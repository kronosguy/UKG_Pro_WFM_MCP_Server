/**
 * Universal Hydration Engine
 * Follows the spec:
 * 1. Parse response graph
 * 2. Identify partials/refs
 * 3. For each, find best hydrator
 * 4. Resolve params needed
 * 5. Call + merge
 * 6. Recurse until complete or blocked
 */
import { UkgWfmClient } from '../api/client.js';
import { EndpointGraphBuilder } from '../catalog/graph.js';
import { EndpointIntelligence, ResponseGraph } from '../types/index.js';
import { MissingInputResolver } from './missing-input-resolver.js';
export interface HydrationResult {
    graph: ResponseGraph;
    hydratedCount: number;
    blocked: Array<{
        ref: string;
        reason: string;
    }>;
    trace: string[];
}
export declare class HydrationEngine {
    private client;
    private graphBuilder;
    private endpoints;
    private resolver;
    private parser;
    private maxDepth;
    constructor(client: UkgWfmClient, graphBuilder: EndpointGraphBuilder, endpoints: EndpointIntelligence[], resolver: MissingInputResolver);
    hydrate(response: any, initialObjectType: string, ctx: any): Promise<HydrationResult>;
    private collectHydrationNodes;
    private selectBestHydrator;
}
//# sourceMappingURL=hydration-engine.d.ts.map