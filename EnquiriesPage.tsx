import { useMemo, useState } from 'react';
import { Search, Phone, MessageCircle, Mail, Trash2, CheckCheck, ChevronRight } from 'lucide-react';
import { listEnquiries, updateEnquiryStatus, deleteEnquiry } from '@/services/enquiries';
import { useAsyncData } from '@/admin/hooks/useAsyncData';
import { useToast } from '@/admin/hooks/useToast';
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PageHeader, Panel } from '@/admin/components/AdminUI';
import { STATUS_LABELS, STATUS_STYLES, TYPE_LABELS } from '@/admin/enquiryLabels';
import Modal from '@/components/ui/Modal';
import { Button, LinkButton } from '@/components/ui/Button';
import { cn, formatDate, telUrl, whatsappUrl } from '@/utils/helpers';
import type { Enquiry, EnquiryStatus, EnquiryType } from '@/types';

export default function EnquiriesPage() {
  const { data, setData, loading, error, reload } = useAsyncData(listEnquiries);
  const notify = useToast();
  const [type, setType] = useState<EnquiryType | 'all'>('all');
  const [status, setStatus] = useState<EnquiryStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    return (data ?? []).filter(
      (e) =>
        (type === 'all' || e.enquiry_type === type) &&
        (status === 'all' || e.status === status) &&
        (!q || e.full_name.toLowerCase().includes(q) || (qDigits.length > 0 && e.phone.replace(/\D/g, '').includes(qDigits))),
    );
  }, [data, type, status, query]);

  const selected = data?.find((e) => e.id === selectedId) ?? null;

  const changeStatus = async (e: Enquiry, next: EnquiryStatus) => {
    setBusy(true);
    try {
      await updateEnquiryStatus(e.id, next);
      setData((list) => list?.map((x) => (x.id === e.id ? { ...x, status: next } : x)) ?? null);
      notify(`Marked as ${STATUS_LABELS[next].toLowerCase()}`);
    } catch (cause) {
      console.error(cause);
      notify('Could not update status', 'error');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await deleteEnquiry(selected.id);
      setData((list) => list?.filter((x) => x.id !== selected.id) ?? null);
      setConfirmDelete(false);
      setSelectedId(null);
      notify('Enquiry deleted');
    } catch (cause) {
      console.error(cause);
      notify('Could not delete enquiry', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Enquiries" description="Every enquiry submitted through the website." />

      <Panel className="mb-6 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <span className="sr-only">Search by name or phone</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input className="input pl-10" placeholder="Search name or phone" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <select aria-label="Filter by type" className="input md:w-48" value={type} onChange={(e) => setType(e.target.value as EnquiryType | 'all')}>
          <option value="all">All types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select aria-label="Filter by status" className="input md:w-44" value={status} onChange={(e) => setStatus(e.target.value as EnquiryStatus | 'all')}>
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </Panel>

      {loading && !data ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState message={data?.length ? 'No enquiries match these filters.' : 'No enquiries yet.'} />
      ) : (
        <Panel className="overflow-hidden">
          <ul className="divide-y divide-white/5">
            {filtered.map((e) => (
              <li key={e.id}>
                <button type="button" onClick={() => setSelectedId(e.id)} className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]">
                  <span className={cn('h-2 w-2 shrink-0 rounded-full', e.status === 'new' ? 'bg-blood-500' : 'bg-transparent')} />
                  <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center sm:gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{e.full_name}</p>
                      <p className="text-xs text-zinc-500">{e.phone}</p>
                    </div>
                    <p className="truncate text-sm text-zinc-400">{TYPE_LABELS[e.enquiry_type]}{e.interested_plan ? ` · ${e.interested_plan}` : e.subject ? ` · ${e.subject}` : ''}</p>
                    <p className="text-xs text-zinc-500">{formatDate(e.created_at)}</p>
                    <span className={cn('w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold', STATUS_STYLES[e.status])}>{STATUS_LABELS[e.status]}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-600" />
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Modal open={!!selected && !confirmDelete} onClose={() => setSelectedId(null)} title="Enquiry details" size="lg">
        {selected && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-zinc-300">{TYPE_LABELS[selected.enquiry_type]}</span>
              <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold', STATUS_STYLES[selected.status])}>{STATUS_LABELS[selected.status]}</span>
              <span className="text-xs text-zinc-500">{formatDate(selected.created_at)}</span>
            </div>
            <dl className="grid gap-5 sm:grid-cols-2">
              {[
                ['Name', selected.full_name],
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['Interested in', selected.interested_plan],
                ['Preferred contact', selected.preferred_contact],
                ['Subject', selected.subject],
              ].map(([k, v]) => v && (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase tracking-widest text-zinc-500">{k}</dt>
                  <dd className="mt-1 break-words text-zinc-200">{v}</dd>
                </div>
              ))}
            </dl>
            {selected.message && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Message</p>
                <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-ink-800 p-4 text-sm text-zinc-300">{selected.message}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <LinkButton size="sm" variant="outline" href={telUrl(selected.phone)}><Phone className="h-4 w-4" /> Call</LinkButton>
              <LinkButton size="sm" variant="whatsapp" href={whatsappUrl(selected.phone.replace(/\D/g, '').length === 10 ? `91${selected.phone}` : selected.phone, `Hello ${selected.full_name}, thank you for contacting MR. THANOS FITNESS.`)}>
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </LinkButton>
              {selected.email && <LinkButton size="sm" variant="outline" href={`mailto:${selected.email}`}><Mail className="h-4 w-4" /> Email</LinkButton>}
            </div>
            <div className="flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="block">
                  <span className="label">Status</span>
                  <select className="input sm:w-48" value={selected.status} disabled={busy} onChange={(e) => changeStatus(selected, e.target.value as EnquiryStatus)}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
                {selected.status !== 'contacted' && (
                  <Button size="sm" disabled={busy} onClick={() => changeStatus(selected, 'contacted')}><CheckCheck className="h-4 w-4" /> Mark contacted</Button>
                )}
              </div>
              <Button size="sm" variant="ghost" className="text-blood-400 hover:text-blood-300" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete enquiry?"
        message={`This permanently removes the enquiry from ${selected?.full_name ?? 'this person'}. This cannot be undone.`}
        busy={busy}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
