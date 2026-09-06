import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center pt-28 pb-20">
      <div className="container-page">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">404</p>
          <h1 className="mt-5 heading-xl">
            Pagina <span className="text-av-green">non trovata</span>
          </h1>
          <p className="mt-6 body-lg">
            L&apos;indirizzo richiesto non esiste o è stato spostato. Torna alla home o esplora le guide.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="btn-primary shadow-glow-green-sm">
              Torna alla home
            </Link>
            <Link href="/guide" className="btn-ghost">
              Esplora le guide
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
