import { expect, test } from '@playwright/test'
import { profile } from '../src/content'

test('renders truthful content, working navigation, and no browser errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hi, I’m Warre.')
  await expect(page.getByText('Hi, I’m Warre.', { exact: true })).toHaveCount(1)
  await expect(page.getByText('Learning by doing.', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Building with purpose.', { exact: true })).toHaveCount(0)
  await expect(page.getByText('CURIOUS MIND. WORK IN PROGRESS.')).toHaveCount(0)
  await expect(page.getByText('Student today. Builder always.')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /pause.*animation|play.*animation|replay.*reveal|reduced motion/i })).toHaveCount(0)
  await expect(page.locator('.scene-toggle, .replay-button')).toHaveCount(0)
  await expect(page.locator('.project-card')).toHaveCount(3)
  await expect(page.locator('.project-status', { hasText: 'Placeholder' })).toHaveCount(2)
  await expect(page.getByRole('link', { name: 'Download', exact: false })).toHaveCount(0)
  await expect(page.locator('a[download], .cv-row')).toHaveCount(0)
  await expect(page.getByText(/curriculum vitae|downloadable CV/i)).toHaveCount(0)
  await page.getByRole('link', { name: 'Explore my work' }).click()
  await expect(page).toHaveURL(/#work$/)
  expect(errors).toEqual([])
})

test('skills and tools show confirmed experience rather than site-stack placeholders', async ({ page }) => {
  await page.goto('/')
  const groups = page.locator('#toolbox .tool-group')
  await expect(groups).toHaveCount(2)
  await expect(groups.nth(0).getByRole('heading')).toHaveText('Technologies')
  await expect(groups.nth(0).locator('.tags > span')).toHaveText(['React', 'Java', 'Python', 'MySQL'])
  await expect(groups.nth(1).getByRole('heading')).toHaveText('Tools')
  await expect(groups.nth(1).locator('.tags > span')).toHaveText(['Git', 'GitHub', 'Postman', 'Docker', 'Figma'])
  await expect(page.locator('#toolbox')).not.toContainText('Placeholder')
  await expect(page.locator('#toolbox')).not.toContainText('This website')
})

test('theme switches and persists on reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('contact validates fields and prepares an honest draft without network delivery', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/#contact')
  const form = page.locator('form')
  await form.getByRole('button', { name: 'Prepare message' }).click()
  await expect(form.getByRole('status')).toHaveCount(0)
  await form.getByLabel('Your name').fill('Alex Test')
  await form.getByLabel('Email address').fill('alex@example.com')
  await form.getByLabel('What’s on your mind?').fill('Hello, let’s talk about your portfolio.')
  await form.getByRole('button', { name: 'Prepare message' }).click()
  await expect(form.getByRole('status')).toContainText(profile.email ? 'Your email app will open with a draft. Nothing has been sent from this website.' : 'Email delivery isn’t connected yet')
  await expect(form.getByRole('textbox', { name: 'Your email draft', exact: true })).toHaveValue(/Alex Test/)
  await form.getByRole('button', { name: 'Copy draft' }).click()
  await expect(form.getByRole('status')).toContainText('Draft copied. Nothing has been sent.')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('alex@example.com')
})

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`no horizontal overflow at ${width}px, including reduced-motion mode`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await expect(page.locator('.storm-dragon-scene')).toBeVisible()
    for (const selector of ['.hero-description', '.project-body > p', '.about-copy > p', 'input', 'textarea']) {
      expect(await page.locator(selector).first().evaluate((element) => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16)
    }
  })
}

test('decorative storm dragons animate automatically and respect live reduced motion', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const canvas = page.locator('.storm-dragon-scene')
  const initial = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())
  await expect.poll(() => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).not.toBe(initial)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(canvas).toHaveAttribute('data-motion', 'reduced')
  const still = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())
  await page.getByRole('heading', { level: 1 }).hover()
  expect(await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).toBe(still)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(canvas).toHaveAttribute('data-motion', 'active')
  await expect.poll(() => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).not.toBe(still)
})

test('project images load and reveal automatically without demo controls', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/#work')
  const images = page.locator('.project-media img')
  await expect(images).toHaveCount(3)
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true)
  }
  await expect(page.getByRole('button', { name: /replay/i })).toHaveCount(0)
  expect(errors).toEqual([])
})
