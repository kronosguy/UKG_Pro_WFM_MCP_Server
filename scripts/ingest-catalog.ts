import { CatalogIngestor } from '../src/catalog/ingestor.js';

async function main() {
  const ing = new CatalogIngestor();
  const eps = await ing.ingest({ openApiPath: process.argv[2] });
  console.log(`Ingested ${eps.length} endpoints. Source: ${ing.getLoadedSource()}`);
  console.dir(eps.slice(0, 2), { depth: 1 });
}
main();
