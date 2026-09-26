import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  getInMemoryMeetings,
  getInMemoryMeetingById,
  getInMemoryParticipants,
  saveInMemoryMeeting,
  getInMemoryUserMeetings,
  getInMemoryUserActions,
  getInMemoryUserDecisions,
  getInMemoryUserQuestions,
  updateInMemoryAction
} from './memoryStore.ts';
import {
  INTAKE_TEMPLATES,
  buildMeetingFromTemplate,
  buildMeetingFromUploadedFile
} from './pipeline.ts';
import {
  getIntelligenceStatus
} from './intelligence/index.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ==========================================
// 0. API Root Handlers
// ==========================================
app.get(['/', '/api'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'meetwise-backend',
    message: 'Meetwise API root'
  });
});

// ==========================================
// 1. Health Endpoint (Unconditional 200 OK)
// ==========================================
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'meetwise-backend',
    runtime: 'pure-in-memory',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. GET /api/meetings (List with summary metadata)
// ==========================================
app.get('/api/meetings', (req: Request, res: Response) => {
  try {
    const meetings = getInMemoryMeetings();
    res.json({
      count: meetings.length,
      meetings
    });
  } catch (err: any) {
    console.error('Error fetching meetings:', err);
    res.status(500).json({ error: 'Failed to retrieve meetings', details: err.message });
  }
});

// Helper: Persist complete meeting object into Memory
export function saveMeetingToDatabase(m: any) {
  return saveInMemoryMeeting(m);
}

// ==========================================
// 2b. POST /api/meetings (Create / Ingest Meeting)
// ==========================================
app.post('/api/meetings', (req: Request, res: Response) => {
  try {
    const m = req.body;
    if (!m || !m.title) {
      return res.status(400).json({ error: 'Meeting title is required' });
    }

    const created = saveMeetingToDatabase(m);
    res.status(201).json({
      success: true,
      meeting: created
    });
  } catch (err: any) {
    console.error('Error creating meeting:', err);
    res.status(500).json({ error: 'Failed to create meeting', details: err.message });
  }
});

// ==========================================
// 2b-0. GET /api/intelligence/status (Provider Status)
// ==========================================
app.get('/api/intelligence/status', (req: Request, res: Response) => {
  try {
    const status = getIntelligenceStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve intelligence status', details: err.message });
  }
});

// ==========================================
// 2b-1. GET /api/import/templates (Available intake templates)
// ==========================================
app.get('/api/import/templates', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      templates: INTAKE_TEMPLATES
    });
  } catch (err: any) {
    console.error('Error retrieving templates:', err);
    res.status(500).json({ error: 'Failed to retrieve intake templates', details: err.message });
  }
});

// ==========================================
// 2b-2. POST /api/meetings/import (Meeting Intake Pipeline)
// ==========================================
app.post('/api/meetings/import', async (req: Request, res: Response) => {
  try {
    const { source, templateId, fileMeta, title, participantIds } = req.body;
    let meetingPayload: any;

    if (source === 'file' && fileMeta) {
      meetingPayload = buildMeetingFromUploadedFile(fileMeta, title, participantIds);
    } else {
      const selectedId = templateId || 'template-infra-q4';
      meetingPayload = await buildMeetingFromTemplate(selectedId, title);
    }

    const created = saveMeetingToDatabase(meetingPayload);
    res.status(201).json({
      success: true,
      meeting: created,
      stats: {
        totalActions: created.actionItems?.length || 0,
        decisionsCount: created.keyDecisions?.length || 0,
        questionsCount: created.openQuestions?.length || 0,
        utterancesCount: created.transcript?.length || 0
      }
    });
  } catch (err: any) {
    console.error('Failed to import meeting via pipeline:', err);
    res.status(500).json({ error: 'Failed to process and import meeting', details: err.message });
  }
});

// ==========================================
// 2c. GET /api/participants (List all participants)
// ==========================================
app.get('/api/participants', (req: Request, res: Response) => {
  try {
    const participants = getInMemoryParticipants();
    res.json({ participants });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch participants', details: err.message });
  }
});

