"use client";

import { useEffect, useState } from "react";

import { getAuthStatusMessage } from "@/lib/auth/messages";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "password-login" | "password-signup" | "magic-link";

const MODE_LABELS: Record<AuthMode, string> = {
  "password-login": "Giriş yap",
  "password-signup": "Kayıt ol",
  "magic-link": "Magic link",
};

const MODE_HEADINGS: Record<AuthMode, string> = {
  "password-login": "Tekrar hoş geldin",
  "password-signup": "Hesap oluştur",
  "magic-link": "Şifresiz giriş",
};

const MODE_SUBS: Record<AuthMode, string> = {
  "password-login": "Workspace'ine erişmek için e-posta ve şifrenle devam et.",
  "password-signup": "Yeni hesap oluştur. Doğrulama açıksa onay maili gelir.",
  "magic-link": "E-postana tek kullanımlık bağlantı gönderilir.",
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextWorkspace, setNextWorkspace] = useState("");
  const [status, setStatus] = useState<{ text: string; ok: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<AuthMode>("password-login");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextWorkspace(params.get("next") ?? "");
  }, []);

  const getFinishSignupUrl = () => {
    // Relative path kullan - middleware doğru rewrite yapacak
    let url = "/auth/finish-signup";
    if (nextWorkspace) url += `?next=${encodeURIComponent(nextWorkspace)}`;
    return url;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "magic-link") {
         let redirectTo = `${window.location.origin}/auth/callback`;
         if (nextWorkspace) redirectTo += `?next=${encodeURIComponent(nextWorkspace)}`;

         const { error } = await supabase.auth.signInWithOtp({
           email,
           options: { emailRedirectTo: redirectTo },
         });

        setStatus(
          error
            ? { text: getAuthStatusMessage(error.message), ok: false }
            : { text: "Bağlantı gönderildi — mail kutunu kontrol et.", ok: true }
        );
        return;
      }

      if (mode === "password-login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setStatus({ text: getAuthStatusMessage(error.message), ok: false });
          return;
        }
        window.location.assign(getFinishSignupUrl());
        return;
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setStatus({ text: getAuthStatusMessage(error.message), ok: false });
        return;
      }
      if (data.session) {
        window.location.assign(getFinishSignupUrl());
        return;
      }
      setStatus({
        text: "Hesap oluşturuldu. Doğrulama açıksa mail kutunu kontrol et.",
        ok: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitLabel = isSubmitting
    ? "Gönderiliyor…"
    : mode === "password-login"
      ? "Giriş yap"
      : mode === "password-signup"
        ? "Hesap oluştur"
        : "Bağlantı gönder";

  return (
    <main className="auth-shell" style={{ position: "relative", overflow: "hidden" }}>
      {/* Atmospheric warm gradient — identical to hero::before */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: [
            "radial-gradient(ellipse 70% 55% at 20% 15%, rgba(255,200,150,0.22), transparent)",
            "radial-gradient(ellipse 55% 45% at 80% 25%, rgba(180,200,255,0.16), transparent)",
            "radial-gradient(ellipse 45% 40% at 55% 70%, rgba(255,180,200,0.12), transparent)",
          ].join(", "),
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, width: "min(420px, 100%)" }}>
        {/* Wordmark */}
        <a
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            marginBottom: "32px",
            fontSize: "1.125rem",
            fontWeight: 600,
            letterSpacing: "-0.3px",
            color: "var(--charcoal)",
            textDecoration: "none",
          }}
        >
          Virtulize
        </a>

        {/* Card */}
        <div className="auth-card">
          {/* Mode tab switcher */}
          <div
            role="tablist"
            aria-label="Giriş yöntemi"
            style={{
              display: "flex",
              gap: "4px",
              padding: "4px",
              borderRadius: "var(--r-md)",
              background: "var(--ink-04)",
              border: "1px solid var(--border-soft)",
              marginBottom: "28px",
            }}
          >
            {(["password-login", "password-signup", "magic-link"] as AuthMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => { setMode(m); setStatus(null); }}
                style={{
                  flex: 1,
                  minHeight: "32px",
                  padding: "4px 8px",
                  borderRadius: "calc(var(--r-md) - 2px)",
                  border: "none",
                  fontFamily: "var(--font)",
                  fontSize: "0.8125rem",
                  fontWeight: mode === m ? 600 : 400,
                  color: mode === m ? "var(--charcoal)" : "var(--muted)",
                  background: mode === m ? "var(--cream)" : "transparent",
                  boxShadow: mode === m ? "var(--shadow-btn)" : "none",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                  whiteSpace: "nowrap",
                }}
              >
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>

          {/* Heading */}
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.5px", marginBottom: "6px" }}>
            {MODE_HEADINGS[mode]}
          </h1>
          <p className="auth-card__sub">{MODE_SUBS[mode]}</p>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form__field">
              <label htmlFor="email" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--charcoal)" }}>
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            {mode !== "magic-link" && (
              <div className="login-form__field">
                <label htmlFor="password" style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--charcoal)" }}>
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  autoComplete={mode === "password-signup" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
              style={{
                width: "100%",
                marginTop: "4px",
                opacity: isSubmitting ? 0.6 : undefined,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {submitLabel}
            </button>
          </form>

          {/* Status message */}
          {status && (
            <p
              role="status"
              style={{
                marginTop: "16px",
                padding: "12px 14px",
                borderRadius: "var(--r-sm)",
                border: `1px solid ${status.ok ? "rgba(28,28,28,0.12)" : "rgba(200,50,50,0.20)"}`,
                background: status.ok ? "var(--ink-03)" : "rgba(200,50,50,0.05)",
                fontSize: "0.875rem",
                color: status.ok ? "var(--charcoal)" : "#b91c1c",
                lineHeight: 1.5,
              }}
            >
              {status.text}
            </p>
          )}
        </div>

        {/* Footer hint */}
        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            fontSize: "0.8125rem",
            color: "var(--muted)",
          }}
        >
          {mode === "password-login" ? (
            <>Hesabın yok mu?{" "}
              <button
                type="button"
                onClick={() => setMode("password-signup")}
                style={{ background: "none", border: "none", fontFamily: "var(--font)", fontSize: "inherit", color: "var(--charcoal)", textDecoration: "underline", cursor: "pointer" }}
              >
                Kayıt ol
              </button>
            </>
          ) : (
            <>Zaten hesabın var mı?{" "}
              <button
                type="button"
                onClick={() => setMode("password-login")}
                style={{ background: "none", border: "none", fontFamily: "var(--font)", fontSize: "inherit", color: "var(--charcoal)", textDecoration: "underline", cursor: "pointer" }}
              >
                Giriş yap
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
};

export default LoginPage;
