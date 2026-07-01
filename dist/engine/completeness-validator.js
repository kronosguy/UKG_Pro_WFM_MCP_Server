import { ResponseGraphParser } from './response-graph-parser.js';
export class CompletenessValidator {
    parser = new ResponseGraphParser();
    validate(graph, requiredObjectTypes = []) {
        const allRefs = this.parser.findAllReferenceValues(graph);
        const hydrated = graph.objects.size;
        const blocked = 0; // will be passed in by engine
        const unresolved = Math.max(0, allRefs.length - hydrated);
        const totalRequired = Math.max(requiredObjectTypes.length, 1);
        const hydratedRequired = Math.min(hydrated, totalRequired);
        const score = totalRequired > 0 ? hydratedRequired / totalRequired : 0.8;
        return {
            completeness_score: Math.min(1, Math.max(0, score)),
            hydrated_required_objects: hydratedRequired,
            total_required_objects: totalRequired,
            unresolved_reference_count: unresolved,
            blocked_reference_count: blocked,
            ambiguous_reference_count: 0,
            permission_blocked_count: 0,
            endpoint_unavailable_count: 0,
            inferred_value_count: 0,
            user_supplied_value_count: 0,
            missing_fields: [],
            blocked_fields: []
        };
    }
}
//# sourceMappingURL=completeness-validator.js.map