import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./theme.css";
import App from "./App";
import { googleClientId, isAuthConfigured } from "./lib/auth";

const root = createRoot(document.getElementById("root")!);

if (!isAuthConfigured) {
  root.render(
    <main className="auth-shell">
      <section className="auth-panel" aria-labelledby="auth-config-title">
        <h1 id="auth-config-title">Sign-in needs configuration.</h1>
        <p className="auth-copy">Set VITE_GOOGLE_CLIENT_ID and rebuild the frontend.</p>
      </section>
    </main>,
  );
} else {
  root.render(
    <StrictMode>
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    </StrictMode>,
  );
}
