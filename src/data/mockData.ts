import { StudentRecord, CounselorRecord, User, FeeRecord } from '../types';

export const INITIAL_USERS: (User & { passwordHash?: string; plainPassword?: string })[] = [
  {
    id: 'usr-admin-1',
    name: 'Dr. Shahzad Ahmed',
    email: 'admin@school.edu',
    plainPassword: 'admin123password',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr-counselor-1',
    name: 'Sarah Khan',
    email: 'sarah.counselor@school.edu',
    plainPassword: 'counselor123',
    role: 'counselor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    linkedProfileId: 'counselor-1',
    counselorId: 'counselor-1',
  },
  {
    id: 'usr-counselor-2',
    name: 'Tariq Mehmood',
    email: 'tariq.counselor@school.edu',
    plainPassword: 'counselor123',
    role: 'counselor',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    linkedProfileId: 'counselor-2',
    counselorId: 'counselor-2',
  },
  {
    id: 'usr-student-1',
    name: 'Ayesha Malik',
    email: 'ayesha.student@school.edu',
    plainPassword: 'student123',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    linkedProfileId: 'stu-1',
    studentRollNo: 'STU-2024-001',
    counselorId: 'counselor-1',
    counselorName: 'Sarah Khan',
  },
  {
    id: 'usr-student-2',
    name: 'Ali Raza',
    email: 'ali.student@school.edu',
    plainPassword: 'student123',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    linkedProfileId: 'stu-2',
    studentRollNo: 'STU-2024-002',
    counselorId: 'counselor-1',
    counselorName: 'Sarah Khan',
  },
  {
    id: 'usr-student-3',
    name: 'Hamza Farooq',
    email: 'hamza.student@school.edu',
    plainPassword: 'student123',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    linkedProfileId: 'stu-3',
    studentRollNo: 'STU-2024-003',
    counselorId: 'counselor-2',
    counselorName: 'Tariq Mehmood',
  },
  {
    id: 'usr-student-4',
    name: 'Zainab Bibi',
    email: 'zainab.student@school.edu',
    plainPassword: 'student123',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    linkedProfileId: 'stu-4',
    studentRollNo: 'STU-2024-004',
    counselorId: 'counselor-1',
    counselorName: 'Sarah Khan',
  },
  {
    id: 'usr-student-5',
    name: 'Bilal Hussain',
    email: 'bilal.student@school.edu',
    plainPassword: 'student123',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    linkedProfileId: 'stu-5',
    studentRollNo: 'STU-2024-005',
    counselorId: 'counselor-2',
    counselorName: 'Tariq Mehmood',
  }
];

