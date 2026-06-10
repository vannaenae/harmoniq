import { test, expect } from '@playwright/test'

// Regression test for the Library "refuses to load" crash: Radix <Select.Item>
// throws "must have a value prop that is not an empty string" when given
// value="". The Library/SetListBuilder/AddCustomSong filters all pass such
// options, which white-screened the app. This drives the real Select component.

test('Select with empty-string options opens without crashing', async ({ page }) => {
  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', e => pageErrors.push(e.message))

  await page.goto('/e2e/harness.html')

  // The ErrorBoundary renders "Something went wrong" on a render crash — it must NOT appear.
  await expect(page.getByText('Select harness')).toBeVisible()
  await expect(page.getByText('Something went wrong')).toHaveCount(0)

  // Initial state: genre is the empty-string "All genres" value.
  await expect(page.getByTestId('genre-value')).toHaveText('genre=[]')

  // Open the dropdown — this is the moment Radix mounts the Items and used to throw.
  await page.getByRole('combobox', { name: 'Filter by genre' }).click()

  // Items (including the empty-string "All genres") must render.
  await expect(page.getByRole('option', { name: 'All genres' })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Contemporary' })).toBeVisible()

  // Pick a real value, then reopen and pick "All genres" (the empty-string option).
  await page.getByRole('option', { name: 'Contemporary' }).click()
  await expect(page.getByTestId('genre-value')).toHaveText('genre=[Contemporary]')

  await page.getByRole('combobox', { name: 'Filter by genre' }).click()
  await page.getByRole('option', { name: 'All genres' }).click()
  // Selecting the empty-string option returns '' to the caller (API unchanged).
  await expect(page.getByTestId('genre-value')).toHaveText('genre=[]')
  await expect(page.getByTestId('last-change')).toHaveText('change=[EMPTY]')

  // No Radix empty-string error anywhere.
  const allErrors = [...consoleErrors, ...pageErrors].join('\n')
  expect(allErrors).not.toContain('must have a value prop that is not an empty string')
  expect(pageErrors).toEqual([])
})
