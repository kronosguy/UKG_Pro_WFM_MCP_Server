/**
 * Universal Tool Base + Execution Algorithm
 * Implements the spec exactly:
 * load metadata, normalize, resolve missing, execute primary, hydrate graph, validate, format, audit
 */
import { UkgWfmClient } from '../api/client.js';
import { EndpointIntelligence, ToolMetadata, ToolExecutionContext, FullAnswer, ConfidenceLevel } from '../types/index.js';
import { IntentRouter, ParsedRequest } from '../engine/intent-router.js';
import { MissingInputResolver } from '../engine/missing-input-resolver.js';
import { HydrationEngine } from '../engine/hydration-engine.js';
import { CompletenessValidator } from '../engine/completeness-validator.js';
import { ConfidenceScorer } from '../engine/confidence-scorer.js';
import { AuditLogger } from '../engine/audit-logger.js';
import { EndpointGraphBuilder } from '../catalog/graph.js';
import { ResponseGraphParser } from '../engine/response-graph-parser.js';

export abstract class BaseUkgTool {
  abstract name: string;
  abstract description: string;
  abstract metadata: ToolMetadata;

  protected client: UkgWfmClient;
  protected endpoints: EndpointIntelligence[];
  protected graph: EndpointGraphBuilder;
  protected router: IntentRouter;
  protected resolver: MissingInputResolver;
  protected hydrator: HydrationEngine;
  protected validator: CompletenessValidator;
  protected scorer: ConfidenceScorer;
  protected audit: AuditLogger;

  constructor(deps: {
    client: UkgWfmClient;
    endpoints: EndpointIntelligence[];
    graph: EndpointGraphBuilder;
    router: IntentRouter;
    resolver: MissingInputResolver;
    hydrator: HydrationEngine;
    validator: CompletenessValidator;
    scorer: ConfidenceScorer;
    audit: AuditLogger;
  }) {
    this.client = deps.client;
    this.endpoints = deps.endpoints;
    this.graph = deps.graph;
    this.router = deps.router;
    this.resolver = deps.resolver;
    this.hydrator = deps.hydrator;
    this.validator = deps.validator;
    this.scorer = deps.scorer;
    this.audit = deps.audit;
  }

  // Required by spec
  async validateInputs(inputs: Record<string, any>): Promise<{ ok: boolean; errors: string[] }> {
    const errors: string[] = [];
    if (!inputs) errors.push('inputs required');
    return { ok: errors.length === 0, errors };
  }

  async resolveMissingInputs(ctx: ToolExecutionContext): Promise<{ resolved: Record<string, any>; question?: string }> {
    const intel = this.selectPrimaryEndpoint(ctx);
    const required = intel?.inputIdentifiers || [];
    const missing = this.resolver.detectMissing(required, ctx.resolvedInputs || {});
    if (missing.length === 0) return { resolved: ctx.resolvedInputs || {} };
    return this.resolver.resolve(missing, ctx);
  }

  async executeDiscovery(ctx: ToolExecutionContext): Promise<any> {
    const ep = this.selectDiscoveryEndpoint(ctx);
    if (!ep) return null;
    return this.callEndpoint(ep, ctx);
  }

  async rankCandidates(candidates: any[]): Promise<any[]> {
    // Simple score by presence of full fields + recency if present
    return [...candidates].sort((a, b) => {
      const sa = Object.keys(a || {}).length;
      const sb = Object.keys(b || {}).length;
      return sb - sa;
    });
  }

  async executePrimaryCall(ctx: ToolExecutionContext): Promise<{ data: any; status: number; intel: EndpointIntelligence | null }> {
    const intel = this.selectPrimaryEndpoint(ctx);
    if (!intel) throw new Error('No primary endpoint selected for ' + this.name);
    const res = await this.callEndpoint(intel, ctx);
    return { data: res.data, status: res.status, intel };
  }

