import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

import * as schema from '@/db/schema'

const sql = neon(process.env.DATABASE_URL!)

const db = drizzle(sql, { schema, logger: true })

const main = async () => {
  try {
    console.log('🚧 [DB]: Seeding database...')

    await db.delete(schema.courses)
    await db.delete(schema.userProgress)
    await db.delete(schema.units)
    await db.delete(schema.challenges)
    await db.delete(schema.challengeOptions)
    await db.delete(schema.challengeProgress)
    await db.delete(schema.lessons)

    await db.insert(schema.courses).values([
      {
        id: 1,
        title: 'Python',
        altCode: 'py',
      },
      {
        id: 2,
        title: 'JavaScript',
        altCode: 'js',
      },
      {
        id: 3,
        title: 'C++',
        altCode: 'cpp',
      },
      {
        id: 4,
        title: 'Java',
        altCode: 'java',
      },
    ])

    await db.insert(schema.units).values([
      {
        id: 1,
        title: 'Unit 1: Arrays & Strings',
        description: 'Master fundamental data structures: arrays and strings.',
        courseId: 1, // Python
        order: 1,
      },
      {
        id: 2,
        title: 'Unit 2: Linked Lists',
        description: 'Learn about linked lists and their operations.',
        courseId: 1, // Python
        order: 2,
      },
      {
        id: 3,
        title: 'Unit 3: Stacks & Queues',
        description: 'Understand LIFO and FIFO data structures.',
        courseId: 1, // Python
        order: 3,
      },
    ])

    await db.insert(schema.lessons).values([
      {
        id: 1,
        unitId: 1, // Arrays & Strings
        order: 1,
        title: 'Array Basics',
      },
      {
        id: 2,
        unitId: 1,
        order: 2,
        title: 'Two Pointers',
      },
      {
        id: 3,
        unitId: 1, // Arrays & Strings
        order: 3,
        title: 'Sliding Window',
      },
      {
        id: 4,
        unitId: 1,
        order: 4,
        title: 'String Manipulation',
      },
      {
        id: 5,
        unitId: 1,
        order: 5,
        title: 'Sorting & Searching',
      },

      {
        id: 6,
        unitId: 2, // Linked Lists
        order: 1,
        title: 'Singly Linked Lists',
      },
      {
        id: 7,
        unitId: 2,
        order: 2,
        title: 'Doubly Linked Lists',
      },
      {
        id: 8,
        unitId: 2,
        order: 3,
        title: 'Linked List Operations',
      },
      {
        id: 9,
        unitId: 3, // Stacks & Queues
        order: 1,
        title: 'Stack Implementation',
      },
      {
        id: 10,
        unitId: 3,
        order: 2,
        title: 'Queue Implementation',
      },
    ])

    await db.insert(schema.challenges).values([
      {
        id: 1,
        lessonId: 1, // Array Basics
        type: 'SELECT',
        order: 1,
        question: 'What is the time complexity of accessing an element in an array by index?',
      },
      {
        id: 2,
        lessonId: 1, // Array Basics
        type: 'SELECT',
        order: 2,
        question: 'Which operation on an array has O(n) time complexity?',
      },
      {
        id: 3,
        lessonId: 2, // Two Pointers
        type: 'SELECT',
        order: 1,
        question: 'What is the two-pointer technique primarily used for?',
      },
    ])

    await db.insert(schema.challengeOptions).values([
      {
        id: 1,
        challengeId: 1,
        option: 'O(1)',
        correct: true,
        imageSrc: '/complexity-o1.svg',
        audioSrc: '/dsa_o1.mp3',
      },
      {
        id: 2,
        challengeId: 1,
        option: 'O(n)',
        correct: false,
        imageSrc: '/complexity-on.svg',
        audioSrc: '/dsa_on.mp3',
      },
      {
        id: 3,
        challengeId: 1,
        option: 'O(log n)',
        correct: false,
        imageSrc: '/complexity-ologn.svg',
        audioSrc: '/dsa_ologn.mp3',
      },
      {
        id: 4,
        challengeId: 2,
        option: 'Inserting at the end',
        correct: false,
        imageSrc: '/array-insert-end.svg',
        audioSrc: '/dsa_insert_end.mp3',
      },
      {
        id: 5,
        challengeId: 2,
        option: 'Finding an element',
        correct: true,
        imageSrc: '/array-search.svg',
        audioSrc: '/dsa_search.mp3',
      },
      {
        id: 6,
        challengeId: 2,
        option: 'Accessing by index',
        correct: false,
        imageSrc: '/array-access.svg',
        audioSrc: '/dsa_access.mp3',
      },
      {
        id: 7,
        challengeId: 3,
        option: 'Optimizing space complexity',
        correct: true,
        imageSrc: '/two-pointers.svg',
        audioSrc: '/dsa_two_pointers.mp3',
      },
      {
        id: 8,
        challengeId: 3,
        option: 'Sorting arrays',
        correct: false,
        imageSrc: '/sorting.svg',
        audioSrc: '/dsa_sorting.mp3',
      },
      {
        id: 9,
        challengeId: 3,
        option: 'Hashing elements',
        correct: false,
        imageSrc: '/hashing.svg',
        audioSrc: '/dsa_hashing.mp3',
      },
    ])

    console.log('✅ [DB]: Seeded 100%!')
  } catch (error) {
    console.error(error)
    throw new Error('❌ [DB]: Failed to seed database.')
  }
}

main()
