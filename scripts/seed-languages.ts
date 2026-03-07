import { db } from '@/db/drizzle';
import { courses, units, lessons } from '@/db/schema';

async function seedLanguages() {
  console.log('🌱 Seeding 5 new programming languages...\n');

  // Step 1: Create 5 course records
  console.log('📚 Creating courses...');
  const courseData = [
    { title: 'TypeScript', altCode: 'TS' },
    { title: 'Go', altCode: 'Go' },
    { title: 'Rust', altCode: 'Rs' },
    { title: 'Swift', altCode: 'Sw' },
    { title: 'Kotlin', altCode: 'Kt' }
  ];

  const createdCourses = await Promise.all(
    courseData.map(course => db.insert(courses).values(course).returning())
  );

  const courseIds = createdCourses.map(result => result[0].id);
  console.log(`✅ Created ${courseIds.length} courses\n`);

  // Step 2: Create 15 units (3 per language)
  console.log('📖 Creating units...');
  const unitsData = [
    // TypeScript
    { title: 'Unit 1: TypeScript Fundamentals', description: 'Learn types and interfaces', courseId: courseIds[0], order: 1 },
    { title: 'Unit 2: Advanced Types', description: 'Master generics and unions', courseId: courseIds[0], order: 2 },
    { title: 'Unit 3: OOP in TypeScript', description: 'Classes and inheritance patterns', courseId: courseIds[0], order: 3 },
    
    // Go
    { title: 'Unit 1: Go Basics', description: 'Functions and goroutines', courseId: courseIds[1], order: 1 },
    { title: 'Unit 2: Concurrency', description: 'Channels and concurrent patterns', courseId: courseIds[1], order: 2 },
    { title: 'Unit 3: Web Development', description: 'Building HTTP servers', courseId: courseIds[1], order: 3 },
    
    // Rust
    { title: 'Unit 1: Rust Fundamentals', description: 'Ownership and borrowing concepts', courseId: courseIds[2], order: 1 },
    { title: 'Unit 2: Memory Safety', description: 'Lifetimes and traits', courseId: courseIds[2], order: 2 },
    { title: 'Unit 3: Systems Programming', description: 'Unsafe code patterns', courseId: courseIds[2], order: 3 },
    
    // Swift
    { title: 'Unit 1: Swift Basics', description: 'Variables and control flow', courseId: courseIds[3], order: 1 },
    { title: 'Unit 2: OOP in Swift', description: 'Classes and protocols', courseId: courseIds[3], order: 2 },
    { title: 'Unit 3: iOS Development', description: 'Building iOS applications', courseId: courseIds[3], order: 3 },
    
    // Kotlin
    { title: 'Unit 1: Kotlin Fundamentals', description: 'Syntax and null safety', courseId: courseIds[4], order: 1 },
    { title: 'Unit 2: Functional Programming', description: 'Lambdas and extensions', courseId: courseIds[4], order: 2 },
    { title: 'Unit 3: Android Development', description: 'Building Android applications', courseId: courseIds[4], order: 3 }
  ];

  const createdUnits = await Promise.all(
    unitsData.map(unit => db.insert(units).values(unit).returning())
  );

  const unitIds = createdUnits.map(result => result[0].id);
  console.log(`✅ Created ${unitIds.length} units\n`);

  // Step 3: Create 30-45 lessons (2-3 per unit)
  console.log('✏️  Creating lessons...');
  const lessonsData = [
    // TypeScript - Unit 1
    { title: 'Lesson 1.1: Basic Types', description: 'Introduction to TypeScript basic types', unitId: unitIds[0], order: 1 },
    { title: 'Lesson 1.2: Interfaces', description: 'Defining object shapes with interfaces', unitId: unitIds[0], order: 2 },
    
    // TypeScript - Unit 2
    { title: 'Lesson 2.1: Generics', description: 'Writing generic functions and types', unitId: unitIds[1], order: 1 },
    { title: 'Lesson 2.2: Union & Intersection Types', description: 'Combining multiple types', unitId: unitIds[1], order: 2 },
    
    // TypeScript - Unit 3
    { title: 'Lesson 3.1: Classes & Inheritance', description: 'OOP in TypeScript', unitId: unitIds[2], order: 1 },
    { title: 'Lesson 3.2: Abstract Classes', description: 'Creating abstract base classes', unitId: unitIds[2], order: 2 },
    
    // Go - Unit 1
    { title: 'Lesson 1.1: Go Basics', description: 'Variables, functions, and control flow', unitId: unitIds[3], order: 1 },
    { title: 'Lesson 1.2: Goroutines', description: 'Lightweight concurrency primitives', unitId: unitIds[3], order: 2 },
    
    // Go - Unit 2
    { title: 'Lesson 2.1: Channels', description: 'Communication between goroutines', unitId: unitIds[4], order: 1 },
    { title: 'Lesson 2.2: Select Statement', description: 'Multiplexing channels', unitId: unitIds[4], order: 2 },
    
    // Go - Unit 3
    { title: 'Lesson 3.1: HTTP Basics', description: 'Building web servers with Go', unitId: unitIds[5], order: 1 },
    { title: 'Lesson 3.2: Routing & Handlers', description: 'Handling HTTP requests', unitId: unitIds[5], order: 2 },
    
    // Rust - Unit 1
    { title: 'Lesson 1.1: Ownership', description: 'Rust\'s ownership system', unitId: unitIds[6], order: 1 },
    { title: 'Lesson 1.2: Borrowing & References', description: 'Mutable and immutable borrows', unitId: unitIds[6], order: 2 },
    
    // Rust - Unit 2
    { title: 'Lesson 2.1: Lifetimes', description: 'Ensuring references are valid', unitId: unitIds[7], order: 1 },
    { title: 'Lesson 2.2: Traits', description: 'Defining shared behavior', unitId: unitIds[7], order: 2 },
    
    // Rust - Unit 3
    { title: 'Lesson 3.1: Unsafe Rust', description: 'Working with unsafe code blocks', unitId: unitIds[8], order: 1 },
    { title: 'Lesson 3.2: FFI', description: 'Calling C code from Rust', unitId: unitIds[8], order: 2 },
    
    // Swift - Unit 1
    { title: 'Lesson 1.1: Basics', description: 'Variables, constants, and types', unitId: unitIds[9], order: 1 },
    { title: 'Lesson 1.2: Control Flow', description: 'If statements, loops, and switches', unitId: unitIds[9], order: 2 },
    
    // Swift - Unit 2
    { title: 'Lesson 2.1: Classes & Structs', description: 'Object-oriented programming', unitId: unitIds[10], order: 1 },
    { title: 'Lesson 2.2: Protocols', description: 'Defining protocols and conformance', unitId: unitIds[10], order: 2 },
    
    // Swift - Unit 3
    { title: 'Lesson 3.1: UIKit Basics', description: 'Building iOS UIs', unitId: unitIds[11], order: 1 },
    { title: 'Lesson 3.2: View Controllers', description: 'Managing app screens', unitId: unitIds[11], order: 2 },
    
    // Kotlin - Unit 1
    { title: 'Lesson 1.1: Syntax & Variables', description: 'Kotlin fundamentals', unitId: unitIds[12], order: 1 },
    { title: 'Lesson 1.2: Null Safety', description: 'Handling null values safely', unitId: unitIds[12], order: 2 },
    
    // Kotlin - Unit 2
    { title: 'Lesson 2.1: Lambdas', description: 'Functional programming with lambdas', unitId: unitIds[13], order: 1 },
    { title: 'Lesson 2.2: Extension Functions', description: 'Adding functions to existing classes', unitId: unitIds[13], order: 2 },
    
    // Kotlin - Unit 3
    { title: 'Lesson 3.1: Android Basics', description: 'Building Android apps with Kotlin', unitId: unitIds[14], order: 1 },
    { title: 'Lesson 3.2: Jetpack Components', description: 'Using Android Jetpack libraries', unitId: unitIds[14], order: 2 }
  ];

  const createdLessons = await Promise.all(
    lessonsData.map(lesson => db.insert(lessons).values(lesson).returning())
  );

  console.log(`✅ Created ${createdLessons.length} lessons\n`);
  console.log('🎉 Successfully seeded 5 new programming languages!');
  console.log(`   - Courses: ${courseIds.length}`);
  console.log(`   - Units: ${unitIds.length}`);
  console.log(`   - Lessons: ${createdLessons.length}`);
}

seedLanguages().catch(err => {
  console.error('❌ Error seeding languages:', err);
  process.exit(1);
});
