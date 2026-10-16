/*
  MOCK ACCOUNTS — Phase 1 only.

  There are exactly two accounts. There is no signup and no self-registration.

  The Admin sets the Cashier's password and gives it to them in person.
  If the Cashier forgets it, the Admin resets it and gives them the new one.

  ⚠️  PASSWORDS ARE PLAINTEXT HERE. This is unavoidable for mock data and is
      NOT a pattern to carry forward. In Phase 10 passwords must be hashed
      server-side and must never be sent back to the client.
      This file is deleted entirely in Phase 11.
*/

export const DEFAULT_ACCOUNTS = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    active: true,
  },
  {
    id: 'cashier',
    username: 'cashier',
    password: 'cashier123',
    role: 'cashier',
    active: true,
  },
]
