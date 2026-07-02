// Domain: Cycle
//
// Pure descriptive statistics over a user's logged period history.
// No side effects, no external dependencies (no DB, no infra, no UI) — keeping
// this layer portable to a future React Native client.
//
// All date math is done in whole UTC calendar days: time-of-day is ignored,
// which avoids DST and off-by-one bugs. Standard deviation is the sample SD
// (Bessel's correction, n − 1).
//
// These primitives are intentionally strict: they throw when they lack the data
// to compute a real statistic, rather than guessing. The prediction basis
// resolver (separate module) catches those errors to fall back to population
// defaults — a signal it can only rely on if the primitives never fabricate.

export type PeriodLog = {
  startDate: Date // first day of the logged menses
  endDate: Date // last day of the logged menses (inclusive)
}

// Cycle-length spread (max − min) strictly greater than this many days is
// considered irregular.
export const IRREGULAR_THRESHOLD_DAYS = 7

export class InsufficientDataError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InsufficientDataError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

const MS_PER_DAY = 86_400_000

// Whole-day UTC ordinal for a date, ignoring time-of-day.
function toUtcDayNumber(date: Date): number {
  return (
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
    MS_PER_DAY
  )
}

// Signed whole-day difference (b − a) in UTC calendar days.
function daysBetween(a: Date, b: Date): number {
  return toUtcDayNumber(b) - toUtcDayNumber(a)
}

// Rejects any period whose end day falls before its start day.
function validatePeriods(periods: PeriodLog[]): void {
  for (const p of periods) {
    if (toUtcDayNumber(p.endDate) < toUtcDayNumber(p.startDate)) {
      throw new ValidationError('period endDate cannot be before startDate')
    }
  }
}

// A copy sorted by start date ascending. Does not mutate the input.
function sortedByStart(periods: PeriodLog[]): PeriodLog[] {
  return [...periods].sort(
    (a, b) => toUtcDayNumber(a.startDate) - toUtcDayNumber(b.startDate)
  )
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

// Sample standard deviation (n − 1). Returns 0 when there is less than one
// degree of freedom (0 or 1 data points): no spread can be observed.
function sampleStdDev(values: number[]): number {
  const n = values.length
  if (n < 2) return 0
  const m = mean(values)
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (n - 1)
  return Math.sqrt(variance)
}

// Length of each period in inclusive whole days (endDate − startDate + 1).
function periodLengths(periods: PeriodLog[]): number[] {
  return periods.map((p) => daysBetween(p.startDate, p.endDate) + 1)
}

// Days between each consecutive pair of period starts. Empty for < 2 periods.
export function cycleLengths(periods: PeriodLog[]): number[] {
  validatePeriods(periods)
  const sorted = sortedByStart(periods)
  const lengths: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    lengths.push(daysBetween(sorted[i - 1].startDate, sorted[i].startDate))
  }
  return lengths
}

// Rounded mean cycle length. Needs at least 2 periods (one cycle length).
export function averageCycleLength(periods: PeriodLog[]): number {
  const lengths = cycleLengths(periods)
  if (lengths.length < 1) {
    throw new InsufficientDataError(
      'need at least 2 logged periods to calculate cycle length'
    )
  }
  return Math.round(mean(lengths))
}

// Sample standard deviation of cycle lengths. Needs at least 2 periods; returns
// 0 when there is only a single cycle length (exactly 2 periods).
export function cycleLengthStdDev(periods: PeriodLog[]): number {
  const lengths = cycleLengths(periods)
  if (lengths.length < 1) {
    throw new InsufficientDataError(
      'need at least 2 logged periods to calculate cycle length'
    )
  }
  return sampleStdDev(lengths)
}

// Rounded mean period length. Needs at least 1 period.
export function averagePeriodLength(periods: PeriodLog[]): number {
  validatePeriods(periods)
  if (periods.length < 1) {
    throw new InsufficientDataError('need at least 1 logged period')
  }
  return Math.round(mean(periodLengths(periods)))
}

// Sample standard deviation of period lengths. Needs at least 1 period; returns
// 0 for a single period.
export function periodLengthStdDev(periods: PeriodLog[]): number {
  validatePeriods(periods)
  if (periods.length < 1) {
    throw new InsufficientDataError('need at least 1 logged period')
  }
  return sampleStdDev(periodLengths(periods))
}

// True when the cycle-length spread (max − min) strictly exceeds the irregular
// threshold. Needs at least 3 periods (two cycle lengths) to assess spread.
export function isIrregular(periods: PeriodLog[]): boolean {
  const lengths = cycleLengths(periods) // validates + sorts internally
  if (periods.length < 3) {
    throw new InsufficientDataError(
      'need at least 3 logged periods to assess regularity'
    )
  }
  const spread = Math.max(...lengths) - Math.min(...lengths)
  return spread > IRREGULAR_THRESHOLD_DAYS
}

// The 1-based day of the current cycle: 1 on the most recent period start,
// counting inclusive whole days since. Needs at least 1 period.
export function currentCycleDay(periods: PeriodLog[], today: Date): number {
  validatePeriods(periods)
  if (periods.length < 1) {
    throw new InsufficientDataError('need at least 1 logged period')
  }
  const sorted = sortedByStart(periods)
  const mostRecentStart = sorted[sorted.length - 1].startDate
  const daysSinceStart = daysBetween(mostRecentStart, today)
  if (daysSinceStart < 0) {
    throw new ValidationError(
      'date cannot be before the most recent period start'
    )
  }
  return daysSinceStart + 1
}
