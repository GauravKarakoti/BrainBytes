import { type PillVariant, CoursePill } from '@/components/landing/CoursePill'

import { courses } from '@/config/courses'

const variants: NonNullable<PillVariant>[] = [
  'secondary',
  'highlightOutline',
  'secondaryOutline',
  'primary',
  'highlight',
  'default',
  'primaryOutline',
]

export function Fluency() {
  return (
    <ul className="flex flex-col gap-8 px-[5%] lg:px-0">
      {courses.map(({ icon, title, topic }, index) => (
        <li key={title} className="flex justify-center">
          <CoursePill
            title={title}
            topic={topic}
            icon={icon}
            tilt={index % 2 === 0 ? -1 : 1}
            variant={variants[index % variants.length]}
          />
        </li>
      ))}
    </ul>
  )
}
