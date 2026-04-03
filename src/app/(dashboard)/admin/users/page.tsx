import { getAllUsersWithSubscription } from '@/infrastructure/database/user-queries'
import { mapUserRow } from '@/domain/user/user'
import { UserTable } from './user-table'

export default async function UsersPage() {
  const rawUsers = await getAllUsersWithSubscription()
  const users = rawUsers.map(mapUserRow)

  return (
    <div className="space-y-6">
      <UserTable users={users} />
    </div>
  )
}
