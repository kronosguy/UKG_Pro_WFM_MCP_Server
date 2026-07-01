/**
 * Universal Missing Input Resolver
 * Exhausts safe resolution paths before asking user.
 */
import { MissingInput, EndpointIntelligence } from '../types/index.js';
import { UkgWfmClient } from '../api/client.js';
import { EndpointGraphBuilder } from '../catalog/graph.js';
export declare class MissingInputResolver {
    private client;
    private endpoints;
    private graph;
    constructor(client: UkgWfmClient, endpoints: EndpointIntelligence[], graph: EndpointGraphBuilder);
    detectMissing(required: string[], provided: Record<string, any>): MissingInput[];
    resolve(missing: MissingInput[], context: any): Promise<{
        resolved: Record<string, any>;
        clarification?: string;
    }>;
    private attemptDiscovery;
}
//# sourceMappingURL=missing-input-resolver.d.ts.map