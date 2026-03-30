#!/usr/bin/env node
/* eslint-disable no-console */
// Reads test-results/results.json and writes a human-readable summary
// to test-results/summary.txt for Claude to read after test runs.

import { readFileSync, writeFileSync, existsSync } from 'fs'

const resultsPath = 'test-results/results.json'
const summaryPath = 'test-results/summary.txt'

if (!existsSync(resultsPath)) {
  console.error('No results.json found. Run npm test first.')
  process.exit(1)
}

type AssertionResult = {
  status: 'passed' | 'failed' | 'skipped' | 'pending'
  fullName: string
  title: string
  ancestorTitles: string[]
  duration: number
  failureMessages: string[]
}

type TestSuite = {
  name: string
  status: 'passed' | 'failed'
  message: string
  assertionResults: AssertionResult[]
}

type Results = {
  numTotalTests: number
  numPassedTests: number
  numFailedTests: number
  numPendingTests: number
  success: boolean
  testResults: TestSuite[]
}

const raw = readFileSync(resultsPath, 'utf-8')
const results: Results = JSON.parse(raw)

const lines: string[] = []
const timestamp = new Date().toISOString()

lines.push(`Test Run Summary — ${timestamp}`)
lines.push('='.repeat(60))
lines.push('')

// Overall status
const { numTotalTests, numPassedTests, numFailedTests, numPendingTests } = results
const status = results.success ? '✅ PASSED' : '❌ FAILED'
lines.push(`Status: ${status}`)
lines.push(
  `Total: ${numTotalTests} | Passed: ${numPassedTests} | Failed: ${numFailedTests} | Pending: ${numPendingTests}`
)
lines.push('')

// Failed tests — full detail
if (numFailedTests > 0) {
  lines.push('FAILED TESTS')
  lines.push('-'.repeat(40))
  for (const suite of results.testResults) {
    const failed = suite.assertionResults.filter((t) => t.status === 'failed')
    if (failed.length === 0) continue
    lines.push(`\nSuite: ${suite.name}`)
    for (const test of failed) {
      lines.push(`  ✗ ${test.fullName}`)
      if (test.failureMessages.length > 0) {
        for (const msg of test.failureMessages) {
          // First 10 lines of each failure message
          const msgLines = msg.split('\n').slice(0, 10).join('\n    ')
          lines.push(`    ${msgLines}`)
        }
      }
    }
  }
  lines.push('')
}

// Suite summary
lines.push('TEST SUITES')
lines.push('-'.repeat(40))
for (const suite of results.testResults) {
  const suiteStatus = suite.status === 'passed' ? '✅' : '❌'
  const passed = suite.assertionResults.filter((t) => t.status === 'passed').length
  const total = suite.assertionResults.length
  // Show just the filename not the full path
  const suiteName = suite.name.split('/').pop() ?? suite.name
  lines.push(`${suiteStatus} ${suiteName} (${passed}/${total})`)
}
lines.push('')

lines.push('='.repeat(60))
lines.push('Coverage: run npm run test:coverage for a full coverage report.')

const summary = lines.join('\n')
writeFileSync(summaryPath, summary, 'utf-8')
console.log(summary)
