import { useState } from 'react';
import { getHint } from '../lib/ai';

export type HintState = 'idle' | 'loading' | 'shown' | 'error';

export const MAX_HINTS = 3;
export const HINT_TIME_COST = 5; // seconds deducted from timer

export function useHint() {
  const [state,    setState]    = useState<HintState>('idle');
  const [text,     setText]     = useState<string>('');
  const [used,     setUsed]     = useState(0);

  async function requestHint(nowWord: string, nextWord: string, target: string) {
    if (used >= MAX_HINTS || state === 'loading') return;
    setState('loading');
    try {
      const hint = await getHint(nowWord, nextWord, target);
      setText(hint);
      setUsed(u => u + 1);
      setState('shown');
    } catch {
      setText('Hint unavailable right now. Trust your instincts!');
      setState('error');
    }
  }

  function dismiss() {
    setState('idle');
    setText('');
  }

  function reset() {
    setState('idle');
    setText('');
    setUsed(0);
  }

  return { state, text, used, requestHint, dismiss, reset };
}
