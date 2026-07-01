import { LookupPersonTool, LookupKnownPlaceTool, LookupTimecardTool, LookupScheduleTool, UniversalLookupTool } from './read-tools.js';
import { CreateShiftTool, BulkTimecardEditTool } from './write-tools.js';
import { ReconcileEmployeeTimecardWorkflow, AnalyzeScheduleCoverageWorkflow } from './workflow-tools.js';
import { IntentRouter } from '../engine/intent-router.js';
import { MissingInputResolver } from '../engine/missing-input-resolver.js';
import { HydrationEngine } from '../engine/hydration-engine.js';
import { CompletenessValidator } from '../engine/completeness-validator.js';
import { ConfidenceScorer } from '../engine/confidence-scorer.js';
import { AuditLogger } from '../engine/audit-logger.js';
export function createAllTools(deps) {
    const router = new IntentRouter(deps.graph, deps.endpoints);
    const resolver = new MissingInputResolver(deps.client, deps.endpoints, deps.graph);
    const hydrator = new HydrationEngine(deps.client, deps.graph, deps.endpoints, resolver);
    const validator = new CompletenessValidator();
    const scorer = new ConfidenceScorer();
    const audit = new AuditLogger();
    const baseDeps = {
        client: deps.client,
        endpoints: deps.endpoints,
        graph: deps.graph,
        router,
        resolver,
        hydrator,
        validator,
        scorer,
        audit
    };
    const tools = [
        new UniversalLookupTool(baseDeps),
        new LookupPersonTool(baseDeps),
        new LookupKnownPlaceTool(baseDeps),
        new LookupTimecardTool(baseDeps),
        new LookupScheduleTool(baseDeps),
        new CreateShiftTool(baseDeps),
        new BulkTimecardEditTool(baseDeps),
        new ReconcileEmployeeTimecardWorkflow(baseDeps),
        new AnalyzeScheduleCoverageWorkflow(baseDeps)
    ];
    return tools;
}
//# sourceMappingURL=tool-factory.js.map