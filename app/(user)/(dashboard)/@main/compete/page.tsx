import Link from 'next/link'
import { db } from '@/db/drizzle'
import { challenges } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { buttonVariants } from '@/components/ui/button'
import { requireUser } from '@/lib/auth0'
import { cn } from '@/lib/utils'

export default async function CompeteListPage() {
  await requireUser()

  const codeChallenges = await db.query.challenges.findMany({
    where: eq(challenges.type, 'CODE'), //
    orderBy: (challenges, { asc }) => [asc(challenges.order)],
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Coding Challenges (PvP)
      </h1>
      <div className="space-y-4">
        {codeChallenges.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No coding challenges available for competition right now.
          </p>
        ) : (
          codeChallenges.map((challenge) => (
            <Link
              href={`/compete/${challenge.id}`}
              key={challenge.id}
              className={cn(
                buttonVariants({ variant: 'highlight', size: 'lg' }),
                'w-full h-auto flex justify-between items-center'
              )}
            >
              <span className="text-lg font-semibold">{challenge.question}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}