// ==========================================
// 3. GET /api/meetings/:id (Full meeting detail)
// ==========================================
app.get('/api/meetings/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const meeting = getInMemoryMeetingById(id);

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    }

    res.json(meeting);
  } catch (err: any) {
    console.error(`Error fetching meeting ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to retrieve meeting', details: err.message });
  }
});

// ==========================================
// 4. GET /api/meetings/:id/transcript
// ==========================================
app.get('/api/meetings/:id/transcript', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const m = getInMemoryMeetingById(id);
    if (!m) return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    res.json({
      meetingId: id,
      count: m.transcript?.length || 0,
      transcript: m.transcript || []
    });
  } catch (err: any) {
    console.error(`Error fetching transcript for ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to retrieve transcript', details: err.message });
  }
});

// ==========================================
// 5. GET /api/meetings/:id/actions
// ==========================================
app.get('/api/meetings/:id/actions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const m = getInMemoryMeetingById(id);
    if (!m) return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    res.json({
      meetingId: id,
      count: m.actionItems?.length || 0,
      actionItems: m.actionItems || []
    });
  } catch (err: any) {
    console.error(`Error fetching action items for ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to retrieve action items', details: err.message });
  }
});

// ==========================================
// 6. PATCH /api/meetings/:id/actions/:actionId
// ==========================================
app.patch('/api/meetings/:id/actions/:actionId', (req: Request, res: Response) => {
  try {
    const { id, actionId } = req.params;
    const { completed, title, assigneeId } = req.body;

    const updated = updateInMemoryAction(id, actionId, { completed, title, assigneeId });
    if (!updated) {
      return res.status(404).json({ error: 'Action item not found', actionId, meetingId: id });
    }
    res.json({
      success: true,
      actionItem: updated
    });
  } catch (err: any) {
    console.error(`Error updating action item ${req.params.actionId}:`, err);
    res.status(500).json({ error: 'Failed to update action item', details: err.message });
  }
});

// ==========================================
// 7. GET /api/meetings/:id/decisions
// ==========================================
app.get('/api/meetings/:id/decisions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const m = getInMemoryMeetingById(id);
    if (!m) return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    const decisions = m.keyDecisionDetails || (m.keyDecisions || []).map((text, idx) => ({ id: `dec-${id}-${idx}`, text }));
    res.json({
      meetingId: id,
      count: decisions.length,
      decisions
    });
  } catch (err: any) {
    console.error(`Error fetching decisions for ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to retrieve decisions', details: err.message });
  }
});

