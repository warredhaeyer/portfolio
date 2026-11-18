import { useEffect, useState } from 'react'

export function useActiveSection() {
  const [active, setActive] = useState('home')

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
    const navigation = document.querySelector<HTMLElement>('.navigation')
    let frame = 0

    function update() {
      frame = 0
      // Match native anchor placement, rather than comparing differently sized
      // sections' intersection ratios. Include the sticky header's actual size.
      const anchorOffset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
      const boundary = Math.max(navigation?.getBoundingClientRect().bottom ?? 0, anchorOffset) + 1
      let current = 'home'
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= boundary) {
          current = section.dataset.navSection ?? section.id
        }
      }

      // The last section may be too short to reach the activation line.
      const page = document.documentElement
      if (page.scrollHeight > window.innerHeight && window.scrollY + window.innerHeight >= page.scrollHeight - 2) {
        const last = sections.at(-1)
        if (last) current = last.dataset.navSection ?? last.id
      }
      setActive(current)
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    const observer = new ResizeObserver(scheduleUpdate)
    sections.forEach((section) => observer.observe(section))
    if (navigation) observer.observe(navigation)
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    window.addEventListener('hashchange', scheduleUpdate)
    window.addEventListener('pageshow', scheduleUpdate)
    update()

    // On a direct /#about load the browser can resolve the fragment before
    // React has mounted that target. Complete that initial anchor navigation.
    const initialTarget = sections.find((section) => `#${section.id}` === window.location.hash)
    const initialFrame = initialTarget ? requestAnimationFrame(() => {
      initialTarget.scrollIntoView({ block: 'start', behavior: 'instant' })
      scheduleUpdate()
    }) : 0

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(initialFrame)
      observer.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('hashchange', scheduleUpdate)
      window.removeEventListener('pageshow', scheduleUpdate)
    }
  }, [])

  return active
}
