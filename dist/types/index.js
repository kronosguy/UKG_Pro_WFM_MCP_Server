/**
 * Core Types for UKG Pro WFM MCP Server
 * Universal reasoning, hydration, and execution layer.
 */
// Reference field patterns (universal)
export const REFERENCE_FIELD_PATTERNS = [
    /^id$/, /^uuid$/, /^guid$/, /^persistentId$/, /^qualifier$/, /^name$/,
    /Id$/, /_id$/, /Ref$/, /_ref$/, /Guid$/, /_guid$/, /Qualifier$/, /_qualifier$/,
    /^personId$/, /^employeeId$/, /^employeeNumber$/, /^personNumber$/,
    /^managerId$/, /^jobId$/, /^orgId$/, /^laborCategoryId$/,
    /^payCodeId$/, /^workRuleId$/, /^payRuleId$/, /^profileId$/,
    /^accessProfileId$/, /^displayProfileId$/, /^dataAccessProfileId$/,
    /^functionAccessProfileId$/, /^employeeGroupId$/, /^locationId$/,
    /^locationSetId$/, /^knownPlaceId$/, /^hyperfindId$/, /^scheduleId$/,
    /^shiftId$/, /^punchId$/, /^timecardId$/, /^accrualProfileId$/,
    /^leaveCaseId$/, /^deviceId$/, /^workflowId$/, /^processId$/
];
//# sourceMappingURL=index.js.map