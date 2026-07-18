"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Send, Loader2, MessageCircle, Instagram, Facebook, AtSign, Hash, ExternalLink, Link2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { BackButton } from "@/components/shared/back-button"
import { useAuth } from "@/lib/auth/AuthProvider"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

interface SocialLink {
  name: string
  url: string
  icon: string
  is_visible: boolean
}

const socialIcons: Record<string, React.ComponentType<any>> = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Hash,
  x: Hash,
  tiktok: AtSign,
}

const socialColors: Record<string, string> = {
  whatsapp: "text-[#25D366] hover:bg-[#25D366]/10",
  instagram: "text-[#E4405F] hover:bg-[#E4405F]/10",
  facebook: "text-[#1877F2] hover:bg-[#1877F2]/10",
  twitter: "text-[#1DA1F2] hover:bg-[#1DA1F2]/10",
  x: "text-white hover:bg-white/10",
  tiktok: "text-[#FF004F] hover:bg-[#FF004F]/10",
}

export default function ContactPage() {
  const { profile, user } = useAuth()
  const [name, setName] = useState(profile?.full_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [subject, setSubject] = useState("")

  useEffect(() => {
    if (profile?.full_name) setName(profile.full_name)
    if (user?.email) setEmail(user.email)
  }, [profile, user])
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        const raw = data.social_links
        if (Array.isArray(raw)) {
          setSocialLinks(raw.filter((l: SocialLink) => l.is_visible !== false))
        } else if (typeof raw === "string") {
          try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) setSocialLinks(parsed.filter((l: SocialLink) => l.is_visible !== false))
          } catch { /* ignore */ }
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    setSending(true)
    setFormError("")
    const { error } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || null,
      message: message.trim(),
      user_id: profile?.user_id || null,
    })
    setSending(false)
    if (error) {
      setFormError(error.message || "Failed to send message. Please try again.")
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <PublicHeader />
        <div className="pt-20 sm:pt-24 pb-10 sm:pb-16 px-3 sm:px-4 flex items-start justify-center">
          <div className="glass-card rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
            <div className="mb-4">
              <BackButton fallback="/" />
            </div>
            <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary-light mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Message Sent!</h2>
            <p className="text-xs sm:text-sm text-muted mb-4 sm:mb-6">We'll get back to you within 24 hours.</p>
            <button onClick={() => setSent(false)} className="text-xs sm:text-sm text-primary-light hover:underline">Send another</button>
          </div>
        </div>
        <PublicFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicHeader />
      <div className="pt-10 sm:pt-12 pb-10 sm:pb-16 px-3 sm:px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <BackButton fallback="/" />
        </div>
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-2 sm:mb-3">Contact Us</h1>
          <p className="text-muted text-sm sm:text-base">Have a question or need help? Send us a message.</p>
        </div>
        <form onSubmit={handleSubmit} className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 space-y-3 sm:space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-[10px] sm:text-xs font-medium mb-1 sm:mb-1.5 block">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-2.5 sm:px-3 py-2 bg-black/40 border border-muted/20 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-primary-light/40" />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-medium mb-1 sm:mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-2.5 sm:px-3 py-2 bg-black/40 border border-muted/20 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-primary-light/40" />
            </div>
          </div>
          <div>
            <label className="text-[10px] sm:text-xs font-medium mb-1 sm:mb-1.5 block">Subject (optional)</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-2.5 sm:px-3 py-2 bg-black/40 border border-muted/20 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-primary-light/40" />
          </div>
          <div>
            <label className="text-[10px] sm:text-xs font-medium mb-1 sm:mb-1.5 block">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="w-full px-2.5 sm:px-3 py-2 bg-black/40 border border-muted/20 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-primary-light/40 resize-none" />
          </div>
          <button type="submit" disabled={sending} className="w-full py-2.5 rounded-lg bg-primary-light text-black font-semibold text-xs sm:text-sm hover:bg-primary-light/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-3 h-3 sm:w-4 sm:h-4" /> Send Message</>}
          </button>
        </form>

        {socialLinks.length > 0 && (
          <div className="mt-8">
            <div className="text-center mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Connect With Us</h2>
              <p className="text-muted text-xs sm:text-sm">Reach out on social media</p>
            </div>
            <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6">
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                {socialLinks.map((link) => {
                  const Icon = socialIcons[link.icon] || Link2
                  const colorClass = socialColors[link.icon] || "text-muted hover:bg-muted/10"
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-muted/20 bg-black/30 transition-all ${colorClass}`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs sm:text-sm font-medium">{link.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
      <PublicFooter />
    </div>
  )
}
