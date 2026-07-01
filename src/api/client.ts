/**
 * UKG Pro WFM API Client
 * Resilient, authenticated client. Supports bearer + tenant headers.
 * Used by execution engine and tools.
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { TenantContext } from '../types/index.js';

export class UkgWfmClient {
  private http: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private tenant: TenantContext = {}) {
    const baseURL = tenant.baseUrl || process.env.UKG_WFM_BASE_URL || 'https://api.ultipro.com/workforce/v1';
    this.http = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(tenant.tenantId ? { 'X-UKG-Tenant': tenant.tenantId } : {})
      }
    });

    this.http.interceptors.request.use(async (config) => {
      const tok = await this.getAccessToken();
      if (tok) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${tok}`;
      }
      return config;
    });
  }

  async getAccessToken(): Promise<string | null> {
    if (this.token && Date.now() < this.tokenExpiry) return this.token;

    // Support two patterns:
    // 1. Direct bearer from env (for demos / PAT)
    const direct = process.env.UKG_WFM_BEARER_TOKEN || this.tenant.accessToken;
    if (direct) {
      this.token = direct;
      this.tokenExpiry = Date.now() + 3600_000;
      return this.token;
    }

    // 2. OAuth2 client credentials (typical for UKG WFM service apps)
    const clientId = process.env.UKG_WFM_CLIENT_ID;
    const clientSecret = process.env.UKG_WFM_CLIENT_SECRET;
    const tokenUrl = process.env.UKG_WFM_TOKEN_URL || 'https://api.ultipro.com/oauth2/token';

    if (!clientId || !clientSecret) {
      console.warn('[UkgWfmClient] No credentials configured. Calls will be unauthenticated.');
      return null;
    }

    try {
      const resp = await axios.post(tokenUrl, new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: process.env.UKG_WFM_SCOPE || 'wfm'
      }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

      this.token = resp.data.access_token;
      const expiresIn = resp.data.expires_in || 3600;
      this.tokenExpiry = Date.now() + (expiresIn - 60) * 1000;
      return this.token;
    } catch (e: any) {
      console.error('[UkgWfmClient] Token acquisition failed', e?.response?.data || e.message);
      return null;
    }
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<{ data: T; status: number; headers: any }> {
    try {
      const res = await this.http.request<T>(config);
      return { data: res.data, status: res.status, headers: res.headers };
    } catch (err: any) {
      if (err.response) {
        return { data: err.response.data, status: err.response.status, headers: err.response.headers };
      }
      throw err;
    }
  }

  // Convenience
  async get<T>(path: string, params?: any): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'GET', url: path, params });
  }

  async post<T>(path: string, body?: any, params?: any): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'POST', url: path, data: body, params });
  }

  async put<T>(path: string, body?: any): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'PUT', url: path, data: body });
  }

  async patch<T>(path: string, body?: any): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'PATCH', url: path, data: body });
  }

  async delete<T>(path: string): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'DELETE', url: path });
  }

  setTenant(ctx: Partial<TenantContext>) {
    this.tenant = { ...this.tenant, ...ctx };
    if (ctx.baseUrl) {
      this.http.defaults.baseURL = ctx.baseUrl;
    }
  }
}
