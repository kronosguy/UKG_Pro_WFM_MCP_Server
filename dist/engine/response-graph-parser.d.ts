/**
 * Universal Response Graph Parser
 * Turns any API response into a traversable graph of objects, refs, collections.
 */
import { ResponseGraph } from '../types/index.js';
export declare class ResponseGraphParser {
    parse(response: any, rootPath?: string): ResponseGraph;
    private walk;
    private extractId;
    private isReferenceField;
    findAllReferenceValues(graph: ResponseGraph): Array<{
        path: string;
        value: string;
        hint?: string;
    }>;
}
//# sourceMappingURL=response-graph-parser.d.ts.map