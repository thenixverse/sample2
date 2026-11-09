import { Link } from 'react-router-dom';
import { Inbox, Sparkles, CreditCard, Mail, ArrowRight } from 'lucide-react';
import { listEnquiries } from '@/services/enquiries';
import { useAsyncData } from '@/admin/hooks/useAsyncData';
import { ErrorState, LoadingState, PageHeader, Panel } from '@/admin/components/AdminUI';
import { STATUS_LABELS, STATUS_STYLES, TYPE_LABELS } from '@/admin/enquiryLabels';
import { cn, formatDate } from '@/utils/helpers';

export default function DashboardPage() {
  const { data, loading, error, reload } = useAsyncData(listEnquiries);

  if (loading && !data) return <LoadingState />;
  if (error || !data) return <ErrorState onRetry={reload} />;

  const stats = [
    { label: 'Total enquiries', value: data.length, icon: Inbox },
    { label: 'New enquiries', value: data.filter((e) => e.status === 'new').length, icon: Sparkles, accent: true },
    { label: 'Membership enquiries', value: data.filter((e) => e.enquiry_type !== 'contact').length, icon: CreditCard },
    { label: 'Contact enquiries', value: data.filter((e) => e.enquiry_type === 'contact').length, icon: Mail },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="Overview of website enquiries." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <Panel key={label} className={cn('p-6', accent && 'border-blood-500/30 bg-gradient-to-br from-blood-500/10 to-ink-700')}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{label}</p>
              <Icon className={cn('h-5 w-5', accent ? 'text-blood-500' : 'text-zinc-600')} />
            </div>
            <p className="mt-4 font-display text-6xl">{value}</p>
          </Panel>
        ))}
      </div>

      <Panel className="mt-8">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
          <h2 className="font-display text-2xl uppercase tracking-wide">Recent activity</h2>
          <Link to="/admin/enquiries" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blood-400 hover:text-blood-300">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {data.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No enquiries yet. New submissions from the website will appear here.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {data.slice(0, 8).map((e) => (
              <li key={e.id} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{e.full_name}</p>
                  <p className="text-xs text-zinc-500">{TYPE_LABELS[e.enquiry_type]}{e.interested_plan ? ` · ${e.interested_plan}` : ''} · {formatDate(e.created_at)}</p>
                </div>
                <span className={cn('w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold', STATUS_STYLES[e.status])}>{STATUS_LABELS[e.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
