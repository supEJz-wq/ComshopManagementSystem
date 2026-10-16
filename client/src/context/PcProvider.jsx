import { useEffect, useState } from 'react'
import { ALLOWED_TRANSITIONS, DEFAULT_PCS, PC_STATUS } from '../data/pcs.js'
import { PcContext } from './pcContext.js'

const PCS_KEY = 'cybershopos.pcs'

/*
  Ids are internal keys, generated free of collisions. They are deliberately
  NOT a slug of the name: "PC-09" and "PC 09" are two different, legitimately
  addable names, but a slug collapses both onto one id — which would give two
  tiles the same key and make status and rental lookups hit both at once.
  The name is never edited and the PC is never deleted, so a plain sequence
  is stable for the life of the record.
*/
function nextPcId(pcs) {
  let n = 1
  let id = `pc-${String(n).padStart(2, '0')}`
  while (pcs.some((pc) => pc.id === id)) {
    n += 1
    id = `pc-${String(n).padStart(2, '0')}`
  }
  return id
}

function readPcs() {
  try {
    const raw = localStorage.getItem(PCS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_PCS
  } catch {
    return DEFAULT_PCS
  }
}

export function PcProvider({ children }) {
  const [pcs, setPcs] = useState(readPcs)

  useEffect(() => {
    localStorage.setItem(PCS_KEY, JSON.stringify(pcs))
  }, [pcs])

  // Admin only. Names must be unique and are never editable afterwards.
  // A PC has a name and a status. Nothing else — no location, no notes, and
  // no rental field. Rental timing lives in the rental layer.
  function addPc(rawName) {
    const name = rawName.trim()
    if (!name) return { ok: false, error: 'Enter a name for the PC.' }

    const taken = pcs.some((pc) => pc.name.toLowerCase() === name.toLowerCase())
    if (taken) return { ok: false, error: `${name} already exists.` }

    setPcs((prev) => [...prev, { id: nextPcId(prev), name, status: PC_STATUS.FREE, needsRepair: false }])
    return { ok: true }
  }

  // Transitions are validated here, not in the UI, so an invalid change can
  // never be applied even if a control is bypassed.
  //
  // Entering a fault state RAISES needsRepair. It is never lowered here,
  // because going free does not mean the machine was repaired — it usually
  // means a rental ended. Only repairPc() clears the flag.
  function setStatus(id, nextStatus) {
    setPcs((prev) =>
      prev.map((pc) => {
        if (pc.id !== id) return pc
        if (!ALLOWED_TRANSITIONS[pc.status]?.includes(nextStatus)) return pc
        const faulted = nextStatus === PC_STATUS.ISSUE || nextStatus === PC_STATUS.UNRESPONSIVE
        return { ...pc, status: nextStatus, needsRepair: faulted ? true : pc.needsRepair ?? false }
      }),
    )
  }

  /*
    The only way a known fault is ever cleared. Leaves the PC usable, and
    if it was flagged issue or unresponsive it goes back to free.
  */
  function repairPc(id) {
    setPcs((prev) =>
      prev.map((pc) => {
        if (pc.id !== id) return pc
        const status =
          pc.status === PC_STATUS.ISSUE || pc.status === PC_STATUS.UNRESPONSIVE
            ? PC_STATUS.FREE
            : pc.status
        return { ...pc, status, needsRepair: false }
      }),
    )
  }

  const value = { pcs, addPc, setStatus, repairPc }

  return <PcContext.Provider value={value}>{children}</PcContext.Provider>
}
