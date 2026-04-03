import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()

  if (!user || user.publicMetadata.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="-m-8 flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </div>
    </div>
  )
}
