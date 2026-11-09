import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = 'Page not found | MR. THANOS FITNESS';
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center">
      <p className="font-display text-[10rem] leading-none text-blood-500">404</p>
      <h1 className="font-display text-4xl uppercase tracking-wide">This page skipped leg day</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-8 rounded-md bg-blood-500 px-6 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-blood-600">
        Back to home
      </Link>
    </main>
  );
}
