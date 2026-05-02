'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronDown,
  Play,
  Star,
  Check,
  ArrowRight,
  BookOpen,
  Users,
  Trophy,
  Zap,
  Lock,
  Globe,
  Code2,
  Database,
  Layers,
  Terminal,
  GitBranch,
  Rocket,
} from 'lucide-react'

// ── Data ─────────────────────────────────────────────────────────────────────

const modules = [
  {
    icon: Code2,
    title: 'React Fundamentals',
    lessons: 3,
    duration: '2h 15m',
    topics: ['Components & JSX', 'State & Props', 'useEffect & Lifecycle'],
  },
  {
    icon: Layers,
    title: 'Advanced React Patterns',
    lessons: 4,
    duration: '3h 10m',
    topics: ['Custom Hooks', 'Context API', 'Performance Optimization', 'Server Components'],
  },
  {
    icon: Database,
    title: 'Backend & APIs',
    lessons: 4,
    duration: '3h 45m',
    topics: ['Node.js & Express', 'REST API Design', 'PostgreSQL', 'Authentication & JWT'],
  },
  {
    icon: Globe,
    title: 'Full-Stack Integration',
    lessons: 3,
    duration: '2h 30m',
    topics: ['Next.js App Router', 'Server Actions', 'API Routes'],
  },
  {
    icon: GitBranch,
    title: 'Testing & Quality',
    lessons: 2,
    duration: '1h 50m',
    topics: ['Unit Testing', 'E2E with Playwright'],
  },
  {
    icon: Rocket,
    title: 'Production & Deployment',
    lessons: 2,
    duration: '1h 40m',
    topics: ['CI/CD Pipelines', 'Docker & Deployment'],
  },
]

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Senior Engineer at Stripe',
    avatar: 'SC',
    content:
      'This course completely changed how I think about full-stack architecture. The project-based approach meant I was building real things from day one. Worth every penny.',
    rating: 5,
  },
  {
    name: 'Marcus Williams',
    role: 'Founder, DevLaunch',
    avatar: 'MW',
    content:
      'I went from knowing basic HTML to shipping a SaaS product in 3 months. The section on authentication and database design alone was worth the entire price.',
    rating: 5,
  },
  {
    name: 'Priya Patel',
    role: 'Software Engineer at Vercel',
    avatar: 'PP',
    content:
      "The best structured programming course I've taken. Every concept builds on the last, and the instructor explains the \"why\" behind every decision — not just the \"how\".",
    rating: 5,
  },
]

