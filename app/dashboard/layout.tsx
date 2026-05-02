import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// This layout acts as a second server-side guard in addition to middleware.
// Even if middleware is bypassed, this check will catch unauthorized access.
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('has_access')
    .eq('id', user.id)
    .single()

  if (!profile?.has_access) {
    redirect('/payment')
  }

  return <>{children}</>
}
