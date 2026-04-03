import Link from "next/link";

const NotFoundPage = () => {
  return (
    <main className="not-found">
      <span className="eyebrow">404</span>
      <h1>Bu alan bulunamadı.</h1>
      <p>
        İstediğiniz tenant alanı henüz hazır değil veya link artık geçerli değil. Root landing alanına dönüp
        tekrar deneyebilirsiniz.
      </p>
      <div className="not-found__actions">
        <Link href="/" className="button">
          Landing sayfasına dön
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;
