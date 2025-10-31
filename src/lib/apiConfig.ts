export function getApiUrl(): string {
	// 1) Highest priority: manual override set by user/admin
	const stored = (typeof window !== 'undefined') ? localStorage.getItem('apiUrl') : null;
	if (stored && /^https?:\/\//i.test(stored)) {
		return stored.replace(/\/$/, '');
	}

	// 2) Environment-provided URL (Vite: VITE_API_URL)
	const envUrl = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
	if (envUrl && /^https?:\/\//i.test(envUrl)) {
		return envUrl.replace(/\/$/, '');
	}

	// 3) Derive based on current host
	if (typeof window !== 'undefined') {
		const host = window.location.hostname;

		// Local dev or LAN IPs → assume backend on port 8099
		const isLocalHost = host === 'localhost' || host.startsWith('127.') || /^(\d+\.){3}\d+$/.test(host);
		if (isLocalHost) {
			return `http://${host}:8099/api`;
		}

		// Production default strategies:
		// a) api.<host>/api (common pattern)
		const apiSubdomain = `https://api.${host}`;
		// b) same origin /api (when reverse-proxied)
		const sameOrigin = `${window.location.origin}/api`;

		// Prefer api.<host>/api by default; if a reverse proxy is configured, you can set VITE_API_URL
		return `${apiSubdomain}/api` || sameOrigin;
	}

	// 4) Final fallback
	return 'http://localhost:8099/api';
}
