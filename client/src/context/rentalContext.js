// client/src/context/rentalContext.js
//
// Rental context object + hook. Unchanged shape from Phase 3.

import { createContext, useContext } from 'react';

export const RentalContext = createContext(null);

export function useRentals() {
  return useContext(RentalContext);
}
