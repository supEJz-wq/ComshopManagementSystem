/*
  PRICING RULES — Phase 4
  ---------------------------------------------------------------
  Every pricing decision lives here as a pure function, so the UI and
  the data layer cannot disagree and the rules can be tested directly.

  DURATION IS IN SECONDS throughout. Minutes are a display convenience.
  A rental may be booked to the second, because an emergency rental of
  two minutes has to be recordable without pretending it was half an hour.

  RATE      ₲20 per hour = ₱10 per 30-minute block.
  ROUNDING  Time is always rounded UP to the next :00 or :30.
  PROMO     A piece of exactly 6 hours costs ₱100 instead of ₱120.
            The promo applies to a booking AND to a 6-hour extension —
            each piece is priced on its OWN length, never on the total.

      book 6 hr          →  ₱100   (promo)
      + 30 min           →  ₱110
      + 6 hr             →  ₱200   (promo again)
      book 6 hr 30 min   →  ₱130   (not 6 hours, so no promo)
      book 12 hr         →  ₱240   (not 6 hours, so no promo)

  Because pieces are priced separately, the same total can be reached
  at different prices — book 6 then extend 6 is ₱200, book 12 straight
  is ₱240. That is deliberate: the promo is a reward for taking the
  6-hour piece, and the customer is free to use it.

  A rental stops at 24 hours. Nothing may be booked or extended past it.

  There are never centavos. Every amount is a whole peso.

  The shortest bookable rental is one minute. Anything shorter rounds
  up to a single ₱10 block anyway, so sub-minute precision is refused
  rather than accepted and hidden.

  This file is deleted in Phase 11; the pricing rules move to the
  server, which becomes the only place they are enforced.
*/

export const THIRTY_MIN_SECONDS = 30 * 60
export const RATE_PER_BLOCK = 10
export const PROMO_SECONDS = 6 * 60 * 60
export const PROMO_PRICE = 100
export const MAX_RENTAL_SECONDS = 24 * 60 * 60
export const MIN_RENTAL_SECONDS = 60

/*
  Round seconds up to the next whole 30-minute block. 20s → 1800,
  1800 → 1800, 1801 → 3600. This is the only rounding the shop does.
*/
export function roundUpToBlock(seconds) {
  return Math.ceil(seconds / THIRTY_MIN_SECONDS) * THIRTY_MIN_SECONDS
}

/*
  Price one piece of a rental on its own length. A piece of exactly
  six hours is the promo; everything else is blocks of ₱10.
*/
export function priceForPiece(seconds) {
  if (seconds === PROMO_SECONDS) return PROMO_PRICE
  return (roundUpToBlock(seconds) / THIRTY_MIN_SECONDS) * RATE_PER_BLOCK
}

/*
  Total seconds a customer has committed to — the initial booking plus
  every extension.
*/
export function bookedSecondsOf(rental) {
  return rental.segments.reduce((sum, piece) => sum + piece.seconds, 0)
}

/*
  The bill for a rental that has just ended.

  Each booked piece is priced on its own length, so the promo survives
  extensions. Time the customer used beyond what was booked becomes one
  extra piece, rounded up — a customer who overstays by 20 minutes on a
  6-hour rental is charged one more block, and keeps the promo.
*/
export function billRental(rental, endedAt) {
  const usedSeconds = Math.max(0, Math.round((endedAt - rental.startedAt) / 1000))
  const bookedSeconds = bookedSecondsOf(rental)
  const overstaySeconds = Math.max(0, usedSeconds - bookedSeconds)

  const pieces = rental.segments.map((piece) => ({ ...piece }))

  if (overstaySeconds > 0) {
    pieces.push({
      seconds: roundUpToBlock(overstaySeconds),
      amount: priceForPiece(overstaySeconds),
      extra: true,
    })
  }

  const amountDue = pieces.reduce((sum, piece) => sum + piece.amount, 0)

  return { pieces, usedSeconds, bookedSeconds, overstaySeconds, amountDue }
}

export function formatPeso(amount) {
  return `₱${amount.toLocaleString('en-PH')}`
}

/*
  A duration for the cashier to read. Under a minute it shows seconds,
  because that is exactly the emergency case the seconds box exists for.
*/
export function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)} sec`

  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} min`
  if (minutes === 0) return `${hours} hr`
  return `${hours} hr ${minutes} min`
}
