import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'

import * as schema from '@/db/schema'
import { QUESTS } from '@/config/quests'

// Support both Neon (PostgreSQL) and local SQLite for testing
let db: any

const initializeDatabase = async () => {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL is not set. Please create a .env file with DATABASE_URL.'
    )
  }

  // Check if using SQLite (local file)
  if (dbUrl.startsWith('file:')) {
    // For SQLite support during development
    console.log('📦 Using SQLite (local development)')
    // In production, use the Neon database
    // For now, we'll skip SQLite support and require Neon
    throw new Error(
      'SQLite not supported. Please use a Neon PostgreSQL database.'
    )
  } else {
    // Use Neon PostgreSQL
    const sqlClient = neon(dbUrl)
    db = drizzle(sqlClient, { schema, logger: true })
  }

  return db
}

const main = async () => {
  try {
    const database = await initializeDatabase()

    console.log('🚧 [DB]: Seeding database...')

    console.log('Seeding courses...')
    await database.insert(schema.courses).values([
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
      
    ]).onConflictDoUpdate({
      target: schema.courses.id,
      set: {
        title: sql`excluded.title`,
        altCode: sql`excluded.alt_code`,
      },
    })

    await database.insert(schema.units).values([
      // Python Units
      {
        id: 1,
        title: 'Unit 1: Arrays & Strings',
        description: 'Master fundamental data structures: arrays and strings.',
        courseId: 1,
        order: 1,
      },
      {
        id: 2,
        title: 'Unit 2: Linked Lists',
        description: 'Learn about linked lists and their operations.',
        courseId: 1,
        order: 2,
      },
      {
        id: 3,
        title: 'Unit 3: Stacks & Queues',
        description: 'Understand LIFO and FIFO data structures.',
        courseId: 1,
        order: 3,
      },
      
      // JavaScript Units
      {
        id: 4,
        title: 'Unit 1: JavaScript Basics',
        description: 'Learn the fundamentals of JavaScript programming.',
        courseId: 2,
        order: 1,
      },
      {
        id: 5,
        title: 'Unit 2: Async JavaScript',
        description: 'Master asynchronous programming in JavaScript.',
        courseId: 2,
        order: 2,
      },
      // C++ Units
      {
        id: 6,
        title: 'Unit 1: C++ Fundamentals',
        description: 'Learn C++ basics and memory management.',
        courseId: 3,
        order: 1,
      },
      {
        id: 7,
        title: 'Unit 2: STL & Algorithms',
        description: 'Master the Standard Template Library.',
        courseId: 3,
        order: 2,
      },
      // Java Units
      {
        id: 8,
        title: 'Unit 1: Java Basics',
        description: 'Learn Java fundamentals and OOP concepts.',
        courseId: 4,
        order: 1,
      },
      {
        id: 9,
        title: 'Unit 2: Collections Framework',
        description: 'Master Java collections and data structures.',
        courseId: 4,
        order: 2,
      },
      {
        id: 10,
        title: 'Unit 3: Concurrency & Multithreading',
        description: 'Learn Java concurrency and multithreading concepts.',
        courseId: 4,
        order: 3,
      },
    ]).onConflictDoUpdate({
      target: schema.units.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        courseId: sql`excluded.course_id`,
        order: sql`excluded."order"`,
      },
    })

    console.log('Seeding lessons...')
    await database.insert(schema.lessons).values([
      // Python - Unit 1
      {
        id: 1,
        unitId: 1,
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
        unitId: 1,
        order: 3,
        title: 'Sliding Window',
      },
      // Python - Unit 2
      {
        id: 4,
        unitId: 2,
        order: 1,
        title: 'Singly Linked Lists',
      },
      {
        id: 5,
        unitId: 2,
        order: 2,
        title: 'Doubly Linked Lists',
      },
      {
        id: 6,
        unitId: 2,
        order: 3,
        title: 'Linked List Operations',
      },
      // Python - Unit 3
      {
        id: 7,
        unitId: 3,
        order: 1,
        title: 'Stack Implementation',
      },
      {
        id: 8,
        unitId: 3,
        order: 2,
        title: 'Queue Implementation',
      },
      // JavaScript - Unit 1
      {
        id: 9,
        unitId: 4,
        order: 1,
        title: 'Variables & Data Types',
      },
      {
        id: 10,
        unitId: 4,
        order: 2,
        title: 'Functions & Scope',
      },
      {
        id: 11,
        unitId: 4,
        order: 3,
        title: 'Objects & Arrays',
      },
      // JavaScript - Unit 2
      {
        id: 12,
        unitId: 5,
        order: 1,
        title: 'Promises',
      },
      {
        id: 13,
        unitId: 5,
        order: 2,
        title: 'Async/Await',
      },
      {
        id: 14,
        unitId: 5,
        order: 3,
        title: 'Event Loop',
      },
      // C++ - Unit 1
      {
        id: 15,
        unitId: 6,
        order: 1,
        title: 'Pointers & References',
      },
      {
        id: 16,
        unitId: 6,
        order: 2,
        title: 'Memory Management',
      },
      {
        id: 17,
        unitId: 6,
        order: 3,
        title: 'Classes & Objects',
      },
      // C++ - Unit 2
      {
        id: 18,
        unitId: 7,
        order: 1,
        title: 'Vectors & Arrays',
      },
      {
        id: 19,
        unitId: 7,
        order: 2,
        title: 'Maps & Sets',
      },
      {
        id: 20,
        unitId: 7,
        order: 3,
        title: 'Iterators',
      },
      // Java - Unit 1
      {
        id: 21,
        unitId: 8,
        order: 1,
        title: 'Classes & Inheritance',
      },
      {
        id: 22,
        unitId: 8,
        order: 2,
        title: 'Interfaces',
      },
      {
        id: 23,
        unitId: 8,
        order: 3,
        title: 'Exception Handling',
      },
      // Java - Unit 2
      {
        id: 24,
        unitId: 9,
        order: 1,
        title: 'ArrayList & LinkedList',
      },
      {
        id: 25,
        unitId: 9,
        order: 2,
        title: 'HashMap & TreeMap',
      },
      {
        id: 26,
        unitId: 9,
        order: 3,
        title: 'Streams & Lambda',
      },
      // Java - Unit 3
      {
        id: 27,
        unitId: 10,
        order: 1,
        title: 'Threads & Runnable',
      },
      {
        id: 28,
        unitId: 10,
        order: 2,
        title: 'Synchronization',
      },
      {
        id: 29,
        unitId: 10,
        order: 3,
        title: 'Concurrent Collections',
      },
    ]).onConflictDoUpdate({
      target: schema.lessons.id,
      set: {
        unitId: sql`excluded.unit_id`,
        order: sql`excluded."order"`,
        title: sql`excluded.title`,
      },
    })

    console.log('Seeding challenges...')
    const reverseStringTestCases = [
      { input: 'hello', output: 'olleh' },
      { input: 'world', output: 'dlrow' },
      { input: 'BrainBytes', output: 'setyBniarB' },
      { input: 'a', output: 'a' },
    ]

    const pythonStub = `def reverse_string(s):
  # Your code here
  return ""

# Read input from stdin
try:
  s_input = input()
  # Call the function and print the result
  print(reverse_string(s_input))
except EOFError:
  pass
`

    const jsStub = `function reverseString(s) {
  // Your code here
  return "";
}

// Read input from stdin
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let inputData = '';
rl.on('line', function(line){
  inputData += line;
});

rl.on('close', function() {
  // Call the function and print the result
  console.log(reverseString(inputData));
});
`

    const javaStub = `import java.util.Scanner;

class Solution {
    public String reverseString(String s) {
        // Your code here
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String s = "";
        if (sc.hasNextLine()) {
            s = sc.nextLine();
        }
        Solution sol = new Solution();
        System.out.println(sol.reverseString(s));
        sc.close();
    }
}`

    const cppStub = `#include <iostream>
#include <string>
#include <algorithm>

std::string reverseString(std::string s) {
  // Your code here
  return "";
}

int main() {
    std::string s;
    std::getline(std::cin, s);
    std::cout << reverseString(s) << std::endl;
    return 0;
}`

    console.log('Seeding challenges...')
    await database.insert(schema.challenges).values([
      // Python - Lesson 1: Array Basics
      {
        id: 1,
        lessonId: 1,
        type: 'SELECT',
        order: 1,
        question: 'What is the time complexity of accessing an element in an array by index?',
      },
      {
        id: 2,
        lessonId: 1,
        type: 'SELECT',
        order: 2,
        question: 'Which operation on an array has O(n) time complexity?',
      },
      // Python - Lesson 2: Two Pointers
      {
        id: 3,
        lessonId: 2,
        type: 'SELECT',
        order: 1,
        question: 'What is the two-pointer technique primarily used for?',
      },
      {
        id: 4,
        lessonId: 2,
        type: 'SELECT',
        order: 2,
        question: 'In which scenario is the two-pointer technique most efficient?',
      },
      // JavaScript - Lesson 9: Variables & Data Types
      {
        id: 5,
        lessonId: 9,
        type: 'SELECT',
        order: 1,
        question: 'Which keyword is used to declare a block-scoped variable in JavaScript?',
      },
      {
        id: 6,
        lessonId: 9,
        type: 'SELECT',
        order: 2,
        question: 'What is the result of typeof null in JavaScript?',
      },
      // JavaScript - Lesson 10: Functions & Scope
      {
        id: 7,
        lessonId: 10,
        type: 'SELECT',
        order: 1,
        question: 'What is a closure in JavaScript?',
      },
      {
        id: 8,
        lessonId: 10,
        type: 'SELECT',
        order: 2,
        question: 'Which of these correctly defines an arrow function?',
      },
      // C++ - Lesson 15: Pointers & References
      {
        id: 9,
        lessonId: 15,
        type: 'SELECT',
        order: 1,
        question: 'What does the * operator do when used with a pointer?',
      },
      {
        id: 10,
        lessonId: 15,
        type: 'SELECT',
        order: 2,
        question: 'What is the difference between a pointer and a reference in C++?',
      },
      // C++ - Lesson 16: Memory Management
      {
        id: 11,
        lessonId: 16,
        type: 'SELECT',
        order: 1,
        question: 'Which operator is used to allocate memory dynamically in C++?',
      },
      {
        id: 12,
        lessonId: 16,
        type: 'SELECT',
        order: 2,
        question: 'What happens if you delete a pointer twice?',
      },
      // Java - Lesson 21: Classes & Inheritance
      {
        id: 13,
        lessonId: 21,
        type: 'SELECT',
        order: 1,
        question: 'Which keyword is used to inherit a class in Java?',
      },
      {
        id: 14,
        lessonId: 21,
        type: 'SELECT',
        order: 2,
        question: 'Can a class in Java inherit from multiple classes?',
      },
      // Java - Lesson 22: Interfaces
      {
        id: 15,
        lessonId: 22,
        type: 'SELECT',
        order: 1,
        question: 'What keyword is used to implement an interface in Java?',
      },
      {
        id: 16,
        lessonId: 22,
        type: 'SELECT',
        order: 2,
        question: 'Can an interface have constructors?',
      },
      // Java - Lesson 27: Threads & Runnable
      {
        id: 21,
        lessonId: 27,
        type: 'SELECT',
        order: 1,
        question: 'Which interface should a class implement to be executed by a thread?',
      },
      {
        id: 22,
        lessonId: 27,
        type: 'SELECT',
        order: 2,
        question: 'Which method is used to start a thread\'s execution?',
      },
      // Java - Lesson 28: Synchronization
      {
        id: 23,
        lessonId: 28,
        type: 'SELECT',
        order: 1,
        question: 'Which keyword is used to synchronize a method in Java?',
      },
      {
        id: 24,
        lessonId: 28,
        type: 'SELECT',
        order: 2,
        question: 'What does synchronization prevent in multithreaded programs?',
      },
      // Java - Lesson 29: Concurrent Collections
      {
        id: 25,
        lessonId: 29,
        type: 'SELECT',
        order: 1,
        question: 'Which package contains thread-safe collections in Java?',
      },
      {
        id: 26,
        lessonId: 29,
        type: 'SELECT',
        order: 2,
        question: 'What is the advantage of ConcurrentHashMap over synchronized HashMap?',
      },
      // CODE Challenges
      {
        id: 17,
        lessonId: 23,
        type: 'CODE',
        order: 1,
        question: 'Python',
        problemDescription: 'Given an input string, write a Python function that returns the string reversed. For example, if the input is "hello", the output should be "olleh".',
        stubCodePy: pythonStub,
        stubCodeJs: jsStub,
        stubCodeJava: javaStub,
        stubCodeCpp: cppStub,
        testCases: reverseStringTestCases,
      },
      {
        id: 18,
        lessonId: 24,
        type: 'CODE',
        order: 1,
        question: 'C++',
        problemDescription: 'Given an input string, write a C++ function that returns the string reversed. For example, if the input is "hello", the output should be "olleh".', 
        stubCodePy: pythonStub,
        stubCodeJs: jsStub,
        stubCodeJava: javaStub,
        stubCodeCpp: cppStub,
        testCases: reverseStringTestCases,
      },
        {
        id: 19,
        lessonId: 25,
        type: 'CODE',
        order: 1,
        question: 'Java',
        problemDescription: 'Given an input string, write a Java function that returns the string reversed. For example, if the input is "hello", the output should be "olleh".',
        stubCodePy: pythonStub,
        stubCodeJs: jsStub,
        stubCodeJava: javaStub,
        stubCodeCpp: cppStub,
        testCases: reverseStringTestCases,
      },
      {
        id: 20,
        lessonId: 26,
        type: 'CODE',
        order: 1,
        question: 'JavaScript',
        problemDescription: 'Given an input string, write a JavaScript function that returns the string reversed. For example, if the input is "hello", the output should be "olleh".',
        stubCodePy: pythonStub,
        stubCodeJs: jsStub,
        stubCodeJava: javaStub,
        stubCodeCpp: cppStub,
        testCases: reverseStringTestCases,
      },
            // New Languages MCQs
      {
        id: 27,
        lessonId: 9,
        type: 'SELECT',
        order: 3,
        question: 'Which keyword is used to declare a constant in Swift?',
      },
      {
        id: 28,
        lessonId: 9,
        type: 'SELECT',
        order: 4,
        question: 'Which TypeScript feature allows defining variable types?',
      },
      {
        id: 29,
        lessonId: 9,
        type: 'SELECT',
        order: 5,
        question: 'Which keyword is used to define a variable in Rust?',
      },
      {
        id: 30,
        lessonId: 9,
        type: 'SELECT',
        order: 6,
        question: 'Which keyword is used to declare a function in Go?',
      },
      {
        id: 31,
        lessonId: 9,
        type: 'SELECT',
        order: 7,
        question: 'Which keyword is used to declare a variable in Kotlin?',
      },

    ]).onConflictDoUpdate({
      target: schema.challenges.id,
      set: {
        lessonId: sql`excluded.lesson_id`,
        type: sql`excluded.type`,
        order: sql`excluded."order"`,
        question: sql`excluded.question`,
        problemDescription: sql`excluded.problem_description`,
        stubCodePy: sql`excluded.stub_code_py`,
        stubCodeJs: sql`excluded.stub_code_js`,
        stubCodeJava: sql`excluded.stub_code_java`,
        stubCodeCpp: sql`excluded.stub_code_cpp`,
        testCases: sql`excluded.test_cases`,
      },
    })

    console.log('Seeding challenge options...')
    await database.insert(schema.challengeOptions).values([
      // Challenge 1: Array access complexity
      {
        id: 1,
        challengeId: 1,
        option: 'O(1)',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 2,
        challengeId: 1,
        option: 'O(n)',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 3,
        challengeId: 1,
        option: 'O(log n)',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 2: Array O(n) operation
      {
        id: 4,
        challengeId: 2,
        option: 'Inserting at the end',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 5,
        challengeId: 2,
        option: 'Finding an element',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 6,
        challengeId: 2,
        option: 'Accessing by index',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 3: Two-pointer technique
      {
        id: 7,
        challengeId: 3,
        option: 'Optimizing space complexity',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 8,
        challengeId: 3,
        option: 'Sorting arrays',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 9,
        challengeId: 3,
        option: 'Hashing elements',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 4: Two-pointer efficiency
      {
        id: 10,
        challengeId: 4,
        option: 'Searching in sorted arrays',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 11,
        challengeId: 4,
        option: 'Random access',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 12,
        challengeId: 4,
        option: 'Hash table lookups',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 5: JS let keyword
      {
        id: 13,
        challengeId: 5,
        option: 'let',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 14,
        challengeId: 5,
        option: 'var',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 15,
        challengeId: 5,
        option: 'global',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 6: typeof null
      {
        id: 16,
        challengeId: 6,
        option: 'object',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 17,
        challengeId: 6,
        option: 'null',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 18,
        challengeId: 6,
        option: 'undefined',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 7: Closure
      {
        id: 19,
        challengeId: 7,
        option: 'A function with access to outer scope',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 20,
        challengeId: 7,
        option: 'A closed function',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 21,
        challengeId: 7,
        option: 'A private function',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 8: Arrow function
      {
        id: 22,
        challengeId: 8,
        option: '(x) => x * 2',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 23,
        challengeId: 8,
        option: 'function => (x)',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 24,
        challengeId: 8,
        option: 'x -> x * 2',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 9: Pointer dereference
      {
        id: 25,
        challengeId: 9,
        option: 'Dereferences the pointer',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 26,
        challengeId: 9,
        option: 'Gets the address',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 27,
        challengeId: 9,
        option: 'Multiplies the value',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 10: Pointer vs reference
      {
        id: 28,
        challengeId: 10,
        option: 'Pointers can be null, references cannot',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 29,
        challengeId: 10,
        option: 'They are the same',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 30,
        challengeId: 10,
        option: 'References use * operator',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 11: Dynamic memory allocation
      {
        id: 31,
        challengeId: 11,
        option: 'new',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 32,
        challengeId: 11,
        option: 'malloc',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 33,
        challengeId: 11,
        option: 'alloc',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 12: Double delete
      {
        id: 34,
        challengeId: 12,
        option: 'Undefined behavior/crash',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 35,
        challengeId: 12,
        option: 'Nothing happens',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 36,
        challengeId: 12,
        option: 'Frees memory twice',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 13: Java inheritance
      {
        id: 37,
        challengeId: 13,
        option: 'extends',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 38,
        challengeId: 13,
        option: 'implements',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 39,
        challengeId: 13,
        option: 'inherits',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 14: Multiple inheritance
      {
        id: 40,
        challengeId: 14,
        option: 'No',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 41,
        challengeId: 14,
        option: 'Yes',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 42,
        challengeId: 14,
        option: 'Only with interfaces',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 15: Interface implementation
      {
        id: 43,
        challengeId: 15,
        option: 'implements',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 44,
        challengeId: 15,
        option: 'extends',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 45,
        challengeId: 15,
        option: 'uses',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 16: Interface constructors
      {
        id: 46,
        challengeId: 16,
        option: 'No',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 47,
        challengeId: 16,
        option: 'Yes',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 48,
        challengeId: 16,
        option: 'Only private ones',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 21: Runnable interface
      {
        id: 49,
        challengeId: 21,
        option: 'Runnable',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 50,
        challengeId: 21,
        option: 'Thread',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 51,
        challengeId: 21,
        option: 'Callable',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 22: Thread start method
      {
        id: 52,
        challengeId: 22,
        option: 'run()',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 53,
        challengeId: 22,
        option: 'start()',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 54,
        challengeId: 22,
        option: 'execute()',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 23: Synchronization keyword
      {
        id: 55,
        challengeId: 23,
        option: 'synchronized',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 56,
        challengeId: 23,
        option: 'volatile',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 57,
        challengeId: 23,
        option: 'static',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 24: Synchronization prevents
      {
        id: 58,
        challengeId: 24,
        option: 'Race conditions',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 59,
        challengeId: 24,
        option: 'Memory leaks',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 60,
        challengeId: 24,
        option: 'Null pointer exceptions',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 25: Thread-safe collections package
      {
        id: 61,
        challengeId: 25,
        option: 'java.util.concurrent',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 62,
        challengeId: 25,
        option: 'java.util',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 63,
        challengeId: 25,
        option: 'java.lang',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      // Challenge 26: ConcurrentHashMap advantage
      {
        id: 64,
        challengeId: 26,
        option: 'Better performance under high concurrency',
        correct: true,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 65,
        challengeId: 26,
        option: 'Allows null keys and values',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
      {
        id: 66,
        challengeId: 26,
        option: 'Maintains insertion order',
        correct: false,
        imageSrc: null,
        audioSrc: null,
      },
            // Challenge 27: Swift constant
      { id: 67, challengeId: 27, option: 'let', correct: true, imageSrc: null, audioSrc: null },
      { id: 68, challengeId: 27, option: 'var', correct: false, imageSrc: null, audioSrc: null },
      { id: 69, challengeId: 27, option: 'const', correct: false, imageSrc: null, audioSrc: null },
      { id: 70, challengeId: 27, option: 'static', correct: false, imageSrc: null, audioSrc: null },

      // Challenge 28: TypeScript typing
      { id: 71, challengeId: 28, option: 'Type annotations', correct: true, imageSrc: null, audioSrc: null },
      { id: 72, challengeId: 28, option: 'Hoisting', correct: false, imageSrc: null, audioSrc: null },
      { id: 73, challengeId: 28, option: 'Closures', correct: false, imageSrc: null, audioSrc: null },
      { id: 74, challengeId: 28, option: 'Promises', correct: false, imageSrc: null, audioSrc: null },

      // Challenge 29: Rust variable
      { id: 75, challengeId: 29, option: 'let', correct: true, imageSrc: null, audioSrc: null },
      { id: 76, challengeId: 29, option: 'var', correct: false, imageSrc: null, audioSrc: null },
      { id: 77, challengeId: 29, option: 'mut', correct: false, imageSrc: null, audioSrc: null },
      { id: 78, challengeId: 29, option: 'define', correct: false, imageSrc: null, audioSrc: null },

      // Challenge 30: Go function
      { id: 79, challengeId: 30, option: 'func', correct: true, imageSrc: null, audioSrc: null },
      { id: 80, challengeId: 30, option: 'function', correct: false, imageSrc: null, audioSrc: null },
      { id: 81, challengeId: 30, option: 'def', correct: false, imageSrc: null, audioSrc: null },
      { id: 82, challengeId: 30, option: 'fn', correct: false, imageSrc: null, audioSrc: null },

      // Challenge 31: Kotlin variable
      { id: 83, challengeId: 31, option: 'val', correct: true, imageSrc: null, audioSrc: null },
      { id: 84, challengeId: 31, option: 'var', correct: false, imageSrc: null, audioSrc: null },
      { id: 85, challengeId: 31, option: 'let', correct: false, imageSrc: null, audioSrc: null },
      { id: 86, challengeId: 31, option: 'const', correct: false, imageSrc: null, audioSrc: null },

    ]).onConflictDoUpdate({
      target: schema.challengeOptions.id,
      set: {
        challengeId: sql`excluded.challenge_id`,
        option: sql`excluded.option`,
        correct: sql`excluded.correct`,
        imageSrc: sql`excluded.image_src`,
        audioSrc: sql`excluded.audio_src`,
      },
    })

    console.log('Seeding quests...')
    const questsData = QUESTS.map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      icon: quest.icon,
      target: quest.target,
      rewardPoints: quest.reward.points,
      rewardGems: quest.reward.gems,
      type: quest.type,
    }))

    await database.insert(schema.quests).values(questsData).onConflictDoUpdate({
      target: schema.quests.id,
      set: {
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        icon: sql`excluded.icon`,
        target: sql`excluded.target`,
        rewardPoints: sql`excluded.reward_points`,
        rewardGems: sql`excluded.reward_gems`,
        type: sql`excluded.type`,
      },
    })

    console.log('🔄 Syncing sequences...')
    // This tells Postgres: "Look at the highest ID in the table, and set the counter to that number."
    await database.execute(sql`SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses))`)
    await database.execute(sql`SELECT setval('units_id_seq', (SELECT MAX(id) FROM units))`)
    await database.execute(sql`SELECT setval('lessons_id_seq', (SELECT MAX(id) FROM lessons))`)
    await database.execute(sql`SELECT setval('challenges_id_seq', (SELECT MAX(id) FROM challenges))`)
    await database.execute(sql`SELECT setval('challenge_options_id_seq', (SELECT MAX(id) FROM challenge_options))`)
    await database.execute(sql`SELECT setval('quests_id_seq', (SELECT MAX(id) FROM quests))`)

    console.log('✅ [DB]: Seeded 100%!')
  } catch (error) {
    console.error(error)
    throw new Error('❌ [DB]: Failed to seed database.')
  }
}

main()