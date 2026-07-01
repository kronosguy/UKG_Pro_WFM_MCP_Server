import { describe, it, expect } from 'vitest';
import { CatalogIngestor } from '../src/catalog/ingestor.js';
import { EndpointGraphBuilder } from '../src/catalog/graph.js';
import { classifyEndpoint } from '../src/catalog/classifier.js';

describe('Catalog + Classifier + Graph', () => {
  it('ingests seed endpoints', async () => {
    const ing = new CatalogIngestor();
    const eps = await ing.ingest();
    expect(eps.length).toBeGreaterThan(10);
    expect(eps.some(e => e.domain === 'people')).toBe(true);
  });

  it('classifies correctly', () => {
    const classified = classifyEndpoint({
      operationId: 'searchPersons',
      method: 'POST',
      path: '/search',
      objectType: 'Person'
    });
    expect(classified.classification).toBe('DISCOVERY_ONLY');
    expect(classified.finalAnswerEligible).toBe(false);
  });

  it('builds graph with hydration edges', async () => {
    const ing = new CatalogIngestor();
    const eps = await ing.ingest();
    const gb = new EndpointGraphBuilder();
    const g = gb.build(eps);
    expect(g.nodes.size).toBeGreaterThan(20);
    expect(g.edges.length).toBeGreaterThan(30);
    expect(gb.findHydratorsFor('Person').length).toBeGreaterThan(0);
  });
});
