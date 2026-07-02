import { describe, it, expect } from 'vitest'
import {
  cycleLengths,
  averageCycleLength,
  cycleLengthStdDev,
  averagePeriodLength,
  periodLengthStdDev,
  isIrregular,
  currentCycleDay,
  IRREGULAR_THRESHOLD_DAYS,
  InsufficientDataError,
  ValidationError,
  type PeriodLog,
} from './cycle'

// These tests serve as documentation for how the cycle statistics domain works.
// Every public function is tested, including all error branches and the
// UTC-whole-day date semantics. Standard deviation is the sample SD (n − 1).

// --- Test data helpers ---------------------------------------------------

// A UTC midnight Date for an ISO calendar day.
const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`)

// Add whole days to a Date (exact in UTC).
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86_400_000)

// A period starting on `start` and lasting `lengthDays` inclusive days.
const period = (start: Date, lengthDays: number): PeriodLog => ({
  startDate: start,
  endDate: addDays(start, lengthDays - 1),
})

// Builds a history from a base start date and the cycle gaps between starts.
// e.g. periodsWithGaps(day('2026-01-01'), [28, 30]) => 3 periods.
const periodsWithGaps = (base: Date, gaps: number[]): PeriodLog[] => {
  const periods: PeriodLog[] = [period(base, 5)]
  let cursor = base
  for (const gap of gaps) {
    cursor = addDays(cursor, gap)
    periods.push(period(cursor, 5))
  }
  return periods
}

// -------------------------------------------------------------------------

describe('cycleLengths', () => {
  it('returns [28] for two periods 28 days apart', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28])
    expect(cycleLengths(periods)).toEqual([28])
  })

  it('returns [] for a single period', () => {
    expect(cycleLengths([period(day('2026-01-01'), 5)])).toEqual([])
  })

  it('returns [] for an empty history', () => {
    expect(cycleLengths([])).toEqual([])
  })

  it('returns the gap between each consecutive pair of starts', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28, 30, 32])
    expect(cycleLengths(periods)).toEqual([28, 30, 32])
  })

  it('ignores time-of-day and measures whole UTC calendar days', () => {
    // 28 calendar days apart, but with times that would floor to 27 days
    // if raw millisecond subtraction were used.
    const periods: PeriodLog[] = [
      period(new Date('2026-01-01T23:00:00.000Z'), 5),
      period(new Date('2026-01-29T01:00:00.000Z'), 5),
    ]
    expect(cycleLengths(periods)).toEqual([28])
  })

  it('sorts internally — input order does not matter', () => {
    const ordered = periodsWithGaps(day('2026-01-01'), [28, 30])
    const shuffled = [ordered[2], ordered[0], ordered[1]]
    expect(cycleLengths(shuffled)).toEqual([28, 30])
  })

  it('throws ValidationError when a period ends before it starts', () => {
    const bad: PeriodLog = {
      startDate: day('2026-01-10'),
      endDate: day('2026-01-05'),
    }
    expect(() => cycleLengths([bad])).toThrow(ValidationError)
    expect(() => cycleLengths([bad])).toThrow(
      'period endDate cannot be before startDate'
    )
  })
})

describe('averageCycleLength', () => {
  it('returns the rounded mean of the cycle lengths', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28, 30, 32])
    expect(averageCycleLength(periods)).toBe(30)
  })

  it('rounds a fractional mean to the nearest whole day', () => {
    // gaps [28, 31] => mean 29.5 => 30
    const periods = periodsWithGaps(day('2026-01-01'), [28, 31])
    expect(averageCycleLength(periods)).toBe(30)
  })

  it('is order-independent', () => {
    const ordered = periodsWithGaps(day('2026-01-01'), [28, 30, 32])
    const shuffled = [ordered[3], ordered[1], ordered[0], ordered[2]]
    expect(averageCycleLength(shuffled)).toBe(30)
  })

  it('throws InsufficientDataError for a single period', () => {
    const periods = [period(day('2026-01-01'), 5)]
    expect(() => averageCycleLength(periods)).toThrow(InsufficientDataError)
    expect(() => averageCycleLength(periods)).toThrow(
      'need at least 2 logged periods to calculate cycle length'
    )
  })
})

describe('cycleLengthStdDev', () => {
  it('returns the sample standard deviation (n−1) of the cycle lengths', () => {
    // lengths [28, 30, 32] => mean 30, variance 8/2 = 4, sd = 2
    const periods = periodsWithGaps(day('2026-01-01'), [28, 30, 32])
    expect(cycleLengthStdDev(periods)).toBe(2)
  })

  it('returns 0 when there is only one cycle length (two periods)', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28])
    expect(cycleLengthStdDev(periods)).toBe(0)
  })

  it('is order-independent', () => {
    const ordered = periodsWithGaps(day('2026-01-01'), [28, 30, 32])
    const shuffled = [ordered[2], ordered[0], ordered[3], ordered[1]]
    expect(cycleLengthStdDev(shuffled)).toBe(2)
  })

  it('throws InsufficientDataError for a single period', () => {
    const periods = [period(day('2026-01-01'), 5)]
    expect(() => cycleLengthStdDev(periods)).toThrow(InsufficientDataError)
    expect(() => cycleLengthStdDev(periods)).toThrow(
      'need at least 2 logged periods to calculate cycle length'
    )
  })
})

describe('averagePeriodLength', () => {
  it('computes each period length as endDate − startDate + 1 and rounds the mean', () => {
    // lengths 4, 5, 6 => mean 5
    const periods = [
      period(day('2026-01-01'), 4),
      period(day('2026-02-01'), 5),
      period(day('2026-03-01'), 6),
    ]
    expect(averagePeriodLength(periods)).toBe(5)
  })

  it('counts a same-day period (endDate === startDate) as length 1', () => {
    const sameDay: PeriodLog = {
      startDate: day('2026-01-01'),
      endDate: day('2026-01-01'),
    }
    expect(averagePeriodLength([sameDay])).toBe(1)
  })

  it('rounds a fractional mean', () => {
    // lengths 4, 5 => mean 4.5 => 5
    const periods = [period(day('2026-01-01'), 4), period(day('2026-02-01'), 5)]
    expect(averagePeriodLength(periods)).toBe(5)
  })

  it('is order-independent', () => {
    const periods = [
      period(day('2026-03-01'), 6),
      period(day('2026-01-01'), 4),
      period(day('2026-02-01'), 5),
    ]
    expect(averagePeriodLength(periods)).toBe(5)
  })

  it('throws InsufficientDataError for an empty history', () => {
    expect(() => averagePeriodLength([])).toThrow(InsufficientDataError)
    expect(() => averagePeriodLength([])).toThrow('need at least 1 logged period')
  })

  it('throws ValidationError when a period ends before it starts', () => {
    const bad: PeriodLog = {
      startDate: day('2026-01-10'),
      endDate: day('2026-01-05'),
    }
    expect(() => averagePeriodLength([bad])).toThrow(ValidationError)
  })
})

describe('periodLengthStdDev', () => {
  it('returns the sample standard deviation (n−1) of the period lengths', () => {
    // lengths 4, 5, 6 => mean 5, variance 2/2 = 1, sd = 1
    const periods = [
      period(day('2026-01-01'), 4),
      period(day('2026-02-01'), 5),
      period(day('2026-03-01'), 6),
    ]
    expect(periodLengthStdDev(periods)).toBe(1)
  })

  it('returns 0 for a single period', () => {
    expect(periodLengthStdDev([period(day('2026-01-01'), 5)])).toBe(0)
  })

  it('is order-independent', () => {
    const periods = [
      period(day('2026-03-01'), 6),
      period(day('2026-01-01'), 4),
      period(day('2026-02-01'), 5),
    ]
    expect(periodLengthStdDev(periods)).toBe(1)
  })

  it('throws InsufficientDataError for an empty history', () => {
    expect(() => periodLengthStdDev([])).toThrow(InsufficientDataError)
    expect(() => periodLengthStdDev([])).toThrow('need at least 1 logged period')
  })
})

describe('isIrregular', () => {
  it('returns true when the cycle-length spread exceeds the threshold', () => {
    // lengths [28, 40] => spread 12 > 7
    const periods = periodsWithGaps(day('2026-01-01'), [28, 40])
    expect(isIrregular(periods)).toBe(true)
  })

  it('returns false when the spread is well within the threshold', () => {
    // lengths [28, 30, 32] => spread 4
    const periods = periodsWithGaps(day('2026-01-01'), [28, 30, 32])
    expect(isIrregular(periods)).toBe(false)
  })

  it('returns false when the spread is exactly 7 days (strict >)', () => {
    // lengths [28, 35] => spread 7, boundary
    const periods = periodsWithGaps(day('2026-01-01'), [28, 35])
    expect(isIrregular(periods)).toBe(false)
  })

  it('is order-independent', () => {
    const ordered = periodsWithGaps(day('2026-01-01'), [28, 40])
    const shuffled = [ordered[2], ordered[0], ordered[1]]
    expect(isIrregular(shuffled)).toBe(true)
  })

  it('throws InsufficientDataError for fewer than 3 periods', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28])
    expect(() => isIrregular(periods)).toThrow(InsufficientDataError)
    expect(() => isIrregular(periods)).toThrow(
      'need at least 3 logged periods to assess regularity'
    )
  })

  it('throws ValidationError when a period ends before it starts', () => {
    const valid = periodsWithGaps(day('2026-01-01'), [28, 30])
    const bad: PeriodLog = {
      startDate: day('2026-06-10'),
      endDate: day('2026-06-05'),
    }
    expect(() => isIrregular([...valid, bad])).toThrow(ValidationError)
  })
})

describe('IRREGULAR_THRESHOLD_DAYS', () => {
  it('is 7', () => {
    expect(IRREGULAR_THRESHOLD_DAYS).toBe(7)
  })
})

describe('currentCycleDay', () => {
  it('returns 1 when today equals the most recent period start', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28])
    const mostRecentStart = day('2026-01-29')
    expect(currentCycleDay(periods, mostRecentStart)).toBe(1)
  })

  it('counts whole days since the most recent start, inclusive', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28])
    const today = day('2026-02-03') // 5 days after 2026-01-29
    expect(currentCycleDay(periods, today)).toBe(6)
  })

  it('ignores time-of-day on today', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28])
    const today = new Date('2026-01-29T23:59:00.000Z')
    expect(currentCycleDay(periods, today)).toBe(1)
  })

  it('uses the most recent start regardless of input order', () => {
    const ordered = periodsWithGaps(day('2026-01-01'), [28])
    const shuffled = [ordered[1], ordered[0]]
    expect(currentCycleDay(shuffled, day('2026-01-29'))).toBe(1)
  })

  it('throws ValidationError when today precedes the most recent start', () => {
    const periods = periodsWithGaps(day('2026-01-01'), [28])
    const before = day('2026-01-28')
    expect(() => currentCycleDay(periods, before)).toThrow(ValidationError)
    expect(() => currentCycleDay(periods, before)).toThrow(
      'date cannot be before the most recent period start'
    )
  })

  it('throws InsufficientDataError for an empty history', () => {
    expect(() => currentCycleDay([], day('2026-01-01'))).toThrow(
      InsufficientDataError
    )
    expect(() => currentCycleDay([], day('2026-01-01'))).toThrow(
      'need at least 1 logged period'
    )
  })
})
