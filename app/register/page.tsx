'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Terminal,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type FormData = {
  name: string
  phone: string
  email: string
}

type FieldErrors = Partial<Record<keyof FormData, string>>

function validateForm(data: FormData): FieldErrors {
  const errors: FieldErrors = {}
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = 'אנא הזן שם מלא.'
  }
  if (!data.phone.trim() || !/^\+?[\d\s\-()]{7,}$/.test(data.phone)) {
    errors.phone = 'אנא הזן מספר טלפון תקין.'
  }
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'אנא הזן כתובת אימייל תקינה.'
  }
  return errors
}

const OTP_LENGTH = 6

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ name: '', phone: '', email: '' })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
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

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: form.email.trim().toLowerCase(),
      options: {
        shouldCreateUser: true,
        data: { name: form.name.trim() },
      },
    })

    if (signInError) {
      setServerError(signInError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep('otp')
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()

    const token = otpDigits.join('')
    if (token.length < OTP_LENGTH) {
      setOtpError('אנא הזן את כל 6 הספרות.')
      return
    }

    setOtpLoading(true)
    setOtpError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email: form.email.trim().toLowerCase(),
      token,
      type: 'email',
    })

    if (error) {
      setOtpError('הקוד שגוי או פג תוקפו. אנא נסה שנית.')
      setOtpLoading(false)
      return
    }

    if (data.user) {
      // Upsert profile after successful OTP verification
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: data.user.id,
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
    }

    router.push('/payment')
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
                אימות אימייל
              </p>
              <h2 className="text-xl font-bold text-white mb-3">
                הכנס את הקוד שנשלח אליך
              </h2>
              <p className="text-zinc-500 text-sm">
                נשלח אל{' '}
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
                    aria-label={`ספרה ${i + 1}`}
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
                      מאמת...
                    </>
                  ) : (
                    <>
                      אמת והמשך
                      <ArrowLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p
              className="text-center text-xs text-zinc-600 mt-6"
              style={{ animation: 'fadeUp 0.5s cubic-bezier(0.23,1,0.32,1) 0.3s forwards', opacity: 0 }}
            >
              לא קיבלת קוד?{' '}
              <button
                type="button"
                onClick={() => {
                  setStep('form')
                  setOtpDigits(Array(OTP_LENGTH).fill(''))
                  setOtpError('')
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                חזור
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

        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">צור את החשבון שלך</h1>
            <p className="text-zinc-400 text-sm">הצטרף לקורס והתחל ללמוד היום</p>
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
                שם מלא
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="ישראל ישראלי"
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
                מספר טלפון
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="050-000-0000"
                value={form.phone}
                onChange={handleChange}
                className={`input-field ${fieldErrors.phone ? 'border-red-500/60 focus:border-red-500' : ''}`}
                dir="ltr"
              />
              {fieldErrors.phone && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                כתובת אימייל
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
                dir="ltr"
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-400">{fieldErrors.email}</p>
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
                  יוצר חשבון...
                </>
              ) : (
                <>
                  המשך
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            כבר יש לך חשבון?{' '}
            <Link
              href="/login"
              className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              התחבר
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          בהרשמה אתה מסכים לתנאי השירות ומדיניות הפרטיות שלנו.
        </p>
      </div>
    </div>
  )
}
