import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { fetchSiteContent } from '@/services/content';
import { DEFAULT_CONTENT } from '@/utils/defaults';
import type { SiteContent } from '@/types';

interface SiteContentState {
  content: SiteContent;
  loading: boolean;
  error: boolean;
}

const SiteContentContext = createContext<SiteContentState>({ content: DEFAULT_CONTENT, loading: true, error: false });

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SiteContentState>({ content: DEFAULT_CONTENT, loading: true, error: false });

  useEffect(() => {
    let active = true;
    fetchSiteContent()
      .then((content) => active && setState({ content, loading: false, error: false }))
      .catch((cause) => {
        console.error('site content load failed', cause);
        if (active) setState({ content: DEFAULT_CONTENT, loading: false, error: true });
      });
    return () => {
      active = false;
    };
  }, []);

  return <SiteContentContext.Provider value={state}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
