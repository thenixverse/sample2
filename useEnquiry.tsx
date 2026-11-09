import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import type { EnquiryType } from '@/types';
import EnquiryModal from '@/components/enquiry/EnquiryModal';

export interface EnquiryRequest {
  type: EnquiryType;
  plan?: string;
  title?: string;
}

const EnquiryContext = createContext<(req: EnquiryRequest) => void>(() => {});

export function EnquiryProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<EnquiryRequest | null>(null);
  const open = useCallback((req: EnquiryRequest) => setRequest(req), []);

  return (
    <EnquiryContext.Provider value={open}>
      {children}
      <EnquiryModal request={request} onClose={() => setRequest(null)} />
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  return useContext(EnquiryContext);
}
