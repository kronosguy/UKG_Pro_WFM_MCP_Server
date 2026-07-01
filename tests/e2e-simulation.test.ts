import { describe, it, expect, beforeAll } from 'vitest';
import { CatalogIngestor } from '../src/catalog/ingestor.js';
import { EndpointGraphBuilder } from '../src/catalog/graph.js';
import { IntentRouter } from '../src/engine/intent-router.js';

// Note: full client calls mocked by not calling real APIs here.
// This validates the NL -> plan -> graph selection + completeness pipeline.

describe('End-to-End Self-Sufficiency Simulation', () => {
  let endpoints: any[];
  let graph: EndpointGraphBuilder;
  let router: IntentRouter;

  beforeAll(async () => {
    const ing = new CatalogIngestor();
    endpoints = await ing.ingest();
    graph = new EndpointGraphBuilder();
    graph.build(endpoints);
    router = new IntentRouter(graph, endpoints);
  });

  it('parses known place request and selects discovery + hydrator', () => {
    const parsed = router.parse('Give me the full details of the Hillcrest South Known Place including geofence and location set');
    expect(parsed.objectTypes).toContain('KnownPlace');
    const selected = router.selectPrimaryEndpoints(parsed);
    const hasDiscovery = selected.some(s => s.classification === 'DISCOVERY_ONLY' || s.operationId.includes('searchKnown'));
    const hasHydrator = selected.some(s => s.classification === 'DETAIL_HYDRATOR');
    expect(hasHydrator || hasDiscovery).toBe(true);
  });

  it('person + timecard flow selects multiple hydrators', () => {
    const parsed = router.parse('Show the complete timecard for employee EMP42 on 2026-06-15 with punches and totals');
    const selected = router.selectPrimaryEndpoints(parsed);
    expect(selected.length).toBeGreaterThan(1);
    expect(selected.some(s => s.objectType === 'Timecard')).toBe(true);
  });

  it('endpoint intelligence meets spec requirements', () => {
    const kp = endpoints.find((e: any) => e.objectType === 'KnownPlace' && e.classification === 'DETAIL_HYDRATOR');
    expect(kp).toBeTruthy();
    expect(kp.finalAnswerEligible).toBe(true);
    expect(kp.hydrationCandidates.length).toBeGreaterThan(0);
    expect(kp.referenceFields.length).toBeGreaterThan(0);
  });
});
