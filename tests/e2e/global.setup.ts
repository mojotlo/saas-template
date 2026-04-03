import { clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright'
import { test as setup } from '@playwright/test'

setup('authenticate as admin', async ({ page }) => {
  await clerkSetup()
  await setupClerkTestingToken({ page })

  await page.goto('/sign-in')

  await page.getByLabel('Email address or username').fill(
    process.env.E2E_CLERK_USER_USERNAME!
  )
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.getByLabel('Password').fill(
    process.env.E2E_CLERK_USER_PASSWORD!
  )
  await page.getByRole('button', { name: 'Continue' }).click()

  await page.waitForURL('/dashboard')

  await page.context().storageState({ path: 'playwright/.clerk/user.json' })
})
