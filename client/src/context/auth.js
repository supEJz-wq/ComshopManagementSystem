// client/src/context/auth.js
//
// Auth context + hook. No mock data. The session lives server-side in PHP
// $_SESSION (cookie-based). This provider just mirrors the server state.

import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}
