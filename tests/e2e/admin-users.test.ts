import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

test.describe('Admin Users page', () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto('/dashboard/admin/users')
  })

  test('renders heading and table column headers', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()

    const columnHeaders = ['Email', 'Plan', 'Status', 'Joined', 'Actions']
    for (const header of columnHeaders) {
      await expect(
        page.getByRole('columnheader', { name: header })
      ).toBeVisible()
    }
  })

  test('renders user rows or empty state', async ({ page }) => {
    const rows = page.locator('tbody tr')
    const emptyState = page.getByText('No users yet.')

    const hasRows = await rows.count().then((count) => count > 0)

    if (hasRows) {
      await expect(rows.first()).toBeVisible()
    } else {
      await expect(emptyState).toBeVisible()
    }
  })

  test('email search input is present and accepts text', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by email...')
    await expect(searchInput).toBeVisible()
    await searchInput.fill('test@example.com')
    await expect(searchInput).toHaveValue('test@example.com')
  })

  test('status filter dropdown is present and can be changed', async ({ page }) => {
    const select = page.locator('select')
    await expect(select).toBeVisible()
    await expect(select).toHaveValue('All')
    await select.selectOption('Active')
    await expect(select).toHaveValue('Active')
  })

  test('user rows have Clerk link with target="_blank"', async ({ page }) => {
    const rows = page.locator('tbody tr')
    const hasRows = await rows.count().then((count) => count > 0)

    if (hasRows) {
      const firstRow = rows.first()
      const clerkLink = firstRow.getByRole('link', { name: 'Clerk' })
      await expect(clerkLink).toBeVisible()
      await expect(clerkLink).toHaveAttribute('target', '_blank')
    }
  })
})
