"use client";

import { useEffect, useState } from "react";

import { getAuthStatusMessage } from "@/lib/auth/messages";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AuthMode = "password-login" | "password-signup" | "magic-link";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nextWorkspace, setNextWorkspace] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<AuthMode>("password-login");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextWorkspace(params.get("next") ?? "");
  }, []);

  const getFinishSignupUrl = () => {
    const finishSignupUrl = new URL("/auth/finish-signup", window.location.origin);
    if (nextWorkspace) {
      finishSignupUrl.searchParams.set("next", nextWorkspace);
    }

    return finishSignupUrl.toString();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "magic-link") {
        const redirectTo = new URL("/auth/callback", window.location.origin);
        if (nextWorkspace) {
          redirectTo.searchParams.set("next", nextWorkspace);
        }

        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo.toString()
          }
        });

        setStatus(error ? getAuthStatusMessage(error.message) : "Magic link gonderildi. Mail kutunu kontrol et.");
        return;
      }

      if (mode === "password-login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          setStatus(getAuthStatusMessage(error.message));
          return;
        }

        window.location.assign(getFinishSignupUrl());
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        setStatus(getAuthStatusMessage(error.message));
        return;
      }

      if (data.session) {
        window.location.assign(getFinishSignupUrl());
        return;
      }

      setStatus("Kayit olusturuldu. E-posta dogrulamasi aciksa mail kutunu kontrol et, degilse dogrudan giris yapabilirsin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="shell">
      <div className="shell__inner">
        <section className="hero">
          <span className="eyebrow">Login</span>
          <h1>Workspace girisi</h1>
          <p>Supabase Auth oturumu server-side cookie akisi ile root domain uzerinden baslatilir.</p>
          <div className="auth-mode-switch" role="tablist" aria-label="Giris yontemi">
            <button
              type="button"
              className={mode === "password-login" ? "button" : "button--secondary"}
              onClick={() => setMode("password-login")}
            >
              Sifre ile giris
            </button>
            <button
              type="button"
              className={mode === "password-signup" ? "button" : "button--secondary"}
              onClick={() => setMode("password-signup")}
            >
              Kayit ol
            </button>
            <button
              type="button"
              className={mode === "magic-link" ? "button" : "button--secondary"}
              onClick={() => setMode("magic-link")}
            >
              Magic link
            </button>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-form__field">
              <span>E-posta</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                required
              />
            </label>
            {mode !== "magic-link" ? (
              <label className="login-form__field">
                <span>Sifre</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="En az 6 karakter"
                  minLength={6}
                  required
                />
              </label>
            ) : null}
            <button type="submit" className="button">
              {isSubmitting
                ? "Gonderiliyor..."
                : mode === "password-login"
                  ? "Giris yap"
                  : mode === "password-signup"
                    ? "Hesap olustur"
                    : "Magic link gonder"}
            </button>
          </form>
          <p className="login-help">
            {mode === "password-login"
              ? "Var olan hesabinla sifre kullanarak giris yaparsin."
              : mode === "password-signup"
                ? "Yeni hesap olusturur. E-posta dogrulamasi aciksa onay maili beklenir."
                : "Sifresiz giris icin tek kullanımlik baglanti gonderir."}
          </p>
          {status ? <p>{status}</p> : null}
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
