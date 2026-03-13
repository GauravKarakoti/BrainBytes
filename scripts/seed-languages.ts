import { db } from '@/db/drizzle';
import { courses, units, lessons } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function seedLanguages() {
  console.log('🌱 Seeding programming languages...\n');

  // Grouped data structure to ensure IDs stay correctly linked 
  // even if some courses are skipped.
  const seedData = [
    {
      course: { title: 'TypeScript', altCode: 'ts' },
      units: [
        {
          title: 'Unit 1: TypeScript Fundamentals', description: 'Learn types and interfaces', order: 1,
          lessons: [
            { title: 'Lesson 1.1: Basic Types', description: 'Introduction to TypeScript basic types', order: 1 },
            { title: 'Lesson 1.2: Interfaces', description: 'Defining object shapes with interfaces', order: 2 },
          ]
        },
        {
          title: 'Unit 2: Advanced Types', description: 'Master generics and unions', order: 2,
          lessons: [
            { title: 'Lesson 2.1: Generics', description: 'Writing generic functions and types', order: 1 },
            { title: 'Lesson 2.2: Union & Intersection Types', description: 'Combining multiple types', order: 2 },
          ]
        },
        {
          title: 'Unit 3: OOP in TypeScript', description: 'Classes and inheritance patterns', order: 3,
          lessons: [
            { title: 'Lesson 3.1: Classes & Inheritance', description: 'OOP in TypeScript', order: 1 },
            { title: 'Lesson 3.2: Abstract Classes', description: 'Creating abstract base classes', order: 2 },
          ]
        }
      ]
    },
    {
      course: { title: 'Go', altCode: 'go' },
      units: [
        {
          title: 'Unit 1: Go Basics', description: 'Functions and goroutines', order: 1,
          lessons: [
            { title: 'Lesson 1.1: Go Basics', description: 'Variables, functions, and control flow', order: 1 },
            { title: 'Lesson 1.2: Goroutines', description: 'Lightweight concurrency primitives', order: 2 },
          ]
        },
        {
          title: 'Unit 2: Concurrency', description: 'Channels and concurrent patterns', order: 2,
          lessons: [
            { title: 'Lesson 2.1: Channels', description: 'Communication between goroutines', order: 1 },
            { title: 'Lesson 2.2: Select Statement', description: 'Multiplexing channels', order: 2 },
          ]
        },
        {
          title: 'Unit 3: Web Development', description: 'Building HTTP servers', order: 3,
          lessons: [
            { title: 'Lesson 3.1: HTTP Basics', description: 'Building web servers with Go', order: 1 },
            { title: 'Lesson 3.2: Routing & Handlers', description: 'Handling HTTP requests', order: 2 },
          ]
        }
      ]
    },
    {
      course: { title: 'Rust', altCode: 'rust' },
      units: [
        {
          title: 'Unit 1: Rust Fundamentals', description: 'Ownership and borrowing concepts', order: 1,
          lessons: [
            { title: 'Lesson 1.1: Ownership', description: 'Rust\'s ownership system', order: 1 },
            { title: 'Lesson 1.2: Borrowing & References', description: 'Mutable and immutable borrows', order: 2 },
          ]
        },
        {
          title: 'Unit 2: Memory Safety', description: 'Lifetimes and traits', order: 2,
          lessons: [
            { title: 'Lesson 2.1: Lifetimes', description: 'Ensuring references are valid', order: 1 },
            { title: 'Lesson 2.2: Traits', description: 'Defining shared behavior', order: 2 },
          ]
        },
        {
          title: 'Unit 3: Systems Programming', description: 'Unsafe code patterns', order: 3,
          lessons: [
            { title: 'Lesson 3.1: Unsafe Rust', description: 'Working with unsafe code blocks', order: 1 },
            { title: 'Lesson 3.2: FFI', description: 'Calling C code from Rust', order: 2 },
          ]
        }
      ]
    },
    {
      course: { title: 'Swift', altCode: 'swift' },
      units: [
        {
          title: 'Unit 1: Swift Basics', description: 'Variables and control flow', order: 1,
          lessons: [
            { title: 'Lesson 1.1: Basics', description: 'Variables, constants, and types', order: 1 },
            { title: 'Lesson 1.2: Control Flow', description: 'If statements, loops, and switches', order: 2 },
          ]
        },
        {
          title: 'Unit 2: OOP in Swift', description: 'Classes and protocols', order: 2,
          lessons: [
            { title: 'Lesson 2.1: Classes & Structs', description: 'Object-oriented programming', order: 1 },
            { title: 'Lesson 2.2: Protocols', description: 'Defining protocols and conformance', order: 2 },
          ]
        },
        {
          title: 'Unit 3: iOS Development', description: 'Building iOS applications', order: 3,
          lessons: [
            { title: 'Lesson 3.1: UIKit Basics', description: 'Building iOS UIs', order: 1 },
            { title: 'Lesson 3.2: View Controllers', description: 'Managing app screens', order: 2 },
          ]
        }
      ]
    },
    {
      course: { title: 'Kotlin', altCode: 'kotlin' },
      units: [
        {
          title: 'Unit 1: Kotlin Fundamentals', description: 'Syntax and null safety', order: 1,
          lessons: [
            { title: 'Lesson 1.1: Syntax & Variables', description: 'Kotlin fundamentals', order: 1 },
            { title: 'Lesson 1.2: Null Safety', description: 'Handling null values safely', order: 2 },
          ]
        },
        {
          title: 'Unit 2: Functional Programming', description: 'Lambdas and extensions', order: 2,
          lessons: [
            { title: 'Lesson 2.1: Lambdas', description: 'Functional programming with lambdas', order: 1 },
            { title: 'Lesson 2.2: Extension Functions', description: 'Adding functions to existing classes', order: 2 },
          ]
        },
        {
          title: 'Unit 3: Android Development', description: 'Building Android applications', order: 3,
          lessons: [
            { title: 'Lesson 3.1: Android Basics', description: 'Building Android apps with Kotlin', order: 1 },
            { title: 'Lesson 3.2: Jetpack Components', description: 'Using Android Jetpack libraries', order: 2 },
          ]
        }
      ]
    }
  ];

  let addedCourses = 0;
  let addedUnits = 0;
  let addedLessons = 0;

  for (const data of seedData) {
    // 1. Check if course exists
    const existingCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.altCode, data.course.altCode));

    if (existingCourse.length > 0) {
      console.log(`⏭️  Course '${data.course.title}' already exists. Skipping.`);
      continue; // Skip seeding units and lessons for this course
    }

    // 2. Insert the course
    const [createdCourse] = await db.insert(courses).values(data.course).returning();
    addedCourses++;
    console.log(`📚 Created course: ${createdCourse.title}`);

    // 3. Insert its units
    for (const unitData of data.units) {
      const [createdUnit] = await db.insert(units).values({
        title: unitData.title,
        description: unitData.description,
        order: unitData.order,
        courseId: createdCourse.id,
      }).returning();
      addedUnits++;

      for (const lessonData of unitData.lessons) {
        await db.insert(lessons).values({
          title: lessonData.title,
          order: lessonData.order,
          unitId: createdUnit.id,
        });
        addedLessons++;
      }
    }
  }

  console.log('\n🎉 Seeding script finished!');
  console.log(`   - New Courses: ${addedCourses}`);
  console.log(`   - New Units: ${addedUnits}`);
  console.log(`   - New Lessons: ${addedLessons}`);
}

seedLanguages().catch((err) => {
  console.error('❌ Error seeding languages:', err);
  process.exit(1);
});