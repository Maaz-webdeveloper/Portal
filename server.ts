import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Client } from '@notionhq/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { INITIAL_STUDENTS, INITIAL_COUNSELORS, INITIAL_USERS, INITIAL_FEES } from './src/data/mockData';
import { StudentRecord, NotionConfig, FeeRecord, User } from './src/types';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'portal-jwt-secret-notion-rbac-2026-superkey';

app.use(express.json());

// In-memory data store for live & mock sync
let studentsStore: StudentRecord[] = [...INITIAL_STUDENTS];
let counselorsStore = [...INITIAL_COUNSELORS];
let usersStore = INITIAL_USERS.map((u) => ({
  ...u,
  passwordHash: bcrypt.hashSync(u.plainPassword || 'password123', 8),
}));
let feesStore: FeeRecord[] = [...INITIAL_FEES];

let notionConfig: NotionConfig = {
  apiKey: process.env.NOTION_API_KEY || '',
  usersDatabaseId: process.env.NOTION_USERS_DATABASE_ID || '',
  studentsDatabaseId: process.env.NOTION_STUDENTS_DATABASE_ID || '',
  counselorsDatabaseId: process.env.NOTION_COUNSELORS_DATABASE_ID || '',
  feesDatabaseId: process.env.NOTION_FEES_DATABASE_ID || '',
  isConnected: false,
  lastSyncTime: null,
  mode: process.env.NOTION_API_KEY ? 'live' : 'mock',
};

// Test Notion Connection helper
async function checkNotionConnection(apiKey: string, databaseId: string): Promise<boolean> {
  if (!apiKey || !databaseId) return false;
  try {
    const notion = new Client({ auth: apiKey }) as any;
    await notion.databases.retrieve({ database_id: databaseId });
    return true;
  } catch (error) {
    console.error('Notion Connection Error:', error);
    return false;
  }
}

// Initial connection test if env vars present
if (notionConfig.apiKey && notionConfig.studentsDatabaseId) {
  checkNotionConnection(notionConfig.apiKey, notionConfig.studentsDatabaseId).then((connected) => {
    notionConfig.isConnected = connected;
    if (connected) {
      notionConfig.lastSyncTime = new Date().toISOString();
      console.log('Successfully connected to Notion API!');
    }
  });
}

// ==================== AUTH & RBAC MIDDLEWARES ====================

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: 'admin' | 'counselor' | 'student';
    email: string;
    name: string;
    linkedProfileId?: string;
    counselorId?: string;
    counselorName?: string;
    studentRollNo?: string;
  };
}

// Middleware: Authenticate JWT Token
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
}

