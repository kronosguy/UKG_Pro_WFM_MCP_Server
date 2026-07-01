# UKG Pro WFM MCP Server — Developer Guide

## Philosophy

This MCP server is a **reasoning layer**, not a proxy.

Every API response is treated as the start of a graph. The server is obligated to walk that graph using available endpoints until every reachable object is fully materialized or explicitly marked blocked.

## Key Loops (must remain correct)

1. **Universal Endpoint Digest Loop** — every op gets an intelligence record
2. **Universal Hydration Loop** — parse → identify refs → hydrate → repeat
3. **Missing Input Resolution Loop** — try inference, discovery, prior results, tenant, parents, children, crosswalks, safe defaults — then ask
4. **Natural Language Request Loop** — normalize → extract → plan → discover → hydrate → validate → answer with trace

## Adding a New Domain / Endpoint

1. Add representative intelligence record to `data/openapi-seed/endpoints.seed.json` (or ingest real OpenAPI)
2. Rebuild graph on restart
3. Optionally create a specialized tool in `src/tools/`
4. Add test cases

The classifier will handle most classification. You can override in the seed.

## Implementing a New Tool

```ts
export class MyNewTool extends BaseUkgTool {
  name = 'ukg_wfm_...';
  description = '...';
  metadata = { ... };

  // You can override any of:
  // validateInputs, resolveMissingInputs, executeDiscovery, ...
  // or just rely on the universal execute()
}
```

All tools inherit the full `execute()` algorithm.

## Hydration Rules

Reference fields that trigger hydration (partial list):
`id`, `personId`, `employeeId`, `*_ref`, `*_id`, `managerId`, `jobId`, `profileId`, `knownPlaceId`, `hyperfindId`, `scheduleId`, `timecardId`, `punchId`, etc.

See `src/types/index.ts` → `REFERENCE_FIELD_PATTERNS`

## Confidence & Completeness

- Never claim CERTAIN unless criteria strictly met.
- For payroll/timecard affecting reads, aim for 100% on the target object.
- Disclose every blocked ref.

## Testing Strategy

- Unit: parser, classifier, graph, scorer
- Integration: mocked client calls that return partials → assert full hydration occurred
- End-to-end: feed natural language, inspect `hydration_status` and `source_chain`

## Debugging

Set env `LOG_LEVEL=debug` (future) or inspect returned `source_chain` + `raw`.

Use the diagnostic tools:
- `ukg_wfm_endpoint_scorecard`
- `ukg_wfm_hydrate_object`
- Resources: `ukg://graph`

## Security & Safety

- Writes are never automatic.
- Bearer tokens and client secrets via environment only.
- All mutations should be audited (already logged).

## Future Enhancements

- Full dynamic tool generation from ingested OpenAPI
- LLM-assisted entity extraction (optional, behind flag)
- Persistent graph cache / Redis
- Pagination + async job awareness
- Multi-tenant switching in one session
- Hyperfind expansion in resolver

Keep the "NO PARTIAL RESPONSE" rule absolute.
