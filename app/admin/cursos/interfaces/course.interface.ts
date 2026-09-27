export interface Resource {
  id: string;
  name: string;
  type: string;
  size: string | null;
  url: string;
  lessonId: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
}

export interface Question {
  id: string;
  text: string;
  quizId: string;
  options: Option[];
}

export interface Quiz {
  id: string;
  title: string;
  lessonId: string;
  questions: Question[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string | null;
  type: string;
  videoUrl?: string | null;
  order: number;
  moduleId: string;
  resources: Resource[];
  quizzes: Quiz[];
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  level: string | null;
  duration: string | null;
  lessonsCount: number;
  rating: number;
  instructor: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  features?: string[];
  modules?: CourseModule[];
}

export interface PaginationMeta {
  firstPage: number;
  lastPage: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedCourses {
  data: Course[];
  meta: PaginationMeta;
}
