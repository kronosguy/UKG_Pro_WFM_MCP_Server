/**
 * Endpoint Relationship Graph
 * Powers routing, missing-input, hydration, confidence.
 * Nodes + Edges per spec.
 */
import { EndpointIntelligence, EndpointGraph, GraphNode, GraphEdge } from '../types/index.js';

export class EndpointGraphBuilder {
  private graph: EndpointGraph = {
    nodes: new Map(),
    edges: [],
    endpointsByDomain: new Map(),
    endpointsByObject: new Map(),
    hydrationMap: new Map()
  };

  build(endpoints: EndpointIntelligence[]): EndpointGraph {
    this.graph = {
      nodes: new Map(),
      edges: [],
      endpointsByDomain: new Map(),
      endpointsByObject: new Map(),
      hydrationMap: new Map()
    };

    // Create nodes for domains, endpoints, objects
    const domains = new Set<string>();
    const objects = new Set<string>();

    for (const ep of endpoints) {
      domains.add(ep.domain);
      objects.add(ep.objectType);

      // Endpoint node
      const epNodeId = `endpoint:${ep.operationId}`;
      this.addNode(epNodeId, 'endpoint', ep.operationId, { intelligence: ep });

      // Object node
      const objNodeId = `object:${ep.objectType}`;
      this.addNode(objNodeId, 'object', ep.objectType);

      // Domain node
      const domNodeId = `domain:${ep.domain}`;
      this.addNode(domNodeId, 'domain', ep.domain);

      // Edges
      this.addEdge(epNodeId, objNodeId, 'RETURNS', 1, { path: ep.path });
      this.addEdge(objNodeId, domNodeId, 'BELONGS_TO');

      if (ep.classification === 'DISCOVERY_ONLY') {
        this.addEdge(epNodeId, objNodeId, 'SEARCHES');
      }
      if (ep.classification === 'DETAIL_HYDRATOR') {
        this.addEdge(epNodeId, objNodeId, 'HYDRATES');
      }
      if (['ACTION_EXECUTOR', 'BULK_MUTATOR'].includes(ep.classification)) {
        this.addEdge(epNodeId, objNodeId, 'MUTATES');
      }

      // Input identifiers -> requires edges
      for (const id of ep.inputIdentifiers) {
        const idNode = `id:${id}`;
        this.addNode(idNode, 'identifier', id);
        this.addEdge(epNodeId, idNode, 'REQUIRES');
      }

      // Reference fields -> possible hydration
      for (const ref of ep.referenceFields) {
        const refNode = `ref:${ref}`;
        this.addNode(refNode, 'identifier', ref);
        this.addEdge(epNodeId, refNode, 'REFERENCES');

        // Register hydration candidate mapping
        for (const hyd of ep.hydrationCandidates) {
          const key = `${ep.objectType}:${ref}`;
          if (!this.graph.hydrationMap.has(key)) this.graph.hydrationMap.set(key, []);
          this.graph.hydrationMap.get(key)!.push(hyd);
        }
      }

      // Index
      if (!this.graph.endpointsByDomain.has(ep.domain)) this.graph.endpointsByDomain.set(ep.domain, []);
      this.graph.endpointsByDomain.get(ep.domain)!.push(ep.operationId);

      if (!this.graph.endpointsByObject.has(ep.objectType)) this.graph.endpointsByObject.set(ep.objectType, []);
      this.graph.endpointsByObject.get(ep.objectType)!.push(ep.operationId);
    }

    // Cross-hydration edges based on candidates
    for (const ep of endpoints) {
      for (const cand of ep.hydrationCandidates) {
        const target = endpoints.find(e => e.operationId === cand);
        if (target) {
          this.addEdge(
            `endpoint:${ep.operationId}`,
            `endpoint:${cand}`,
            'HYDRATES',
            0.8,
            { targetObject: target.objectType }
          );
        }
      }
    }

    return this.graph;
  }

  private addNode(id: string, type: GraphNode['type'], label: string, metadata?: any) {
    if (!this.graph.nodes.has(id)) {
      this.graph.nodes.set(id, { id, type, label, metadata });
    }
  }

  private addEdge(from: string, to: string, type: GraphEdge['type'], weight = 1, metadata?: any) {
    this.graph.edges.push({ from, to, type, weight, metadata });
  }

  getGraph(): EndpointGraph {
    return this.graph;
  }

  // Query helpers
  findHydratorsFor(objectType: string, refField?: string): string[] {
    const key = refField ? `${objectType}:${refField}` : objectType;
    const direct = this.graph.hydrationMap.get(key) || [];
    // Also find DETAIL_HYDRATOR endpoints for the object
    const byObject = this.graph.endpointsByObject.get(objectType) || [];
    return Array.from(new Set([...direct, ...byObject]));
  }

  findDiscoveryFor(objectType: string): string[] {
    const all = this.graph.endpointsByObject.get(objectType) || [];
    return all; // Caller filters classification
  }

  findReverseLookups(objectType: string): string[] {
    // In richer impl would use more indexes
    return this.graph.endpointsByObject.get(objectType) || [];
  }

  findEndpointsByDomain(domain: string): string[] {
    return this.graph.endpointsByDomain.get(domain) || [];
  }

  getAllDomains(): string[] {
    return Array.from(this.graph.endpointsByDomain.keys());
  }

  // For natural language routing: score endpoints relevant to entities
  scoreEndpointsForIntent(entities: { objectTypes: string[]; ids: string[]; keywords: string[] }): Array<{ opId: string; score: number }> {
    const scores = new Map<string, number>();
    for (const [obj, ops] of this.graph.endpointsByObject.entries()) {
      if (entities.objectTypes.some(o => o.toLowerCase().includes(obj.toLowerCase()) || obj.toLowerCase().includes(o.toLowerCase()))) {
        for (const op of ops) {
          scores.set(op, (scores.get(op) || 0) + 3);
        }
      }
    }
    // Keyword boost
    const lowerKw = entities.keywords.map(k => k.toLowerCase());
    for (const epId of Array.from(this.graph.nodes.keys()).filter(k => k.startsWith('endpoint:'))) {
      const op = epId.replace('endpoint:', '');
      if (lowerKw.some(kw => op.toLowerCase().includes(kw))) {
        scores.set(op, (scores.get(op) || 0) + 1);
      }
    }
    return Array.from(scores.entries()).map(([opId, score]) => ({ opId, score })).sort((a, b) => b.score - a.score);
  }
}
