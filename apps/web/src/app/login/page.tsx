"use client";

import { useEffect, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [nextWorkspace, setNextWorkspace] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextWorkspace(params.get("next") ?? "");
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const supabase = createSupabaseBrowserClient();

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

    setStatus(error ? error.message : "Magic link gonderildi. Mail kutunu kontrol et.");
  };

  return (
    <main className="shell">
      <div className="shell__inner">
        <section className="hero">
          <span className="eyebrow">Login</span>
          <h1>Workspace girisi</h1>
          <p>Supabase Auth oturumu server-side cookie akisi ile root domain uzerinden baslatilir.</p>
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
            <button type="submit" className="button">
              Magic link gonder
            </button>
          </form>
          {status ? <p>{status}</p> : null}
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
