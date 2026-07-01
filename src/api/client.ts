/**
 * UKG Pro WFM API Client
 * Auth0-style OAuth client credentials + resilient request wrapper.
 */
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { TenantContext } from '../types/index.js';

export class UkgWfmClient {
  private http: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry = 0;

  constructor(private tenant: TenantContext = {}) {
    const baseURL =
      tenant.baseUrl ||
      process.env.UKG_BASE_URL ||
      process.env.UKG_WFM_BASE_URL ||
      'https://ahsmanagement.prd.mykronos.com/api';

    this.http = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(tenant.tenantId ? { 'X-UKG-Tenant': tenant.tenantId } : {})
      }
    });

    this.http.interceptors.request.use(async config => {
      const token = await this.getAccessToken();

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });
  }

  async getAccessToken(): Promise<string | null> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    const direct =
      process.env.UKG_BEARER_TOKEN ||
      process.env.UKG_WFM_BEARER_TOKEN ||
      this.tenant.accessToken;

    if (direct) {
      this.token = direct;
      this.tokenExpiry = Date.now() + 55 * 60 * 1000;
      return this.token;
    }

    const tokenUrl =
      process.env.UKG_AUTH_URL ||
      process.env.UKG_WFM_TOKEN_URL ||
      'https://welcome-us.ukg.net/oauth/token';

    const clientId =
      process.env.UKG_CLIENT_ID ||
      process.env.UKG_WFM_CLIENT_ID;

    const clientSecret =
      process.env.UKG_CLIENT_SECRET ||
      process.env.UKG_WFM_CLIENT_SECRET;

    const audience =
      process.env.UKG_AUDIENCE ||
      'https://wfm.ukg.net/api';

    const grantType =
      process.env.UKG_GRANT_TYPE ||
      'client_credentials';

    const organization =
      process.env.UKG_ORGANIZATION ||
      process.env.UKG_WFM_TENANT_ID ||
      this.tenant.tenantId;

    if (!clientId || !clientSecret || !organization) {
      console.warn('[UkgWfmClient] Missing OAuth credentials. Calls will be unauthenticated.');
      return null;
    }

    try {
      const response = await axios.post(
        tokenUrl,
        {
          client_id: clientId,
          client_secret: clientSecret,
          audience,
          grant_type: grantType,
          organization
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          timeout: 30000
        }
      );

      this.token = response.data.access_token;

      const expiresIn = Number(response.data.expires_in || 3600);
      this.tokenExpiry = Date.now() + Math.max(expiresIn - 60, 60) * 1000;

      return this.token;
    } catch (error: any) {
      console.error(
        '[UkgWfmClient] Token acquisition failed',
        error?.response?.status,
        error?.response?.data || error.message
      );

      return null;
    }
  }

  async request<T = any>(
    config: AxiosRequestConfig
  ): Promise<{ data: T; status: number; headers: any }> {
    try {
      const response = await this.http.request<T>(config);

      return {
        data: response.data,
        status: response.status,
        headers: response.headers
      };
    } catch (error: any) {
      if (error.response) {
        return {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        };
      }

      throw error;
    }
  }

  async get<T = any>(url: string, params?: any): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'GET', url, params });
  }

  async post<T = any>(url: string, body?: any, params?: any): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'POST', url, data: body, params });
  }

  async put<T = any>(url: string, body?: any): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'PUT', url, data: body });
  }

  async patch<T = any>(url: string, body?: any): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'PATCH', url, data: body });
  }

  async delete<T = any>(url: string): Promise<{ data: T; status: number }> {
    return this.request<T>({ method: 'DELETE', url });
  }

  setTenant(ctx: Partial<TenantContext>) {
    this.tenant = { ...this.tenant, ...ctx };

    if (ctx.baseUrl) {
      this.http.defaults.baseURL = ctx.baseUrl;
    }

    if (ctx.accessToken) {
      this.token = ctx.accessToken;
      this.tokenExpiry = Date.now() + 55 * 60 * 1000;
    }
  }
}
