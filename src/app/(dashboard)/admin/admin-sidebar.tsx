'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreditCard, Users, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard/admin/plans', label: 'Plans', icon: CreditCard },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '#', label: 'Subscriptions', icon: Receipt, disabled: true },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-background">
      <div className="flex h-12 items-center border-b px-4">
        <h2 className="text-sm font-semibold text-muted-foreground">Admin</h2>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-disabled={item.disabled}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith(item.href) && !item.disabled
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              item.disabled && 'pointer-events-none opacity-50'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
