// Lightweight GitHub API client with localStorage cache, ETag conditional requests, and request deduplication
// Works in static Netlify sites (client-side only)

export interface CachedResponse<T = any> {
  data: T;
  etag?: string | null;
  timestamp: number; // ms
}

const inFlight = new Map<string, Promise<any>>();

function buildHeaders(token?: string, etag?: string | null): HeadersInit {
  const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `token ${token}`;
  if (etag) headers['If-None-Match'] = etag;
  return headers;
}

async function fetchWithCache<T = any>(url: string, token?: string, ttlMinutes = 60): Promise<T> {
  const cacheKey = `ghcache:${url}`;
  const ttlMs = ttlMinutes * 60_000;
  const now = Date.now();

  try {
    const cachedRaw = localStorage.getItem(cacheKey);
    const cached: CachedResponse<T> | null = cachedRaw ? JSON.parse(cachedRaw) : null;

    // Fast path: valid cache within TTL
    if (cached && now - cached.timestamp < ttlMs) {
      return cached.data;
    }

    // Deduplicate in-flight requests for the same URL
    if (inFlight.has(url)) {
      return await inFlight.get(url)!;
    }

    const headers = buildHeaders(token, cached?.etag ?? null);
    const req = fetch(url, { headers }).then(async (res) => {
      // 304 Not Modified: serve cached
      if (res.status === 304 && cached) {
        return cached.data;
      }

      if (res.ok) {
        const etag = res.headers.get('ETag');
        const data = (await res.json()) as T;
        const toStore: CachedResponse<T> = { data, etag, timestamp: now };
        try { localStorage.setItem(cacheKey, JSON.stringify(toStore)); } catch {}
        return data;
      }

      // Error: fallback to stale cache if present
      if (cached) {
        return cached.data;
      }

      throw new Error(`GitHub request failed: ${res.status} ${res.statusText}`);
    }).finally(() => {
      inFlight.delete(url);
    });

    inFlight.set(url, req);
    return await req;
  } catch (e) {
    // Any unexpected error: fallback to cache if present
    const cachedRaw = localStorage.getItem(cacheKey);
    const cached: CachedResponse<T> | null = cachedRaw ? JSON.parse(cachedRaw) : null;
    if (cached) return cached.data;
    throw e;
  }
}

export async function getLatestRelease(repo: string, token?: string, ttlMinutes = 60): Promise<any> {
  const url = `https://api.github.com/repos/${repo}/releases/latest`;
  return fetchWithCache<any>(url, token, ttlMinutes);
}

export async function getReleases(repo: string, perPage: number = 4, token?: string, ttlMinutes = 60): Promise<any[]> {
  const url = `https://api.github.com/repos/${repo}/releases?per_page=${perPage}`;
  return fetchWithCache<any[]>(url, token, ttlMinutes);
}