// Middleware: Authorize specific Roles
function authorizeRole(allowedRoles: ('admin' | 'counselor' | 'student')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated user.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: User role '${req.user.role}' is not authorized for this resource.`,
      });
    }
    next();
  };
}

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AUTH: Login with Email & Password
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = usersStore.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Issue signed JWT token containing role and profile linkages
  const payload = {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    linkedProfileId: user.linkedProfileId,
    counselorId: user.counselorId,
    counselorName: user.counselorName,
    studentRollNo: user.studentRollNo,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

  const safeUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    linkedProfileId: user.linkedProfileId,
    counselorId: user.counselorId,
    counselorName: user.counselorName,
    studentRollNo: user.studentRollNo,
  };

  return res.json({
    success: true,
    token,
    user: safeUser,
    message: `Logged in successfully as ${user.role}.`,
  });
});

// AUTH: Verify Token & Get Current User
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

// AUTH: List quick demo test accounts
app.get('/api/auth/demo-accounts', (_req, res) => {
  res.json({
    accounts: usersStore.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      password: u.plainPassword,
      avatar: u.avatar,
      studentRollNo: u.studentRollNo,
      counselorId: u.counselorId,
    })),
  });
});

// Notion Config status
app.get('/api/notion/config', (_req, res) => {
  res.json({
    apiKeyConfigured: !!notionConfig.apiKey,
    databaseIdConfigured: !!notionConfig.studentsDatabaseId,
    isConnected: notionConfig.isConnected,
    lastSyncTime: notionConfig.lastSyncTime,
    mode: notionConfig.mode,
    maskedApiKey: notionConfig.apiKey ? `${notionConfig.apiKey.slice(0, 7)}...` : '',
    usersDatabaseId: notionConfig.usersDatabaseId,
    studentsDatabaseId: notionConfig.studentsDatabaseId,
    counselorsDatabaseId: notionConfig.counselorsDatabaseId,
    feesDatabaseId: notionConfig.feesDatabaseId,
  });
});

// Update or test Notion credentials
app.post('/api/notion/config', async (req, res) => {
  const {
    apiKey,
    studentsDatabaseId,
    usersDatabaseId,
    counselorsDatabaseId,
    feesDatabaseId,
    mode,
  } = req.body;

  if (mode === 'mock') {
    notionConfig.mode = 'mock';
    notionConfig.isConnected = false;
    return res.json({ success: true, message: 'Switched to local simulated Notion mode.', config: notionConfig });
  }

  const keyToUse = apiKey || notionConfig.apiKey;
  const dbToUse = studentsDatabaseId || notionConfig.studentsDatabaseId;

  const connected = await checkNotionConnection(keyToUse, dbToUse);
  if (connected) {
    notionConfig.apiKey = keyToUse;
    notionConfig.studentsDatabaseId = dbToUse;
    if (usersDatabaseId) notionConfig.usersDatabaseId = usersDatabaseId;
    if (counselorsDatabaseId) notionConfig.counselorsDatabaseId = counselorsDatabaseId;
    if (feesDatabaseId) notionConfig.feesDatabaseId = feesDatabaseId;
    notionConfig.isConnected = true;
    notionConfig.mode = 'live';
    notionConfig.lastSyncTime = new Date().toISOString();
    return res.json({ success: true, message: 'Connected to Notion successfully!', isConnected: true });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Could not connect to Notion API. Please verify Token and Database ID permissions.',
    });
  }
});

// Sync data from Notion Database
app.post('/api/notion/sync', async (_req, res) => {
  if (!notionConfig.isConnected || !notionConfig.apiKey || !notionConfig.studentsDatabaseId) {
    notionConfig.lastSyncTime = new Date().toISOString();
    return res.json({
      success: true,
      message: 'Simulated sync complete (using 4 linked role-filtered databases).',
      lastSyncTime: notionConfig.lastSyncTime,
      count: studentsStore.length,
    });
  }

  try {
    const notion = new Client({ auth: notionConfig.apiKey }) as any;
    const response = await notion.databases.query({
      database_id: notionConfig.studentsDatabaseId,
    });

    const fetchedStudents: StudentRecord[] = response.results.map((page: any, index: number) => {
      const props = page.properties;
      return {
        id: page.id,
        notionPageId: page.id,
        rollNo:
          props['Roll No']?.title?.[0]?.plain_text ||
          props['Roll No']?.rich_text?.[0]?.plain_text ||
          `STU-2024-${String(index + 1).padStart(3, '0')}`,
        fullName:
          props['Name']?.title?.[0]?.plain_text ||
          props['Full Name']?.rich_text?.[0]?.plain_text ||
          'Student Name',
        email: props['Email']?.email || props['Email']?.rich_text?.[0]?.plain_text || 'student@school.edu',
        phone: props['Phone']?.phone_number || props['Phone']?.rich_text?.[0]?.plain_text || '+92 300 0000000',
        course: props['Course']?.select?.name || props['Course']?.rich_text?.[0]?.plain_text || 'Web Development',
        counselorId: props['Counselor ID']?.rich_text?.[0]?.plain_text || 'counselor-1',
        counselorName:
          props['Counselor Name']?.select?.name ||
          props['Counselor Name']?.rich_text?.[0]?.plain_text ||
          'Sarah Khan',
        feeStatus: (props['Fee Status']?.select?.name as any) || 'Pending',
        feeAmount: props['Fee Amount']?.number || 1000,
        feePaid: props['Fee Paid']?.number || 0,
        dueDate: props['Due Date']?.date?.start || '2026-08-30',
        enrollmentDate: props['Enrollment Date']?.date?.start || '2026-01-01',
        academicProgress: props['Progress']?.number || 85,
        attendancePercentage: props['Attendance']?.number || 90,
        counselorNotes: [],
        lastSyncedAt: new Date().toISOString(),
      };
    });

    if (fetchedStudents.length > 0) {
      studentsStore = fetchedStudents;
      // Refresh fee store as well
      feesStore = studentsStore.map((s) => ({
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
      }));
    }
    notionConfig.lastSyncTime = new Date().toISOString();

    return res.json({
      success: true,
      message: `Synced ${fetchedStudents.length} student records directly from Notion!`,
      lastSyncTime: notionConfig.lastSyncTime,
      count: fetchedStudents.length,
    });
  } catch (error: any) {
    console.error('Failed to sync Notion database:', error);
    return res.status(500).json({ success: false, message: error?.message || 'Error syncing from Notion API' });
  }
});

// ==================== ROLE-BASED ACCESS CONTROL (RBAC) API ENDPOINTS ====================
// Exactly matching Page 3 & 4 of PDF:
// Critical rule: filtering happens inside the Express route handler using the role decoded
// from the verified JWT — never trusting frontend request params!

// GET /api/students
app.get('/api/students', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  
  if (user.role === 'admin') {
    // Level 1 Admin: No filter applied, sees all students
    return res.json({
      role: user.role,
      recordsCount: studentsStore.length,
      students: studentsStore,
      serverFilterApplied: 'None (Admin Super Access)',
    });
  }

  if (user.role === 'counselor') {
    // Level 2 Counselor: Filter Assigned Counselor relation = their own user/counselor ID
    const counselorScoped = studentsStore.filter((s) => s.counselorId === user.counselorId);
    return res.json({
      role: user.role,
      counselorId: user.counselorId,
      recordsCount: counselorScoped.length,
      students: counselorScoped,
      serverFilterApplied: `Assigned Counselor ID === '${user.counselorId}'`,
    });
  }

  if (user.role === 'student') {
    // Level 3 Student: Filter record ID = their own linked ID / Roll No / Email
    const studentScoped = studentsStore.filter(
      (s) =>
        (user.studentRollNo && s.rollNo === user.studentRollNo) ||
        (user.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
        (user.linkedProfileId && s.id === user.linkedProfileId)
    );
    return res.json({
      role: user.role,
      recordsCount: studentScoped.length,
      students: studentScoped,
      serverFilterApplied: `Student Roll No === '${user.studentRollNo}'`,
    });
  }

  return res.status(403).json({ error: 'Unauthorized role.' });
});

// GET /api/counselors (Admin sees all; others can view counselor directory)
app.get('/api/counselors', authenticateToken, (_req: AuthenticatedRequest, res) => {
  res.json({ counselors: counselorsStore });
});

// GET /api/fees (Filtered by role: Student sees own; Counselor sees assigned; Admin sees all)
app.get('/api/fees', authenticateToken, (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  if (user.role === 'admin') {
    return res.json({ fees: feesStore, count: feesStore.length });
  }

  if (user.role === 'counselor') {
    const assignedStudentIds = studentsStore
      .filter((s) => s.counselorId === user.counselorId)
      .map((s) => s.id);
    const counselorFees = feesStore.filter((f) => assignedStudentIds.includes(f.studentId));
    return res.json({ fees: counselorFees, count: counselorFees.length });
  }

  if (user.role === 'student') {
    const studentFee = feesStore.filter(
      (f) =>
        (user.studentRollNo && f.studentRollNo === user.studentRollNo) ||
        (user.linkedProfileId && f.studentId === user.linkedProfileId)
    );
    return res.json({ fees: studentFee, count: studentFee.length });
  }

  return res.status(403).json({ error: 'Unauthorized.' });
});

// POST /api/students (Admin & Counselor authorized)
app.post('/api/students', authenticateToken, authorizeRole(['admin', 'counselor']), async (req: AuthenticatedRequest, res) => {
  const newStudent: StudentRecord = {
    ...req.body,
    id: `stu-${Date.now()}`,
    lastSyncedAt: new Date().toISOString(),
    counselorNotes: req.body.counselorNotes || [],
  };

  studentsStore.unshift(newStudent);

  // Also add fee record
  feesStore.unshift({
    id: `fee-${newStudent.id}`,
    studentId: newStudent.id,
    studentRollNo: newStudent.rollNo,
    studentName: newStudent.fullName,
    course: newStudent.course,
    totalAmount: newStudent.feeAmount,
    paidAmount: newStudent.feePaid,
    balance: newStudent.feeAmount - newStudent.feePaid,
    status: newStudent.feeStatus,
    dueDate: newStudent.dueDate,
  });

  // If connected to Notion, push page to Notion Database
  if (notionConfig.isConnected && notionConfig.apiKey && notionConfig.studentsDatabaseId) {
    try {
      const notion = new Client({ auth: notionConfig.apiKey }) as any;
      await notion.pages.create({
        parent: { database_id: notionConfig.studentsDatabaseId },
        properties: {
          'Name': { title: [{ text: { content: newStudent.fullName } }] },
          'Roll No': { rich_text: [{ text: { content: newStudent.rollNo } }] },
          'Email': { email: newStudent.email },
          'Course': { select: { name: newStudent.course } },
          'Counselor Name': { select: { name: newStudent.counselorName } },
          'Counselor ID': { rich_text: [{ text: { content: newStudent.counselorId } }] },
          'Fee Status': { select: { name: newStudent.feeStatus } },
          'Fee Amount': { number: newStudent.feeAmount },
          'Fee Paid': { number: newStudent.feePaid },
        },
      });
    } catch (err) {
      console.error('Failed pushing student to Notion:', err);
    }
  }

  res.status(201).json({ success: true, student: newStudent });
});

// PATCH /api/students/:id (Admin & Counselor authorized)
app.patch('/api/students/:id', authenticateToken, authorizeRole(['admin', 'counselor']), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updates = req.body;

  const index = studentsStore.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  // Counselors can only edit their own students
  if (req.user?.role === 'counselor' && studentsStore[index].counselorId !== req.user.counselorId) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify students outside your assigned group.' });
  }

  studentsStore[index] = {
    ...studentsStore[index],
    ...updates,
    lastSyncedAt: new Date().toISOString(),
  };

  const updatedStudent = studentsStore[index];

  // Update fee record too
  const feeIdx = feesStore.findIndex((f) => f.studentId === id);
  if (feeIdx !== -1) {
    if (updates.feeStatus) feesStore[feeIdx].status = updates.feeStatus;
    if (updates.feePaid !== undefined) {
      feesStore[feeIdx].paidAmount = updates.feePaid;
      feesStore[feeIdx].balance = feesStore[feeIdx].totalAmount - updates.feePaid;
    }
  }

  // If connected to Notion, patch page in Notion Database
  if (updatedStudent.notionPageId && notionConfig.isConnected && notionConfig.apiKey) {
    try {
      const notion = new Client({ auth: notionConfig.apiKey }) as any;
      const propsToUpdate: any = {};
      if (updates.feeStatus) propsToUpdate['Fee Status'] = { select: { name: updates.feeStatus } };
      if (updates.feePaid !== undefined) propsToUpdate['Fee Paid'] = { number: updates.feePaid };

      if (Object.keys(propsToUpdate).length > 0) {
        await notion.pages.update({
          page_id: updatedStudent.notionPageId,
          properties: propsToUpdate,
        });
      }
    } catch (err) {
      console.error('Failed patching Notion page:', err);
    }
  }

  res.json({ success: true, student: updatedStudent });
});

// POST /api/students/:id/notes (Add Counselor Note)
app.post('/api/students/:id/notes', authenticateToken, authorizeRole(['admin', 'counselor']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { note } = req.body;

  const student = studentsStore.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  if (req.user?.role === 'counselor' && student.counselorId !== req.user.counselorId) {
    return res.status(403).json({ error: 'Forbidden: You can only add notes to your assigned students.' });
  }

  const newNote = {
    id: `note-${Date.now()}`,
    authorName: req.user?.name || 'Counselor',
    date: new Date().toISOString().split('T')[0],
    note,
  };

  student.counselorNotes.unshift(newNote);
  res.json({ success: true, note: newNote, student });
});

// Server Initialization
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Role-Based Student Management Portal (JWT + Notion RBAC) running on http://localhost:${PORT}`);
  });
}

startServer();
