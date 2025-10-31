// src/lib/apiConfig.ts
export function normalizeBaseUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    // remove trailing slash
    let u = url.trim().replace(/\/+$/, "");
    // if it already ends with /api, keep as is; otherwise add /api
    if (!/\/api$/i.test(u)) u = `${u}/api`;
    return u;
}

export function getApiUrl(): string {
    // 1) Highest priority: manual override stored in localStorage (for quick testing)
    try {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("apiUrl");
            if (stored && /^https?:\/\//i.test(stored)) {
                const n = normalizeBaseUrl(stored);
                if (n) return n;
            }
        }
    } catch (e) {
        // ignore localStorage errors in SSR
    }

    // 2) Next: Next/Vercel env var (NEXT_PUBLIC_API_BASE_URL)
    // In Next/Vercel this is available at runtime via process.env
    if (typeof process !== "undefined" && (process as any).env) {
        const nextUrl = (process as any).env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
        const n = normalizeBaseUrl(nextUrl);
        if (n) return n;
    }

    // 3) Vite env var (VITE_API_URL)
    const viteUrl = (typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_API_URL : undefined) as string | undefined;
    const nVite = normalizeBaseUrl(viteUrl);
    if (nVite) return nVite;

    // 4) Derive based on current host (browser only)
    if (typeof window !== "undefined") {
        const host = window.location.hostname;
        const isLocalHost = host === "localhost" || host.startsWith("127.") || /^(\d+\.){3}\d+$/.test(host);
        if (isLocalHost) {
            return `http://${host}:8099/api`;
        }

        // // prefer api.<host>/api by default
        // const apiSubdomain = `https://api.${host}/api`;
        // const sameOrigin = `${window.location.origin}/api`;
        // // prefer api subdomain first
        // return apiSubdomain;

        // use same origin (for production on Vercel / Railway)
        return `${window.location.origin}/api`;

    }

    // 5) final fallback
    return "http://localhost:8099/api";
}




