/**
 * Composite workflow tools - multi-step orchestrated actions.
 */
import { BaseUkgTool } from './base-tool.js';
import { ToolMetadata, FullAnswer } from '../types/index.js';

export class ReconcileEmployeeTimecardWorkflow extends BaseUkgTool {
  name = 'ukg_wfm_workflow_reconcile_timecard';
  description = 'Composite: Discover employee -> hydrate person + assignments -> find timecard -> hydrate punches/totals/exceptions -> cross validate totals vs punches -> report discrepancies.';
  metadata: ToolMetadata = {
    domain: 'timekeeping',
    object_type: 'Timecard',
    endpoint_classification: 'DETAIL_HYDRATOR',
    risk_level: 'SAFE_READ',
    final_answer_eligible: true,
    requires_hydration: true,
    hydration_targets: ['*'],
    reverse_lookup_targets: ['*'],
    child_collection_targets: ['*'],
    missing_input_strategy: 'employee + date range',
    confidence_rules: 'Requires 95%+ completeness for audit workflows',
    audit_required: true,
    dry_run_supported: false,
    confirmation_required: false
  };
}

export class AnalyzeScheduleCoverageWorkflow extends BaseUkgTool {
  name = 'ukg_wfm_workflow_analyze_schedule_coverage';
  description = 'Composite: Resolve location/employee group -> hydrate schedules -> hydrate each shift + employee + job -> summarize coverage gaps vs forecast if available.';
  metadata: ToolMetadata = {
    domain: 'scheduling',
    object_type: 'Schedule',
    endpoint_classification: 'DETAIL_HYDRATOR',
    risk_level: 'SAFE_READ',
    final_answer_eligible: true,
    requires_hydration: true,
    hydration_targets: ['getScheduleDetail', 'getPersonDetail', 'getForecast'],
    reverse_lookup_targets: [],
    child_collection_targets: [],
    missing_input_strategy: 'group or location + date',
    confidence_rules: 'HIGH when all shifts + employees hydrated',
    audit_required: true,
    dry_run_supported: false,
    confirmation_required: false
  };
}
