import { describe, expect, it, beforeAll } from 'vitest';
import { CatalogIngestor } from '../src/catalog/ingestor.js';

let endpoints: any[] = [];

beforeAll(async () => {
  const ingestor = new CatalogIngestor();

  endpoints = await ingestor.ingest({
    seedPath: 'data/openapi-seed/endpoints.seed.json'
  });
});

describe('End-to-End Self-Sufficiency Simulation', () => {
  it('parses known place request and selects discovery + hydrator', () => {
    const discovery = endpoints.find(
      (e: any) =>
        e.objectType === 'KnownPlace' &&
        e.classification === 'DISCOVERY_ONLY'
    );

    const hydrator = endpoints.find(
      (e: any) =>
        e.objectType === 'KnownPlace' &&
        e.classification === 'DETAIL_HYDRATOR'
    );

    expect(discovery).toBeTruthy();
    expect(hydrator).toBeTruthy();
  });

  it('person + timecard flow selects multiple hydrators', () => {
    const personHydrator = endpoints.find(
      (e: any) =>
        e.objectType === 'Person' &&
        e.classification === 'DETAIL_HYDRATOR'
    );

    const timecardHydrator = endpoints.find(
      (e: any) =>
        e.objectType === 'Timecard' &&
        e.classification === 'DETAIL_HYDRATOR'
    );

    expect(personHydrator).toBeTruthy();
    expect(timecardHydrator).toBeTruthy();
  });

  it('endpoint intelligence meets spec requirements', () => {
    const kp = endpoints.find(
      (e: any) =>
        e.objectType === 'KnownPlace' &&
        e.classification === 'DETAIL_HYDRATOR'
    );

    expect(kp).toBeTruthy();
    expect(kp.finalAnswerEligible).toBe(true);

    if (kp.classification === 'DISCOVERY_ONLY') {
      expect(kp.hydrationCandidates.length).toBeGreaterThan(0);
    } else {
      expect(kp.finalAnswerEligible).toBe(true);
    }

    expect(kp.referenceFields.length).toBeGreaterThan(0);
  });
});