const faqs = [
  {
    q: 'Do I need prior coding experience?',
    a: 'Basic JavaScript knowledge is helpful, but the course starts from the fundamentals. We cover everything you need to understand each concept before building on it.',
  },
  {
    q: 'How long do I have access?',
    a: 'Lifetime access. Once you enroll, the course and all future updates are yours forever — including new modules added as the ecosystem evolves.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes. If you are not satisfied within the first 30 days, we offer a full refund — no questions asked.',
  },
  {
    q: 'Will this work on Windows, Mac, and Linux?',
    a: 'Absolutely. All tools and workflows demonstrated in the course are cross-platform. Setup guides are provided for each OS.',
  },
  {
    q: 'Is there a community or support channel?',
    a: 'Enrolled students get access to a private Discord server with the instructor and fellow students for code reviews, questions, and networking.',
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-zinc-100 tracking-tight">Masterclass</span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors duration-150 px-4 py-2"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="btn-press text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg transition-colors duration-150"
        >
          Get Access
        </Link>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(124,58,237,0.18),transparent)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8"
          style={{ animation: 'fadeIn 0.5s ease-out forwards' }}
        >
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse-slow" />
          Now Enrolling — Cohort 4
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.04] mb-6"
          style={{ animation: 'fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.1s forwards', opacity: 0 }}
        >
          Master Full-Stack
          <br />
          <span className="gradient-text">from Zero to Production</span>
        </h1>

        {/* Subtext */}
        <p
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ animation: 'fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.2s forwards', opacity: 0 }}
        >
          A complete, project-based course covering React, Node.js, PostgreSQL, and production deployment.
          Join 500+ developers who've already shipped real products.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          style={{ animation: 'fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.3s forwards', opacity: 0 }}
        >
          <Link
            href="/register"
            className="btn-press group inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-base transition-colors duration-150 shadow-[0_0_40px_rgba(124,58,237,0.3)]"
          >
            Get Instant Access
            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
          <p className="text-sm text-zinc-500">30-day money-back guarantee</p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl mx-auto"
          style={{ animation: 'fadeUp 0.7s cubic-bezier(0.23,1,0.32,1) 0.4s forwards', opacity: 0 }}
        >
          {[
            { value: '500+', label: 'Students' },
            { value: '4.9★', label: 'Average rating' },
            { value: '18', label: 'Video lessons' },
            { value: '∞', label: 'Lifetime access' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-zinc-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CurriculumSection() {
  return (
    <section id="curriculum" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-violet-400 font-medium text-sm uppercase tracking-widest mb-3">Curriculum</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Everything you need to ship
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            18 lessons across 6 modules. No fluff — every lesson teaches something you'll use in the real world.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 stagger-children">
          {modules.map((mod) => (
            <div
              key={mod.title}
              className="glass-card rounded-2xl p-6 hover:border-zinc-700/80 transition-colors duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <mod.icon className="w-5 h-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-zinc-100 text-sm">{mod.title}</h3>
                    <span className="text-xs text-zinc-500 flex-shrink-0">
                      {mod.lessons} lessons · {mod.duration}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {mod.topics.map((t) => (
                      <li key={t} className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Check className="w-3 h-3 text-violet-500 flex-shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WhySection() {
  const reasons = [
    {
      icon: Zap,
      title: 'Project-first learning',
      body: 'Every concept is learned by building something real. No toy examples — you ship a complete SaaS product by the end of the course.',
    },
    {
      icon: BookOpen,
      title: 'Depth over breadth',
      body: 'We go deep on the things that matter most: architecture, state management, security, and performance. Not a surface-level overview.',
    },
    {
      icon: Users,
      title: 'Private community',
      body: 'Join a Discord with the instructor and 500+ alumni. Get code reviews, answer questions, and find collaborators for your projects.',
    },
  ]

  return (
    <section className="py-24 px-6 bg-zinc-900/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-violet-400 font-medium text-sm uppercase tracking-widest mb-3">Why this course</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Built differently
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {reasons.map((r) => (
            <div key={r.title} className="glass-card rounded-2xl p-7">
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                <r.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-zinc-100 mb-2">{r.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function InstructorSection() {
  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-2xl p-8 md:p-10 flex flex-col sm:flex-row items-start gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white select-none">
              JR
            </div>
          </div>
          {/* Bio */}
          <div>
            <p className="text-violet-400 text-xs font-medium uppercase tracking-widest mb-2">
              Your Instructor
            </p>
            <h3 className="text-xl font-bold text-white mb-1">Jordan Rivera</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Staff Engineer · 12 years building production systems
            </p>
            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              I've built products used by millions of people at companies like Meta and early-stage startups.
              This course distills 12 years of hard-won lessons into the clearest, most practical curriculum
              I know how to build. I teach the way I wished I was taught.
            </p>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'AWS'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="py-24 px-6 bg-zinc-900/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-violet-400 font-medium text-sm uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            What students are saying
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 stagger-children">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-7 flex flex-col gap-4">
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed flex-1">"{t.content}"</p>
              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-100">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const features = [
    '18 in-depth video lessons',
    '6 structured modules',
    'Full source code on GitHub',
    'Private Discord community',
    'Certificate of completion',
    'Lifetime access + free updates',
    '30-day money-back guarantee',
  ]

  return (
    <section id="pricing" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-12">
          <p className="text-violet-400 font-medium text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            One price, forever
          </h2>
        </div>

        <div className="gradient-border glass-card rounded-2xl p-8 text-center">
          <p className="text-zinc-400 text-sm mb-2">Full course access</p>
          <div className="flex items-start justify-center gap-1 mb-1">
            <span className="text-zinc-400 text-xl mt-3">$</span>
            <span className="text-6xl font-bold text-white tracking-tight">197</span>
          </div>
          <p className="text-zinc-500 text-sm mb-8">One-time payment · No subscription</p>

          <ul className="space-y-3 mb-8 text-left">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-violet-400" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          <Link
            href="/register"
            className="btn-press block w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-base transition-colors duration-150 shadow-[0_0_30px_rgba(124,58,237,0.25)]"
          >
            Enroll Now — $197
          </Link>
          <p className="text-xs text-zinc-600 mt-4">Secure checkout · 30-day refund</p>
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section className="py-24 px-6 bg-zinc-900/30">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-violet-400 font-medium text-sm uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl font-bold text-white tracking-tight">Common questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-zinc-800/40 transition-colors duration-150"
              >
                <span className="font-medium text-zinc-100 text-sm pr-4">{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-500 flex-shrink-0 transition-transform duration-200 ${
                    openIdx === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIdx === i && (
                <div
                  className="px-6 pb-5"
                  style={{ animation: 'fadeIn 0.2s ease-out forwards' }}
                >
                  <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaBanner() {
  return (
    <section className="py-24 px-6 bg-zinc-950">
      <div className="max-w-3xl mx-auto text-center">
        <div className="glass-card gradient-border rounded-2xl px-8 py-16">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-7 h-7 text-violet-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            Ready to level up?
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-lg mx-auto">
            Join 500+ developers who've already shipped their first production app. Start today.
          </p>
          <Link
            href="/register"
            className="btn-press inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-base transition-colors duration-150 shadow-[0_0_40px_rgba(124,58,237,0.3)]"
          >
            Get Instant Access
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 py-10 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-600 flex items-center justify-center">
            <Terminal className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-zinc-400 text-sm">Masterclass</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Enroll
          </Link>
        </div>
        <p className="text-xs text-zinc-600">© {new Date().getFullYear()} Masterclass. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <NavBar />
      <HeroSection />
      <CurriculumSection />
      <WhySection />
      <InstructorSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <CtaBanner />
      <Footer />
    </main>
  )
}
