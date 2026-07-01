/**
 * Read-only safe tools.
 */
import { BaseUkgTool } from './base-tool.js';
import { ToolMetadata } from '../types/index.js';

export class LookupPersonTool extends BaseUkgTool {
  name = 'ukg_wfm_lookup_person';
  description = 'Lookup and fully hydrate a Person (employee) record including assignments, profiles, manager, groups.';
  metadata: ToolMetadata = {
    domain: 'people',
    object_type: 'Person',
    endpoint_classification: 'DETAIL_HYDRATOR',
    risk_level: 'SAFE_READ',
    final_answer_eligible: true,
    requires_hydration: true,
    hydration_targets: ['getPersonDetail', 'getPersonAssignments', 'getEmployeeGroupDetail'],
    reverse_lookup_targets: ['searchPersons'],
    child_collection_targets: ['listPersonJobs'],
    missing_input_strategy: 'name_or_id_from_request_or_discovery',
    confidence_rules: 'CERTAIN if unique personId + full detail + all key refs hydrated',
    audit_required: true,
    dry_run_supported: false,
    confirmation_required: false
  };
}

export class LookupKnownPlaceTool extends BaseUkgTool {
  name = 'ukg_wfm_lookup_known_place';
  description = 'Resolve Known Place by name or id. Hydrates location set, geofence, effective status.';
  metadata: ToolMetadata = {
    domain: 'common_resources',
    object_type: 'KnownPlace',
    endpoint_classification: 'DETAIL_HYDRATOR',
    risk_level: 'SAFE_READ',
    final_answer_eligible: true,
    requires_hydration: true,
    hydration_targets: ['getKnownPlaceDetail'],
    reverse_lookup_targets: ['searchKnownPlaces'],
    child_collection_targets: [],
    missing_input_strategy: 'name search then hydrate',
    confidence_rules: 'HIGH when locationSet + geofence hydrated',
    audit_required: true,
    dry_run_supported: false,
    confirmation_required: false
  };
}

export class LookupTimecardTool extends BaseUkgTool {
  name = 'ukg_wfm_lookup_timecard';
  description = 'Fully hydrate a timecard: punches, totals, exceptions, pay codes, linked rules.';
  metadata: ToolMetadata = {
    domain: 'timekeeping_timecards',
    object_type: 'Timecard',
    endpoint_classification: 'DETAIL_HYDRATOR',
    risk_level: 'SAFE_READ',
    final_answer_eligible: true,
    requires_hydration: true,
    hydration_targets: ['getTimecard', 'getPunchDetail', 'listExceptions'],
    reverse_lookup_targets: ['findTimecardByEmployeeDate'],
    child_collection_targets: ['getTimecardPunches', 'getTimecardTotals'],
    missing_input_strategy: 'employee + date or timecardId',
    confidence_rules: 'CERTAIN for payroll affecting objects only when 100% hydrated',
    audit_required: true,
    dry_run_supported: false,
    confirmation_required: false
  };
}

export class LookupScheduleTool extends BaseUkgTool {
  name = 'ukg_wfm_lookup_schedule';
  description = 'Hydrate schedule + shifts + linked jobs, work rules, pay rules.';
  metadata: ToolMetadata = {
    domain: 'scheduling',
    object_type: 'Schedule',
    endpoint_classification: 'DETAIL_HYDRATOR',
    risk_level: 'SAFE_READ',
    final_answer_eligible: true,
    requires_hydration: true,
    hydration_targets: ['getScheduleDetail', 'getShiftDetail', 'getWorkRuleDetail'],
    reverse_lookup_targets: [],
    child_collection_targets: ['listScheduleShifts'],
    missing_input_strategy: 'employee + date range',
    confidence_rules: 'HIGH when shifts and rules hydrated',
    audit_required: true,
    dry_run_supported: false,
    confirmation_required: false
  };
}

export class UniversalLookupTool extends BaseUkgTool {
  name = 'ukg_wfm_universal_lookup';
  description = 'Natural language entrypoint. Detects intent/object, discovers, ranks, hydrates EVERYTHING reachable. The primary tool for all read queries.';
  metadata: ToolMetadata = {
    domain: 'platform',
    object_type: 'Any',
    endpoint_classification: 'DETAIL_HYDRATOR',
    risk_level: 'SAFE_READ',
    final_answer_eligible: true,
    requires_hydration: true,
    hydration_targets: ['*'],
    reverse_lookup_targets: ['*'],
    child_collection_targets: ['*'],
    missing_input_strategy: 'exhaustive resolution before call',
    confidence_rules: 'Follows full spec: CERTAIN/HIGH/MEDIUM/LOW/BLOCKED with disclosure',
    audit_required: true,
    dry_run_supported: false,
    confirmation_required: false
  };
}
