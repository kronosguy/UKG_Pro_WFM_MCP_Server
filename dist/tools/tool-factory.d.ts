import { BaseUkgTool } from './base-tool.js';
import { UkgWfmClient } from '../api/client.js';
import { EndpointIntelligence } from '../types/index.js';
import { EndpointGraphBuilder } from '../catalog/graph.js';
export declare function createAllTools(deps: {
    client: UkgWfmClient;
    endpoints: EndpointIntelligence[];
    graph: EndpointGraphBuilder;
}): BaseUkgTool[];
//# sourceMappingURL=tool-factory.d.ts.map