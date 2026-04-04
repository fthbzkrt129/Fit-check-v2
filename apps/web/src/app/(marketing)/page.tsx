import Link from "next/link";

const MarketingPage = () => {
  return (
    <main className="shell">
      <div className="shell__inner">
        <section className="hero">
          <span className="eyebrow">Phase 5 foundation</span>
          <h1>fit-check, güvenli SaaS omurgasına geçiyor.</h1>
          <p>
            Mevcut styling deneyimini korurken AI anahtarlarını browser dışına taşıyan, tenant-aware ve
            Supabase-first yeni uygulama kabuğu burada kuruluyor.
          </p>
          <div className="hero__actions">
            <Link href="/login" className="button">
              Giriş yakında
            </Link>
            <Link href="/signup" className="button--secondary">
              Kayıt yakında
            </Link>
          </div>
        </section>

        <section className="grid" aria-label="Platform pillars">
          <article className="card">
            <h2>Server-side AI gateway</h2>
            <p>Gemini ve fal.ai çağrıları tenant context ile güvenli backend yüzeyine taşınacak.</p>
          </article>
          <article className="card">
            <h2>Supabase auth + SSR</h2>
            <p>Anon landing, auth girişi ve oturum yenileme Next.js App Router üzerinden ayrışacak.</p>
          </article>
          <article className="card">
            <h2>Workspace subdomain modeli</h2>
            <p>Kullanıcılar root landing sonrası kendi workspace subdomain alanlarına yönlenecek.</p>
          </article>
        </section>
      </div>
    </main>
  );
};

export default MarketingPage;
