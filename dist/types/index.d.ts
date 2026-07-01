/**
 * Core Types for UKG Pro WFM MCP Server
 * Universal reasoning, hydration, and execution layer.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type EndpointClassification = 'DISCOVERY_ONLY' | 'DETAIL_HYDRATOR' | 'ACTION_EXECUTOR' | 'VALIDATOR' | 'BULK_MUTATOR' | 'EVENT_SOURCE' | 'RELATIONSHIP_RESOLVER';
export type RiskLevel = 'SAFE_READ' | 'CONTROLLED_WRITE' | 'DANGEROUS_WRITE' | 'DESTRUCTIVE';
export type IntentCategory = 'lookup' | 'explain' | 'compare' | 'validate' | 'troubleshoot' | 'audit' | 'summarize' | 'reconcile' | 'detect_anomaly' | 'create' | 'update' | 'delete' | 'execute_workflow' | 'generate_report' | 'map_relationships' | 'identify_missing_configuration' | 'determine_root_cause';
export type ConfidenceLevel = 'CERTAIN' | 'HIGH' | 'MEDIUM' | 'LOW' | 'BLOCKED';
export interface EndpointIntelligence {
    domain: string;
    operationId: string;
    method: HttpMethod;
    path: string;
    classification: EndpointClassification;
    objectType: string;
    inputIdentifiers: string[];
    outputIdentifiers: string[];
    referenceFields: string[];
    hydrationCandidates: string[];
    childCollectionCandidates: string[];
    reverseLookupCandidates: string[];
    riskLevel: RiskLevel;
    toolEligible: boolean;
    finalAnswerEligible: boolean;
    requiresConfirmation: boolean;
    notes: string;
    tags?: string[];
}
export interface GraphNode {
    id: string;
    type: 'endpoint' | 'object' | 'identifier' | 'domain' | 'profile';
    label: string;
    metadata?: Record<string, any>;
}
export interface GraphEdge {
    from: string;
    to: string;
    type: 'RETURNS' | 'REQUIRES' | 'HYDRATES' | 'LISTS' | 'SEARCHES' | 'MUTATES' | 'REFERENCES' | 'HAS_PARENT' | 'HAS_CHILD' | 'USES_PROFILE' | 'BELONGS_TO';
    weight?: number;
    metadata?: Record<string, any>;
}
export interface EndpointGraph {
    nodes: Map<string, GraphNode>;
    edges: GraphEdge[];
    endpointsByDomain: Map<string, string[]>;
    endpointsByObject: Map<string, string[]>;
    hydrationMap: Map<string, string[]>;
}
export interface ToolMetadata {
    domain: string;
    object_type: string;
    endpoint_classification: EndpointClassification;
    risk_level: RiskLevel;
    final_answer_eligible: boolean;
    requires_hydration: boolean;
    hydration_targets: string[];
    reverse_lookup_targets: string[];
    child_collection_targets: string[];
    missing_input_strategy: string;
    confidence_rules: string;
    audit_required: boolean;
    dry_run_supported: boolean;
    confirmation_required: boolean;
}
export interface ToolExecutionContext {
    userRequest: string;
    normalizedRequest: string;
    extractedEntities: Record<string, any>;
    resolvedInputs: Record<string, any>;
    priorResults: any[];
    tenantContext?: TenantContext;
    dryRun?: boolean;
}
export interface TenantContext {
    tenantId?: string;
    baseUrl?: string;
    apiKey?: string;
    accessToken?: string;
    userId?: string;
}
export interface MissingInput {
    name: string;
    type: string;
    required: boolean;
    description: string;
    possibleSources: string[];
}
export interface DiscoveredCandidate {
    id: string;
    type: string;
    sourceEndpoint: string;
    score: number;
    raw: any;
    qualifiers?: Record<string, string>;
}
export interface HydrationNode {
    refId: string;
    objectType: string;
    currentPartial: any;
    targetHydrator: string;
    requiredParams: Record<string, any>;
    status: 'pending' | 'hydrating' | 'hydrated' | 'blocked';
    reasonBlocked?: string;
    hydratedData?: any;
    depth: number;
}
export interface ResponseGraph {
    primary: any;
    objects: Map<string, any>;
    references: Array<{
        path: string;
        value: any;
        typeHint?: string;
    }>;
    collections: Array<{
        path: string;
        items: any[];
    }>;
    relationships: GraphEdge[];
}
export interface CompletenessReport {
    completeness_score: number;
    hydrated_required_objects: number;
    total_required_objects: number;
    unresolved_reference_count: number;
    blocked_reference_count: number;
    ambiguous_reference_count: number;
    permission_blocked_count: number;
    endpoint_unavailable_count: number;
    inferred_value_count: number;
    user_supplied_value_count: number;
    missing_fields: string[];
    blocked_fields: Array<{
        field: string;
        reason: string;
    }>;
}
export interface ConfidenceReport {
    level: ConfidenceLevel;
    score: number;
    reasons: string[];
    criteria_met: string[];
}
export interface FullAnswer {
    direct_answer: string;
    objects_analyzed: any[];
    full_details: Record<string, any>;
    source_chain: Array<{
        step: string;
        operationId?: string;
        path?: string;
        status: number;
    }>;
    hydration_status: {
        total_references: number;
        hydrated: number;
        blocked: number;
    };
    confidence: ConfidenceReport;
    completeness: CompletenessReport;
    related_hydrated: string[];
    related_not_hydrated: string[];
    business_interpretation: string;
    caveats: string[];
    raw_json_available: boolean;
    raw?: any;
}
export interface AuditEvent {
    timestamp: string;
    tool: string;
    userRequest: string;
    inputs: any;
    confidence: ConfidenceLevel;
    completeness_score: number;
    actions: string[];
    result_summary: string;
    tenant?: string;
}
export interface CatalogSeed {
    domains: string[];
    endpoints: EndpointIntelligence[];
}
export declare const REFERENCE_FIELD_PATTERNS: RegExp[];
//# sourceMappingURL=index.d.ts.map