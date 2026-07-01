import { describe, expect, it } from 'vitest';
import { CatalogIngestor } from '../src/catalog/ingestor.js';
import { EndpointGraphBuilder } from '../src/catalog/graph.js';

describe('Catalog + Classifier + Graph', () => {
  it('ingests seed endpoints', async () => {
    const ing = new CatalogIngestor();
    const eps = await ing.ingest({
      seedPath: 'data/openapi-seed/endpoints.seed.json',
      catalogUrl: 'seed-only'
    });

    expect(eps.length).toBeGreaterThan(0);
    expect(eps.some(e => e.objectType === 'KnownPlace')).toBe(true);
  }, 15000);

  it('classifies correctly', async () => {
    const ing = new CatalogIngestor();
    const eps = await ing.ingest({
      seedPath: 'data/openapi-seed/endpoints.seed.json',
      catalogUrl: 'seed-only'
    });

    const write = eps.find(e => e.operationId === 'createShift');
    expect(write?.requiresConfirmation).toBe(true);
  }, 15000);

  it('builds graph with hydration edges', async () => {
    const ing = new CatalogIngestor();
    const eps = await ing.ingest({
      seedPath: 'data/openapi-seed/endpoints.seed.json',
      catalogUrl: 'seed-only'
    });

    const graph = new EndpointGraphBuilder().build(eps);
    expect(graph.nodes.size).toBeGreaterThan(0);
  }, 15000);
});
