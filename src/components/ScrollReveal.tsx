import { useLayoutEffect, useRef, type HTMLAttributes } from 'react'
import { createAsciiReveal, type Duration, type Origin, type PresetName } from 'ascii-reveal'

interface ScrollRevealProps extends HTMLAttributes<HTMLDivElement> {
  preset?: PresetName
  duration?: Duration
  speed?: number
  selector?: string
  origin?: Origin
  ready?: boolean
}

const ENTRY_THRESHOLD = .25
const COOLDOWN_MS = 1200

// Two observers deliberately separate "enough visible to reveal" from
// "completely offscreen to rearm". Crossing one threshold cannot cause flicker.
export function ScrollReveal(
  { preset = 'decode', duration = 'fast', speed = 1, selector, origin, ready = true, children, style, ...rest }: ScrollRevealProps,
) {
  const rootRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const options = { preset, duration, speed, selector, lazy: false }
    let controller = createAsciiReveal(root, options)
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false, armed = true, eligible = false
    let running: Promise<void> | null = null
    let generation = 0, count = 0, lastStart = -Infinity
    let lastExit: 'above' | 'below' = 'below'
    let entryObserver: IntersectionObserver | undefined
    root.dataset.revealCount = '0'

    function state(value: string) { root!.dataset.revealState = value }
    function restore() {
      // destroy() releases hidden text/media and outstanding canvases immediately.
      // Unlike a reduced-motion reveal, this never fades an entire paragraph block.
      generation++
      controller.destroy()
      controller = createAsciiReveal(root!, options)
      running = null
    }

    function reveal(): Promise<void> {
      if (disposed || !ready || motion.matches) return Promise.resolve()
      if (running) return running
      if (!armed || !eligible) return Promise.resolve()
      armed = false
      // Rapid re-entry or keyboard focus should show content, not queue a blank
      // loading state or interrupt an interaction. Re-arm on the next full exit.
      if (performance.now() - lastStart < COOLDOWN_MS || root!.contains(document.activeElement)) {
        restore()
        state('visible')
        return Promise.resolve()
      }
      lastStart = performance.now()
      root!.dataset.revealStartedAt = String(lastStart)
      const token = ++generation
      const rect = root!.getBoundingClientRect()
      const edge = lastExit === 'above' ? Math.min(rect.bottom, innerHeight) : Math.max(rect.top, 80)
      state('revealing')
      root!.dataset.revealCount = String(++count)
      void controller.hide({ instant: true })
      // Scope each heading separately: the library's slow-device fade must not
      // fade the wrapper's paragraphs or controls along with the selected text.
      const targets = selector ? Array.from(root!.querySelectorAll(selector)) : [root!]
      const promise = Promise.all(targets.map((target) => controller.reveal({ within: target, origin: origin ?? { x: rect.left + rect.width / 2, y: edge } })))
        .then(() => {})
        .catch(() => {
          if (!disposed && token === generation) { restore(); state('visible') }
        })
        .finally(() => {
          if (!disposed && token === generation) {
            running = null
            state('visible')
          }
        })
      running = promise
      return promise
    }

    function checkPosition() {
      const rect = root!.getBoundingClientRect()
      const header = document.querySelector('.navigation')?.getBoundingClientRect().bottom ?? 80
      const visible = Math.max(0, Math.min(rect.bottom, innerHeight * .95) - Math.max(rect.top, header))
      eligible = rect.height > 0 && visible / rect.height >= ENTRY_THRESHOLD
      if (rect.bottom <= 0 || rect.top >= innerHeight) {
        lastExit = rect.bottom <= 0 ? 'above' : 'below'
      }
    }

    function observeEntry() {
      entryObserver?.disconnect()
      const header = Math.ceil(document.querySelector('.navigation')?.getBoundingClientRect().height ?? 80)
      entryObserver = new IntersectionObserver(([entry]) => {
        eligible = entry.isIntersecting && entry.intersectionRatio >= ENTRY_THRESHOLD
        if (eligible) void reveal()
      }, { rootMargin: `-${header}px 0px -5% 0px`, threshold: [0, ENTRY_THRESHOLD] })
      entryObserver.observe(root!)
    }

    if (!('IntersectionObserver' in window)) {
      state('visible')
      return () => { disposed = true; controller.destroy() }
    }

    const exitObserver = new IntersectionObserver(([entry]) => {
      const rect = entry.boundingClientRect
      if (entry.isIntersecting && rect.bottom > 0 && rect.top < innerHeight) return
      lastExit = rect.bottom <= 0 ? 'above' : 'below'
      eligible = false
      armed = true
      if (ready && !motion.matches) {
        if (running) restore()
        void controller.hide({ instant: true })
        state('waiting')
      }
    }, { threshold: 0 })

    const onMotionChange = () => {
      restore()
      armed = true
      checkPosition()
      if (motion.matches) state('reduced')
      else if (ready) {
        void controller.hide({ instant: true })
        state('waiting')
        if (eligible) void reveal()
      }
    }
    const onResize = () => {
      observeEntry()
      checkPosition()
      if (eligible) void reveal()
    }

    checkPosition()
    if (motion.matches) state('reduced')
    else if (!ready) state('not-ready')
    else {
      void controller.hide({ instant: true })
      state('waiting')
      if (eligible) void reveal()
    }
    observeEntry()
    exitObserver.observe(root)
    motion.addEventListener('change', onMotionChange)
    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      generation++
      entryObserver?.disconnect()
      exitObserver.disconnect()
      motion.removeEventListener('change', onMotionChange)
      window.removeEventListener('resize', onResize)
      controller.destroy()
    }
  }, [preset, duration, speed, selector, origin, ready])

  return <div {...rest} ref={rootRef} data-scroll-reveal="" style={{ position: 'relative', ...style }}>{children}</div>
}
