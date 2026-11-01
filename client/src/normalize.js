// client/src/normalize.js
//
// The API speaks snake_case, because that is what the SQL columns are called.
// The screens speak camelCase, because that is what they were written against
// in Phases 1-8 and every one of them has been owner-verified since.
//
// Rather than rewrite eight screens and risk breaking verified UI, the two
// shapes meet HERE, once. One mapping, one place to look, one place to change.
//
// This is the same discipline the backend uses: a rule that lives in one place
// cannot drift out of agreement with itself.

/** A bill, as the Payments / Refunds / Revenue screens expect it. */
export function normalizePayment(row) {
  return {
    id: row.id,
    ref: row.reference_number,
    rentalId: row.rental_id,
    pcId: row.pc_id,
    pcName: row.pc_name,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    usedSeconds: row.used_seconds,
    bookedSeconds: row.booked_seconds,
    overstaySeconds: row.overstay_seconds,
    pieces: (row.pieces ?? []).map((piece) => ({
      seconds: piece.seconds,
      amount: piece.amount,
      isPromo: piece.isPromo,
      isOverstay: piece.isOverstay,
    })),
    transfers: (row.transfers ?? []).map((t) => ({
      fromPcId: t.fromPcId,
      fromPcName: t.fromPcName,
      toPcId: t.toPcId,
      toPcName: t.toPcName,
      remainingTimeSeconds: t.remainingTimeSeconds,
      // The screens sort and label this as `at`.
      at: t.transferredAt,
    })),
    amountDue: row.amount_due,
    cashReceived: row.cash_received,
    amountCharged: row.amount_charged,
    change: row.change_given,
    settled: row.is_settled,
    settledAt: row.settled_at,
    settledById: row.settled_by_id,
    settledByName: row.settled_by_name,
    cashierId: row.cashier_id,
    cashierName: row.cashier_name,
    createdAt: row.created_at,
  };
}

/** A refund / adjustment record, as the screens expect it. */
export function normalizeRefund(row) {
  return {
    id: row.id,
    // The screens say "transaction", the column says "payment". Same thing.
    transactionId: row.payment_id,
    amount: row.amount,
    reason: row.reason,
    kind: row.kind ?? row.refund_type,
    cashierId: row.cashier_id,
    cashierName: row.cashier_name,
    at: row.at ?? row.created_at,
  };
}

/*
  REVENUE — the server's own figures for one period.

  The server decides which bills and refunds belong to the period, and what a
  bill is worth after its refunds. The screen displays these numbers; it does
  not recompute them. See server/api/revenue/index.php.
*/
export function normalizeRevenueSummary(row) {
  return {
    period: row.period,
    label: row.label,
    range: {
      start: row.range?.start ?? null,
      end: row.range?.end ?? null,
    },
    collected: row.collected,
    refunded: row.refunded,
    net: row.net,
    stillOwed: row.stillOwed,
    settledCount: row.settledCount,
    refundCount: row.refundCount,
    adjustmentCount: row.adjustmentCount,
    role: row.role,
  };
}

/** A settled bill in the period, with the net the server computed. */
export function normalizeRevenueBill(row) {
  return {
    id: row.id,
    ref: row.reference_number,
    pcName: row.pc_name,
    amountCharged: row.amount_charged,
    cashReceived: row.cash_received,
    change: row.change_given,
    settledAt: row.settled_at,
    settledByName: row.settled_by_name,
    cashierName: row.cashier_name,
    refunded: row.refunded,
    net: row.net,
  };
}

/** A refund in the period, with the bill it belongs to. */
export function normalizeRevenueRefund(row) {
  return {
    id: row.id,
    transactionId: row.payment_id,
    amount: row.amount,
    reason: row.reason,
    kind: row.refund_type,
    at: row.created_at,
    cashierName: row.cashier_name,
    billRef: row.reference_number,
    pcName: row.pc_name,
  };
}

/*
  ANALYTICS — every series a chart draws, as the server computed it.

  The label is presentation, so where the server sent a label it is kept
  (day buckets) and where it sent raw parts the client formats them
  (months, hours).
*/
export function normalizeDayBuckets(rows) {
  return (rows ?? []).map((row) => ({
    at: row.at,
    label: row.label,
    collected: row.collected,
    refunded: row.refunded,
  }));
}

export function normalizeHourBuckets(rows) {
  return (rows ?? []).map((row) => ({
    hour: row.hour,
    label: `${row.hour}:00`,
    collected: row.collected,
  }));
}

export function normalizeCashierRows(rows) {
  return (rows ?? []).map((row) => ({
    cashier: row.cashier,
    collected: row.collected,
    refunded: row.refunded,
    net: row.net,
  }));
}

export function normalizeYearRows(rows) {
  return (rows ?? []).map((row) => ({
    year: row.year,
    collected: row.collected,
  }));
}

/**
 * Months per year, flattened for one year.
 *
 * The server sends every year it has data for, twelve months each, so the
 * Analytics screen can offer the years. The label is built here because the
 * server sent the month as a number, and a month is only a label once it has
 * a name.
 */
export function normalizeMonthRows(years, year) {
  const match = (years ?? []).find((row) => Number(row.year) === Number(year));

  if (!match) return [];

  return (match.months ?? []).map((row) => ({
    month: row.month,
    label: new Date(Number(match.year), row.month - 1, 1).toLocaleDateString('en-PH', {
      month: 'short',
      year: 'numeric',
    }),
    collected: row.collected,
  }));
}

/** An active rental, as the board and Rentals screen expect it. */
export function normalizeRental(row) {
  return {
    id: row.id,
    pcId: row.pcId,
    blockSeconds: row.blockSeconds,
    startedAt: row.startedAt,
    blockStartedAt: row.blockStartedAt,
    status: row.status,
    cashierId: row.cashierId,
    segments: (row.segments ?? []).map((piece) => ({
      seconds: piece.seconds,
      amount: piece.amountCharged,
      isPromo: piece.isPromo,
      isOverstay: piece.isOverstay,
    })),
    transfers: (row.transfers ?? []).map((t) => ({
      fromPcId: t.fromPcId,
      fromPcName: t.fromPcName,
      toPcId: t.toPcId,
      toPcName: t.toPcName,
      remainingTimeSeconds: t.remainingTimeSeconds,
      at: t.transferredAt,
    })),
  };
}