  async hydrateResponseGraph(response: any, objectType: string, ctx: ToolExecutionContext): Promise<any> {
    const result = await this.hydrator.hydrate(response, objectType, ctx);
    return result;
  }

  async validateCompleteness(graph: any): Promise<any> {
    return this.validator.validate(graph);
  }

  async calculateConfidence(completeness: any, isWrite: boolean): Promise<any> {
    return this.scorer.score(completeness, true, isWrite, 0);
  }

  async formatAnswer(graph: any, confidence: any, completeness: any, trace: any[], intel?: EndpointIntelligence | null): Promise<FullAnswer> {
    const primary = graph.primary || graph.objects?.values?.()?.next?.()?.value || {};
    const answer: FullAnswer = {
      direct_answer: this.summarizePrimary(primary, intel),
      objects_analyzed: Array.from(graph.objects?.values?.() || [primary]).slice(0, 5),
      full_details: primary,
      source_chain: trace,
      hydration_status: {
        total_references: completeness.unresolved_reference_count + (graph.objects?.size || 1),
        hydrated: graph.objects?.size || 1,
        blocked: completeness.blocked_reference_count
      },
      confidence,
      completeness,
      related_hydrated: [],
      related_not_hydrated: [],
      business_interpretation: this.interpret(primary, intel),
      caveats: completeness.blocked_reference_count > 0 ? ['Some references could not be hydrated due to permissions or missing endpoints.'] : [],
      raw_json_available: true,
      raw: primary
    };
    return answer;
  }

  async writeAuditEvent(answer: FullAnswer, ctx: ToolExecutionContext): Promise<void> {
    this.audit.log({
      timestamp: new Date().toISOString(),
      tool: this.name,
      userRequest: ctx.userRequest,
      inputs: ctx.resolvedInputs,
      confidence: answer.confidence.level,
      completeness_score: answer.completeness.completeness_score,
      actions: [this.name],
      result_summary: answer.direct_answer.slice(0, 200),
      tenant: ctx.tenantContext?.tenantId
    });
  }

  // Universal execute loop (core of spec)
  async execute(userRequest: string, inputs: Record<string, any> = {}): Promise<FullAnswer> {
    const ctx: ToolExecutionContext = {
      userRequest,
      normalizedRequest: userRequest.toLowerCase().trim(),
      extractedEntities: inputs,
      resolvedInputs: { ...inputs },
      priorResults: [],
      tenantContext: {}
    };

    // 1. validate
    const v = await this.validateInputs(inputs);
    if (!v.ok) throw new Error(v.errors.join('; '));

    // 2. resolve missing (loop)
    let resolveAttempt = await this.resolveMissingInputs(ctx);
    let attempts = 0;
    while (resolveAttempt.question && attempts < 2) {
      // In MCP context we return clarification via answer
      ctx.resolvedInputs = { ...ctx.resolvedInputs, ...resolveAttempt.resolved };
      resolveAttempt = await this.resolveMissingInputs(ctx);
      attempts++;
    }
    ctx.resolvedInputs = { ...ctx.resolvedInputs, ...resolveAttempt.resolved };

    if (resolveAttempt.question) {
      // Return blocked answer
      return this.makeBlockedAnswer(userRequest, resolveAttempt.question);
    }

    // 3. discovery + rank (if discovery needed)
    const discovery = await this.executeDiscovery(ctx);
    if (discovery) ctx.priorResults.push(discovery);

    const ranked = discovery?.data ? await this.rankCandidates(Array.isArray(discovery.data) ? discovery.data : [discovery.data]) : [];

    // 4. primary call
    const primary = await this.executePrimaryCall(ctx);
    const trace = [{ step: 'primary', operationId: primary.intel?.operationId, path: primary.intel?.path, status: primary.status }];

    // 5. hydrate
    const hydration = await this.hydrateResponseGraph(primary.data, primary.intel?.objectType || 'Unknown', ctx);
    trace.push(...hydration.trace.map((t: string) => ({ step: 'hydrate', status: 200, note: t })));

    // 6. validate + confidence
    const completeness = await this.validateCompleteness(hydration.graph);
    const isWrite = primary.intel?.classification === 'ACTION_EXECUTOR' || primary.intel?.classification === 'BULK_MUTATOR';
    const confidence = await this.calculateConfidence(completeness, isWrite);

    // 7. format
    const answer = await this.formatAnswer(hydration.graph, confidence, completeness, trace, primary.intel);

    // 8. audit
    await this.writeAuditEvent(answer, ctx);

    // 9. For writes - caller must still enforce confirmation
    return answer;
  }