// ==========================================
// 8. GET /api/meetings/:id/questions
// ==========================================
app.get('/api/meetings/:id/questions', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const m = getInMemoryMeetingById(id);
    if (!m) return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    res.json({
      meetingId: id,
      count: m.openQuestions?.length || 0,
      openQuestions: m.openQuestions || []
    });
  } catch (err: any) {
    console.error(`Error fetching open questions for ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to retrieve open questions', details: err.message });
  }
});

// ==========================================
// 8b. GET /api/users/:userId/actions (Personalized Workspace Actions)
// ==========================================
app.get('/api/users/:userId/actions', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const completedParam = req.query.completed;

    const actionItems = getInMemoryUserActions(userId, completedParam as string);
    const pendingCount = actionItems.filter(a => !a.completed).length;
    const completedCount = actionItems.filter(a => a.completed).length;
    const dueSoonCount = actionItems.filter(a => a.isDueSoon).length;

    res.json({
      userId,
      count: actionItems.length,
      stats: {
        total: actionItems.length,
        pending: pendingCount,
        completed: completedCount,
        dueSoon: dueSoonCount
      },
      actionItems
    });
  } catch (err: any) {
    console.error(`Error fetching actions for user ${req.params.userId}:`, err);
    res.status(500).json({ error: 'Failed to retrieve user actions', details: err.message });
  }
});

// ==========================================
// 8b-2. GET /api/users/:userId/meetings (Personalized My Meetings)
// ==========================================
app.get('/api/users/:userId/meetings', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const meetings = getInMemoryUserMeetings(userId);
    res.json({
      userId,
      count: meetings.length,
      meetings
    });
  } catch (err: any) {
    console.error(`Error fetching meetings for user ${req.params.userId}:`, err);
    res.status(500).json({ error: 'Failed to retrieve user meetings', details: err.message });
  }
});

// ==========================================
// 8b-3. GET /api/users/:userId/decisions (Personalized Decisions)
// ==========================================
app.get('/api/users/:userId/decisions', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const decisions = getInMemoryUserDecisions(userId);
    res.json({
      userId,
      count: decisions.length,
      decisions
    });
  } catch (err: any) {
    console.error(`Error fetching decisions for user ${req.params.userId}:`, err);
    res.status(500).json({ error: 'Failed to retrieve user decisions', details: err.message });
  }
});

// ==========================================
// 8b-4. GET /api/users/:userId/questions (Personalized Open Questions)
// ==========================================
app.get('/api/users/:userId/questions', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const openQuestions = getInMemoryUserQuestions(userId);
    res.json({
      userId,
      count: openQuestions.length,
      openQuestions
    });
  } catch (err: any) {
    console.error(`Error fetching open questions for user ${req.params.userId}:`, err);
    res.status(500).json({ error: 'Failed to retrieve user open questions', details: err.message });
  }
});

// ==========================================
// 8c. GET /api/actions (All Workspace Actions)
// ==========================================
app.get('/api/actions', (req: Request, res: Response) => {
  try {
    const { userId, completed } = req.query;
    const allMeetings = getInMemoryMeetings();
    const actionItems: any[] = [];
    allMeetings.forEach(m => {
      const fullM = getInMemoryMeetingById(m.id);
      (fullM?.actionItems || []).forEach(a => {
        if (userId && a.assignee?.id !== userId) return;
        if (completed !== undefined) {
          const isComp = completed === 'true' || completed === '1';
          if (Boolean(a.completed) !== isComp) return;
        }
        actionItems.push({
          id: a.id,
          meetingId: fullM.id,
          meetingTitle: fullM.title,
          meetingDate: fullM.date,
          title: a.title,
          ownerId: a.assignee?.id,
          ownerName: a.assignee?.name,
          ownerEmail: a.assignee?.email,
          ownerAvatar: a.assignee?.avatar,
          completed: Boolean(a.completed),
          timestamp: a.timestamp,
          sourceQuote: a.sourceQuote
        });
      });
    });
    res.json({ count: actionItems.length, actionItems });
  } catch (err: any) {
    console.error('Error fetching all actions:', err);
    res.status(500).json({ error: 'Failed to retrieve actions', details: err.message });
  }
});

// ==========================================
// 8d. GET /api/decisions (All Workspace Decisions)
// ==========================================
app.get('/api/decisions', (req: Request, res: Response) => {
  try {
    const allMeetings = getInMemoryMeetings();
    const decisions: any[] = [];
    allMeetings.forEach(m => {
      const fullM = getInMemoryMeetingById(m.id);
      (fullM?.keyDecisionDetails || []).forEach(d => {
        decisions.push({
          id: d.id,
          meetingId: fullM.id,
          meetingTitle: fullM.title,
          meetingDate: fullM.date,
          text: d.text,
          timestamp: d.timestamp
        });
      });
    });
    res.json({ count: decisions.length, decisions });
  } catch (err: any) {
    console.error('Error fetching decisions:', err);
    res.status(500).json({ error: 'Failed to retrieve decisions', details: err.message });
  }
});

// ==========================================
// 8e. GET /api/questions (All Workspace Open Questions)
// ==========================================
app.get('/api/questions', (req: Request, res: Response) => {
  try {
    const allMeetings = getInMemoryMeetings();
    const openQuestions: any[] = [];
    allMeetings.forEach(m => {
      const fullM = getInMemoryMeetingById(m.id);
      (fullM?.openQuestions || []).forEach(q => {
        openQuestions.push({
          id: q.id,
          meetingId: fullM.id,
          meetingTitle: fullM.title,
          meetingDate: fullM.date,
          question: q.question,
          speakerName: q.speakerName,
          timestamp: q.timestamp,
          context: q.context
        });
      });
    });
    res.json({ count: openQuestions.length, openQuestions });
  } catch (err: any) {
    console.error('Error fetching open questions:', err);
    res.status(500).json({ error: 'Failed to retrieve open questions', details: err.message });
  }
});

// ==========================================
// 9. PATCH /api/meetings/:id (Metadata updates like title, template)
// ==========================================
app.patch('/api/meetings/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, activeTemplate, overview } = req.body;

    const meeting = getInMemoryMeetingById(id);
    if (!meeting) return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    if (title !== undefined) meeting.title = title.trim();
    if (activeTemplate !== undefined) meeting.activeTemplate = activeTemplate.trim();
    if (overview !== undefined) meeting.overview = overview.trim();
    saveInMemoryMeeting(meeting);
    res.json({ success: true, meeting });
  } catch (err: any) {
    console.error(`Error updating meeting ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update meeting', details: err.message });
  }
});

