/**
 * OpenAPI Catalog Ingestor
 * Loads official OpenAPI (yaml/json), falls back to seed, produces EndpointIntelligence records.
 * Supports future discovered domains.
 */
import fs from 'fs/promises';
import path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';
import { classifyEndpoint } from './classifier.js';
export class CatalogIngestor {
    cache = [];
    loadedFrom = 'none';
    async ingest(opts = {}) {
        const seedPath = opts.seedPath || path.resolve('data/openapi-seed/endpoints.seed.json');
        let endpoints = [];
        // 1. Try to load official OpenAPI if provided
        if (opts.openApiPath) {
            try {
                const api = await SwaggerParser.parse(opts.openApiPath);
                endpoints = this.parseOpenApiToIntelligence(api);
                this.loadedFrom = `openapi:${opts.openApiPath}`;
            }
            catch (e) {
                console.warn('[Ingestor] Failed to parse provided OpenAPI, falling back to seed.', e);
            }
        }
        // 2. Fallback to seed (always merge/augment)
        if (endpoints.length === 0) {
            const seedRaw = await fs.readFile(seedPath, 'utf-8');
            const seed = JSON.parse(seedRaw);
            endpoints = seed;
            this.loadedFrom = `seed:${seedPath}`;
        }
        // 3. Enrich + classify (idempotent)
        endpoints = endpoints.map(ep => this.enrichEndpoint(ep));
        // 4. Load additional seed domains if present
        const domainsSeed = path.resolve('data/openapi-seed/ukg-wfm-domains.seed.json');
        try {
            const ds = JSON.parse(await fs.readFile(domainsSeed, 'utf-8'));
            // Future: cross-reference domains
        }
        catch { }
        this.cache = endpoints;
        return endpoints;
    }
    parseOpenApiToIntelligence(api) {
        const results = [];
        const paths = api.paths || {};
        const tagsByOp = {};
        for (const [p, methods] of Object.entries(paths)) {
            for (const [method, op] of Object.entries(methods)) {
                if (!op || typeof op !== 'object' || !op.operationId)
                    continue;
                const m = method.toUpperCase();
                const domain = this.inferDomainFromTags(op.tags || [], p);
                const objType = this.inferObjectType(op, p);
                const intel = {
                    domain,
                    operationId: op.operationId,
                    method: m,
                    path: p,
                    classification: 'DISCOVERY_ONLY',
                    objectType: objType,
                    inputIdentifiers: this.extractInputIdentifiers(op),
                    outputIdentifiers: this.extractOutputIdentifiers(op),
                    referenceFields: this.extractReferenceFields(op),
                    hydrationCandidates: [],
                    childCollectionCandidates: [],
                    reverseLookupCandidates: [],
                    riskLevel: this.inferRisk(m, op),
                    toolEligible: true,
                    finalAnswerEligible: false,
                    requiresConfirmation: m !== 'GET',
                    notes: op.summary || '',
                    tags: op.tags || []
                };
                // Will be classified next
                results.push(intel);
            }
        }
        return results;
    }
    enrichEndpoint(ep) {
        const classified = classifyEndpoint(ep);
        return { ...ep, ...classified };
    }
    inferDomainFromTags(tags, path) {
        const lower = (tags.join(' ') + ' ' + path).toLowerCase();
        if (lower.includes('attendance'))
            return 'attendance';
        if (lower.includes('schedule'))
            return lower.includes('setup') ? 'scheduling_setup' : 'scheduling';
        if (lower.includes('timecard') || lower.includes('bulk'))
            return lower.includes('bulk') ? 'timekeeping_bulk_operations' : 'timekeeping_timecards';
        if (lower.includes('timekeep'))
            return 'timekeeping';
        if (lower.includes('leave'))
            return 'leave';
        if (lower.includes('punch') || lower.includes('device'))
            return 'universal_device_manager';
        if (lower.includes('forecast'))
            return 'forecasting';
        if (lower.includes('person') || lower.includes('employee'))
            return 'people';
        if (lower.includes('common') || lower.includes('known') || lower.includes('hyperfind') || lower.includes('group'))
            return 'common_resources';
        if (lower.includes('platform') || lower.includes('webhook'))
            return 'platform';
        if (lower.includes('hcm'))
            return 'hcm';
        if (lower.includes('assign'))
            return 'person_assignments';
        if (lower.includes('health'))
            return 'healthcare_productivity';
        if (lower.includes('self'))
            return 'employee_self_service';
        return 'platform';
    }
    inferObjectType(op, path) {
        if (op.responses?.['200']?.content) {
            const ex = JSON.stringify(op.responses['200'].content);
            if (ex.includes('Person'))
                return 'Person';
            if (ex.includes('Timecard'))
                return 'Timecard';
            if (ex.includes('Punch'))
                return 'Punch';
            if (ex.includes('Schedule'))
                return 'Schedule';
            if (ex.includes('KnownPlace') || path.includes('known'))
                return 'KnownPlace';
            if (ex.includes('Group'))
                return 'EmployeeGroup';
            if (ex.includes('Hyperfind'))
                return 'Hyperfind';
        }
        const seg = path.split('/').pop()?.replace(/[{}]/g, '') || 'Unknown';
        return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/_/g, '');
    }
    extractInputIdentifiers(op) {
        const ids = [];
        const params = [...(op.parameters || []), ...(op.requestBody ? ['body'] : [])];
        for (const p of op.parameters || []) {
            if (p.required || ['id', 'Id', 'number', 'date', 'qualifier'].some(k => (p.name || '').toLowerCase().includes(k.toLowerCase()))) {
                ids.push(p.name);
            }
        }
        if (op.requestBody)
            ids.push('body');
        return Array.from(new Set(ids));
    }
    extractOutputIdentifiers(op) {
        // Heuristic: look at example or schema for id fields
        return ['id', 'personId', 'employeeId', 'qualifier', 'persistentId'];
    }
    extractReferenceFields(op) {
        // In real impl, deep walk schema $refs and properties
        return ['id', 'ref', 'Id', 'managerId', 'jobId', 'orgRef', 'profileRef'];
    }
    inferRisk(method, op) {
        if (method === 'GET')
            return 'SAFE_READ';
        if (method === 'DELETE')
            return 'DESTRUCTIVE';
        const desc = (op.summary + ' ' + (op.description || '')).toLowerCase();
        if (desc.includes('bulk') || desc.includes('all') || desc.includes('multiple'))
            return 'DANGEROUS_WRITE';
        return 'CONTROLLED_WRITE';
    }
    getLoadedEndpoints() {
        return this.cache;
    }
    getLoadedSource() {
        return this.loadedFrom;
    }
}
//# sourceMappingURL=ingestor.js.map