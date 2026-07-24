import { useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function Auth({ onGuest }) {
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null); // { type: "error" | "info", text }
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          setStatus({ type: "info", text: "Check your email to confirm your account, then sign in." });
        }
      }
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-title">✦ Gacha Sim</h1>
        <p className="auth-sub">
          {mode === "signin"
            ? "Sign in to sync your save to your account."
            : "Create an account to keep your save anywhere."}
        </p>

        <form className="auth-form" onSubmit={submit}>
          <input
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "…" : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        {status && <p className={`auth-status ${status.type}`}>{status.text}</p>}

        <button
          className="auth-switch"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setStatus(null);
          }}
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <div className="auth-divider">or</div>

        <button className="auth-guest" onClick={onGuest}>
          Continue as guest
        </button>
        <p className="auth-guest-note">Guest saves stay only on this browser.</p>
      </div>
    </section>
  );
}
