import { EndpointIntelligence } from '../types/index.js';
export interface IngestOptions {
    openApiPath?: string;
    seedPath?: string;
    baseUrl?: string;
}
export declare class CatalogIngestor {
    private cache;
    private loadedFrom;
    ingest(opts?: IngestOptions): Promise<EndpointIntelligence[]>;
    private parseOpenApiToIntelligence;
    private enrichEndpoint;
    private inferDomainFromTags;
    private inferObjectType;
    private extractInputIdentifiers;
    private extractOutputIdentifiers;
    private extractReferenceFields;
    private inferRisk;
    getLoadedEndpoints(): EndpointIntelligence[];
    getLoadedSource(): string;
}
//# sourceMappingURL=ingestor.d.ts.map