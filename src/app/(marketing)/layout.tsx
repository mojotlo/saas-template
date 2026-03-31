'use client'

import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

function NavAuth() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <UserButton />
      </>
    )
  }

  return (
    <>
      <Button variant="ghost" asChild>
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">Get started</Link>
      </Button>
    </>
  )
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-foreground">
            SaaS Template
          </Link>
          <nav className="flex items-center gap-4">
            <NavAuth />
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SaaS Template. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
