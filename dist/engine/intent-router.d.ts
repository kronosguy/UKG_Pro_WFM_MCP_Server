/**
 * Universal Natural Language Router + Intent Detection
 */
import { IntentCategory, EndpointIntelligence } from '../types/index.js';
import { EndpointGraphBuilder } from '../catalog/graph.js';
export interface ParsedRequest {
    intent: IntentCategory;
    objectTypes: string[];
    entities: Record<string, string>;
    keywords: string[];
    dateRange?: {
        start?: string;
        end?: string;
    };
    raw: string;
}
export declare class IntentRouter {
    private graph;
    private endpoints;
    constructor(graph: EndpointGraphBuilder, endpoints: EndpointIntelligence[]);
    parse(userRequest: string): ParsedRequest;
    private tokenize;
    selectPrimaryEndpoints(parsed: ParsedRequest): EndpointIntelligence[];
}
//# sourceMappingURL=intent-router.d.ts.map