import { expect, test, type Page } from '@playwright/test'
import { profile } from '../src/content'

async function expectActive(page: Page, label: string | null) {
  const current = page.getByRole('navigation').locator('[aria-current="location"]')
  await expect(current).toHaveCount(label ? 1 : 0)
  if (label) await expect(current).toHaveText(label)
}

async function scrollToBoundary(page: Page, id: string, offset: number) {
  await page.evaluate(({ id, offset }) => {
    const top = document.getElementById(id)!.getBoundingClientRect().top + window.scrollY
    const anchor = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
    window.scrollTo({ top: top - anchor + offset, behavior: 'instant' })
  }, { id, offset })
}

for (const width of [390, 1440]) {
  test(`navbar clicks select the correct section at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await expectActive(page, null)
    for (const label of ['About', 'Work', 'Contact', 'About']) {
      await page.getByRole('navigation').getByRole('link', { name: label, exact: true }).click()
      await expectActive(page, label)
      // Verify the final native-anchor destination, not an intermediate smooth-scroll frame.
      const id = label.toLowerCase()
      await expect.poll(() => page.evaluate((id) => {
        const top = document.getElementById(id)!.getBoundingClientRect().top
        const anchor = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
        return Math.abs(top - anchor) <= 2 || window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      }, id)).toBe(true)
      await expectActive(page, label)
    }
  })

  test(`scroll boundaries track correctly in both directions at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 720 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    for (const [id, before, after] of [['work', null, 'Work'], ['about', 'Work', 'About']] as const) {
      await scrollToBoundary(page, id, -4)
      await expectActive(page, before)
      await scrollToBoundary(page, id, 4)
      await expectActive(page, after)
      await scrollToBoundary(page, id, -4)
      await expectActive(page, before)
    }
    await scrollToBoundary(page, 'toolbox', 30)
    await expectActive(page, 'About')
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
    await expectActive(page, 'Contact')
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expectActive(page, null)
  })
}

test('direct hash navigation and resizing keep the correct active link', async ({ page }) => {
  await page.goto('/#about')
  await expectActive(page, 'About')
  await page.setViewportSize({ width: 390, height: 844 })
  await scrollToBoundary(page, 'about', 4)
  await expectActive(page, 'About')
  await page.goto('/#contact')
  await expectActive(page, 'Contact')
})

for (const width of [360, 390, 1440]) {
  test(`navbar has a single clean wordmark without crowding at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const brand = page.locator('header .wordmark')
    await expect(brand).toHaveAccessibleName(`${profile.name} home`)
    await expect(brand).toHaveAttribute('href', '#home')
    await expect(brand).not.toContainText('wd.')
    await expect(brand.locator(width > 800 ? '.wordmark-full' : '.wordmark-short')).toBeVisible()
    await expect(brand.locator(width > 800 ? '.wordmark-short' : '.wordmark-full')).toBeHidden()
    const bounds = await page.evaluate(() => ({
      brand: document.querySelector('header .wordmark')!.getBoundingClientRect().right,
      navLeft: document.querySelector('header nav')!.getBoundingClientRect().left,
      navRight: document.querySelector('header nav')!.getBoundingClientRect().right,
      theme: document.querySelector('header .icon-button')!.getBoundingClientRect().left,
    }))
    expect(bounds.brand).toBeLessThanOrEqual(bounds.navLeft)
    expect(bounds.navRight).toBeLessThanOrEqual(bounds.theme)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}
