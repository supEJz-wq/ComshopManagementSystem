// client/src/context/pcContext.js
//
// PC context object + hook. Unchanged shape from Phase 2 — only the provider
// changed (it now reads from the API).

import { createContext, useContext } from 'react';

export const PcContext = createContext(null);

export function usePcs() {
  return useContext(PcContext);
}
