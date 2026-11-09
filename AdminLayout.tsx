import { useState, type ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Inbox, CreditCard, Dumbbell, Images, MessageSquareQuote, Settings, LogOut, ExternalLink, Menu, X } from 'lucide-react';
import { Logo } from '@/components/layout/Navbar';
import { requireSupabase } from '@/lib/supabase';
import { cn } from '@/utils/helpers';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Inbox },
  { to: '/admin/memberships', label: 'Memberships', icon: CreditCard },
  { to: '/admin/programs', label: 'Training programs', icon: Dumbbell },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { to: '/admin/settings', label: 'Business settings', icon: Settings },
];

export default function AdminLayout({ email, children }: { email: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Admin">
      {LINKS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            cn('flex items-center gap-3 rounded-md px-4 py-3 text-sm transition-colors', isActive ? 'bg-blood-500 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white')
          }
        >
          <Icon className="h-4 w-4" /> {label}
        </NavLink>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/5 pt-4">
        <Link to="/" target="_blank" className="flex items-center gap-3 rounded-md px-4 py-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
        <button type="button" onClick={() => requireSupabase().auth.signOut()} className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
        <p className="truncate px-4 pt-2 text-xs text-zinc-600">{email}</p>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-white/5 bg-ink-800 lg:flex">
        <div className="border-b border-white/5 p-6"><Logo /></div>
        {nav}
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-ink-800/95 px-5 py-3 backdrop-blur lg:hidden">
        <Logo />
        <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} className="flex h-11 w-11 items-center justify-center rounded-md border border-white/10">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open && <div className="fixed inset-x-0 bottom-0 top-[65px] z-30 flex flex-col overflow-y-auto bg-ink-800 lg:hidden">{nav}</div>}

      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">{children}</main>
    </div>
  );
}
