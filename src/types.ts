export type UserRole = 'admin' | 'counselor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  counselorId?: string; // For student: assigned counselor ID
  counselorName?: string;
  studentRollNo?: string; // For student: roll number to link to student record
}

export interface StudentRecord {
  id: string;
  notionPageId?: string;
  rollNo: string;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  counselorId: string;
  counselorName: string;
  feeStatus: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  feeAmount: number;
  feePaid: number;
  dueDate: string;
  enrollmentDate: string;
  counselorNotes: {
    id: string;
    authorName: string;
    date: string;
    note: string;
  }[];
  lastSyncedAt: string;
  academicProgress: number; // Percentage 0-100
  attendancePercentage: number;
}

export interface CounselorRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  assignedStudentIds: string[];
  avatar: string;
}

export interface NotionConfig {
  apiKey: string;
  studentsDatabaseId: string;
  isConnected: boolean;
  lastSyncTime: string | null;
  mode: 'live' | 'mock';
}

export interface SystemStats {
  totalStudents: number;
  totalCounselors: number;
  totalFeesCollected: number;
  totalPendingFees: number;
  paidStudentsCount: number;
  pendingStudentsCount: number;
}