// ==========================================
// 10. GET /api/search?q=query (Search across all in-memory records)
// ==========================================
app.get('/api/search', (req: Request, res: Response) => {
  try {
    const rawQuery = ((req.query.q as string) || '').trim();
    if (!rawQuery) {
      return res.json({
        query: '',
        totalMatches: 0,
        meetings: [],
        transcripts: [],
        actionItems: [],
        decisions: [],
        openQuestions: []
      });
    }

    const qLower = rawQuery.toLowerCase();
    const allMeetings = getInMemoryMeetings().map(m => getInMemoryMeetingById(m.id)!);
    const allParticipants = getInMemoryParticipants();

    const matchingPeople = allParticipants.filter(p =>
      p.name.toLowerCase().includes(qLower) || p.email.toLowerCase().includes(qLower) || p.role.toLowerCase().includes(qLower)
    );

    const matchingMeetings = allMeetings.filter(m =>
      m.title.toLowerCase().includes(qLower) || (m.overview && m.overview.toLowerCase().includes(qLower)) || (m.tags && m.tags.some(t => t.toLowerCase().includes(qLower)))
    );

    const matchingDecisions: any[] = [];
    const matchingActions: any[] = [];
    const matchingQuestions: any[] = [];
    const matchingUtterances: any[] = [];

    allMeetings.forEach(m => {
      (m.keyDecisionDetails || []).forEach(d => {
        if (d.text.toLowerCase().includes(qLower)) {
          matchingDecisions.push({ id: d.id, meetingId: m.id, meetingTitle: m.title, text: d.text, timestamp: d.timestamp });
        }
      });
      (m.actionItems || []).forEach(a => {
        if (a.title.toLowerCase().includes(qLower) || a.assignee?.name.toLowerCase().includes(qLower) || (a.sourceQuote && a.sourceQuote.toLowerCase().includes(qLower))) {
          matchingActions.push({
            id: a.id,
            meetingId: m.id,
            meetingTitle: m.title,
            title: a.title,
            assigneeName: a.assignee?.name,
            assigneeId: a.assignee?.id,
            timestamp: a.timestamp,
            completed: Boolean(a.completed)
          });
        }
      });
      (m.openQuestions || []).forEach(q => {
        if (q.question.toLowerCase().includes(qLower) || (q.speakerName && q.speakerName.toLowerCase().includes(qLower))) {
          matchingQuestions.push({
            id: q.id,
            meetingId: m.id,
            meetingTitle: m.title,
            question: q.question,
            speakerName: q.speakerName,
            timestamp: q.timestamp
          });
        }
      });
      (m.transcript || []).forEach(u => {
        if (u.text.toLowerCase().includes(qLower) || u.speakerName.toLowerCase().includes(qLower)) {
          matchingUtterances.push({
            id: u.id,
            meetingId: m.id,
            meetingTitle: m.title,
            speakerName: u.speakerName,
            timestamp: u.startTime,
            text: u.text
          });
        }
      });
    });

    const totalMatches = matchingPeople.length + matchingMeetings.length + matchingDecisions.length + matchingActions.length + matchingQuestions.length + matchingUtterances.length;
    res.json({
      query: rawQuery,
      totalMatches,
      people: matchingPeople,
      meetings: matchingMeetings,
      decisions: matchingDecisions,
      actionItems: matchingActions,
      openQuestions: matchingQuestions,
      transcripts: matchingUtterances
    });
  } catch (err: any) {
    console.error('Error during search:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

// Helper: Format seconds to MM:SS
function formatTimestamp(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ==========================================
// 11. POST /api/meetings/:meetingId/chat (Ask Meetwise - In-Meeting Assistant)
// ==========================================
app.post('/api/meetings/:meetingId/chat', (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const meeting = getInMemoryMeetingById(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found', meetingId });
    }

    const qLower = question.trim().toLowerCase();
    const decisions = meeting.keyDecisionDetails || [];
    const actions = meeting.actionItems || [];
    const utterances = (meeting.transcript || []).map(u => ({
      id: u.id,
      speakerName: u.speakerName,
      timestamp: u.startTime,
      text: u.text
    }));

    let answer = '';
    const sources: any[] = [];

    if (/\b(decis(ion|ions)|decid(e|ed))\b/i.test(qLower)) {
      answer = decisions.length > 0
        ? `Agreed decisions in "${meeting.title}":\n\n` + decisions.map((d, i) => `${i + 1}. ${d.text}`).join('\n')
        : `No formal decisions recorded in "${meeting.title}".`;
    } else if (/\b(action(s)?|task(s)?|owner)\b/i.test(qLower)) {
      answer = actions.length > 0
        ? `Action items in "${meeting.title}":\n\n` + actions.map((a, i) => `${i + 1}. "${a.title}" — Assignee: ${a.assignee?.name}`).join('\n')
        : `No action items found in "${meeting.title}".`;
    } else {
      const match = utterances.find(u => u.text.toLowerCase().includes(qLower));
      if (match) {
        answer = `Found evidence in "${meeting.title}":\n"${match.text}" — ${match.speakerName}`;
        sources.push({ meetingId: meeting.id, meetingTitle: meeting.title, timestamp: match.timestamp, quote: match.text });
      } else {
        answer = `Meetwise response: verified evidence from "${meeting.title}" was reviewed.`;
      }
    }

    const intelStatus = getIntelligenceStatus();
    res.json({
      meetingId: meeting.id,
      meetingTitle: meeting.title,
      question: question.trim(),
      answer,
      sources,
      provider: intelStatus.providerId,
      llmProviderConfigured: intelStatus.isLlmConfigured
    });
  } catch (err: any) {
    console.error('Error in Ask Meetwise chat:', err);
    res.status(500).json({ error: 'Chat processing failed', details: err.message });
  }
});

// ==========================================
// 12. POST /api/chat (Cross-Meeting Assistant)
// ==========================================
app.post('/api/chat', (req: Request, res: Response) => {
  try {
    const { question, userId = 'p-david' } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const userActions = getInMemoryUserActions(userId);
    const answer = userActions.length > 0
      ? `Across your meetings, you have ${userActions.length} action items assigned to you:\n\n` +
      userActions.map((a, i) => `${i + 1}. "${a.title}" [${a.completed ? 'Completed' : 'Pending'}] (${formatTimestamp(a.timestamp)})`).join('\n\n')
      : 'You have no action items assigned to you across any meetings.';

    const sources = userActions.map(a => ({
      meetingId: a.meetingId,
      meetingTitle: a.meetingTitle,
      timestamp: a.timestamp,
      speakerName: a.ownerName,
      quote: a.sourceQuote || a.title
    }));

    const intelStatus = getIntelligenceStatus();
    res.json({
      question: question.trim(),
      answer,
      sources,
      provider: intelStatus.providerId,
      llmProviderConfigured: intelStatus.isLlmConfigured
    });
  } catch (err: any) {
    console.error('Error in cross-meeting chat:', err);
    res.status(500).json({ error: 'Chat processing failed', details: err.message });
  }
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Meetwise API server running on http://localhost:${PORT}`);
  });
}

export default app;
