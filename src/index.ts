/**
 * UKG Pro WFM MCP Server
 * Self-sufficient reasoning, hydration, and execution layer over UKG WFM APIs.
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

dotenv.config();

async function main() {
  const ingestor = new CatalogIngestor();
  const endpoints = await ingestor.ingest({
    openApiPath: process.env.UKG_WFM_OPENAPI_PATH
  });

  console.error(
    `[MCP] Loaded ${endpoints.length} endpoint intelligence records from ${ingestor.getLoadedSource()}`
  );

  const graphBuilder = new EndpointGraphBuilder();
  const graph = graphBuilder.build(endpoints);

  const client = new UkgWfmClient({
    baseUrl: process.env.UKG_BASE_URL || process.env.UKG_WFM_BASE_URL,
    tenantId: process.env.UKG_ORGANIZATION || process.env.UKG_WFM_TENANT_ID
  });

  const tools: BaseUkgTool[] = createAllTools({
    client,
    endpoints,
    graph: graphBuilder
  });

  const server = new McpServer({
    name: 'ukg-pro-wfm-mcp',
    version: '1.0.0'
  });

  const askTool =
    tools.find(t => t.name === 'ukg_wfm_universal_lookup') ||
    tools[0];

  server.tool(
    'ukg_wfm_ask',
    'Universal natural language entry point with full hydration',
    {
      question: z
        .string()
        .min(1)
        .describe('Natural language UKG Pro WFM question or request.'),
      inputs: z.record(z.string(), z.any())
        .optional()
        .describe('Optional structured inputs such as employeeId, personId, dateRange, knownPlaceId, or groupId.')
    },
    async ({ question, inputs }) => {
      const result = await askTool.execute(question, inputs || {});

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  console.error('[MCP] Registered tool: ukg_wfm_ask');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[MCP] UKG Pro WFM MCP Server running.');
}

main().catch(err => {
  console.error('[MCP] Fatal startup error:', err);
  process.exit(1);
});
