'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Terminal, Loader2, AlertCircle, ShieldCheck, ArrowLeft, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const OTP_LENGTH = 6

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null))

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }, [step])

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

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!email) {
      setError('אנא הזן כתובת אימייל.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('אנא הזן כתובת אימייל תקינה.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: sendError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    })

    setLoading(false)

    if (sendError) {
      setError('לא נמצא חשבון עם אימייל זה. אנא הירשם תחילה.')
      return
    }

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
      email: email.trim().toLowerCase(),
      token,
      type: 'email',
    })

    if (error) {
      setOtpError('הקוד שגוי או פג תוקפו. אנא נסה שנית.')
      setOtpLoading(false)
      return
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_access')
        .eq('id', data.user.id)
        .single()

      router.push(profile?.has_access ? '/dashboard' : '/payment')
      router.refresh()
    }
  }

  // ── OTP step ───────────────────────────────────────────────────────────────
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
                אימות זהות
              </p>
              <h2 className="text-xl font-bold text-white mb-3">
                בדוק את תיבת הדואר שלך
              </h2>
              <p className="text-zinc-500 text-sm">
                שלחנו קוד אל{' '}
                <span className="text-zinc-300 font-medium">{email}</span>
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
                    'אמת והמשך'
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
                  setStep('email')
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

  // ── Email step ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(124,58,237,0.1),transparent)] pointer-events-none" />

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
            <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">ברוך השב</h1>
            <p className="text-zinc-400 text-sm">הזן את האימייל שלך לקבלת קוד כניסה</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSendOtp} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                כתובת אימייל
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className="input-field"
                dir="ltr"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-press w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors duration-150"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  שולח...
                </>
              ) : (
                'שלח קוד'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            אין לך חשבון?{' '}
            <Link href="/register" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
              קבל גישה
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
