import { useEffect } from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import { Loader2, ShieldAlert, Database } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { isSupabaseConfigured, requireSupabase } from '@/lib/supabase';
import { ToastProvider } from '@/admin/hooks/useToast';
import AdminLogin from '@/admin/AdminLogin';
import AdminLayout from '@/admin/AdminLayout';
import DashboardPage from '@/admin/pages/DashboardPage';
import EnquiriesPage from '@/admin/pages/EnquiriesPage';
import PlansPage from '@/admin/pages/PlansPage';
import ProgramsPage from '@/admin/pages/ProgramsPage';
import GalleryPage from '@/admin/pages/GalleryPage';
import TestimonialsPage from '@/admin/pages/TestimonialsPage';
import SettingsPage from '@/admin/pages/SettingsPage';
import { Button } from '@/components/ui/Button';

function CenteredNotice({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="max-w-md rounded-xl border border-white/10 bg-ink-700 p-8 text-center">
        <div className="flex justify-center text-blood-500">{icon}</div>
        <h1 className="mt-4 font-display text-4xl uppercase tracking-wide">{title}</h1>
        <div className="mt-3 text-sm text-muted">{children}</div>
      </div>
    </main>
  );
}

export default function AdminApp() {
  const { session, isAdmin, loading, refresh } = useAdminAuth();

  useEffect(() => {
    document.title = 'Admin | MR. THANOS FITNESS';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <CenteredNotice icon={<Database className="h-8 w-8" />} title="Backend not connected">
        <p>The admin dashboard needs the database connection to be configured before it can be used. Once connected, reload this page to set up the owner account.</p>
        <Link to="/" className="mt-6 inline-block text-xs uppercase tracking-wider text-blood-400">Back to website</Link>
      </CenteredNotice>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!session) return <AdminLogin onSignedIn={refresh} />;

  if (!isAdmin) {
    return (
      <CenteredNotice icon={<ShieldAlert className="h-8 w-8" />} title="Access denied">
        <p>This account does not have administrator access.</p>
        <Button variant="outline" size="sm" className="mt-6" onClick={() => requireSupabase().auth.signOut()}>Sign out</Button>
      </CenteredNotice>
    );
  }

  return (
    <ToastProvider>
      <AdminLayout email={session.user.email ?? ''}>
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="enquiries" element={<EnquiriesPage />} />
          <Route path="memberships" element={<PlansPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </ToastProvider>
  );
}
