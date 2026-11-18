import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { profile } from '../content'

export function ContactForm() {
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const draft = `Hi Warre,\n\n${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`
    setMessage(draft)
    setCopied(false)
    if (!profile.email) {
      setFeedback('Email delivery isn’t connected yet. Your draft is ready below; you can copy it and keep it for later.')
      return
    }
    const subject = encodeURIComponent(`Portfolio inquiry from ${data.get('name')}`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${encodeURIComponent(draft)}`
    setFeedback('Your email app will open with a draft. Nothing has been sent from this website.')
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setFeedback('Draft copied. Nothing has been sent.')
    } catch {
      setFeedback('Copy isn’t available in this browser. Select and copy the draft below instead.')
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>Your name<input name="name" autoComplete="name" placeholder="Alex Smith" required maxLength={100} /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" placeholder="alex@example.com" required maxLength={200} /></label>
      </div>
      <label>What’s on your mind?<textarea name="message" rows={4} placeholder="An opportunity, a question, or just a hello…" required maxLength={3000} /></label>
      <div className="form-bottom"><span className="micro muted">{profile.email ? 'Opens your email app. No data stored.' : 'Preview mode · delivery not connected'}</span><button className="button primary" type="submit">Prepare message <ArrowUpRight size={15} /></button></div>
      {feedback && <div className="form-feedback" role="status"><p>{feedback}</p>{message && <><label className="mt-3">Your email draft<textarea aria-label="Your email draft" readOnly value={message} rows={7} /></label><button className="button secondary mt-3" type="button" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? 'Copied' : 'Copy draft'}</button></>}</div>}
    </form>
  )
}
