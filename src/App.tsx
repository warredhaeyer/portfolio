import { useEffect, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, Check, GitFork, GraduationCap, BriefcaseBusiness, Mail, Moon, Sun } from 'lucide-react'
import { StormDragonsScene } from './components/StormDragonsScene'
import { ProjectCard } from './components/ProjectCard'
import { ContactForm } from './components/ContactForm'
import { profile, projects, toolbox } from './content'
import { useActiveSection } from './hooks/useActiveSection'
import { ScrollReveal } from './components/ScrollReveal'

type Theme = 'dark' | 'light'
const currentYear = new Date().getFullYear()

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem('portfolio-theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* Storage may be disabled. */ }
  return 'dark'
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <ScrollReveal className="section-heading" selector="h2">
      <h2>{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </ScrollReveal>
  )
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const active = useActiveSection()
  const [emailCopied, setEmailCopied] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('portfolio-theme', theme) } catch { /* Theme still works without storage. */ }
  }, [theme])

  async function copyEmail() {
    if (!profile.email) return
    try { await navigator.clipboard.writeText(profile.email); setEmailCopied(true) } catch { setEmailCopied(false) }
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="ambient-grid" aria-hidden="true" />
      <div className="page-frame">
        <header className="navigation ruled">
          <a href="#home" className="wordmark" aria-label={`${profile.name} home`}>
            <span className="wordmark-full">{profile.name}</span>
            <span className="wordmark-short">{profile.firstName}</span>
          </a>
          <nav aria-label="Main navigation">
            {[['work', 'Work'], ['about', 'About'], ['contact', 'Contact']].map(([id, label]) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined}>{label}</a>)}
          </nav>
          <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </header>

        <main id="main">
          <section id="home" className="hero ruled">
            <StormDragonsScene />
            <div className="hero-copy">
              <ScrollReveal selector="h1">
                <h1>Hi, I’m {profile.firstName}.</h1>
                <p className="hero-description">{profile.introduction}</p>
                <div className="hero-actions">
                  <a className="button primary" href="#work">Explore my work <ArrowDown size={17} /></a>
                  <a className="button secondary" href="#contact">Let’s connect <ArrowUpRight size={17} /></a>
                </div>
              </ScrollReveal>
            </div>
          </section>

          <section id="work" className="content-section ruled">
            <SectionHeading title="Selected projects" description="Personal work and future projects." />
            <div className="project-grid">
              {projects.map((project, index) => <ProjectCard key={project.id} project={project} featured={index === 0} />)}
            </div>
          </section>

          <section id="about" className="about-section ruled">
            <ScrollReveal className="about-copy" selector="h2"><h2>About me</h2><p>{profile.about}</p></ScrollReveal>
            <ScrollReveal className="journey-card" selector="h3, h4">
              <h3 className="journey-header"><GraduationCap size={21} />Education</h3>
              <div className="education-details"><h4>{profile.education.school}</h4><p>{profile.education.course}</p><span className="muted">{profile.education.detail}</span></div>
            </ScrollReveal>
          </section>

          <section id="toolbox" data-nav-section="about" className="content-section toolbox-section ruled">
            <SectionHeading title="Skills & tools" />
            <div className="toolbox-grid">
              {toolbox.map((group) => <ScrollReveal className="tool-group" selector="h3" key={group.title}><h3>{group.title}</h3><p>{group.description}</p><div className="tags">{group.items.map((item) => <span key={item}>{item}</span>)}</div></ScrollReveal>)}
            </div>
          </section>

          <section id="contact" className="contact-section ruled">
            <ScrollReveal className="contact-copy" selector="h2">
              <h2>Let’s talk.</h2><p>Have a question or an opportunity in mind? Get in touch.</p>
              <div className="contact-links" data-ascii="skip">
                {profile.email ? <button onClick={copyEmail} className="email-link">{emailCopied ? <Check size={18} /> : <Mail size={18} />}{emailCopied ? 'Email copied' : profile.email}</button> : <span className="unconfigured-link"><Mail size={18} />Email address coming soon</span>}
                <div className="flex flex-wrap gap-3">
                  {[{ title: 'GitHub', href: profile.github, Icon: GitFork }, { title: 'LinkedIn', href: profile.linkedin, Icon: BriefcaseBusiness }].map(({ title, href, Icon }) => href ? <a key={title} className="social-link" href={href} target="_blank" rel="noreferrer"><Icon size={17} />{title}<ArrowUpRight size={15} /></a> : <span key={title} className="social-link unconfigured"><Icon size={17} />{title}<span className="micro">Soon</span></span>)}
                </div>
              </div>
            </ScrollReveal>
            <ContactForm />
          </section>
        </main>

        <footer><span className="muted">© {currentYear} {profile.name}</span><a href="#home" className="footer-top">Back to top <ArrowUp size={16} /></a></footer>
      </div>
    </>
  )
}
