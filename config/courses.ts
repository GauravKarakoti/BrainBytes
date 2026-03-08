export const courses = [
  {
    title: 'Python',
    icon: 'py',
    topic: 'Automation & APIs',
    category: 'Backend',
    tags: ['scripting', 'data', 'ai'],
  },
  {
    title: 'JavaScript',
    icon: 'js',
    topic: 'Interactive Web Apps',
    category: 'Frontend',
    tags: ['web', 'browser', 'ui'],
  },
  {
    title: 'C++',
    icon: 'cpp',
    topic: 'Modern Systems Design',
    category: 'Systems',
    tags: ['performance', 'low-level', 'gaming'],
  },
  {
    title: 'Java',
    icon: 'java',
    topic: 'Enterprise Services',
    category: 'Backend',
    tags: ['enterprise', 'oop', 'jvm'],
  },
  {
    title: 'TypeScript',
    icon: 'ts',
    topic: 'Typed Frontends',
    category: 'Frontend',
    tags: ['web', 'types', 'strict'],
  },
  {
    title: 'Go',
    icon: 'go',
    topic: 'Concurrent APIs',
    category: 'Backend',
    tags: ['cloud', 'microservices', 'concurrency'],
  },
  {
    title: 'Rust',
    icon: 'rust',
    topic: 'Memory-Safe Performance',
    category: 'Systems',
    tags: ['safety', 'wasm', 'fast'],
  },
  {
    title: 'Swift',
    icon: 'swift',
    topic: 'iOS Experiences',
    category: 'Mobile',
    tags: ['apple', 'ios', 'app'],
  },
  {
    title: 'Kotlin',
    icon: 'kotlin',
    topic: 'Android Experiences',
    category: 'Mobile',
    tags: ['android', 'app', 'jvm'],
  },
];

// Optional: Export a type so you can use it strictly in other components
export type Course = typeof courses[0];