export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "";
export const isAuthConfigured = googleClientId.length > 0;

let googleIdToken: string | null = null;

export function setGoogleIdToken(token: string | null) {
  googleIdToken = token;
}

export function getGoogleIdToken(): string {
  if (!googleIdToken) {
    throw new Error("Sign in with Google to access your tasks.");
  }
  return googleIdToken;
}

export function getGoogleAccountName(token: string): string {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims = JSON.parse(window.atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    return typeof claims.name === "string"
      ? claims.name
      : typeof claims.email === "string"
        ? claims.email
        : "Google account";
  } catch {
    return "Google account";
  }
}