import { expect, test, type Locator, type Page } from '@playwright/test'

async function scrollTo(page: Page, selector: string) {
  await page.locator(selector).evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
}

async function waitForCooldown(root: Locator) {
  await expect.poll(() => root.evaluate((element) => performance.now() - Number((element as HTMLElement).dataset.revealStartedAt))).toBeGreaterThanOrEqual(1200)
}

for (const width of [390, 1440]) {
  for (const [label, selector] of [
    ['heading', '#work .section-heading'],
    ['image', '.featured-project .project-image-reveal'],
  ]) {
    test(`${label} reveals on downward and upward re-entry at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 })
      await page.goto('/')
      const root = page.locator(selector)
      await scrollTo(page, selector)
      await expect(root).toHaveAttribute('data-reveal-count', '1')
      await expect(root).toHaveAttribute('data-reveal-state', 'visible')
      await scrollTo(page, 'footer')
      await expect(root).toHaveAttribute('data-reveal-state', 'waiting')
      await waitForCooldown(root)
      await scrollTo(page, selector)
      await expect(root).toHaveAttribute('data-reveal-count', '2')
      await expect(root).toHaveAttribute('data-reveal-state', 'visible')
      await scrollTo(page, '#home')
      await expect(root).toHaveAttribute('data-reveal-state', 'waiting')
      await waitForCooldown(root)
      await scrollTo(page, selector)
      await expect(root).toHaveAttribute('data-reveal-count', '3')
      await expect(root).toHaveAttribute('data-reveal-state', 'visible')
    })
  }
}

test('partial exits do not rearm and rapid full re-entry shows content without replaying', async ({ page }) => {
  await page.goto('/')
  const selector = '#work .section-heading'
  const root = page.locator(selector)
  await scrollTo(page, selector)
  await expect(root).toHaveAttribute('data-reveal-state', 'visible')
  await waitForCooldown(root)
  const count = await root.getAttribute('data-reveal-count')
  // Keep 10px of the heading inside the real viewport, outside the trigger zone.
  await root.evaluate((element) => window.scrollTo({ top: element.getBoundingClientRect().top + scrollY - innerHeight + 10, behavior: 'instant' }))
  await expect.poll(() => root.evaluate((element) => element.getBoundingClientRect().top)).toBeGreaterThan(500)
  await scrollTo(page, selector)
  await expect(root).toHaveAttribute('data-reveal-count', count!)

  // A new reveal can happen after full exit; then an immediate round trip
  // must not start yet another decode or leave the title blank for a cooldown.
  await scrollTo(page, 'footer')
  await expect(root).toHaveAttribute('data-reveal-state', 'waiting')
  await scrollTo(page, selector)
  await expect(root).toHaveAttribute('data-reveal-count', String(Number(count) + 1))
  await scrollTo(page, 'footer')
  await expect(root).toHaveAttribute('data-reveal-state', 'waiting')
  await scrollTo(page, selector)
  await expect(root).toHaveAttribute('data-reveal-state', 'visible')
  await expect(root).toHaveAttribute('data-reveal-count', String(Number(count) + 1))
  await expect(root.locator('h2[data-ar-t]')).toHaveCount(0)
})

test('paragraphs and contact form stay unchanged during re-entry', async ({ page }) => {
  await page.goto('/#contact')
  const name = page.getByLabel('Your name')
  const message = page.getByLabel('What’s on your mind?')
  await name.fill('Warre Test')
  await message.fill('Keep this draft while I explore the page.')
  await expect(page.locator('form [data-scroll-reveal]')).toHaveCount(0)
  expect(await page.locator('form').evaluate((element) => !!element.closest('[data-scroll-reveal]'))).toBe(false)
  await scrollTo(page, '#home')
  await scrollTo(page, '#contact .contact-form')
  await expect(name).toHaveValue('Warre Test')
  await expect(message).toHaveValue('Keep this draft while I explore the page.')
  await scrollTo(page, '#about .about-copy')
  const paragraph = page.locator('#about .about-copy > p')
  await expect(paragraph).toHaveCSS('opacity', '1')
  expect(await paragraph.evaluate((element) => element.hasAttribute('data-ar-t') || element.hasAttribute('data-ar-f') || element.hasAttribute('data-ar-s'))).toBe(false)
  expect(await paragraph.evaluate((element) => element.parentElement!.getAnimations().length)).toBe(0)
})

test('reduced motion never hides content or replays decodes, including live preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const root = page.locator('#work .section-heading')
  await scrollTo(page, '#work .section-heading')
  await expect(root).toHaveAttribute('data-reveal-state', 'reduced')
  await expect(root).toHaveAttribute('data-reveal-count', '0')
  await scrollTo(page, 'footer')
  await scrollTo(page, '#work .section-heading')
  await expect(root).toHaveAttribute('data-reveal-count', '0')
  await expect(page.locator('[data-scroll-reveal] [data-ar-t], [data-scroll-reveal] [data-ar-m]')).toHaveCount(0)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(root).toHaveAttribute('data-reveal-count', '1')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(root).toHaveAttribute('data-reveal-state', 'reduced')
  await expect(root.locator('h2')).toHaveCSS('-webkit-text-fill-color', 'rgb(237, 237, 239)')
})

test('a failed project image shows its fallback instead of getting stuck hidden', async ({ page }) => {
  await page.route('**/images/portfolio-preview.jpg', (route) => route.abort())
  await page.goto('/')
  await scrollTo(page, '.featured-project')
  await expect(page.locator('.featured-project .image-fallback')).toBeVisible()
  await expect(page.locator('.featured-project .image-skeleton')).toHaveCount(0)
  await expect(page.locator('.featured-project .project-image-reveal')).toHaveAttribute('data-reveal-count', '0')
})
