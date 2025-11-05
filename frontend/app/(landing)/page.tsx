import { Hero } from '@/components/landing/Hero'
import { Courses } from '@/components/landing/Courses'
import { Metrics } from '@/components/landing/Metrics'
import { Fluency } from '@/components/landing/Fluency'
import { Reasons } from '@/components/landing/Reasons'

export default function Home() {
  return (
    <>
      <Hero />
      <Courses />
      <Metrics>
        <Fluency />
      </Metrics>
      <Reasons />
    </>
  )
}
