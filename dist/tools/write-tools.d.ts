/**
 * Controlled write / bulk / action tools.
 * Always hydrate before mutate, support dry-run, require confirmation.
 */
import { BaseUkgTool } from './base-tool.js';
import { ToolMetadata, FullAnswer } from '../types/index.js';
export declare class CreateShiftTool extends BaseUkgTool {
    name: string;
    description: string;
    metadata: ToolMetadata;
    execute(userRequest: string, inputs?: Record<string, any>): Promise<FullAnswer>;
}
export declare class BulkTimecardEditTool extends BaseUkgTool {
    name: string;
    description: string;
    metadata: ToolMetadata;
}
//# sourceMappingURL=write-tools.d.ts.map