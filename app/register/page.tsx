'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Terminal,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
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

const OTP_LENGTH = 6

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ name: '', phone: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null))

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }, [step])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    setServerError('')
  }

  function handleOtpChange(index: number, value: string) {
    // Handle paste of full code
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
      const newDigits = [...otpDigits]
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) newDigits[index + i] = d
      })
      setOtpDigits(newDigits)
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1)
      otpRefs.current[nextIndex]?.focus()
      return
    }

    const digit = value.replace(/\D/g, '')
    const newDigits = [...otpDigits]
    newDigits[index] = digit
    setOtpDigits(newDigits)
    setOtpError('')

    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
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

    // Create the auth user — Supabase will email the 6-digit OTP code
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: {
        data: { name: form.name.trim() },
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

    // Upsert the profile row — DB trigger may have created a bare row already
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

    setLoading(false)
    setStep('otp')
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()

    const token = otpDigits.join('')
    if (token.length < OTP_LENGTH) {
      setOtpError('Please enter all 6 digits.')
      return
    }

    setOtpLoading(true)
    setOtpError('')

    const supabase = createClient()
    const { error } = await supabase.auth.verifyOtp({
      email: form.email.trim().toLowerCase(),
      token,
      type: 'signup',
    })

    if (error) {
      setOtpError(error.message)
      setOtpLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  // ── OTP verification step ──────────────────────────────────────────────────
  if (step === 'otp') {
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

          <div className="glass-card rounded-2xl p-10">
            <div
              className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6"
              style={{ animation: 'scaleIn 0.5s cubic-bezier(0.23,1,0.32,1) 0.1s forwards', opacity: 0 }}
            >
              <ShieldCheck className="w-8 h-8 text-violet-400" />
            </div>

            <div
              className="text-center mb-8"
              style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.15s forwards', opacity: 0 }}
            >
              <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-3">
                אימות מייל
              </p>
              <h2 className="text-xl font-bold text-white mb-3" dir="rtl">
                הכנס את הקוד שנשלח אליך
              </h2>
              <p className="text-zinc-500 text-sm">
                Sent to{' '}
                <span className="text-zinc-300 font-medium">{form.email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} noValidate>
              <div
                className="flex gap-2 justify-center mb-6"
                style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.2s forwards', opacity: 0 }}
              >
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="w-11 h-14 text-center text-xl font-bold bg-zinc-900 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                    aria-label={`Digit ${i + 1}`}
                  />
                ))}
              </div>

              {otpError && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{otpError}</p>
                </div>
              )}

              <div style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.25s forwards', opacity: 0 }}>
                <button
                  type="submit"
                  disabled={otpLoading || otpDigits.join('').length < OTP_LENGTH}
                  className="btn-press w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-150"
                >
                  {otpLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p
              className="text-center text-xs text-zinc-600 mt-6"
              style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.3s forwards', opacity: 0 }}
            >
              Didn't receive a code?{' '}
              <button
                type="button"
                onClick={() => {
                  setStep('form')
                  setOtpDigits(Array(OTP_LENGTH).fill(''))
                  setOtpError('')
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                Go back
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Registration form view ─────────────────────────────────────────────────
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
                  Continue
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
