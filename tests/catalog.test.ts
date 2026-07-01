import { describe, expect, it } from 'vitest';
import { CatalogIngestor } from '../src/catalog/ingestor.js';
import { EndpointGraphBuilder } from '../src/catalog/graph.js';

describe('Catalog + Classifier + Graph', () => {
  it('ingests seed endpoints without calling the live catalog', async () => {
    const ingestor = new CatalogIngestor();

    const endpoints = await ingestor.ingest({
      seedPath: 'data/openapi-seed/endpoints.seed.json',
      useSeedOnly: true
    });

    expect(endpoints.length).toBeGreaterThan(0);
    expect(ingestor.getLoadedSource()).toContain('seed:');
    expect(
      endpoints.some(endpoint => endpoint.objectType === 'KnownPlace')
    ).toBe(true);
  });

  it('classifies controlled writes correctly', async () => {
    const ingestor = new CatalogIngestor();

    const endpoints = await ingestor.ingest({
      seedPath: 'data/openapi-seed/endpoints.seed.json',
      useSeedOnly: true
    });

    const createShift = endpoints.find(
      endpoint => endpoint.operationId === 'createShift'
    );

    expect(createShift).toBeTruthy();
    expect(createShift?.requiresConfirmation).toBe(true);
  });

  it('builds graph nodes and hydration relationships', async () => {
    const ingestor = new CatalogIngestor();

    const endpoints = await ingestor.ingest({
      seedPath: 'data/openapi-seed/endpoints.seed.json',
      useSeedOnly: true
    });

    const graphBuilder = new EndpointGraphBuilder();
    const graph = graphBuilder.build(endpoints);

    expect(graph.nodes.size).toBeGreaterThan(0);
  });
});
