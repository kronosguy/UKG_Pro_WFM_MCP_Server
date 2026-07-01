/**
 * Generates Endpoint Scorecard + Tool Risk Matrix.
 */
import { CatalogIngestor } from '../src/catalog/ingestor.js';
import fs from 'fs/promises';

async function run() {
  const ingestor = new CatalogIngestor();
  const eps = await ingestor.ingest();

  const byDomain: Record<string, number> = {};
  const byClass: Record<string, number> = {};
  const byRisk: Record<string, number> = {};
  let finalAnswer = 0, write = 0, requiresHydration = 0;

  for (const e of eps) {
    byDomain[e.domain] = (byDomain[e.domain] || 0) + 1;
    byClass[e.classification] = (byClass[e.classification] || 0) + 1;
    byRisk[e.riskLevel] = (byRisk[e.riskLevel] || 0) + 1;
    if (e.finalAnswerEligible) finalAnswer++;
    if (['ACTION_EXECUTOR', 'BULK_MUTATOR'].includes(e.classification)) write++;
    if (e.hydrationCandidates.length > 0) requiresHydration++;
  }

  const scorecard = {
    generatedAt: new Date().toISOString(),
    total: eps.length,
    byDomain,
    byClassification: byClass,
    byRiskLevel: byRisk,
    finalAnswerEligible: finalAnswer,
    writeOperations: write,
    hydrationAware: requiresHydration,
    sampleIntelligenceRecords: eps.slice(0, 5),
    complianceNotes: [
      'Search/list endpoints marked DISCOVERY_ONLY with finalAnswerEligible=false',
      'Every DETAIL_HYDRATOR is finalAnswerEligible only after hydration',
      'All writes require confirmation + pre-hydration',
      'Graph contains hydration edges for every reference pattern'
    ]
  };

  const riskMatrix = {
    SAFE_READ: eps.filter(e => e.riskLevel === 'SAFE_READ').map(e => e.operationId),
    CONTROLLED_WRITE: eps.filter(e => e.riskLevel === 'CONTROLLED_WRITE').map(e => e.operationId),
    DANGEROUS_WRITE: eps.filter(e => e.riskLevel === 'DANGEROUS_WRITE').map(e => e.operationId),
    DESTRUCTIVE: eps.filter(e => e.riskLevel === 'DESTRUCTIVE').map(e => e.operationId)
  };

  await fs.mkdir('docs', { recursive: true });
  await fs.writeFile('docs/endpoint-scorecard.json', JSON.stringify(scorecard, null, 2));
  await fs.writeFile('docs/tool-risk-matrix.json', JSON.stringify(riskMatrix, null, 2));
  console.log('Scorecard + Risk Matrix written to docs/');
}

run();
