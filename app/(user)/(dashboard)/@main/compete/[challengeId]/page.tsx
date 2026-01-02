import { db } from '@/db/drizzle'
import { challenges } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { CompetitionRoom } from '@/components/user/compete/CompetitionRoom'
import { requireUser } from '@/lib/auth0'

type Props = {
  params: {
    challengeId: number
  }
}

const languageMap: { [key: string]: { monacoId: string, stubKey: keyof typeof challenges.$inferSelect } } = {
  'Python': { monacoId: 'python', stubKey: 'stubCodePy' },
  'JavaScript': { monacoId: 'javascript', stubKey: 'stubCodeJs' },
  'Java': { monacoId: 'java', stubKey: 'stubCodeJava' },
  'C++': { monacoId: 'cpp', stubKey: 'stubCodeCpp' },
}

export default async function CompetePage({ params }: Props) {
  await requireUser()

  const challenge = await db.query.challenges.findFirst({
    where: and(
      eq(challenges.id, params.challengeId),
      eq(challenges.type, 'CODE')
    )
  })

  if (!challenge) {
    return <div>Coding challenge not found.</div>
  }

  const langConfig = languageMap[challenge.question];

  if (!langConfig) {
    return <div>Configuration error: Language &quot;{challenge.question}&quot; not mapped for competition.</div>
  }

  const language = langConfig.monacoId;
  const stubCodeKey = langConfig.stubKey;
  const initialCode = challenge[stubCodeKey] as string || `// Start coding in ${language}`;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4">{challenge.question} Competition</h1>
      <CompetitionRoom 
        challenge={challenge}
        language={language}
        initialCode={initialCode}
      />
    </div>
  )
}