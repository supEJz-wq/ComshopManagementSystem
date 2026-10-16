import { createContext, useContext } from 'react'

export const PcContext = createContext(null)

export function usePcs() {
  const context = useContext(PcContext)
  if (!context) throw new Error('usePcs must be used inside PcProvider')
  return context
}
