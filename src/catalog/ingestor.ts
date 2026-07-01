import fs from 'fs/promises';
import path from 'path';
import SwaggerParser from '@apidevtools/swagger-parser';
import { EndpointIntelligence, HttpMethod } from '../types/index.js';
import { classifyEndpoint } from './classifier.js';

export interface IngestOptions {
  openApiPath?: string;
  seedPath?: string;
  catalogUrl?: string;
}

export class CatalogIngestor {
  private cache: EndpointIntelligence[] = [];
  private loadedFrom = 'none';

  async ingest(opts: IngestOptions = {}): Promise<EndpointIntelligence[]> {
    let endpoints: EndpointIntelligence[] = [];

    if (opts.openApiPath) {
      endpoints = await this.ingestOneOpenApi(opts.openApiPath);
      this.loadedFrom = `openapi:${opts.openApiPath}`;
    } else {
      endpoints = await this.ingestUkgCatalog(
        opts.catalogUrl || 'https://developer.ukg.com/wfm/openapi'
      );
    }

    if (endpoints.length === 0) {
      const seedPath = opts.seedPath || path.resolve('data/openapi-seed/endpoints.seed.json');
      const seedRaw = await fs.readFile(seedPath, 'utf-8');
      endpoints = JSON.parse(seedRaw);
      this.loadedFrom = `seed:${seedPath}`;
    }

    endpoints = endpoints.map(ep => this.enrichEndpoint(ep));
    this.cache = endpoints;
    return endpoints;
  }

  private async ingestUkgCatalog(catalogUrl: string): Promise<EndpointIntelligence[]> {
    const html = await fetch(catalogUrl).then(r => {
      if (!r.ok) throw new Error(`Failed catalog fetch: ${r.status}`);
      return r.text();
    });

    const jsonFiles = Array.from(
      new Set(
        [...html.matchAll(/href="([^"]+\.json)"/g)]
          .map(m => new URL(m[1], catalogUrl).toString())
      )
    );

    const all: EndpointIntelligence[] = [];

    for (const url of jsonFiles) {
      try {
        const eps = await this.ingestOneOpenApi(url);
        all.push(...eps);
      } catch (e) {
        console.warn(`[Ingestor] Failed ${url}`, e);
      }
    }

    this.loadedFrom = `catalog:${catalogUrl} files:${jsonFiles.length}`;
    return all;
  }

  private async ingestOneOpenApi(source: string): Promise<EndpointIntelligence[]> {
    const api = await SwaggerParser.parse(source);
    return this.parseOpenApiToIntelligence(api, source);
  }

  private parseOpenApiToIntelligence(api: any, source = ''): EndpointIntelligence[] {
    const results: EndpointIntelligence[] = [];
    const paths = api.paths || {};

    for (const [p, methods] of Object.entries(paths) as [string, any][]) {
      for (const [method, op] of Object.entries(methods) as [string, any][]) {
        if (!op || typeof op !== 'object') continue;

        const m = method.toUpperCase() as HttpMethod;
        if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(m)) continue;

        const operationId =
          op.operationId ||
          `${m.toLowerCase()}_${p.replace(/[/{}/-]+/g, '_').replace(/^_|_$/g, '')}`;

        const intel: EndpointIntelligence = {
          domain: this.inferDomainFromTags(op.tags || [], p, source),
          operationId,
          method: m,
          path: p,
          classification: 'DISCOVERY_ONLY',
          objectType: this.inferObjectType(op, p),
          inputIdentifiers: this.extractInputIdentifiers(op),
          outputIdentifiers: this.extractOutputIdentifiers(op),
          referenceFields: this.extractReferenceFields(op),
          hydrationCandidates: [],
          childCollectionCandidates: [],
          reverseLookupCandidates: [],
          riskLevel: this.inferRisk(m, op),
          toolEligible: true,
          finalAnswerEligible: false,
          requiresConfirmation: m !== 'GET',
          notes: op.summary || op.description || '',
          tags: op.tags || []
        };

        results.push(intel);
      }
    }

