import { ResponseGraphParser } from './response-graph-parser.js';
export class HydrationEngine {
    client;
    graphBuilder;
    endpoints;
    resolver;
    parser = new ResponseGraphParser();
    maxDepth = 4;
    constructor(client, graphBuilder, endpoints, resolver) {
        this.client = client;
        this.graphBuilder = graphBuilder;
        this.endpoints = endpoints;
        this.resolver = resolver;
    }
    async hydrate(response, initialObjectType, ctx) {
        const trace = [];
        let graph = this.parser.parse(response);
        const blocked = [];
        let pending = this.collectHydrationNodes(graph, initialObjectType);
        let depth = 0;
        while (pending.length > 0 && depth < this.maxDepth) {
            const node = pending.shift();
            if (node.depth > this.maxDepth) {
                blocked.push({ ref: node.refId, reason: 'max_depth_exceeded' });
                continue;
            }
            const hydratorOp = this.selectBestHydrator(node);
            if (!hydratorOp) {
                blocked.push({ ref: node.refId, reason: 'no_hydrator_found' });
                continue;
            }
            // Resolve params for this hydrator
            const intel = this.endpoints.find(e => e.operationId === hydratorOp);
            if (!intel) {
                blocked.push({ ref: node.refId, reason: 'hydrator_not_in_catalog' });
                continue;
            }
            const requiredParams = {};
            for (const inp of intel.inputIdentifiers) {
                // Try to pull from node, ctx, prior results, etc.
                let val = node.currentPartial?.[inp] || ctx?.[inp] || node.refId;
                // Special case common patterns
                if (inp.toLowerCase().includes('id') && !val)
                    val = node.refId;
                if (inp === 'personId' || inp === 'employeeId')
                    val = node.refId;
                requiredParams[inp] = val;
            }
            // Attempt call
            try {
                trace.push(`Hydrating ${node.objectType}:${node.refId} via ${hydratorOp}`);
                const method = intel.method.toLowerCase();
                let callPath = intel.path;
                // naive path param fill
                Object.keys(requiredParams).forEach(k => {
                    callPath = callPath.replace(`{${k}}`, encodeURIComponent(requiredParams[k]));
                });
                const res = method === 'get'
                    ? await this.client.get(callPath, requiredParams)
                    : await this.client.post(callPath, requiredParams);
                if (res.status >= 200 && res.status < 300) {
                    // Merge into graph
                    const hydrated = this.parser.parse(res.data, `hydrated:${hydratorOp}`);
                    for (const [k, v] of hydrated.objects.entries()) {
                        graph.objects.set(k, v);
                    }
                    node.hydratedData = res.data;
                    node.status = 'hydrated';
                    // Recurse for newly discovered refs in hydrated
                    const newRefs = this.parser.findAllReferenceValues(hydrated);
                    for (const nr of newRefs) {
                        if (!graph.objects.has(nr.value)) {
                            pending.push({
                                refId: nr.value,
                                objectType: nr.hint || 'Unknown',
                                currentPartial: { [nr.hint || 'id']: nr.value },
                                targetHydrator: '',
                                requiredParams: {},
                                status: 'pending',
                                depth: node.depth + 1
                            });
                        }
                    }
                }
                else {
                    blocked.push({ ref: node.refId, reason: `http_${res.status}` });
                }
            }
            catch (e) {
                blocked.push({ ref: node.refId, reason: e.message || 'call_failed' });
            }
        }
        return {
            graph,
            hydratedCount: Array.from(graph.objects.keys()).length,
            blocked,
            trace
        };
    }
    collectHydrationNodes(graph, rootType) {
        const nodes = [];
        const refs = this.parser.findAllReferenceValues(graph);
        // Always consider primary as node 0
        nodes.push({
            refId: 'primary',
            objectType: rootType,
            currentPartial: graph.primary,
            targetHydrator: '',
            requiredParams: {},
            status: 'pending',
            depth: 0
        });
        for (const r of refs) {
            nodes.push({
                refId: r.value,
                objectType: r.hint || 'Unknown',
                currentPartial: { [r.hint || 'id']: r.value },
                targetHydrator: '',
                requiredParams: {},
                status: 'pending',
                depth: 1
            });
        }
        return nodes;
    }
    selectBestHydrator(node) {
        // Prefer DETAIL_HYDRATOR for the objectType
        const candidates = this.graphBuilder.findHydratorsFor(node.objectType);
        const detail = this.endpoints.find(e => candidates.includes(e.operationId) && e.classification === 'DETAIL_HYDRATOR');
        if (detail)
            return detail.operationId;
        // Fallback any hydrator
        return candidates[0] || null;
    }
}
//# sourceMappingURL=hydration-engine.js.map