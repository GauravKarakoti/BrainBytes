import { Suspense } from 'react'
import { UserProgress } from '@/components/user/UserProgress'
import Loading from './loading' 

// HACK: https://github.com/vercel/next.js/issues/65533
// fix loading issue using suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <UserProgress plain />
    </Suspense>
  )
}