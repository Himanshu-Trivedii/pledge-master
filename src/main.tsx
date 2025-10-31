import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/lib/providers";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <ThemeProvider defaultTheme="system" storageKey="pledge-theme">
        <App />
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </Providers>
  </React.StrictMode>
);
