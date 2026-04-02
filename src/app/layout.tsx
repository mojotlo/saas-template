import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'SaaS Template',
  description: 'A Next.js SaaS template with Clerk and Stripe',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
