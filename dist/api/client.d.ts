/**
 * UKG Pro WFM API Client
 * Resilient, authenticated client. Supports bearer + tenant headers.
 * Used by execution engine and tools.
 */
import { AxiosRequestConfig } from 'axios';
import { TenantContext } from '../types/index.js';
export declare class UkgWfmClient {
    private tenant;
    private http;
    private token;
    private tokenExpiry;
    constructor(tenant?: TenantContext);
    getAccessToken(): Promise<string | null>;
    request<T = any>(config: AxiosRequestConfig): Promise<{
        data: T;
        status: number;
        headers: any;
    }>;
    get<T>(path: string, params?: any): Promise<{
        data: T;
        status: number;
    }>;
    post<T>(path: string, body?: any, params?: any): Promise<{
        data: T;
        status: number;
    }>;
    put<T>(path: string, body?: any): Promise<{
        data: T;
        status: number;
    }>;
    patch<T>(path: string, body?: any): Promise<{
        data: T;
        status: number;
    }>;
    delete<T>(path: string): Promise<{
        data: T;
        status: number;
    }>;
    setTenant(ctx: Partial<TenantContext>): void;
}
//# sourceMappingURL=client.d.ts.map