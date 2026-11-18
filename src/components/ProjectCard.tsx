import { useState } from 'react'
import { AsciiSkeleton } from 'ascii-reveal'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../content'
import { ScrollReveal } from './ScrollReveal'

export function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  return (
    <article className={`project-card ${featured ? 'featured-project' : ''}`}>
      <div className="project-media">
        <ScrollReveal className="project-image-reveal" preset={featured ? 'decode' : 'dither'} duration="cinematic" speed={1.3} ready={loaded}>
          {!loaded && !failed && <div className="image-skeleton" aria-hidden="true"><AsciiSkeleton rows={12} width="100%" height="100%" variant="dither" /></div>}
          {failed ? <div className="image-fallback" data-ascii="skip">Preview unavailable</div> : <img src={project.image.src} alt={project.image.alt} width={1000} height={700} loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />}
        </ScrollReveal>
      </div>
      <ScrollReveal className="project-body" selector="h3">
        <div className="project-meta">{project.category}</div>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {project.tags.length > 0 && <div className="tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
        <div className="project-footer">
          <span className={`project-status ${project.status !== 'Placeholder' ? 'current' : ''}`}>{project.status}</span>
          {project.href && <a href={project.href} target="_blank" rel="noreferrer" className="project-link">View project <ArrowUpRight size={18} /></a>}
        </div>
      </ScrollReveal>
    </article>
  )
}