export const INITIAL_COUNSELORS: CounselorRecord[] = [
  {
    id: 'counselor-1',
    name: 'Sarah Khan',
    email: 'sarah.counselor@school.edu',
    phone: '+92 300 1234567',
    specialization: 'Computer Science & STEM',
    assignedStudentIds: ['stu-1', 'stu-2', 'stu-4'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'counselor-2',
    name: 'Tariq Mehmood',
    email: 'tariq.counselor@school.edu',
    phone: '+92 301 9876543',
    specialization: 'Business & Management',
    assignedStudentIds: ['stu-3', 'stu-5'],
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  }
];

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'stu-1',
    notionPageId: 'notion-page-001',
    rollNo: 'STU-2024-001',
    fullName: 'Ayesha Malik',
    email: 'ayesha.student@school.edu',
    phone: '+92 321 4455667',
    course: 'Ivy League & US Top 20 Admissions',
    counselorId: 'counselor-1',
    counselorName: 'Sarah Khan',
    feeStatus: 'Paid',
    feeAmount: 1200,
    feePaid: 1200,
    dueDate: '2026-08-01',
    enrollmentDate: '2026-01-15',
    academicProgress: 88,
    attendancePercentage: 94,
    counselorNotes: [
      {
        id: 'note-1',
        authorName: 'Sarah Khan',
        date: '2026-07-28',
        note: 'Completed Common App personal statement draft. Excellent narrative on community robotics.',
      },
      {
        id: 'note-2',
        authorName: 'Sarah Khan',
        date: '2026-06-10',
        note: 'Initial strategy session completed. High potential for Stanford and MIT early action.',
      }
    ],
    applications: [
      { id: 'app-1', universityName: 'Stanford University', country: 'US', tier: 'Reach', major: 'Computer Science', status: 'Drafting Essays', deadline: '2026-11-01' },
      { id: 'app-2', universityName: 'UC Berkeley', country: 'US', tier: 'Target', major: 'EECS', status: 'Planning', deadline: '2026-11-30' },
      { id: 'app-3', universityName: 'University of Michigan', country: 'US', tier: 'Safety', major: 'Software Engineering', status: 'Submitted', deadline: '2026-10-15' },
    ],
    essays: [
      { id: 'essay-1', title: 'Common App Personal Statement', type: 'Personal Statement (Common App)', status: 'In Review', lastUpdated: '2026-08-10', counselorFeedback: 'Great hook! Expand on the robotics team leadership role in paragraph 3.' },
      { id: 'essay-2', title: 'Why Stanford Supplemental', type: 'Supplemental Essay', status: 'Drafting', lastUpdated: '2026-08-12', counselorFeedback: 'Connect your CS project directly with Stanford d.school initiatives.' },
    ],
    sessions: [
      { id: 'sess-1', topic: 'Ivy League Profile Positioning & Extracurricular Audit', counselorName: 'Sarah Khan', date: '2026-08-20', time: '04:00 PM', status: 'Scheduled', meetingLink: 'https://meet.google.com/pine-ivyleague-meet' }
    ],
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'stu-2',
    notionPageId: 'notion-page-002',
    rollNo: 'STU-2024-002',
    fullName: 'Ali Raza',
    email: 'ali.student@school.edu',
    phone: '+92 333 8877665',
    course: 'UK / UCAS Undergraduate Consulting',
    counselorId: 'counselor-1',
    counselorName: 'Sarah Khan',
    feeStatus: 'Pending',
    feeAmount: 1000,
    feePaid: 400,
    dueDate: '2026-08-15',
    enrollmentDate: '2026-02-01',
    academicProgress: 72,
    attendancePercentage: 86,
    counselorNotes: [
      {
        id: 'note-3',
        authorName: 'Sarah Khan',
        date: '2026-07-20',
        note: 'Submitted UCAS personal statement draft. Advised on fee balance remaining ($600).',
      }
    ],
    applications: [
      { id: 'app-4', universityName: 'University of Oxford', country: 'UK', tier: 'Reach', major: 'Economics & Management', status: 'Drafting Essays', deadline: '2026-10-15' },
      { id: 'app-5', universityName: 'LSE (London School of Economics)', country: 'UK', tier: 'Target', major: 'Finance', status: 'Planning', deadline: '2026-01-25' },
    ],
    essays: [
      { id: 'essay-3', title: 'UCAS Personal Statement', type: 'Personal Statement (Common App)', status: 'Revision Needed', lastUpdated: '2026-08-05', counselorFeedback: 'Needs 80% academic focus and 20% extracurriculars for UK universities.' },
    ],
    sessions: [
      { id: 'sess-2', topic: 'UCAS Course Selection & LOR Guidance', counselorName: 'Sarah Khan', date: '2026-08-22', time: '02:00 PM', status: 'Scheduled', meetingLink: 'https://meet.google.com/pine-ucas-meet' }
    ],
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'stu-3',
    notionPageId: 'notion-page-003',
    rollNo: 'STU-2024-003',
    fullName: 'Hamza Farooq',
    email: 'hamza.student@school.edu',
    phone: '+92 302 5544332',
    course: 'Master’s & Graduate Admissions',
    counselorId: 'counselor-2',
    counselorName: 'Tariq Mehmood',
    feeStatus: 'Overdue',
    feeAmount: 1500,
    feePaid: 500,
    dueDate: '2026-07-10',
    enrollmentDate: '2026-01-20',
    academicProgress: 65,
    attendancePercentage: 78,
    counselorNotes: [
      {
        id: 'note-4',
        authorName: 'Tariq Mehmood',
        date: '2026-07-15',
        note: 'Sent formal reminder regarding overdue consulting fees ($1000 outstanding).',
      }
    ],
    applications: [
      { id: 'app-6', universityName: 'Carnegie Mellon University', country: 'US', tier: 'Reach', major: 'MS in Machine Learning', status: 'Planning', deadline: '2026-12-01' },
      { id: 'app-7', universityName: 'Georgia Tech', country: 'US', tier: 'Target', major: 'MS in Computer Science', status: 'Planning', deadline: '2026-12-15' },
    ],
    essays: [
      { id: 'essay-4', title: 'Statement of Purpose (SOP)', type: 'SOP (Master\'s)', status: 'Drafting', lastUpdated: '2026-07-28', counselorFeedback: 'Outline your undergraduate thesis research methodology clearly.' },
    ],
    sessions: [
      { id: 'sess-3', topic: 'GRE Score Strategy & SOP Brainstorming', counselorName: 'Tariq Mehmood', date: '2026-08-25', time: '05:00 PM', status: 'Scheduled', meetingLink: 'https://meet.google.com/pine-masters-meet' }
    ],
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'stu-4',
    notionPageId: 'notion-page-004',
    rollNo: 'STU-2024-004',
    fullName: 'Zainab Bibi',
    email: 'zainab.student@school.edu',
    phone: '+92 312 9988776',
    course: 'Ivy League & US Top 20 Admissions',
    counselorId: 'counselor-1',
    counselorName: 'Sarah Khan',
    feeStatus: 'Paid',
    feeAmount: 1200,
    feePaid: 1200,
    dueDate: '2026-08-01',
    enrollmentDate: '2026-03-01',
    academicProgress: 91,
    attendancePercentage: 98,
    counselorNotes: [
      {
        id: 'note-5',
        authorName: 'Sarah Khan',
        date: '2026-07-30',
        note: 'Consistent top performer in college application milestone reviews.',
      }
    ],
    applications: [
      { id: 'app-8', universityName: 'Harvard University', country: 'US', tier: 'Reach', major: 'Biomedical Engineering', status: 'Drafting Essays', deadline: '2026-11-01' },
      { id: 'app-9', universityName: 'Johns Hopkins University', country: 'US', tier: 'Target', major: 'Pre-Med / Neuroscience', status: 'Submitted', deadline: '2026-11-15' },
    ],
    essays: [
      { id: 'essay-5', title: 'Harvard Supplemental Essay', type: 'Supplemental Essay', status: 'Approved', lastUpdated: '2026-08-02', counselorFeedback: 'Exceptional articulation of your medical research internship.' },
    ],
    sessions: [
      { id: 'sess-4', topic: 'Interview Prep & Mock Alumni Session', counselorName: 'Sarah Khan', date: '2026-08-19', time: '03:00 PM', status: 'Scheduled', meetingLink: 'https://meet.google.com/pine-harvard-prep' }
    ],
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'stu-5',
    notionPageId: 'notion-page-005',
    rollNo: 'STU-2024-005',
    fullName: 'Bilal Hussain',
    email: 'bilal.student@school.edu',
    phone: '+92 345 1122334',
    course: 'Standardized Tests (SAT / ACT / IELTS)',
    counselorId: 'counselor-2',
    counselorName: 'Tariq Mehmood',
    feeStatus: 'Paid',
    feeAmount: 1100,
    feePaid: 1100,
    dueDate: '2026-08-01',
    enrollmentDate: '2026-02-15',
    academicProgress: 80,
    attendancePercentage: 90,
    counselorNotes: [
      {
        id: 'note-6',
        authorName: 'Tariq Mehmood',
        date: '2026-07-25',
        note: 'Scored 1520 on official SAT diagnostic test.',
      }
    ],
    applications: [
      { id: 'app-10', universityName: 'University of Toronto', country: 'Canada', tier: 'Target', major: 'Computer Engineering', status: 'Planning', deadline: '2026-01-15' },
    ],
    essays: [
      { id: 'essay-6', title: 'SAT Essay & Practice Diagnostics', type: 'Resume / CV', status: 'Approved', lastUpdated: '2026-08-08', counselorFeedback: 'Ready for official SAT test date.' },
    ],
    sessions: [
      { id: 'sess-5', topic: 'SAT Math Advanced Problem Solving', counselorName: 'Tariq Mehmood', date: '2026-08-21', time: '11:00 AM', status: 'Scheduled', meetingLink: 'https://meet.google.com/pine-sat-math' }
    ],
    lastSyncedAt: new Date().toISOString(),
  }
];

export const INITIAL_FEES: FeeRecord[] = INITIAL_STUDENTS.map((s) => ({
  id: `fee-${s.id}`,
  studentId: s.id,
  studentRollNo: s.rollNo,
  studentName: s.fullName,
  course: s.course,
  totalAmount: s.feeAmount,
  paidAmount: s.feePaid,
  balance: s.feeAmount - s.feePaid,
  status: s.feeStatus,
  dueDate: s.dueDate,
  lastPaymentDate: s.feePaid > 0 ? '2026-07-01' : undefined,
}));
