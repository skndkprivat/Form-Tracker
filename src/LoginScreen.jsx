import { useState, useEffect } from "react";
import { signInWithGoogle, signOutUser, onAuthChange } from "./firebase.js";

export function useAuth() {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u));
    return unsub;
  }, []);
  return user;
}

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (e) {
      if (e.code === "auth/popup-blocked") {
        setError("Popup blev blokeret — tillad popups for denne side og prøv igen.");
      } else if (e.code !== "auth/cancelled-popup-request") {
        setError("Login fejlede (" + (e.code || e.message) + ")");
      }
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f1e",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', system-ui, sans-serif", padding: 20
    }}>
      <div style={{
        background: "#0f172a", border: "1px solid #1e293b",
        borderRadius: 18, padding: "40px 36px", width: "100%", maxWidth: 380,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 24
      }}>
        <div style={{ fontSize: 48 }}>🏔️</div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
            Form-tracker
          </h1>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Log ind for at se din træningsplan
          </p>
        </div>

        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", background: loading ? "#1e293b" : "#fff",
          color: "#1e293b", border: "none", borderRadius: 10,
          padding: "12px 20px", fontSize: 15, fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10
        }}>
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Logger ind..." : "Fortsæt med Google"}
        </button>

        {error && (
          <div style={{ color: "#f87171", fontSize: 13, textAlign: "center", lineHeight: 1.5 }}>{error}</div>
        )}

        <p style={{ color: "#334155", fontSize: 12, textAlign: "center" }}>
          Dine data synkroniseres automatisk<br/>mellem alle dine enheder via Firebase.
        </p>
      </div>
    </div>
  );
}

export function UserBadge({ user, syncing }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      background: "#1e293b", borderRadius: 99, padding: "5px 14px 5px 6px",
      border: "1px solid #334155"
    }}>
      {user.photoURL
        ? <img src={user.photoURL} style={{ width: 28, height: 28, borderRadius: "50%" }} alt="" />
        : <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6366f1", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700 }}>
            {user.displayName?.[0] || "?"}
          </div>
      }
      <span style={{ color: "#cbd5e1", fontSize: 13 }}>{user.displayName || user.email}</span>
      {syncing && <span style={{ color: "#4ade80", fontSize: 11 }}>↑ gemmer</span>}
      <button onClick={signOutUser} style={{
        background: "none", border: "none", color: "#475569",
        cursor: "pointer", fontSize: 12, marginLeft: 4, padding: 0
      }}>Log ud</button>
    </div>
  );
}
