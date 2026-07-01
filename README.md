# UKG Pro WFM MCP Server

**Self-sufficient reasoning, hydration, and execution layer for the UKG Pro Workforce Management API.**

This is **not** a thin OpenAPI wrapper. It is a full reasoning engine that:

- Accepts natural language
- Detects intent and required objects
- Discovers candidates via search/list endpoints (treated as **discovery only**)
- Resolves every missing input through safe paths
- **Hydrates every partial object** using detail endpoints
- Traverses the full object graph until complete or provably blocked
- Validates completeness
- Scores confidence using strict rules
- **Never returns a partial answer** when more detail is available
- Applies the rule universally across **every domain**

## Core Principles (Non-Negotiable)

1. Search/List = Discovery steps only. Never final truth.
2. For every response, detect refs/IDs/partials → hydrate via best endpoint → repeat.
3. Answer only after the hydration graph is complete (or all paths exhausted and disclosed).
4. Write actions: hydrate first, dry-run, explicit confirmation, re-read after.
5. Full answer contract always includes: source chain, hydration status, confidence, caveats, business interpretation.

## Supported Domains (Current Seed + Extensible)

attendance, common_resources, employee_self_service, forecasting, healthcare_productivity, hcm, leave, people, person_assignments, platform, webhook_events, scheduling, scheduling_setup, timekeeping, timekeeping_setup, timekeeping_timecards, timekeeping_bulk_operations, universal_device_manager

## Quick Start

```bash
cp .env.example .env
# edit .env with credentials / bearer

npm install
npm run build
npm run dev
```

## Primary Tool (Recommended)

`ukg_wfm_ask` — send any natural language question.

Examples:
- "Give me the full details of the Hillcrest South Known Place including geofence and location set"
- "Hydrate the ICU Nurses employee group and all linked profiles and org refs"
- "Show the complete timecard for employee 12345 on 2026-06-15 including punches, exceptions and totals"
- "What is the schedule coverage for the ER nurses group next week? Hydrate everything."

Other tools:
- `ukg_wfm_lookup_person`
- `ukg_wfm_lookup_timecard`
- `ukg_wfm_lookup_schedule`
- `ukg_wfm_lookup_known_place`
- `ukg_wfm_create_shift` (dry-run + confirmation)
- `ukg_wfm_bulk_timecard_edit`
- Composite workflows: `ukg_wfm_workflow_reconcile_timecard`, `ukg_wfm_workflow_analyze_schedule_coverage`
- Diagnostic: `ukg_wfm_endpoint_scorecard`, `ukg_wfm_list_domains`

## How It Works (Execution Algorithm)

```
Natural Language
  → Intent Router + Entity Extraction
  → Missing Input Detection + Exhaustive Resolver (user, search, prior, tenant, parent/child, inference)
  → Discovery via search/list
  → Candidate ranking
  → Primary endpoint execution
  → Response Graph Parse (objects, refs, collections, relationships)
  → Hydration Engine: while pending refs → find hydrator → resolve params → call → merge → recurse
  → Completeness Validator
  → Confidence Scorer (CERTAIN / HIGH / MEDIUM / LOW / BLOCKED)
  → Full Answer Formatter (with trace, hydration stats, caveats)
  → Audit Logger
```

## Tool Metadata (Every Tool)

Every generated tool carries:

```json
{
  "domain": "...",
  "object_type": "...",
  "endpoint_classification": "DETAIL_HYDRATOR | DISCOVERY_ONLY | ...",
  "risk_level": "SAFE_READ | CONTROLLED_WRITE | ...",
  "requires_hydration": true,
  "hydration_targets": ["..."],
  ...
}
```

## Confidence Levels

- **CERTAIN**: unique immutable ID + full detail + all required deps hydrated + no conflicts
- **HIGH**: high-confidence candidate + full detail + minor refs unavailable
- **MEDIUM**: likely + partial
- **LOW**: ambiguous / incomplete
- **BLOCKED**: cannot proceed safely

## Write Safety

All writes:
1. Resolve inputs + hydrate target + hydrate dependents
2. Generate dry-run result
3. Require explicit user confirmation in chat
4. Execute
5. Re-hydrate and return before/after

## Endpoint Graph

Built at startup. Powers intelligent routing and hydration selection. Nodes: endpoint/object/identifier/domain. Edges include HYDRATES, RETURNS, REQUIRES, etc.

## Extending

- Drop a full `openapi.yml` and set `UKG_WFM_OPENAPI_PATH`
- Re-run ingest / restart server
- The classifier + graph will automatically register new endpoints
- Add new concrete tools by extending `BaseUkgTool` and registering in `tool-factory.ts`

## Running Scorecard

```bash
npm run scorecard
# produces docs/endpoint-scorecard.json + tool-risk-matrix.json
```

## Testing

```bash
npm test
```

## Production Notes

- Use proper OAuth2 client credentials (env)
- Store tokens securely; never commit
- Rate limits and tenant quotas apply — the engine is chatty during hydration by design
- Audit log written to `logs/audit.log`
- For very large tenants, consider summary-only mode or explicit max hydration depth (configurable in engine)

## Architecture Files

- `src/catalog/` — ingestor + classifier + graph
- `src/engine/` — intent, missing, hydration, parser, validator, scorer, audit
- `src/tools/` — universal execution algorithm + concrete tools
- `src/api/client.ts` — authenticated resilient client
- `src/index.ts` — MCP server + tool registration

This server implements the complete mission spec.

Built for the UKG WFM Academy.
