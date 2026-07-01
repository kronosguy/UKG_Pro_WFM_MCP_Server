export class MissingInputResolver {
    client;
    endpoints;
    graph;
    constructor(client, endpoints, graph) {
        this.client = client;
        this.endpoints = endpoints;
        this.graph = graph;
    }
    detectMissing(required, provided) {
        const missing = [];
        for (const req of required) {
            if (provided[req] == null || provided[req] === '') {
                missing.push({
                    name: req,
                    type: 'string',
                    required: true,
                    description: `Required ${req} for the operation`,
                    possibleSources: ['user_request', 'search', 'parent_object', 'prior_result', 'default', 'tenant_context']
                });
            }
        }
        return missing;
    }
    async resolve(missing, context) {
        const resolved = {};
        const stillMissing = [];
        for (const m of missing) {
            let value = null;
            // 1. From explicit user request in context
            if (context.extracted?.[m.name]) {
                value = context.extracted[m.name];
            }
            // 2. From prior tool results
            if (!value && context.priorResults?.length) {
                for (const prior of context.priorResults) {
                    if (prior?.[m.name]) {
                        value = prior[m.name];
                        break;
                    }
                    if (prior?.data?.[m.name]) {
                        value = prior.data[m.name];
                        break;
                    }
                }
            }
            // 3. From tenant context
            if (!value && context.tenantContext && context.tenantContext[m.name]) {
                value = context.tenantContext[m.name];
            }
            // 4. Try discovery search if sensible (e.g. by name)
            if (!value && ['personId', 'employeeId', 'knownPlaceId', 'employeeGroupId', 'hyperfindId'].includes(m.name) && context.nameHint) {
                value = await this.attemptDiscovery(m.name, context.nameHint);
            }
            // 5. Safe defaults (very limited)
            if (!value && m.name.toLowerCase().includes('date') && !m.required) {
                value = new Date().toISOString().slice(0, 10);
            }
            if (value != null) {
                resolved[m.name] = value;
            }
            else {
                stillMissing.push(m.name);
            }
        }
        if (stillMissing.length > 0) {
            return {
                resolved,
                clarification: `Please provide: ${stillMissing.join(', ')}. (Tried inference, discovery, prior results, tenant context)`
            };
        }
        return { resolved };
    }
    async attemptDiscovery(idField, nameHint) {
        // Map common search endpoints
        const searchMap = {
            personId: 'searchPersons',
            employeeId: 'searchPersons',
            knownPlaceId: 'searchKnownPlaces',
            employeeGroupId: 'searchEmployeeGroups',
            hyperfindId: 'listHyperfinds'
        };
        const op = searchMap[idField];
        if (!op)
            return null;
        const intel = this.endpoints.find(e => e.operationId === op);
        if (!intel)
            return null;
        try {
            const path = intel.path.replace('{personId}', ''); // naive
            const res = await this.client.post(path, { name: nameHint, limit: 1 });
            if (res.status === 200 && Array.isArray(res.data) && res.data[0]) {
                const first = res.data[0];
                return first[idField] || first.id || first.personId || first.knownPlaceId || first.employeeGroupId || null;
            }
        }
        catch (e) {
            // silent fail per spec - do not hide, but resolver reports
        }
        return null;
    }
}
//# sourceMappingURL=missing-input-resolver.js.map