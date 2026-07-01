export class IntentRouter {
    graph;
    endpoints;
    constructor(graph, endpoints) {
        this.graph = graph;
        this.endpoints = endpoints;
    }
    parse(userRequest) {
        const lower = userRequest.toLowerCase();
        const keywords = this.tokenize(lower);
        let intent = 'lookup';
        if (/explain|why|how|detail|what is/.test(lower))
            intent = 'explain';
        else if (/compare|difference|vs/.test(lower))
            intent = 'compare';
        else if (/valid|check|correct/.test(lower))
            intent = 'validate';
        else if (/trouble|error|issue|problem|fix/.test(lower))
            intent = 'troubleshoot';
        else if (/audit|review|compliance|report/.test(lower))
            intent = 'audit';
        else if (/summar|overview/.test(lower))
            intent = 'summarize';
        else if (/reconcil|match/.test(lower))
            intent = 'reconcile';
        else if (/anomal|unusual|odd/.test(lower))
            intent = 'detect_anomaly';
        else if (/(^| )create |add |new /.test(lower))
            intent = 'create';
        else if (/(^| )update |change |edit |modify /.test(lower))
            intent = 'update';
        else if (/(^| )delete |remove |cancel /.test(lower))
            intent = 'delete';
        else if (/schedule|execute|run |submit|approve/.test(lower))
            intent = 'execute_workflow';
        else if (/root cause|why did/.test(lower))
            intent = 'determine_root_cause';
        else if (/map|relationship|linked to/.test(lower))
            intent = 'map_relationships';
        // Object types
        const objectTypes = [];
        const otMap = {
            'person': 'Person', 'employee': 'Person', 'manager': 'Person',
            'known place': 'KnownPlace', 'knownplace': 'KnownPlace', 'place': 'KnownPlace',
            'group': 'EmployeeGroup', 'employee group': 'EmployeeGroup',
            'hyperfind': 'Hyperfind',
            'schedule': 'Schedule', 'shift': 'Shift',
            'timecard': 'Timecard', 'punch': 'Punch', 'punches': 'Punch',
            'exception': 'Exception',
            'leave': 'LeaveCase', 'leave case': 'LeaveCase',
            'attendance': 'AttendanceEvent',
            'device': 'Device',
            'work rule': 'WorkRule', 'pay code': 'PayCode', 'pay rule': 'PayRule',
            'profile': 'DisplayProfile', 'access profile': 'AccessProfile'
        };
        for (const [phrase, type] of Object.entries(otMap)) {
            if (lower.includes(phrase))
                objectTypes.push(type);
        }
        if (objectTypes.length === 0)
            objectTypes.push('Person'); // sensible default
        // Entities extraction (simple regex + keywords)
        const entities = {};
        const idMatch = userRequest.match(/\b([A-Z]{2,4}[-_]?\d{3,}|EMP\d+|PER\d+|ID[:= ]?[\w-]+)/i);
        if (idMatch)
            entities.id = idMatch[1];
        const nameMatch = userRequest.match(/["']([^"']{2,40})["']|named ([A-Za-z][A-Za-z ]{1,30})/i);
        if (nameMatch)
            entities.name = (nameMatch[1] || nameMatch[2]).trim();
        // Date hints
        let dateRange;
        const dateMatches = [...userRequest.matchAll(/(\d{4}-\d{2}-\d{2})/g)].map(m => m[1]);
        if (dateMatches.length >= 1)
            dateRange = { start: dateMatches[0], end: dateMatches[1] || dateMatches[0] };
        return {
            intent,
            objectTypes: Array.from(new Set(objectTypes)),
            entities,
            keywords,
            dateRange,
            raw: userRequest
        };
    }
    tokenize(s) {
        return s.split(/[^a-z0-9]+/).filter(Boolean);
    }
    selectPrimaryEndpoints(parsed) {
        const scored = this.graph.scoreEndpointsForIntent({
            objectTypes: parsed.objectTypes,
            ids: Object.values(parsed.entities),
            keywords: parsed.keywords
        });
        const selected = [];
        for (const { opId } of scored.slice(0, 6)) {
            const ep = this.endpoints.find(e => e.operationId === opId);
            if (ep)
                selected.push(ep);
        }
        // Guarantee at least one discovery + one hydrator per primary object type
        for (const ot of parsed.objectTypes) {
            const hyd = this.endpoints.find(e => e.objectType === ot && e.classification === 'DETAIL_HYDRATOR');
            if (hyd && !selected.includes(hyd))
                selected.push(hyd);
            const disc = this.endpoints.find(e => e.objectType === ot && e.classification === 'DISCOVERY_ONLY');
            if (disc && !selected.includes(disc))
                selected.push(disc);
        }
        return selected;
    }
}
//# sourceMappingURL=intent-router.js.map