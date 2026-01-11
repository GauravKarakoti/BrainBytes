'use client'

import { useMemo, useState } from 'react'
import NextImage from 'next/image'
import type { Variants } from 'framer-motion'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AnimatedTitle } from '@/components/motion/AnimatedTitle'
import { AnimatedList, AnimatedListItem } from '@/components/motion/AnimatedList'
import { courses } from '@/config/courses'

/* ------------------ Animation Variants ------------------ */
const list = {
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
  hidden: { opacity: 0 },
} satisfies Variants

const item = {
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hidden: { opacity: 0, scale: 0.4 },
} satisfies Variants

/* ------------------ Debounce Hook ------------------ */
function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useMemo(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/* ------------------ Component ------------------ */
export function Courses() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('All')

  const debouncedSearch = useDebounce(search)

  const categories = useMemo(() => {
    const unique = new Set(courses.map((c) => c.category))
    return ['All', ...Array.from(unique)]
  }, [])

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesCategory = category === 'All' || course.category === category
      const matchesSearch =
        course.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        course.tags?.some((tag) =>
          tag.toLowerCase().includes(debouncedSearch.toLowerCase())
        )

      return matchesCategory && matchesSearch
    })
  }, [category, debouncedSearch])

  return (
    <section className="space-y-12 px-4 py-8 sm:px-[10%] md:py-20">
      <AnimatedTitle>
        <h2 className="heading-section">
          Explore <span className="text-highlight-depth">BrainBytes</span>
        </h2>
      </AnimatedTitle>

      {/* ------------------ Search ------------------ */}
      <div className="mx-auto max-w-md">
        <Input
          placeholder="Search by title or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ------------------ Category Filter ------------------ */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={cat === category ? 'default' : 'outline'}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* ------------------ Course List ------------------ */}
      <div className="mx-auto max-w-screen-lg">
        {filteredCourses.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm">Try a different keyword or category</p>
          </div>
        ) : (
          <AnimatedList
            className="flex flex-wrap justify-center gap-2 text-center lg:gap-4"
            variants={list}
          >
            {filteredCourses.map(({ icon, title }) => (
              <AnimatedListItem
                key={title}
                className="basis-28 md:basis-40"
                variants={item}
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="size-full flex-wrap bg-secondary/10 px-0 pb-4 transition active:scale-95 lg:text-base"
                >
                  <AspectRatio
                    ratio={3 / 2}
                    className="!top-1/2 mx-auto h-1/2 w-1/2 -translate-y-1/2"
                  >
                    <NextImage
                      src={`/img/flags/${icon}.png`}
                      alt={`${title} icon`}
                      fill
                      className="rounded-md object-cover"
                    />
                  </AspectRatio>
                  <span>{title}</span>
                </Button>
              </AnimatedListItem>
            ))}
          </AnimatedList>
        )}
      </div>
    </section>
  )
}
