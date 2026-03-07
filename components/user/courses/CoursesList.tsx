import { CoursesListCard } from '@/components/user/courses/CoursesListCard'
import type { CourseType, UserProgressType } from '@/db/schema'

type CoursesListProps = {
  courses: CourseType[]
  activeId?: UserProgressType['activeCourseId']
}

// @/components/user/courses/CoursesList.tsx

export function CoursesList({ courses, activeId }: CoursesListProps) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <li key={course.id}>
          <CoursesListCard course={course} activeId={activeId} />
        </li>
      ))}
    </ul>
  )
}
