import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
	server: {
		host: "::",
		port: 5173, // ✅ Change frontend port (frontend will now run here)
		open: true, // ✅ auto open in browser
		proxy: {
			// ✅ Forward API requests to your Spring Boot backend
			"/api": {
				target: "http://localhost:8099", // your backend server
				changeOrigin: true,
				secure: false,
			},
		},
	},
	plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		outDir: "dist",
		sourcemap: mode === "development",
		rollupOptions: {
			// Ensure service worker is copied to dist
			output: {
				manualChunks: undefined,
			},
		},
	},
	publicDir: "public",
}));
