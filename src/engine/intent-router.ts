/**
 * Universal Natural Language Router + Intent Detection
 */
import { IntentCategory, EndpointIntelligence } from '../types/index.js';
import { EndpointGraphBuilder } from '../catalog/graph.js';

export interface ParsedRequest {
  intent: IntentCategory;
  objectTypes: string[];
  entities: Record<string, string>;
  keywords: string[];
  dateRange?: { start?: string; end?: string };
  raw: string;
}

export class IntentRouter {
  constructor(private graph: EndpointGraphBuilder, private endpoints: EndpointIntelligence[]) {}

  parse(userRequest: string): ParsedRequest {
    const lower = userRequest.toLowerCase();
    const keywords = this.tokenize(lower);

    let intent: IntentCategory = 'lookup';

    if (/explain|why|how|detail|details|what is/.test(lower)) intent = 'explain';
    else if (/compare|difference|vs/.test(lower)) intent = 'compare';
    else if (/valid|check|correct/.test(lower)) intent = 'validate';
    else if (/trouble|error|issue|problem|fix|investigate/.test(lower)) intent = 'troubleshoot';
    else if (/audit|review|compliance|report/.test(lower)) intent = 'audit';
    else if (/summar|overview/.test(lower)) intent = 'summarize';
    else if (/reconcil|match/.test(lower)) intent = 'reconcile';
    else if (/anomal|unusual|odd/.test(lower)) intent = 'detect_anomaly';
    else if (/(^| )create |add |new /.test(lower)) intent = 'create';
    else if (/(^| )update |change |edit |modify /.test(lower)) intent = 'update';
    else if (/(^| )delete |remove |cancel /.test(lower)) intent = 'delete';
    else if (/schedule|execute|run |submit|approve/.test(lower)) intent = 'execute_workflow';
    else if (/root cause|why did/.test(lower)) intent = 'determine_root_cause';
    else if (/map|relationship|linked to/.test(lower)) intent = 'map_relationships';

    const objectTypes: string[] = [];

    const otMap: Array<[RegExp, string]> = [
      [/\bknown place\b|\bknownplace\b|\bgeofence\b|\bgeo fence\b|\blocation set\b|\blocation\b|\bfacility\b/, 'KnownPlace'],
      [/\bemployee group\b|\bgroup\b/, 'EmployeeGroup'],
      [/\bhyperfind\b/, 'Hyperfind'],
      [/\btimecard\b/, 'Timecard'],
      [/\bpunch\b|\bpunches\b/, 'Punch'],
      [/\bexception\b|\bexceptions\b/, 'Exception'],
      [/\bschedule\b|\bshift\b/, 'Schedule'],
      [/\bleave\b|\bleave case\b/, 'LeaveCase'],
      [/\battendance\b/, 'AttendanceEvent'],
      [/\bdevice\b|\bclock\b/, 'Device'],
      [/\bwork rule\b/, 'WorkRule'],
      [/\bpay code\b/, 'PayCode'],
      [/\bpay rule\b/, 'PayRule'],
      [/\bprofile\b|\baccess profile\b|\bdisplay profile\b/, 'DisplayProfile'],
      [/\bperson\b|\bemployee\b|\bmanager\b/, 'Person']
    ];

    for (const [pattern, type] of otMap) {
      if (pattern.test(lower)) objectTypes.push(type);
    }

    const entities: Record<string, string> = {};

    const idMatch = userRequest.match(/\b([A-Z]{2,4}[-_]?\d{3,}|EMP\d+|PER\d+|ID[:= ]?[\w-]+)/i);
    if (idMatch) entities.id = idMatch[1];

    const namedMatch = userRequest.match(/["']([^"']{2,80})["']|named ([A-Za-z][A-Za-z0-9 &.'-]{1,80})/i);
    if (namedMatch) entities.name = (namedMatch[1] || namedMatch[2]).trim();

    if (!entities.name && objectTypes.includes('KnownPlace')) {
      const cleaned = userRequest
        .replace(/show me|give me|get|pull|complete|full|details|detail|including|configuration|geofence|known place|location set|location|facility/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (cleaned.length > 1) {
        entities.name = cleaned;
      }
    }

    let dateRange: any;
    const dateMatches = [...userRequest.matchAll(/(\d{4}-\d{2}-\d{2})/g)].map(m => m[1]);

    if (dateMatches.length >= 1) {
      dateRange = {
        start: dateMatches[0],
        end: dateMatches[1] || dateMatches[0]
      };
    }

    return {
      intent,
      objectTypes: Array.from(new Set(objectTypes)),
      entities,
      keywords,
      dateRange,
      raw: userRequest
    };
  }

  private tokenize(s: string): string[] {
    return s.split(/[^a-z0-9]+/).filter(Boolean);
  }

  selectPrimaryEndpoints(parsed: ParsedRequest): EndpointIntelligence[] {
    const selected: EndpointIntelligence[] = [];

    for (const objectType of parsed.objectTypes) {
      const objectMatches = this.endpoints
        .filter(endpoint => endpoint.objectType === objectType)
        .sort((a, b) => this.endpointScore(b, parsed) - this.endpointScore(a, parsed));

      for (const endpoint of objectMatches.slice(0, 8)) {
        if (!selected.includes(endpoint)) selected.push(endpoint);
      }
    }

    const scored = this.graph.scoreEndpointsForIntent({
      objectTypes: parsed.objectTypes,
      ids: Object.values(parsed.entities),
      keywords: parsed.keywords
    });

    for (const { opId } of scored.slice(0, 12)) {
      const endpoint = this.endpoints.find(e => e.operationId === opId);
      if (endpoint && !selected.includes(endpoint)) selected.push(endpoint);
    }

    return selected;
  }

  private endpointScore(endpoint: EndpointIntelligence, parsed: ParsedRequest): number {
    const text = `${endpoint.operationId} ${endpoint.path} ${endpoint.notes || ''} ${(endpoint.tags || []).join(' ')}`.toLowerCase();
    let score = 0;

    if (endpoint.classification === 'DISCOVERY_ONLY') score += 40;
    if (endpoint.classification === 'DETAIL_HYDRATOR') score += 35;
    if (endpoint.riskLevel === 'SAFE_READ') score += 20;

    for (const keyword of parsed.keywords) {
      if (text.includes(keyword)) score += 5;
    }

    if (parsed.objectTypes.includes('KnownPlace')) {
      if (/known[_-]?places|known place|geofence|geo|location/i.test(text)) score += 100;
      if (/known[_-]?ip|ip address|ip_addresses|startingiprange|endingiprange/i.test(text)) score -= 250;
      if (/activity|activities|work\/activities/i.test(text)) score -= 200;
    }

    if (parsed.objectTypes.includes('Person')) {
      if (/person|employee|people/.test(text)) score += 60;
    }

    if (parsed.objectTypes.includes('EmployeeGroup')) {
      if (/employee.*group|group/.test(text)) score += 60;
    }

    if (endpoint.method !== 'GET' && parsed.intent !== 'create' && parsed.intent !== 'update' && parsed.intent !== 'delete') {
      score -= 25;
    }

    return score;
  }
}
