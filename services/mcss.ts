
export interface MCSSServer {
    serverId: string;
    status: number;
    name: string;
    description: string;
    type: string;
}

export interface MCSSStats {
    cpuUsage: number;
    ramUsage: number;
    onlinePlayers: number;
    maxPlayers: number;
    uptime: string;
}

const DEFAULT_BASE_URL = 'http://server-manfredonia.ddns.net:25560';

export class MCSSService {
    private baseUrl: string;
    private apiKey: string;

    constructor(apiKey: string, baseUrl: string = DEFAULT_BASE_URL) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        console.log(`[MCSS] Service initialized via Supabase Bridge. Target: ${this.baseUrl}`);
    }

    private async fetchApi(endpoint: string, options: RequestInit = {}) {
        const targetUrl = `${this.baseUrl}${endpoint}`;

        try {
            // Using Netlify Function as a Bridge
            const response = await fetch('/.netlify/functions/mcss-proxy', {
                method: options.method || 'GET',
                headers: {
                    'mcss-target-url': targetUrl,
                    'mcss-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                },
                body: options.body,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Proxy Error: ${response.status}`);
            }

            return await response.json();
        } catch (err: any) {
            console.error(`[MCSS] Proxy fetch failed for ${targetUrl}:`, err.message);
            throw err;
        }
    }

    async getServers(): Promise<MCSSServer[]> {
        try {
            const data = await this.fetchApi('/api/v2/servers');
            return Array.isArray(data) ? data : [];
        } catch (err: any) {
            console.error('[MCSS] getServers failed:', err.message || err);
            throw err;
        }
    }

    async getConsole(serverId: string, amountOfLines: number = 50): Promise<string[]> {
        try {
            const data = await this.fetchApi(`/api/v2/servers/${serverId}/console?amountOfLines=${amountOfLines}`);
            return Array.isArray(data) ? data : [];
        } catch (err: any) {
            console.error('[MCSS] getConsole failed:', err.message || err);
            throw err;
        }
    }

    async executeCommand(serverId: string, command: string): Promise<void> {
        return this.fetchApi(`/api/v2/servers/${serverId}/execute/command`, {
            method: 'POST',
            body: JSON.stringify({ command }),
        });
    }

    async getServerStats(serverId: string): Promise<MCSSStats> {
        try {
            const data = await this.fetchApi(`/api/v2/servers/${serverId}/stats`);

            const latest = data?.latest || {};
            const root = data || {};

            const get = (...keys: string[]) => {
                for (const key of keys) {
                    if (latest[key] !== undefined) return latest[key];
                    if (root[key] !== undefined) return root[key];
                    if (root[key.toLowerCase()] !== undefined) return root[key.toLowerCase()];
                }
                return undefined;
            };

            const memUsed = get('memoryUsed', 'ramUsage', 'Memory', 'RAM', 'ram');
            const memLimit = get('memoryLimit', 'maxMemory', 'TotalMemory', 'maxRam');

            return {
                cpuUsage: get('cpu', 'cpuUsage', 'CPU') ?? 0,
                ramUsage: (memLimit && memLimit > 0)
                    ? Math.round((memUsed / memLimit) * 100)
                    : (get('ramUsage', 'ram') ?? 0),
                onlinePlayers: get('playersOnline', 'onlinePlayers', 'OnlinePlayers') ?? 0,
                maxPlayers: get('playerLimit', 'maxPlayers', 'MaxPlayers') ?? 0,
                uptime: get('uptime', 'Uptime') || '00:00:00'
            };
        } catch (err: any) {
            console.error('[MCSS] getServerStats failed:', err.message || err);
            throw err;
        }
    }

    async executeAction(serverId: string, action: string | number): Promise<void> {
        const actionMap: { [key: string]: number } = {
            'Stop': 1,
            'Start': 2,
            'Kill': 3,
            'Restart': 4
        };
        const actionId = typeof action === 'string' ? actionMap[action] || action : action;

        return this.fetchApi(`/api/v2/servers/${serverId}/execute/action`, {
            method: 'POST',
            body: JSON.stringify({ action: actionId }),
        });
    }
}