    return results;
  }

  private enrichEndpoint(ep: EndpointIntelligence): EndpointIntelligence {
    const classified = classifyEndpoint(ep);
    return { ...ep, ...classified };
  }

  private inferDomainFromTags(tags: string[], p: string, source = ''): string {
    const lower = `${tags.join(' ')} ${p} ${source}`.toLowerCase();

    if (lower.includes('attendance')) return 'attendance';
    if (lower.includes('employee-self-service')) return 'employee_self_service';
    if (lower.includes('forecasting')) return 'forecasting';
    if (lower.includes('healthcare-productivity')) return 'healthcare_productivity';
    if (lower.includes('human-capital-management') || lower.includes('hcm')) return 'hcm';
    if (lower.includes('leave')) return 'leave';
    if (lower.includes('person-assignments')) return 'person_assignments';
    if (lower.includes('people') || lower.includes('person') || lower.includes('employee')) return 'people';
    if (lower.includes('webhook')) return 'webhook_events';
    if (lower.includes('scheduling-setup')) return 'scheduling_setup';
    if (lower.includes('scheduling')) return 'scheduling';
    if (lower.includes('timekeeping-bulk')) return 'timekeeping_bulk_operations';
    if (lower.includes('timekeeping-setup')) return 'timekeeping_setup';
    if (lower.includes('timekeeping-timecards')) return 'timekeeping_timecards';
    if (lower.includes('timekeeping')) return 'timekeeping';
    if (lower.includes('universal-device-manager')) return 'universal_device_manager';
    if (lower.includes('common-resources')) return 'common_resources';
    if (lower.includes('platform')) return 'platform';

    return 'platform';
  }

  private inferObjectType(op: any, p: string): string {
    const text = JSON.stringify(op).toLowerCase();

    if (text.includes('person')) return 'Person';
    if (text.includes('timecard')) return 'Timecard';
    if (text.includes('punch')) return 'Punch';
    if (text.includes('schedule')) return 'Schedule';
    if (text.includes('known place') || text.includes('knownplace') || p.toLowerCase().includes('known')) return 'KnownPlace';
    if (text.includes('employee group') || text.includes('employeegroup')) return 'EmployeeGroup';
    if (text.includes('hyperfind')) return 'Hyperfind';
    if (text.includes('pay code') || text.includes('paycode')) return 'PayCode';
    if (text.includes('work rule') || text.includes('workrule')) return 'WorkRule';
    if (text.includes('leave')) return 'LeaveCase';

    const seg = p.split('/').filter(Boolean).pop()?.replace(/[{}]/g, '') || 'Unknown';
    return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/[_-]/g, '');
  }

  private extractInputIdentifiers(op: any): string[] {
    const ids: string[] = [];

    for (const p of op.parameters || []) {
      const name = p.name || '';
      const low = name.toLowerCase();
      if (
        p.required ||
        low.includes('id') ||
        low.includes('date') ||
        low.includes('qualifier') ||
        low.includes('person') ||
        low.includes('employee')
      ) {
        ids.push(name);
      }
    }

    if (op.requestBody) ids.push('body');

    return Array.from(new Set(ids));
  }

  private extractOutputIdentifiers(_op: any): string[] {
    return ['id', 'uuid', 'guid', 'personId', 'employeeId', 'qualifier', 'persistentId'];
  }

  private extractReferenceFields(_op: any): string[] {
    return [
      'id',
      'ref',
      'Id',
      'Ref',
      'guid',
      'managerId',
      'jobId',
      'orgRef',
      'profileRef',
      'groupRef',
      'locationRef'
    ];
  }

  private inferRisk(method: HttpMethod, op: any): 'SAFE_READ' | 'CONTROLLED_WRITE' | 'DANGEROUS_WRITE' | 'DESTRUCTIVE' {
    if (method === 'GET') return 'SAFE_READ';
    if (method === 'DELETE') return 'DESTRUCTIVE';

    const desc = `${op.summary || ''} ${op.description || ''}`.toLowerCase();

    if (
      desc.includes('bulk') ||
      desc.includes('multiple') ||
      desc.includes('delete') ||
      desc.includes('purge')
    ) {
      return 'DANGEROUS_WRITE';
    }

    return 'CONTROLLED_WRITE';
  }

  getLoadedEndpoints(): EndpointIntelligence[] {
    return this.cache;
  }

  getLoadedSource(): string {
    return this.loadedFrom;
  }
}
