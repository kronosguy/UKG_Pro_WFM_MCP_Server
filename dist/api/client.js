/**
 * UKG Pro WFM API Client
 * Resilient, authenticated client. Supports bearer + tenant headers.
 * Used by execution engine and tools.
 */
import axios from 'axios';
export class UkgWfmClient {
    tenant;
    http;
    token = null;
    tokenExpiry = 0;
    constructor(tenant = {}) {
        this.tenant = tenant;
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
    async getAccessToken() {
        if (this.token && Date.now() < this.tokenExpiry)
            return this.token;
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
        }
        catch (e) {
            console.error('[UkgWfmClient] Token acquisition failed', e?.response?.data || e.message);
            return null;
        }
    }
    async request(config) {
        try {
            const res = await this.http.request(config);
            return { data: res.data, status: res.status, headers: res.headers };
        }
        catch (err) {
            if (err.response) {
                return { data: err.response.data, status: err.response.status, headers: err.response.headers };
            }
            throw err;
        }
    }
    // Convenience
    async get(path, params) {
        return this.request({ method: 'GET', url: path, params });
    }
    async post(path, body, params) {
        return this.request({ method: 'POST', url: path, data: body, params });
    }
    async put(path, body) {
        return this.request({ method: 'PUT', url: path, data: body });
    }
    async patch(path, body) {
        return this.request({ method: 'PATCH', url: path, data: body });
    }
    async delete(path) {
        return this.request({ method: 'DELETE', url: path });
    }
    setTenant(ctx) {
        this.tenant = { ...this.tenant, ...ctx };
        if (ctx.baseUrl) {
            this.http.defaults.baseURL = ctx.baseUrl;
        }
    }
}
//# sourceMappingURL=client.js.map