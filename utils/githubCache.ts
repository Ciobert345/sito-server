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
      // 304 Not Modified: serve cached and update timestamp to avoid re-validating every time
      if (res.status === 304 && cached) {
        const toStore: CachedResponse<T> = { ...cached, timestamp: now };
        try { localStorage.setItem(cacheKey, JSON.stringify(toStore)); } catch { }
        return cached.data;
      }

      if (res.ok) {
        const etag = res.headers.get('ETag');
        const data = (await res.json()) as T;
        const toStore: CachedResponse<T> = { data, etag, timestamp: now };
        try { localStorage.setItem(cacheKey, JSON.stringify(toStore)); } catch { }
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

// Helper to compare semantic versions (DESC)
const compareVersions = (a: string, b: string) => {
  const clean = (v: string) => v.replace(/^v\.?/, "").split(".").map(Number);
  const vA = clean(a);
  const vB = clean(b);
  for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
    const pA = vA[i] || 0;
    const pB = vB[i] || 0;
    if (pB !== pA) return pB - pA;
  }
  return 0;
};

export async function getLatestRelease(repo: string, token?: string, ttlMinutes = 10): Promise<any> {
  // Use getReleases and sort locally because GitHub's /latest is unreliable with non-standard release patterns
  const releases = await getReleases(repo, 10, token, ttlMinutes);
  if (!releases || releases.length === 0) return null;

  const sorted = [...releases].sort((a, b) => compareVersions(a.tag_name, b.tag_name));
  return sorted[0];
}

export async function getReleases(repo: string, perPage: number = 4, token?: string, ttlMinutes = 10): Promise<any[]> {
  const url = `https://api.github.com/repos/${repo}/releases?per_page=${perPage}`;
  const data = await fetchWithCache<any[]>(url, token, ttlMinutes);

  // Also provide sorting for getReleases to assist callers who don't sort manually
  return (data || []).sort((a, b) => compareVersions(a.tag_name, b.tag_name));
}
