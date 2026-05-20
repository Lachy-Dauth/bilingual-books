'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type ConsentChoice = 'accepted' | 'rejected' | null;

type ConsentContextValue = {
  choice: ConsentChoice;
  hydrated: boolean;
  accept: () => void;
  reject: () => void;
  reset: () => void;
};

const KEY = 'bb_consent';

const Ctx = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<ConsentChoice>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === 'accepted' || v === 'rejected') setChoice(v);
    } catch {
      /* localStorage blocked — treat as undecided */
    }
    setHydrated(true);
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(KEY, 'accepted');
    } catch {
      /* ignore */
    }
    setChoice('accepted');
  }, []);

  const reject = useCallback(() => {
    try {
      localStorage.setItem(KEY, 'rejected');
    } catch {
      /* ignore */
    }
    setChoice('rejected');
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setChoice(null);
  }, []);

  return (
    <Ctx.Provider value={{ choice, hydrated, accept, reject, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useConsent() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useConsent must be used within ConsentProvider');
  return c;
}
