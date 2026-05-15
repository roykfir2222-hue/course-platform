'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Terminal,
  Play,
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  BookOpen,
  Clock,
  Lock,
  Star,
  Code2,
  Layers,
  Database,
  Globe,
  GitBranch,
  Rocket,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Curriculum data ───────────────────────────────────────────────────────────

type Lesson = {
  id: string
  title: string
  duration: string
  youtubeId: string
  description: string
}

type Module = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  lessons: Lesson[]
}

const curriculum: Module[] = [
  {
    id: 'm1',
    title: 'React Fundamentals',
    icon: Code2,
    lessons: [
      {
        id: 'l1',
        title: 'Components, JSX & Props',
        duration: '42m',
        youtubeId: 'Ke90Tje7VS0',
        description:
          'למד את אבני הבניין של כל אפליקציית React. נכסה יצירת קומפוננטות, תחביר JSX וכיצד להעביר נתונים בין קומפוננטות באמצעות props.',
      },
      {
        id: 'l2',
        title: 'State Management with useState',
        duration: '38m',
        youtubeId: 'O6P86uwfdR0',
        description:
          'הבן state מקומי של קומפוננטות, ה-hook של useState, וכיצד React מרנדר מחדש. נבנה רשימת מטלות אינטראקטיבית מאפס.',
      },
      {
        id: 'l3',
        title: 'Side Effects with useEffect',
        duration: '35m',
        youtubeId: 'TNhaISOUy6Q',
        description:
          'שלוט ב-hook של useEffect — שליפת נתונים, מנוי לאירועים וניקוי תופעות לוואי. הימנע מהמלכודות הנפוצות ביותר.',
      },
    ],
  },
  {
    id: 'm2',
    title: 'Advanced React Patterns',
    icon: Layers,
    lessons: [
      {
        id: 'l4',
        title: 'Custom Hooks',
        duration: '44m',
        youtubeId: '6ThXsUwLWvc',
        description:
          'חלץ לוגיקה לשימוש חוזר ל-custom hooks. נבנה useFetch, useLocalStorage ו-useDebounce מאפס.',
      },
      {
        id: 'l5',
        title: 'Context API & Global State',
        duration: '40m',
        youtubeId: 'lhMKvyLRWo0',
        description:
          'נהל state ברמת האפליקציה ללא prop drilling. למד מתי להשתמש ב-Context לעומת ספריית state.',
      },
      {
        id: 'l6',
        title: 'Performance Optimization',
        duration: '46m',
        youtubeId: 'wTnHqRLZmb8',
        description:
          'useMemo, useCallback, React.memo — מתי להשתמש בהם ומתי לדלג עליהם. פרופיל בעיות ביצועים אמיתיות.',
      },
      {
        id: 'l7',
        title: 'React Server Components',
        duration: '52m',
        youtubeId: '2tJedF8I-8Q',
        description:
          'הבן את המעבר ל-server components ב-Next.js. למד את המודל המנטלי לגבולות client/server.',
      },
    ],
  },
  {
    id: 'm3',
    title: 'Backend & APIs',
    icon: Database,
    lessons: [
      {
        id: 'l8',
        title: 'Node.js & Express Fundamentals',
        duration: '50m',
        youtubeId: 'fBNz5xF-Kx4',
        description:
          'בנה REST API מאפס עם Node.js ו-Express. ניתוב, middleware, טיפול בשגיאות ומבנה פרויקט.',
      },
      {
        id: 'l9',
        title: 'REST API Design',
        duration: '38m',
        youtubeId: 'lsMQRaeKNDk',
        description:
          'עצב APIs שמפתחים אחרים יאהבו להשתמש בהם. שמות משאבים, שיטות HTTP, קודי סטטוס וגרסאות.',
      },
      {
        id: 'l10',
        title: 'PostgreSQL & Supabase',
        duration: '55m',
        youtubeId: 'zJSY8tbf_ys',
        description:
          'הגדר מסד נתונים PostgreSQL לפרודקשן עם Supabase. כתוב שאילתות, עצב סכמות והשתמש ב-Row Level Security.',
      },
      {
        id: 'l11',
        title: 'Authentication & JWT',
        duration: '48m',
        youtubeId: '7Q17ubqLfaM',
        description:
          'בנה אימות מאובטח עם JWTs. הטמע הרשמה, כניסה, רענון טוקן ונתיבים מוגנים.',
      },
    ],
  },
  {
    id: 'm4',
    title: 'Full-Stack Integration',
    icon: Globe,
    lessons: [
      {
        id: 'l12',
        title: 'Next.js App Router Deep Dive',
        duration: '60m',
        youtubeId: 'wm5gMKuwSYk',
        description:
          'המדריך המקיף ל-Next.js App Router. layouts, templates, loading UI, error boundaries ו-parallel routes.',
      },
      {
        id: 'l13',
        title: 'Server Actions & Mutations',
        duration: '44m',
        youtubeId: 'dDpZfOQBMaU',
        description:
          'החלף API routes למוטציות עם Server Actions. טפסים, עדכונים אופטימיסטיים ו-revalidation.',
      },
      {
        id: 'l14',
        title: 'Building the Full-Stack Project',
        duration: '70m',
        youtubeId: 'RjHflb-3gk8',
        description:
          'חבר את כל מה שבנינו לאפליקציית SaaS שלמה. אימות, מסד נתונים, ממשק משתמש ופריסה.',
      },
    ],
  },
  {
    id: 'm5',
    title: 'Testing & Quality',
    icon: GitBranch,
    lessons: [
      {
        id: 'l15',
        title: 'Unit Testing with Vitest',
        duration: '36m',
        youtubeId: 'GhP5HCzecLM',
        description:
          'בדוק את הלוגיקה והקומפוננטות שלך עם Vitest. כתוב בדיקות מהירות ואמינות שנותנות לך ביטחון לשלוח.',
      },
      {
        id: 'l16',
        title: 'E2E Testing with Playwright',
        duration: '42m',
        youtubeId: 'E3K1sKQiNjM',
        description:
          'אוטומציה של בדיקות זרימת משתמש מלאה. כתוב בדיקות E2E שתופסות באגים אמיתיים לפני שהם מגיעים לפרודקשן.',
      },
    ],
  },
  {
    id: 'm6',
    title: 'Production & Deployment',
    icon: Rocket,
    lessons: [
      {
        id: 'l17',
        title: 'CI/CD with GitHub Actions',
        duration: '38m',
        youtubeId: 'R8_veQiYBjI',
        description:
          'אוטומציה של pipeline הפריסה שלך. הרץ בדיקות, lint ופרוס לפרודקשן אוטומטית בכל push.',
      },
      {
        id: 'l18',
        title: 'Docker & Production Deployment',
        duration: '50m',
        youtubeId: 'pTFZFxd5uri',
        description:
          'אחסן את האפליקציה שלך ב-container ופרוס אותה. משתני סביבה, סודות, בדיקות בריאות ופריסה ללא downtime.',
      },
    ],
  },
]

