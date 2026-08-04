import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Client } from '@notionhq/client';
import { INITIAL_STUDENTS, INITIAL_COUNSELORS, INITIAL_USERS } from './src/data/mockData';
import { StudentRecord, NotionConfig } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory store initialized with mock data (can sync with Notion)
let studentsStore: StudentRecord[] = [...INITIAL_STUDENTS];
let notionConfig: NotionConfig = {
  apiKey: process.env.NOTION_API_KEY || '',
  studentsDatabaseId: process.env.NOTION_STUDENTS_DATABASE_ID || '',
  isConnected: false,
  lastSyncTime: null,
  mode: process.env.NOTION_API_KEY ? 'live' : 'mock',
};

// Test Notion Connection helper
async function checkNotionConnection(apiKey: string, databaseId: string): Promise<boolean> {
  if (!apiKey || !databaseId) return false;
  try {
    const notion = new Client({ auth: apiKey });
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

// ==================== API ROUTES ====================

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get Notion Config status
app.get('/api/notion/config', (_req, res) => {
  res.json({
    apiKeyConfigured: !!notionConfig.apiKey,
    databaseIdConfigured: !!notionConfig.studentsDatabaseId,
    isConnected: notionConfig.isConnected,
    lastSyncTime: notionConfig.lastSyncTime,
    mode: notionConfig.mode,
    // Hide secret key for security
    maskedApiKey: notionConfig.apiKey ? `${notionConfig.apiKey.slice(0, 7)}...` : '',
    databaseId: notionConfig.studentsDatabaseId,
  });
});

// Update or test Notion credentials
app.post('/api/notion/config', async (req, res) => {
  const { apiKey, studentsDatabaseId, mode } = req.body;
  if (mode === 'mock') {
    notionConfig.mode = 'mock';
    notionConfig.isConnected = false;
    return res.json({ success: true, message: 'Switched to local database simulation mode.', config: notionConfig });
  }

  const keyToUse = apiKey || notionConfig.apiKey;
  const dbToUse = studentsDatabaseId || notionConfig.studentsDatabaseId;

  const connected = await checkNotionConnection(keyToUse, dbToUse);
  if (connected) {
    notionConfig.apiKey = keyToUse;
    notionConfig.studentsDatabaseId = dbToUse;
    notionConfig.isConnected = true;
    notionConfig.mode = 'live';
    notionConfig.lastSyncTime = new Date().toISOString();
    return res.json({ success: true, message: 'Connected to Notion successfully!', isConnected: true });
  } else {
    return res.status(400).json({
      success: false,
      message: 'Could not connect to Notion API. Please verify Integration Token and Database ID permissions.',
    });
  }
});

// Sync data from Notion Database
app.post('/api/notion/sync', async (_req, res) => {
  if (!notionConfig.isConnected || !notionConfig.apiKey || !notionConfig.studentsDatabaseId) {
    // If not connected to Notion, refresh timestamp in mock mode
    notionConfig.lastSyncTime = new Date().toISOString();
    return res.json({
      success: true,
      message: 'Simulated sync complete (using local role-filtered database).',
      lastSyncTime: notionConfig.lastSyncTime,
      count: studentsStore.length,
    });
  }

  try {
    const notion = new Client({ auth: notionConfig.apiKey }) as any;
    const response = await notion.databases.query({
      database_id: notionConfig.studentsDatabaseId,
    });

    const fetchedStudents: StudentRecord[] = response.results.map((page: any, index) => {
      const props = page.properties;
      return {
        id: page.id,
        notionPageId: page.id,
        rollNo: props['Roll No']?.title?.[0]?.plain_text || props['Roll No']?.rich_text?.[0]?.plain_text || `STU-2024-${String(index + 1).padStart(3, '0')}`,
        fullName: props['Name']?.title?.[0]?.plain_text || props['Full Name']?.rich_text?.[0]?.plain_text || 'Student Name',
        email: props['Email']?.email || props['Email']?.rich_text?.[0]?.plain_text || 'student@school.edu',
        phone: props['Phone']?.phone_number || props['Phone']?.rich_text?.[0]?.plain_text || '+92 300 0000000',
        course: props['Course']?.select?.name || props['Course']?.rich_text?.[0]?.plain_text || 'Web Development',
        counselorId: props['Counselor ID']?.rich_text?.[0]?.plain_text || 'counselor-1',
        counselorName: props['Counselor Name']?.select?.name || props['Counselor Name']?.rich_text?.[0]?.plain_text || 'Sarah Khan',
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

// ROLE-BASED ACCESS CONTROL (RBAC) GET /api/students
// Privacy Filter Enforcement:
// 1. ADMIN -> gets all student records
// 2. COUNSELOR -> gets ONLY students where student.counselorId === req.query.counselorId
// 3. STUDENT -> gets ONLY student record matching student.rollNo or student.email
app.get('/api/students', (req, res) => {
  const role = req.query.role as string;
  const counselorId = req.query.counselorId as string;
  const studentRollNo = req.query.studentRollNo as string;
  const userEmail = req.query.email as string;

  if (role === 'admin') {
    // Admin gets full transparency across all counselors and students
    return res.json({ role, recordsCount: studentsStore.length, students: studentsStore });
  }

  if (role === 'counselor') {
    if (!counselorId) {
      return res.status(400).json({ error: 'Counselor ID is required for counselor access scope.' });
    }
    // Filter strictly for assigned counselor
    const scopedStudents = studentsStore.filter((s) => s.counselorId === counselorId);
    return res.json({ role, counselorId, recordsCount: scopedStudents.length, students: scopedStudents });
  }

  if (role === 'student') {
    // Filter strictly for this individual student
    const studentRecord = studentsStore.filter(
      (s) => (studentRollNo && s.rollNo === studentRollNo) || (userEmail && s.email.toLowerCase() === userEmail.toLowerCase())
    );

    return res.json({ role, recordsCount: studentRecord.length, students: studentRecord });
  }

  return res.status(403).json({ error: 'Unauthorized role specified.' });
});

// Get Counselors List
app.get('/api/counselors', (_req, res) => {
  res.json({ counselors: INITIAL_COUNSELORS });
});

// Create new Student Record
app.post('/api/students', async (req, res) => {
  const newStudent: StudentRecord = {
    ...req.body,
    id: `stu-${Date.now()}`,
    lastSyncedAt: new Date().toISOString(),
    counselorNotes: req.body.counselorNotes || [],
  };

  studentsStore.unshift(newStudent);

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

// Update Student Record (e.g. fee status or counselor note)
app.patch('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const index = studentsStore.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  studentsStore[index] = {
    ...studentsStore[index],
    ...updates,
    lastSyncedAt: new Date().toISOString(),
  };

  const updatedStudent = studentsStore[index];

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

// Add Counselor Note
app.post('/api/students/:id/notes', (req, res) => {
  const { id } = req.params;
  const { authorName, note } = req.body;

  const student = studentsStore.find((s) => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  const newNote = {
    id: `note-${Date.now()}`,
    authorName: authorName || 'Counselor',
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
    console.log(`Role-Based Student Management Portal running on http://localhost:${PORT}`);
  });
}

startServer();
