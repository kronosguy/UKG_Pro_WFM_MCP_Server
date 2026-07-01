/**
 * Universal Response Graph Parser
 * Turns any API response into a traversable graph of objects, refs, collections.
 */
import { REFERENCE_FIELD_PATTERNS } from '../types/index.js';
export class ResponseGraphParser {
    parse(response, rootPath = 'primary') {
        const graph = {
            primary: response,
            objects: new Map(),
            references: [],
            collections: [],
            relationships: []
        };
        this.walk(response, rootPath, graph, 0);
        return graph;
    }
    walk(node, path, graph, depth) {
        if (depth > 8)
            return; // guard
        if (Array.isArray(node)) {
            graph.collections.push({ path, items: node });
            node.forEach((item, i) => this.walk(item, `${path}[${i}]`, graph, depth + 1));
            return;
        }
        if (node && typeof node === 'object') {
            // Detect primary-ish objects by presence of id-like keys
            const id = this.extractId(node);
            if (id) {
                graph.objects.set(`${path}:${id}`, node);
                graph.objects.set(id, node); // direct lookup
            }
            for (const [key, val] of Object.entries(node)) {
                const childPath = `${path}.${key}`;
                if (this.isReferenceField(key, val)) {
                    graph.references.push({ path: childPath, value: val, typeHint: key });
                }
                if (val && (typeof val === 'object' || Array.isArray(val))) {
                    this.walk(val, childPath, graph, depth + 1);
                }
            }
        }
    }
    extractId(obj) {
        const candidates = ['id', 'uuid', 'guid', 'persistentId', 'personId', 'employeeId', 'knownPlaceId', 'scheduleId', 'punchId', 'timecardId', 'hyperfindId', 'employeeGroupId', 'qualifier'];
        for (const c of candidates) {
            if (obj[c])
                return String(obj[c]);
        }
        return null;
    }
    isReferenceField(key, value) {
        if (typeof value !== 'string' && typeof value !== 'number')
            return false;
        return REFERENCE_FIELD_PATTERNS.some(rx => rx.test(key));
    }
    findAllReferenceValues(graph) {
        return graph.references
            .filter(r => r.value != null)
            .map(r => ({ path: r.path, value: String(r.value), hint: r.typeHint }));
    }
}
//# sourceMappingURL=response-graph-parser.js.map