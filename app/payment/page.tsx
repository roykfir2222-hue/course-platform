'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Terminal,
  Shield,
  Lock,
  CheckCircle2,
  Loader2,
  CreditCard,
  AlertCircle,
  Check,
  Star,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type PaymentStep = 'invoice' | 'processing' | 'success' | 'error'

export default function PaymentPage() {
  const router = useRouter()
  const [step, setStep] = useState<PaymentStep>('invoice')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email ?? '')
        setUserName(data.user.user_metadata?.name ?? 'Student')
      }
    })
  }, [])

  async function handleSimulatePayment() {
    setStep('processing')
    setErrorMessage('')

    // Simulate a realistic processing delay
    await new Promise((resolve) => setTimeout(resolve, 2200))

    try {
      const res = await fetch('/api/complete-payment', { method: 'POST' })
      const body = await res.json()

      if (!res.ok) {
        throw new Error(body.error ?? 'Payment failed')
      }

      setStep('success')

      // Redirect to dashboard after showing the success state
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setStep('error')
    }
  }

  const includedItems = [
    '18 in-depth video lessons',
    '6 structured modules',
    'Full source code on GitHub',
    'Private Discord community',
    'Certificate of completion',
    'Lifetime access + free updates',
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(124,58,237,0.1),transparent)] pointer-events-none" />

      <div
        className="relative w-full max-w-lg"
        style={{ animation: 'scaleIn 0.4s cubic-bezier(0.23,1,0.32,1) forwards' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-300">Masterclass</span>
          </Link>
        </div>

        {/* ── Invoice Card ──────────────────────────────────────────────────── */}
        {step === 'invoice' && (
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border-b border-zinc-800 px-8 py-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-1">
                    Invoice #INV-2024-001
                  </p>
                  <h1 className="text-xl font-bold text-white">Complete your enrollment</h1>
                  {userName && (
                    <p className="text-zinc-400 text-sm mt-1">Hello, {userName}</p>
                  )}
                </div>
                {/* Mock Invoice4U badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700">
                  <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-400">Invoice4U</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-6">
              {/* Order summary */}
              <div className="mb-6">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
                  Order Summary
                </h2>
                <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">Full-Stack Masterclass</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Lifetime access · All modules</p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-100">$197.00</p>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-zinc-800">
                  <p className="text-sm text-zinc-400">Subtotal</p>
                  <p className="text-sm text-zinc-400">$197.00</p>
                </div>
                <div className="flex items-center justify-between py-3">
                  <p className="text-base font-semibold text-white">Total</p>
                  <p className="text-xl font-bold text-white">$197.00</p>
                </div>
              </div>

              {/* What's included */}
              <div className="mb-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">
                  What's included
                </p>
                <ul className="space-y-2">
                  {includedItems.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-xs text-zinc-400">
                      <div className="w-4 h-4 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-violet-400" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Billing to */}
              {userEmail && (
                <div className="mb-6 flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Billing to</span>
                  <span className="text-zinc-300 font-medium">{userEmail}</span>
                </div>
              )}

              {/* ── SIMULATE PAYMENT BUTTON ───────────────────────────── */}
              <button
                onClick={handleSimulatePayment}
                className="btn-press w-full flex items-center justify-center gap-2 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-base transition-colors duration-150 shadow-[0_0_30px_rgba(124,58,237,0.25)] mb-4"
              >
                <Shield className="w-4 h-4" />
                Simulate Successful Payment
              </button>

              {/* Trust signals */}
              <div className="flex items-center justify-center gap-6 text-xs text-zinc-600">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3" /> Secure checkout
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="w-3 h-3" /> 30-day refund
                </span>
              </div>

              {/* Demo notice */}
              <div className="mt-5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                <p className="text-xs text-amber-400/70 text-center">
                  <strong>Demo mode:</strong> This is a payment simulator. No real charge is made.
                  Click the button above to grant course access.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Processing ──────────────────────────────────────────────────── */}
        {step === 'processing' && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              {/* Spinning ring */}
              <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-violet-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Processing payment…</h2>
            <p className="text-zinc-400 text-sm">Verifying your transaction. Please wait.</p>

            <div className="mt-8 space-y-2">
              {['Connecting to payment gateway', 'Verifying transaction', 'Granting course access'].map(
                (label, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 text-sm"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${i * 600}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <Loader2 className="w-3 h-3 text-violet-400 animate-spin flex-shrink-0" />
                    <span className="text-zinc-400">{label}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ── Success ─────────────────────────────────────────────────────── */}
        {step === 'success' && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div
              className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6"
              style={{ animation: 'scaleIn 0.4s cubic-bezier(0.23,1,0.32,1) forwards' }}
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment successful!</h2>
            <p className="text-zinc-400 text-sm mb-4">
              You now have full access to the course. Redirecting to your dashboard…
            </p>
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
              <span className="text-sm text-zinc-500">Loading dashboard…</span>
            </div>
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {step === 'error' && (
          <div className="glass-card rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment failed</h2>
            <p className="text-zinc-400 text-sm mb-6">{errorMessage}</p>
            <button
              onClick={() => setStep('invoice')}
              className="btn-press px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors duration-150"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
