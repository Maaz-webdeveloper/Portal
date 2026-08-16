export type UserRole = 'admin' | 'counselor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  linkedProfileId?: string; // Relation to Counselors or Students DB
  counselorId?: string; // For counselor/student
  counselorName?: string;
  studentRollNo?: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface CollegeApplication {
  id: string;
  universityName: string;
  country: string; // 'US' | 'UK' | 'Canada' | 'Europe' | 'Pakistan'
  tier: 'Reach' | 'Target' | 'Safety';
  major: string;
  status: 'Planning' | 'Drafting Essays' | 'Submitted' | 'Interview' | 'Accepted' | 'Waitlisted';
  deadline: string;
}

export interface EssayReview {
  id: string;
  title: string;
  type: 'Personal Statement (Common App)' | 'Supplemental Essay' | 'SOP (Master\'s)' | 'Resume / CV';
  status: 'Drafting' | 'In Review' | 'Revision Needed' | 'Approved';
  lastUpdated: string;
  counselorFeedback?: string;
}

export interface MentorSession {
  id: string;
  topic: string;
  counselorName: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  meetingLink: string;
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
  applications?: CollegeApplication[];
  essays?: EssayReview[];
  sessions?: MentorSession[];
  lastSyncedAt: string;
  academicProgress: number; // 0-100%
  attendancePercentage: number; // 0-100%
}

export interface CounselorRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  assignedStudentIds: string[];
  avatar?: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  studentRollNo: string;
  studentName: string;
  course: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Partial';
  dueDate: string;
  lastPaymentDate?: string;
}

export interface NotionConfig {
  apiKey: string;
  usersDatabaseId: string;
  studentsDatabaseId: string;
  counselorsDatabaseId: string;
  feesDatabaseId: string;
  isConnected: boolean;
  lastSyncTime: string | null;
  mode: 'live' | 'mock';
}

export interface SystemSettings {
  portalName: string;
  institutionName: string;
  academicTerm: string;
  supportEmail: string;
  currencySymbol: string;
  availableCourses: string[];
  allowStudentFeeDownload: boolean;
  lastUpdated: string;
}
