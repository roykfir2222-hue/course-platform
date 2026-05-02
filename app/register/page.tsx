'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Terminal,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  MailCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type FormData = {
  name: string
  phone: string
  email: string
  password: string
}

type FieldErrors = Partial<Record<keyof FormData, string>>

function validateForm(data: FormData): FieldErrors {
  const errors: FieldErrors = {}
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'Enter your full name.'
  }
  if (!data.phone.trim() || !/^\+?[\d\s\-()]{7,}$/.test(data.phone)) {
    errors.phone = 'Enter a valid phone number.'
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address.'
  }
  if (!data.password || data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }
  return errors
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ name: '', phone: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // ── Listen for email confirmation in any open tab ──────────────────────────
  // When the user clicks the confirmation link, Supabase exchanges the code
  // server-side (/api/auth/callback) and stores the session. The browser
  // client then fires SIGNED_IN on all tabs of the same origin — including
  // this waiting tab — so we can redirect automatically without a page refresh.
  useEffect(() => {
    const supabase = createClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/dashboard')
        router.refresh()
      }
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    setServerError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setServerError('')

    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

    // 1. Create the auth user.
    // emailRedirectTo points to the auth callback route which exchanges the
    // confirmation code for a session, then redirects to /dashboard.
    // The session creation fires SIGNED_IN on this tab via onAuthStateChange.
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        data: { name: form.name.trim() },
        emailRedirectTo: `${siteUrl}/api/auth/callback?next=/dashboard`,
      },
    })

    if (signUpError) {
      setServerError(signUpError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setServerError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // 2. Upsert the profile row with full details.
    // The DB trigger may have already created a bare row — this fills in name/phone.
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: authData.user.id,
        email: form.email.trim().toLowerCase(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        has_access: false,
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      console.error('Profile upsert error:', profileError.message)
    }

    // 3. Show the confirmation message — onAuthStateChange handles the redirect.
    setLoading(false)
    setEmailSent(true)
  }

  // ── Email-sent confirmation view ───────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(124,58,237,0.12),transparent)] pointer-events-none" />

        <div
          className="relative w-full max-w-md"
          style={{ animation: 'scaleIn 0.4s cubic-bezier(0.23,1,0.32,1) forwards' }}
        >
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">
                Masterclass
              </span>
            </Link>
          </div>

          <div className="glass-card rounded-2xl p-10 text-center">
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6"
              style={{ animation: 'scaleIn 0.5s cubic-bezier(0.23,1,0.32,1) 0.1s forwards', opacity: 0 }}
            >
              <MailCheck className="w-8 h-8 text-violet-400" />
            </div>

            {/* Hebrew confirmation message */}
            <p
              className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3"
              style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.2s forwards', opacity: 0 }}
            >
              כמעט סיימנו
            </p>
            <h2
              className="text-xl font-bold text-white mb-3 leading-relaxed"
              dir="rtl"
              style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.25s forwards', opacity: 0 }}
            >
              נשלח אליך מייל אישור.
              <br />
              אנא אשר אותו כדי להמשיך.
            </h2>
            <p
              className="text-zinc-500 text-sm mb-8"
              style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.3s forwards', opacity: 0 }}
            >
              Sent to{' '}
              <span className="text-zinc-300 font-medium">{form.email}</span>
              <br />
              Check your spam folder if it doesn't arrive.
            </p>

            {/* Auto-redirect indicator */}
            <div
              className="flex items-center justify-center gap-2 text-sm text-zinc-500"
              style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.35s forwards', opacity: 0 }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
              Waiting for confirmation… will redirect automatically
            </div>

            <p
              className="text-xs text-zinc-700 mt-6"
              style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.4s forwards', opacity: 0 }}
            >
              Already confirmed?{' '}
              <Link href="/login" className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form view ─────────────────────────────��───────────────────
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(124,58,237,0.12),transparent)] pointer-events-none" />

      <div
        className="relative w-full max-w-md"
        style={{ animation: 'scaleIn 0.4s cubic-bezier(0.23,1,0.32,1) forwards' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">
              Masterclass
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-zinc-400 text-sm">Join the course and start learning today</p>
          </div>

          {serverError && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jordan Rivera"
                value={form.name}
                onChange={handleChange}
                className={`input-field ${fieldErrors.name ? 'border-red-500/60 focus:border-red-500' : ''}`}
              />
              {fieldErrors.name && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-zinc-300 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange}
                className={`input-field ${fieldErrors.phone ? 'border-red-500/60 focus:border-red-500' : ''}`}
              />
              {fieldErrors.phone && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className={`input-field ${fieldErrors.email ? 'border-red-500/60 focus:border-red-500' : ''}`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                  className={`input-field pr-11 ${fieldErrors.password ? 'border-red-500/60 focus:border-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-150 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          By registering you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}
