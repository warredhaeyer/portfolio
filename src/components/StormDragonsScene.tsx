import { useEffect, useRef } from 'react'
import { createStormDragons } from '../vendor/storm-dragons'

export function StormDragonsScene() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const element = canvas.current
    if (!element?.parentElement) return
    const scene = createStormDragons(element, {
      count: 3, size: 1, speed: .7, glow: .65, cell: 6,
      colorful: true, grid: true, clouds: true, fire: true,
      gusts: true, twins: false, avoid: true, cursor: true,
      stage: element.parentElement,
    })
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => {
      scene.setPaused(motion.matches)
      element.dataset.motion = motion.matches ? 'reduced' : 'active'
    }
    updateMotion()
    motion.addEventListener('change', updateMotion)
    return () => {
      motion.removeEventListener('change', updateMotion)
      scene.destroy()
    }
  }, [])

  return <canvas ref={canvas} className="storm-dragon-scene" aria-hidden="true" />
}
