/**
 * Endpoint Relationship Graph
 * Powers routing, missing-input, hydration, confidence.
 * Nodes + Edges per spec.
 */
import { EndpointIntelligence, EndpointGraph } from '../types/index.js';
export declare class EndpointGraphBuilder {
    private graph;
    build(endpoints: EndpointIntelligence[]): EndpointGraph;
    private addNode;
    private addEdge;
    getGraph(): EndpointGraph;
    findHydratorsFor(objectType: string, refField?: string): string[];
    findDiscoveryFor(objectType: string): string[];
    findReverseLookups(objectType: string): string[];
    findEndpointsByDomain(domain: string): string[];
    getAllDomains(): string[];
    scoreEndpointsForIntent(entities: {
        objectTypes: string[];
        ids: string[];
        keywords: string[];
    }): Array<{
        opId: string;
        score: number;
    }>;
}
//# sourceMappingURL=graph.d.ts.map