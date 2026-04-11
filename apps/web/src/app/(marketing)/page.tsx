import Link from "next/link";

/* ─── SVG icons (inline, no external dependency) ─── */
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" />
  </svg>
);

const IconBolt = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconDot = () => (
  <svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true">
    <circle cx="3" cy="3" r="3" fill="currentColor" />
  </svg>
);

/* ─── Feature data ─── */
const features = [
  {
    icon: <IconShield />,
    title: "Server-side AI gateway",
    description:
      "Gemini ve fal.ai çağrıları tenant context ile güvenli backend yüzeyine taşınır. API anahtarları asla browser'a ulaşmaz.",
  },
  {
    icon: <IconBolt />,
    title: "Supabase auth + SSR",
    description:
      "Anon landing, kimlik doğrulama girişi ve oturum yenileme Next.js App Router üzerinde temiz bir şekilde ayrışır.",
  },
  {
    icon: <IconGlobe />,
    title: "Workspace subdomain modeli",
    description:
      "Kullanıcılar root landing sonrası kendi workspace subdomain alanlarına yönlendirilir. Tam tenant izolasyonu.",
  },
];

const MarketingPage = () => {
  return (
    <div className="shell">
      {/* ── Navigation ── */}
      <nav className="nav" aria-label="Ana navigasyon">
        <div className="nav__inner">
          <Link href="/" className="nav__logo" aria-label="Virtulize ana sayfa">
            Virtulize
          </Link>

          <ul className="nav__links" role="list">
            <li><Link href="#ozellikler">Özellikler</Link></li>
            <li><Link href="#platform">Platform</Link></li>
            <li><a href="https://docs.virtulize.dev" target="_blank" rel="noreferrer">Docs</a></li>
          </ul>

          <div className="nav__actions">
            <Link href="/login" className="btn btn--ghost btn--sm">
              Giriş yap
            </Link>
            <Link href="/login" className="btn btn--primary btn--sm">
              Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero" aria-label="Hero">
        <div className="hero__content">
          <span className="eyebrow">
            <IconDot />
            Phase 5 · Şu an aktif
          </span>

          <h1>
            AI-powered SaaS&nbsp;omurgası,
            <br />
            güvenli ve çok kiracılı.
          </h1>

          <p className="hero__sub">
            Mevcut styling deneyimini korurken AI anahtarlarını browser dışına taşıyan,
            tenant-aware ve Supabase-first yeni uygulama kabuğu.
          </p>

          <div className="hero__actions">
            <Link href="/login" className="btn btn--primary">
              Uygulamayı aç
            </Link>
            <a
              href="https://docs.virtulize.dev"
              className="btn btn--ghost"
              target="_blank"
              rel="noreferrer"
            >
              Dokümantasyon
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats" aria-label="Platform metrikleri">
        <div className="container">
          <div className="stats__grid">
            <div>
              <p className="stat__number">100%</p>
              <p className="stat__label">Server-side AI işleme</p>
            </div>
            <div>
              <p className="stat__number">0ms</p>
              <p className="stat__label">Browser'a sızan API anahtarı</p>
            </div>
            <div>
              <p className="stat__number">∞</p>
              <p className="stat__label">Tenant izolasyon kapasitesi</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="section" id="ozellikler" aria-labelledby="features-heading">
        <div className="container">
          <p className="section__label">Platform pillars</p>
          <h2 id="features-heading">Güvenli, hızlı ve ölçeklenebilir.</h2>

          <div className="grid" role="list">
            {features.map((f) => (
              <article className="card" key={f.title} role="listitem">
                <div className="card__icon" aria-hidden="true">
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer" aria-label="Site footer">
        <div className="container">
          <div className="footer__inner">
            <div>
              <p className="footer__brand">Virtulize</p>
              <p className="footer__copy">© 2025 Virtulize. Tüm hakları saklıdır.</p>
            </div>
            <ul className="footer__links" role="list">
              <li><a href="/login">Giriş yap</a></li>
              <li><a href="https://docs.virtulize.dev" target="_blank" rel="noreferrer">Docs</a></li>
              <li><a href="mailto:hello@virtulize.dev">İletişim</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingPage;
