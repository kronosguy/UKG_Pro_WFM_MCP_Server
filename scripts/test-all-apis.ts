import { CatalogIngestor } from "../src/catalog/ingestor.js";

const ingestor = new CatalogIngestor();
const endpoints = await ingestor.ingest();

console.log(`Testing all ${endpoints.length} endpoint definitions`);
console.log(`Source: ${ingestor.getLoadedSource()}\n`);

let passed = 0;
let failed = 0;

for (const endpoint of endpoints) {
  const errors: string[] = [];

  if (!endpoint.domain) errors.push("missing domain");
  if (!endpoint.method) errors.push("missing method");
  if (!endpoint.path) errors.push("missing path");
  if (!endpoint.operationId) errors.push("missing operationId");
  if (!endpoint.classification) errors.push("missing classification");
  if (!endpoint.riskLevel) errors.push("missing riskLevel");

  const validMethod = ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(
    String(endpoint.method).toUpperCase()
  );

  if (!validMethod) errors.push(`invalid method: ${endpoint.method}`);

  if (errors.length > 0) {
    failed++;
    console.log(`FAIL ${endpoint.operationId ?? "(unknown)"}`);
    console.log(`  ${errors.join(", ")}`);
  } else {
    passed++;
  }
}

console.log("");
console.log("==============================");
console.log(`Total:  ${endpoints.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log("==============================");

if (failed > 0) process.exit(1);
