/**
 * Controlled write / bulk / action tools.
 * Always hydrate before mutate, support dry-run, require confirmation.
 */
import { BaseUkgTool } from './base-tool.js';
import { ToolMetadata, FullAnswer } from '../types/index.js';

export class CreateShiftTool extends BaseUkgTool {
  name = 'ukg_wfm_create_shift';
  description = 'Create a shift. Hydrates employee + job first. Produces dry-run proposal. Requires explicit confirmation.';
  metadata: ToolMetadata = {
    domain: 'scheduling',
    object_type: 'Shift',
    endpoint_classification: 'ACTION_EXECUTOR',
    risk_level: 'CONTROLLED_WRITE',
    final_answer_eligible: true,
    requires_hydration: true,
    hydration_targets: ['getPersonDetail', 'getJobDetail', 'getScheduleDetail'],
    reverse_lookup_targets: [],
    child_collection_targets: [],
    missing_input_strategy: 'employee + start/end/job + confirmation',
    confidence_rules: 'Requires CERTAIN/HIGH + explicit user confirmation',
    audit_required: true,
    dry_run_supported: true,
    confirmation_required: true
  };

  async execute(userRequest: string, inputs: Record<string, any> = {}): Promise<FullAnswer> {
    // Enhanced: always return dry run proposal first
    const base = await super.execute(userRequest, inputs);
    base.direct_answer = `[DRY-RUN] ${base.direct_answer} \n\nProposed change ready. Reply with "CONFIRM" to execute.`;
    base.caveats.push('Write has not been executed. Confirmation required.');
    return base;
  }
}

export class BulkTimecardEditTool extends BaseUkgTool {
  name = 'ukg_wfm_bulk_timecard_edit';
  description = 'Bulk timecard operation. Hydrates all target timecards, generates impact analysis, dry-run first. HIGH RISK.';
  metadata: ToolMetadata = {
    domain: 'timekeeping_bulk_operations',
    object_type: 'Timecard',
    endpoint_classification: 'BULK_MUTATOR',
    risk_level: 'DANGEROUS_WRITE',
    final_answer_eligible: false,
    requires_hydration: true,
    hydration_targets: ['getTimecard', 'getPunchDetail'],
    reverse_lookup_targets: [],
    child_collection_targets: [],
    missing_input_strategy: 'list of timecard ids or employee+dates + edits + confirmation',
    confidence_rules: '100% completeness + explicit confirmation mandatory',
    audit_required: true,
    dry_run_supported: true,
    confirmation_required: true
  };
}
