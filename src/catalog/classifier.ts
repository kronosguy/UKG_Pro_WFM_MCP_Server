/**
 * Endpoint Classifier
 * Produces full EndpointIntelligence record for any operation.
 * Applies universal rules from the mission spec.
 */
import { EndpointIntelligence, EndpointClassification, RiskLevel, HttpMethod } from '../types/index.js';

export function classifyEndpoint(raw: Partial<EndpointIntelligence>): Partial<EndpointIntelligence> {
  const method = (raw.method || 'GET') as HttpMethod;
  const path = raw.path || '';
  const opId = raw.operationId || '';
  const notes = raw.notes || '';

  let classification: EndpointClassification = raw.classification || 'DISCOVERY_ONLY';
  let riskLevel: RiskLevel = raw.riskLevel || 'SAFE_READ';
  let finalAnswerEligible = raw.finalAnswerEligible ?? false;
  let requiresConfirmation = raw.requiresConfirmation ?? false;

  const isGet = method === 'GET';
  const isSearchOrList = /search|list|find|multi_read|query/i.test(opId + ' ' + path + ' ' + notes);
  const isDetail = /get|retrieve|detail|read/i.test(opId + ' ' + path) && !isSearchOrList;
  const isCreate = method === 'POST' && !isSearchOrList;
  const isUpdate = ['PUT', 'PATCH'].includes(method);
  const isDelete = method === 'DELETE';
  const isBulk = /bulk|batch|multiple/i.test(opId + path + notes);

  if (isBulk) {
    classification = 'BULK_MUTATOR';
    riskLevel = 'DANGEROUS_WRITE';
    requiresConfirmation = true;
    finalAnswerEligible = false;
  } else if (isDelete) {
    classification = 'ACTION_EXECUTOR';
    riskLevel = 'DESTRUCTIVE';
    requiresConfirmation = true;
  } else if (isCreate || isUpdate) {
    classification = 'ACTION_EXECUTOR';
    riskLevel = 'CONTROLLED_WRITE';
    requiresConfirmation = true;
    finalAnswerEligible = true;
  } else if (isDetail) {
    classification = 'DETAIL_HYDRATOR';
    riskLevel = 'SAFE_READ';
    finalAnswerEligible = true;
  } else if (isSearchOrList) {
    classification = 'DISCOVERY_ONLY';
    riskLevel = 'SAFE_READ';
    finalAnswerEligible = false;
  } else if (/validate|check|verify/i.test(opId)) {
    classification = 'VALIDATOR';
    finalAnswerEligible = true;
  } else if (/webhook|event|subscription/i.test(opId + path)) {
    classification = 'EVENT_SOURCE';
  } else if (/relationship|link|assign|map/i.test(opId + path)) {
    classification = 'RELATIONSHIP_RESOLVER';
  }

  // Reference fields always include standard patterns + any from raw
  const referenceFields = Array.from(new Set([
    ...(raw.referenceFields || []),
    'id', 'personId', 'employeeId', 'managerId', 'jobId', 'orgRef', 'profileRef',
    'locationId', 'scheduleId', 'punchId', 'timecardId', 'hyperfindId', 'knownPlaceId'
  ]));

  // Hydration candidates heuristics (will be enriched by graph builder)
  const hydrationCandidates = raw.hydrationCandidates || inferHydrationCandidates(opId, raw.objectType || '');

  return {
    ...raw,
    classification,
    riskLevel,
    finalAnswerEligible,
    requiresConfirmation,
    referenceFields,
    hydrationCandidates,
    toolEligible: raw.toolEligible ?? true,
  };
}

function inferHydrationCandidates(opId: string, objectType: string): string[] {
  const base = objectType.replace(/s$/, '');
  const candidates: string[] = [];
  candidates.push(`get${base}Detail`);
  candidates.push(`retrieve${base}`);
  candidates.push(`get${base}`);
  if (objectType.toLowerCase().includes('person')) {
    candidates.push('getPersonDetail', 'retrievePersons', 'getHcmEmployee');
  }
  if (objectType.toLowerCase().includes('schedule')) candidates.push('getScheduleDetail', 'getShiftDetail');
  if (objectType.toLowerCase().includes('timecard')) candidates.push('getTimecard', 'getTimecardPunches');
  if (objectType.toLowerCase().includes('punch')) candidates.push('getPunchDetail');
  if (objectType.toLowerCase().includes('known')) candidates.push('getKnownPlaceDetail');
  return Array.from(new Set(candidates.filter(c => c !== opId)));
}
