// client/src/context/transactionContext.js
//
// Transaction context object + hook. Unchanged shape from Phase 4.

import { createContext, useContext } from 'react';

export const TransactionContext = createContext(null);

export function useTransactions() {
  return useContext(TransactionContext);
}