const allLessons = curriculum.flatMap((m) => m.lessons)
const TOTAL_LESSONS = allLessons.length

// ── Video placeholder component ───────────────────────────────────────────────

function VideoPlayer({ lesson }: { lesson: Lesson }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden group">
      {playing ? (
        <iframe
          key={lesson.id}
          src={`https://www.youtube.com/embed/${lesson.youtubeId}?autoplay=1&rel=0`}
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <>
          {/* Thumbnail */}
          <img
            src={`https://img.youtube.com/vi/${lesson.youtubeId}/maxresdefault.jpg`}
            alt={lesson.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 to-transparent" />

          {/* Play button */}
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group"
            aria-label="הפעל וידאו"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:bg-white/20 group-active:scale-95">
              <Play className="w-7 h-7 text-white fill-white ml-1" />
            </div>
          </button>

          {/* Duration badge */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/10">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span className="text-xs text-zinc-300 font-medium">{lesson.duration}</span>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main dashboard page ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [activeLessonId, setActiveLessonId] = useState(allLessons[0].id)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userName, setUserName] = useState('תלמיד')

  const activeLesson = allLessons.find((l) => l.id === activeLessonId) ?? allLessons[0]
  const activeLessonIndex = allLessons.findIndex((l) => l.id === activeLessonId)
  const prevLesson = activeLessonIndex > 0 ? allLessons[activeLessonIndex - 1] : null
  const nextLesson = activeLessonIndex < allLessons.length - 1 ? allLessons[activeLessonIndex + 1] : null
  const progress = Math.round((completedIds.size / TOTAL_LESSONS) * 100)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserName(data.user.user_metadata?.name ?? data.user.email?.split('@')[0] ?? 'תלמיד')
      }
    })
  }, [])

  function markComplete(id: string) {
    setCompletedIds((prev) => new Set([...prev, id]))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function selectLesson(id: string) {
    setActiveLessonId(id)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  return (
    <div className="h-screen bg-zinc-950 flex flex-col overflow-hidden">
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm z-30">
        <div className="flex items-center gap-3">
          {/* Hamburger for mobile */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors md:hidden"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Terminal className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-200 text-sm hidden sm:block">Masterclass</span>
          </Link>

          <div className="hidden sm:block w-px h-4 bg-zinc-800 mx-1" />

          <span className="hidden sm:block text-xs text-zinc-500 truncate max-w-48">
            {activeLesson.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500">{progress}%</span>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 pr-3 border-r border-zinc-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white select-none">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-zinc-300 hidden sm:block">{userName}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors mr-1"
              title="התנתק"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar (RIGHT in RTL) ─────────────────────────────────── */}
        <aside
          className={`
            flex-shrink-0 w-72 border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden
            transition-all duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 md:border-0'}
            absolute md:relative inset-y-0 right-0 z-20 md:z-auto
          `}
          style={{ top: 56 }}
        >
          {/* Sidebar header */}
          <div className="flex-shrink-0 px-4 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-violet-400" />
              <h2 className="text-sm font-semibold text-zinc-200">תוכן הקורס</h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500 flex-shrink-0">
                {completedIds.size}/{TOTAL_LESSONS}
              </span>
            </div>
          </div>

          {/* Modules + Lessons */}
          <div className="flex-1 overflow-y-auto py-2">
            {curriculum.map((mod) => {
              const ModIcon = mod.icon
              const moduleCompleted = mod.lessons.every((l) => completedIds.has(l.id))

              return (
                <div key={mod.id} className="mb-1">
                  {/* Module header */}
                  <div className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    <ModIcon className="w-3.5 h-3.5 text-violet-500" />
                    <span className="flex-1 truncate">{mod.title}</span>
                    {moduleCompleted && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Lessons */}
                  {mod.lessons.map((lesson, li) => {
                    const isActive = lesson.id === activeLessonId
                    const isDone = completedIds.has(lesson.id)

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson.id)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 text-right transition-colors duration-150
                          ${isActive
                            ? 'bg-violet-500/10 border-l-2 border-violet-500'
                            : 'hover:bg-zinc-900/60 border-l-2 border-transparent'
                          }
                        `}
                      >
                        {/* Status icon */}
                        <div className="flex-shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : isActive ? (
                            <Play className="w-4 h-4 text-violet-400 fill-violet-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-700" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-medium truncate ${
                              isActive ? 'text-violet-300' : isDone ? 'text-zinc-500' : 'text-zinc-300'
                            }`}
                          >
                            {li + 1}. {lesson.title}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5">{lesson.duration}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {/* Overlay to close sidebar on mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-10 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {/* Video player */}
            <VideoPlayer key={activeLesson.id} lesson={activeLesson} />

            {/* Lesson info */}
            <div className="mt-6 pb-6 border-b border-zinc-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full">
                      {curriculum.find((m) => m.lessons.some((l) => l.id === activeLesson.id))?.title}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {activeLesson.duration}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activeLesson.title}
                  </h1>
                </div>

                {/* Mark complete button */}
                {!completedIds.has(activeLesson.id) ? (
                  <button
                    onClick={() => markComplete(activeLesson.id)}
                    className="btn-press flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm text-zinc-300 transition-colors duration-150"
                  >
                    <Circle className="w-4 h-4" />
                    סמן כהושלם
                  </button>
                ) : (
                  <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    הושלם
                  </div>
                )}
              </div>

              <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-2xl">
                {activeLesson.description}
              </p>
            </div>

            {/* Prev / Next navigation — icons swapped for RTL */}
            <div className="flex items-center justify-between gap-4 mt-6">
              {nextLesson ? (
                <button
                  onClick={() => {
                    markComplete(activeLesson.id)
                    setActiveLessonId(nextLesson.id)
                  }}
                  className="btn-press flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm text-white font-medium transition-colors duration-150 min-w-0 flex-1"
                >
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  <div className="text-right min-w-0 flex-1">
                    <p className="text-xs text-violet-300 mb-0.5">השיעור הבא</p>
                    <p className="text-sm font-medium truncate">{nextLesson.title}</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400 flex-1">
                  <Star className="w-4 h-4 flex-shrink-0 fill-emerald-400" />
                  <span className="font-medium">הקורס הושלם! 🎉</span>
                </div>
              )}

              {prevLesson ? (
                <button
                  onClick={() => setActiveLessonId(prevLesson.id)}
                  className="btn-press flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm text-zinc-300 transition-colors duration-150 min-w-0 flex-1"
                >
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-xs text-zinc-600 mb-0.5">הקודם</p>
                    <p className="text-sm font-medium truncate">{prevLesson.title}</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 flex-shrink-0" />
                </button>
              ) : (
                <div className="flex-1" />
              )}
            </div>

            {/* All modules quick-nav */}
            <div className="mt-10">
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                כל המודולים
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {curriculum.map((mod) => {
                  const ModIcon = mod.icon
                  const doneCount = mod.lessons.filter((l) => completedIds.has(l.id)).length
                  const isCurrentModule = mod.lessons.some((l) => l.id === activeLessonId)

                  return (
                    <button
                      key={mod.id}
                      onClick={() => selectLesson(mod.lessons[0].id)}
                      className={`
                        btn-press flex items-center gap-3 p-4 rounded-xl border text-right transition-colors duration-150
                        ${isCurrentModule
                          ? 'bg-violet-500/8 border-violet-500/25'
                          : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                        }
                      `}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isCurrentModule ? 'bg-violet-500/15' : 'bg-zinc-800'}`}>
                        <ModIcon className={`w-4 h-4 ${isCurrentModule ? 'text-violet-400' : 'text-zinc-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-200 truncate">{mod.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {doneCount}/{mod.lessons.length} שיעורים
                        </p>
                      </div>
                      {doneCount === mod.lessons.length && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