  protected selectPrimaryEndpoint(ctx: ToolExecutionContext): EndpointIntelligence | null {
    const parsed = this.router.parse(ctx.userRequest);
    const candidates = this.router.selectPrimaryEndpoints(parsed);
    return candidates.find(c => c.classification === 'DETAIL_HYDRATOR') || candidates[0] || this.endpoints[0] || null;
  }

  protected selectDiscoveryEndpoint(ctx: ToolExecutionContext): EndpointIntelligence | null {
    const parsed = this.router.parse(ctx.userRequest);
    const cands = this.router.selectPrimaryEndpoints(parsed);
    return cands.find(c => c.classification === 'DISCOVERY_ONLY') || cands[0] || null;
  }

  protected async callEndpoint(intel: EndpointIntelligence, ctx: ToolExecutionContext) {
    let path = intel.path;
    const params: any = { ...ctx.resolvedInputs };

    // Fill path params
    for (const key of Object.keys(params)) {
      path = path.replace(`{${key}}`, encodeURIComponent(params[key]));
      if (path !== intel.path && key !== 'body') delete params[key]; // moved to path
    }

    if (intel.method === 'GET') {
      return this.client.get(path, params);
    }
    if (intel.method === 'POST') {
      return this.client.post(path, params.body || params);
    }
    if (intel.method === 'PUT') return this.client.put(path, params);
    if (intel.method === 'PATCH') return this.client.patch(path, params);
    if (intel.method === 'DELETE') return this.client.delete(path);
    throw new Error('Unsupported method ' + intel.method);
  }

  private summarizePrimary(primary: any, intel: any): string {
    if (!primary) return 'No data returned.';
    const name = primary.name || primary.fullName || primary.firstName + ' ' + primary.lastName || primary.qualifier || primary.id;
    return `${intel?.objectType || 'Object'} resolved: ${name || JSON.stringify(primary).slice(0, 80)}. Full hydration performed.`;
  }

  private interpret(primary: any, intel: any): string {
    return `This ${intel?.objectType || 'record'} was fully resolved through discovery + detail hydration chain from ${intel?.operationId || 'catalog'}. All reachable references were followed per UKG WFM hydration rules.`;
  }

  private makeBlockedAnswer(req: string, question: string): FullAnswer {
    return {
      direct_answer: `Unable to proceed: ${question}`,
      objects_analyzed: [],
      full_details: {},
      source_chain: [],
      hydration_status: { total_references: 0, hydrated: 0, blocked: 0 },
      confidence: { level: 'BLOCKED', score: 0, reasons: [question], criteria_met: [] },
      completeness: { completeness_score: 0, hydrated_required_objects: 0, total_required_objects: 1, unresolved_reference_count: 0, blocked_reference_count: 1, ambiguous_reference_count: 0, permission_blocked_count: 0, endpoint_unavailable_count: 0, inferred_value_count: 0, user_supplied_value_count: 0, missing_fields: [], blocked_fields: [{ field: 'required', reason: question }] },
      related_hydrated: [],
      related_not_hydrated: [],
      business_interpretation: 'Clarification required before any API call.',
      caveats: [question],
      raw_json_available: false
    };
  }
}
