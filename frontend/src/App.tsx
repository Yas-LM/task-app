import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { CheckCheck } from "lucide-react";
import TaskBoard from "./TaskBoard";
import { getGoogleAccountName, setGoogleIdToken } from "./lib/auth";

function App() {
  const [credential, setCredential] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("Google account");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const expireSession = () => {
      setGoogleIdToken(null);
      setCredential(null);
      setAuthError("Your Google sign-in expired. Please sign in again.");
    };
    window.addEventListener("google-auth-expired", expireSession);
    return () => window.removeEventListener("google-auth-expired", expireSession);
  }, []);

  function signOut() {
    setGoogleIdToken(null);
    setCredential(null);
    setAccountName("Google account");
  }

  if (!credential) {
    return (
      <main className="auth-shell">
        <section className="auth-panel" aria-labelledby="auth-title">
          <a className="auth-brand" href="#signin" aria-label="Daymark home">
            <span className="brand-mark">
              <CheckCheck size={21} strokeWidth={2.5} />
            </span>
            <span className="brand-name">
              daymark<span>.</span>
            </span>
          </a>
          <p className="auth-eyebrow">YOUR PERSONAL WORKSPACE</p>
          <h1 id="auth-title">Make room for focused work.</h1>
          <p className="auth-copy">Sign in with your Google account to see your tasks.</p>
          <div className="google-signin">
            <GoogleLogin
              onSuccess={(response) => {
                if (!response.credential) {
                  setAuthError("Google sign-in did not return a credential. Please try again.");
                  return;
                }
                setGoogleIdToken(response.credential);
                setAccountName(getGoogleAccountName(response.credential));
                setCredential(response.credential);
                setAuthError(null);
              }}
              onError={() => setAuthError("Google sign-in failed. Please try again.")}
              text="continue_with"
              theme="outline"
              shape="rectangular"
              size="large"
            />
          </div>
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <p className="auth-footnote">Your task list is private to your account.</p>
        </section>
      </main>
    );
  }

  return (
    <TaskBoard
      accountName={accountName}
      onSignOut={signOut}
    />
  );
}

export default App;