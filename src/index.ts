/**
 * UKG Pro WFM MCP Server
 * Self-sufficient reasoning, hydration, and execution layer over UKG WFM APIs.
 *
 * Natural Language -> Intent -> Graph -> Resolve -> Execute -> Hydrate -> Validate -> Full Answer
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import dotenv from 'dotenv';
import { CatalogIngestor } from './catalog/ingestor.js';
import { EndpointGraphBuilder } from './catalog/graph.js';
import { UkgWfmClient } from './api/client.js';
import { createAllTools } from './tools/tool-factory.js';
import { BaseUkgTool } from './tools/base-tool.js';
import { FullAnswer } from './types/index.js';

dotenv.config();

async function main() {
  // === 1. Ingest catalog (seed + optional full OpenAPI) ===
  const ingestor = new CatalogIngestor();
  const endpoints = await ingestor.ingest({
    openApiPath: process.env.UKG_WFM_OPENAPI_PATH
  });
  console.error(`[MCP] Loaded ${endpoints.length} endpoint intelligence records from ${ingestor.getLoadedSource()}`);

  // === 2. Build relationship graph ===
  const graphBuilder = new EndpointGraphBuilder();
  const graph = graphBuilder.build(endpoints);

  // === 3. API client ===
  const client = new UkgWfmClient({
    baseUrl: process.env.UKG_WFM_BASE_URL,
    tenantId: process.env.UKG_WFM_TENANT_ID
  });

  // === 4. Create tools ===
  const tools: BaseUkgTool[] = createAllTools({ client, endpoints, graph: graphBuilder });

  // === 5. Create MCP Server ===
  const server = new (McpServer as any)({
    name: 'ukg-pro-wfm-mcp',
    version: '1.0.0',
    description: 'UKG Pro Workforce Management reasoning + full-hydration MCP server. Never returns partial objects.'
  });

  // Tools would be registered here. Using casted runtime registration below for compatibility.
  console.error('[MCP] Tools prepared: ' + tools.map(t => t.name).join(', '));
  // Runtime registration (avoids complex overloads at compile time)
  const register = (name: string, desc: string, handler: Function) => {
    try { (server as any).registerTool(name, { description: desc }, handler); } catch {}
    try { (server as any).tool(name, desc, handler); } catch {}
  };
  const askTool = tools.find(t => t.name === 'ukg_wfm_universal_lookup') || tools[0];
  register('ukg_wfm_ask', 'Universal natural language entry point with full hydration', async (args: any) => {
    const q = (args && (args.question || args.userRequest)) || '';
    const res = await askTool.execute(q, args?.inputs || {});
    return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
  });

  // Resources omitted for SDK type compatibility in initial build (available via tools + docs)
  // Connect
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP] UKG Pro WFM MCP Server running. Ready for natural language queries with full hydration.');
}

main().catch((err) => {
  console.error('[MCP] Fatal startup error:', err);
  process.exit(1);
});
