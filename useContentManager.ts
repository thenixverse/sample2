import { useCallback, useState } from 'react';
import { deleteRow, insertRow, listRows, swapOrder, updateRow, type ContentTable } from '@/services/admin';
import { useAsyncData } from '@/admin/hooks/useAsyncData';
import { useToast } from '@/admin/hooks/useToast';

interface Row {
  id: string;
  sort_order: number;
}

export function useContentManager<T extends Row>(table: ContentTable, noun: string) {
  const loader = useCallback(() => listRows<T>(table), [table]);
  const { data, loading, error, reload } = useAsyncData(loader);
  const notify = useToast();
  const [busy, setBusy] = useState(false);
  const items = data ?? [];

  const run = async (action: () => Promise<void>, success: string, failure: string) => {
    setBusy(true);
    try {
      await action();
      await reload();
      notify(success);
      return true;
    } catch (cause) {
      console.error(`${table} change failed`, cause);
      notify(failure, 'error');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const save = (id: string | null, values: Partial<T>) =>
    run(
      () => (id ? updateRow<T>(table, id, values) : insertRow<T>(table, { ...values, sort_order: (items[items.length - 1]?.sort_order ?? 0) + 1 } as Partial<T>)),
      id ? `${noun} updated` : `${noun} added`,
      `Could not save ${noun.toLowerCase()}. Check the details and try again.`,
    );

  const remove = (id: string, afterDelete?: () => Promise<void>) =>
    run(async () => { await deleteRow(table, id); await afterDelete?.(); }, `${noun} removed`, `Could not remove ${noun.toLowerCase()}`);

  const patch = (id: string, values: Partial<T>, message: string) => run(() => updateRow<T>(table, id, values), message, 'Could not update');

  const move = (index: number, dir: -1 | 1) => {
    const a = items[index];
    const b = items[index + dir];
    if (!a || !b) return Promise.resolve(false);
    return run(() => swapOrder(table, a, b), 'Order updated', 'Could not reorder');
  };

  return { items, loading: loading && !data, error, reload, busy, save, remove, patch, move };
}
