/**
 * Universal Tool Base + Execution Algorithm
 * Implements the spec exactly:
 * load metadata, normalize, resolve missing, execute primary, hydrate graph, validate, format, audit
 */
import { UkgWfmClient } from '../api/client.js';
import { EndpointIntelligence, ToolMetadata, ToolExecutionContext, FullAnswer } from '../types/index.js';
import { IntentRouter } from '../engine/intent-router.js';
import { MissingInputResolver } from '../engine/missing-input-resolver.js';
import { HydrationEngine } from '../engine/hydration-engine.js';
import { CompletenessValidator } from '../engine/completeness-validator.js';
import { ConfidenceScorer } from '../engine/confidence-scorer.js';
import { AuditLogger } from '../engine/audit-logger.js';
import { EndpointGraphBuilder } from '../catalog/graph.js';
export declare abstract class BaseUkgTool {
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
    });
    validateInputs(inputs: Record<string, any>): Promise<{
        ok: boolean;
        errors: string[];
    }>;
    resolveMissingInputs(ctx: ToolExecutionContext): Promise<{
        resolved: Record<string, any>;
        question?: string;
    }>;
    executeDiscovery(ctx: ToolExecutionContext): Promise<any>;
    rankCandidates(candidates: any[]): Promise<any[]>;
    executePrimaryCall(ctx: ToolExecutionContext): Promise<{
        data: any;
        status: number;
        intel: EndpointIntelligence | null;
    }>;
    hydrateResponseGraph(response: any, objectType: string, ctx: ToolExecutionContext): Promise<any>;
    validateCompleteness(graph: any): Promise<any>;
    calculateConfidence(completeness: any, isWrite: boolean): Promise<any>;
    formatAnswer(graph: any, confidence: any, completeness: any, trace: any[], intel?: EndpointIntelligence | null): Promise<FullAnswer>;
    writeAuditEvent(answer: FullAnswer, ctx: ToolExecutionContext): Promise<void>;
    execute(userRequest: string, inputs?: Record<string, any>): Promise<FullAnswer>;
    protected selectPrimaryEndpoint(ctx: ToolExecutionContext): EndpointIntelligence | null;
    protected selectDiscoveryEndpoint(ctx: ToolExecutionContext): EndpointIntelligence | null;
    protected callEndpoint(intel: EndpointIntelligence, ctx: ToolExecutionContext): Promise<{
        data: unknown;
        status: number;
    }>;
    private summarizePrimary;
    private interpret;
    private makeBlockedAnswer;
}
//# sourceMappingURL=base-tool.d.ts.map