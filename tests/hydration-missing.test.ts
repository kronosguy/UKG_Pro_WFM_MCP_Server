import { describe, it, expect, vi } from 'vitest';
import { ResponseGraphParser } from '../src/engine/response-graph-parser.js';
import { CompletenessValidator } from '../src/engine/completeness-validator.js';
import { ConfidenceScorer } from '../src/engine/confidence-scorer.js';
import { MissingInputResolver } from '../src/engine/missing-input-resolver.js';

describe('Parser + Completeness + Confidence + Resolver', () => {
  it('parses refs and collections', () => {
    const parser = new ResponseGraphParser();
    const g = parser.parse({ id: '123', personId: 'P99', punches: [{ id: 'p1' }] });
    expect(g.objects.has('123') || g.objects.has('primary:123')).toBeTruthy();
    expect(parser.findAllReferenceValues(g).some(r => r.value === 'P99')).toBe(true);
  });

  it('computes completeness', () => {
    const v = new CompletenessValidator();
    const report = v.validate({ primary: {}, objects: new Map([['1', {}]]), references: [], collections: [], relationships: [] } as any);
    expect(report.completeness_score).toBeGreaterThanOrEqual(0);
  });

  it('scores confidence correctly', () => {
    const scorer = new ConfidenceScorer();
    const c = scorer.score({ completeness_score: 0.99, hydrated_required_objects: 5, total_required_objects: 5, unresolved_reference_count: 0, blocked_reference_count: 0, ambiguous_reference_count: 0, permission_blocked_count: 0, endpoint_unavailable_count: 0, inferred_value_count: 0, user_supplied_value_count: 1, missing_fields: [], blocked_fields: [] }, true, false, 0);
    expect(['CERTAIN', 'HIGH']).toContain(c.level);
  });
});
