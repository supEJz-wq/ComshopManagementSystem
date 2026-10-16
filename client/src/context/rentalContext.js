import { createContext, useContext } from 'react'

export const RentalContext = createContext(null)

export function useRentals() {
  const context = useContext(RentalContext)
  if (!context) throw new Error('useRentals must be used inside RentalProvider')
  return context
}
