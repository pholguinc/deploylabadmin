export interface ReportSummary {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  totalCertificates: number;
  totalAttempts: number;
  passedAttempts: number;
  passRate: number;
}

export interface CourseReportItem {
  id: string;
  title: string;
  category: string;
  level: string;
  instructor: string;
  enrolled: number;
  completed: number;
  completionRate: number;
  avgProgress: number;
  certificatesIssued: number;
  avgRating: number;
  totalReviews: number;
  isActive: boolean;
}

export interface ExamReportItem {
  id: string;
  title: string;
  courseId: string;
  courseTitle: string;
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  passRate: number;
  avgScore: number;
}

export interface CertificateReportItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  courseCategory?: string;
  score: number;
  issuedAt: string;
}

export interface StudentProgressReportItem {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  progress: number;
  status: string;
  enrolledAt: string;
  updatedAt: string;
}
