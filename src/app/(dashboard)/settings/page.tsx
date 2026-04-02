import { UserProfile } from '@clerk/nextjs'

const appearance = {
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    navbar: 'hidden',
    pageScrollBox: 'p-0',
  },
}

export default function ProfilePage() {
  return <UserProfile routing="hash" appearance={appearance} />
}
