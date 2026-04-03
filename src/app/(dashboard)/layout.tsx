import Link from 'next/link'
import { currentUser } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { LayoutDashboard, Settings, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

const baseNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  const isAdmin = user?.publicMetadata?.role === 'admin'

  const navItems = [
    ...baseNavItems,
    ...(isAdmin ? [{ href: '/dashboard/admin', label: 'Admin', icon: Shield }] : []),
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/" className="text-lg font-bold">
            SaaS Template
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <UserButton />
            <span className="text-sm text-muted-foreground">Account</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-4xl p-8">{children}</div>
      </main>
    </div>
  )
}
