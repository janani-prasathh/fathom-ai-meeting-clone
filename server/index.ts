import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { db, getFullMeetingById, initDatabase } from './db.ts';
import {
  INTAKE_TEMPLATES,
  buildMeetingFromTemplate,
  buildMeetingFromUploadedFile
} from './pipeline.ts';
import {
  getIntelligenceStatus,
  getIntelligenceProvider
} from './intelligence/index.ts';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database schema
initDatabase();

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
// 1. Health Endpoint
// ==========================================
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'meetwise-backend',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 2. GET /api/meetings (List with summary metadata)
// ==========================================
app.get('/api/meetings', (req: Request, res: Response) => {
  try {
    const meetingRows = db.prepare(`
      SELECT m.id, m.title, m.original_calendar_title AS originalCalendarTitle,
             m.date, m.duration_seconds AS durationSeconds, m.overview,
             m.active_template AS activeTemplate, m.tags_json AS tagsJson
      FROM meetings m
      ORDER BY m.date DESC
    `).all() as any[];

    // Fetch participants and counts for each meeting
    const meetings = meetingRows.map((m) => {
      const participants = db.prepare(`
        SELECT p.id, p.name, p.email, p.avatar, p.role, p.color
        FROM participants p
        JOIN meeting_participants mp ON p.id = mp.participant_id
        WHERE mp.meeting_id = ?
      `).all(m.id);

      const actionStats = db.prepare(`
        SELECT COUNT(*) AS total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed
        FROM action_items
        WHERE meeting_id = ?
      `).get(m.id) as any;

      const decisionsCount = (db.prepare(`
        SELECT COUNT(*) AS cnt FROM decisions WHERE meeting_id = ?
      `).get(m.id) as any).cnt;

      const questionsCount = (db.prepare(`
        SELECT COUNT(*) AS cnt FROM open_questions WHERE meeting_id = ?
      `).get(m.id) as any).cnt;

      const utterancesCount = (db.prepare(`
        SELECT COUNT(*) AS cnt FROM transcript_utterances WHERE meeting_id = ?
      `).get(m.id) as any).cnt;

      return {
        id: m.id,
        title: m.title,
        originalCalendarTitle: m.originalCalendarTitle || undefined,
        date: m.date,
        durationSeconds: m.durationSeconds,
        overview: m.overview,
        activeTemplate: m.activeTemplate,
        tags: JSON.parse(m.tagsJson || '[]'),
        participants,
        stats: {
          totalActions: actionStats?.total || 0,
          completedActions: actionStats?.completed || 0,
          decisionsCount,
          questionsCount,
          utterancesCount
        }
      };
    });

    res.json({
      count: meetings.length,
      meetings
    });
  } catch (err: any) {
    console.error('Error fetching meetings:', err);
    res.status(500).json({ error: 'Failed to retrieve meetings', details: err.message });
  }
});

// Helper: Persist complete meeting object into SQLite tables
export function saveMeetingToDatabase(m: any) {
  const meetingId = m.id || `meeting-${Date.now()}`;

  const insertTx = db.transaction(() => {
    // 1. Meeting record
    db.prepare(`
      INSERT OR REPLACE INTO meetings (
        id, title, original_calendar_title, date, duration_seconds,
        overview, active_template, templates_json, suggested_questions_json, tags_json
      ) VALUES (
        @id, @title, @original_calendar_title, @date, @duration_seconds,
        @overview, @active_template, @templates_json, @suggested_questions_json, @tags_json
      )
    `).run({
      id: meetingId,
      title: m.title.trim(),
      original_calendar_title: m.originalCalendarTitle || null,
      date: m.date || new Date().toISOString(),
      duration_seconds: m.durationSeconds || 0,
      overview: m.overview || '',
      active_template: m.activeTemplate || 'executive',
      templates_json: JSON.stringify(m.templates || {}),
      suggested_questions_json: JSON.stringify(m.suggestedQuestions || []),
      tags_json: JSON.stringify(m.tags || [])
    });

    // 2. Participants
    if (Array.isArray(m.participants)) {
      for (const p of m.participants) {
        db.prepare(`
          INSERT OR IGNORE INTO participants (id, name, email, avatar, role, color)
          VALUES (@id, @name, @email, @avatar, @role, @color)
        `).run(p);
        db.prepare(`
          INSERT OR REPLACE INTO meeting_participants (meeting_id, participant_id)
          VALUES (?, ?)
        `).run(meetingId, p.id);
      }
    }

    // 3. Transcript Utterances
    if (Array.isArray(m.transcript)) {
      m.transcript.forEach((u: any, idx: number) => {
        db.prepare(`
          INSERT OR REPLACE INTO transcript_utterances (
            id, meeting_id, speaker_id, speaker_name, speaker_avatar,
            start_time, end_time, text, sequence_order
          ) VALUES (
            @id, @meeting_id, @speaker_id, @speaker_name, @speaker_avatar,
            @start_time, @end_time, @text, @sequence_order
          )
        `).run({
          id: u.id || `ut-${meetingId}-${idx}`,
          meeting_id: meetingId,
          speaker_id: u.speakerId || 'p-david',
          speaker_name: u.speakerName || 'Speaker',
          speaker_avatar: u.speakerAvatar || '',
          start_time: u.startTime || 0,
          end_time: u.endTime || 0,
          text: u.text || '',
          sequence_order: idx
        });
      });
    }

    // 4. Action Items
    if (Array.isArray(m.actionItems)) {
      for (const a of m.actionItems) {
        if (a.assignee) {
          db.prepare(`
            INSERT OR IGNORE INTO participants (id, name, email, avatar, role, color)
            VALUES (@id, @name, @email, @avatar, @role, @color)
          `).run(a.assignee);
        }
        db.prepare(`
          INSERT OR REPLACE INTO action_items (
            id, meeting_id, title, assignee_id, completed, timestamp, source_quote,
            confidence, evidence_start, evidence_end, source_utterance_id
          ) VALUES (
            @id, @meeting_id, @title, @assignee_id, @completed, @timestamp, @source_quote,
            @confidence, @evidence_start, @evidence_end, @source_utterance_id
          )
        `).run({
          id: a.id || `act-${Date.now()}-${Math.random()}`,
          meeting_id: meetingId,
          title: a.title,
          assignee_id: a.assignee?.id || 'p-david',
          completed: a.completed ? 1 : 0,
          timestamp: a.timestamp || 0,
          source_quote: a.sourceQuote || '',
          confidence: a.confidence !== undefined ? a.confidence : 1.0,
          evidence_start: a.evidenceStart !== undefined ? a.evidenceStart : null,
          evidence_end: a.evidenceEnd !== undefined ? a.evidenceEnd : null,
          source_utterance_id: a.sourceUtteranceId || null
        });
      }
    }

    // 5. Decisions
    if (Array.isArray(m.keyDecisionDetails) && m.keyDecisionDetails.length > 0) {
      m.keyDecisionDetails.forEach((d: any, idx: number) => {
        db.prepare(`
          INSERT OR REPLACE INTO decisions (id, meeting_id, text, timestamp, sequence_order, confidence, source_utterance_id)
          VALUES (@id, @meeting_id, @text, @timestamp, @sequence_order, @confidence, @source_utterance_id)
        `).run({
          id: d.id || `dec-${meetingId}-${idx}`,
          meeting_id: meetingId,
          text: d.text,
          timestamp: d.timestamp !== undefined ? d.timestamp : null,
          sequence_order: idx,
          confidence: d.confidence !== undefined ? d.confidence : 1.0,
          source_utterance_id: d.sourceUtteranceId || null
        });
      });
    } else if (Array.isArray(m.keyDecisions)) {
      m.keyDecisions.forEach((text: string, idx: number) => {
        db.prepare(`
          INSERT OR REPLACE INTO decisions (id, meeting_id, text, timestamp, sequence_order, confidence, source_utterance_id)
          VALUES (@id, @meeting_id, @text, @timestamp, @sequence_order, @confidence, @source_utterance_id)
        `).run({
          id: `dec-${meetingId}-${idx}`,
          meeting_id: meetingId,
          text,
          timestamp: null,
          sequence_order: idx,
          confidence: 1.0,
          source_utterance_id: null
        });
      });
    }

    // 6. Open Questions
    if (Array.isArray(m.openQuestions)) {
      for (const q of m.openQuestions) {
        db.prepare(`
          INSERT OR REPLACE INTO open_questions (id, meeting_id, question, timestamp, speaker_name, context, confidence, source_utterance_id)
          VALUES (@id, @meeting_id, @question, @timestamp, @speaker_name, @context, @confidence, @source_utterance_id)
        `).run({
          id: q.id || `oq-${Date.now()}-${Math.random()}`,
          meeting_id: meetingId,
          question: q.question,
          timestamp: q.timestamp !== undefined ? q.timestamp : null,
          speaker_name: q.speakerName || null,
          context: q.context || null,
          confidence: q.confidence !== undefined ? q.confidence : 1.0,
          source_utterance_id: q.sourceUtteranceId || null
        });
      }
    }

    // 7. Highlights
    if (Array.isArray(m.highlights)) {
      for (const h of m.highlights) {
        db.prepare(`
          INSERT OR REPLACE INTO highlights (id, meeting_id, title, start_time, end_time, speaker_name, summary, tag)
          VALUES (@id, @meeting_id, @title, @start_time, @end_time, @speaker_name, @summary, @tag)
        `).run({
          id: h.id || `hl-${Date.now()}-${Math.random()}`,
          meeting_id: meetingId,
          title: h.title,
          start_time: h.startTime || 0,
          end_time: h.endTime || 0,
          speaker_name: h.speakerName || '',
          summary: h.summary || '',
          tag: h.tag || 'Key Decision'
        });
      }
    }

    // 8. Topics
    if (Array.isArray(m.topics)) {
      m.topics.forEach((t: any, idx: number) => {
        db.prepare(`
          INSERT OR REPLACE INTO topic_discussions (id, meeting_id, title, timestamp, bullets_json, sequence_order)
          VALUES (@id, @meeting_id, @title, @timestamp, @bullets_json, @sequence_order)
        `).run({
          id: `topic-${meetingId}-${idx}`,
          meeting_id: meetingId,
          title: t.title,
          timestamp: t.timestamp || 0,
          bullets_json: JSON.stringify(t.bullets || []),
          sequence_order: idx
        });
      });
    }
  });

  insertTx();
  return getFullMeetingById(meetingId);
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
    const participants = db.prepare('SELECT * FROM participants ORDER BY name ASC').all();
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
    const meeting = getFullMeetingById(id);

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
    const meetingExists = db.prepare('SELECT id FROM meetings WHERE id = ?').get(id);
    if (!meetingExists) {
      return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    }

    const utterances = db.prepare(`
      SELECT id, speaker_id AS speakerId, speaker_name AS speakerName,
             speaker_avatar AS speakerAvatar, start_time AS startTime,
             end_time AS endTime, text
      FROM transcript_utterances
      WHERE meeting_id = ?
      ORDER BY sequence_order ASC
    `).all(id);

    res.json({
      meetingId: id,
      count: utterances.length,
      transcript: utterances
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
    const meetingExists = db.prepare('SELECT id FROM meetings WHERE id = ?').get(id);
    if (!meetingExists) {
      return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    }

    const actionRows = db.prepare(`
      SELECT a.id, a.title, a.completed, a.timestamp, a.source_quote AS sourceQuote,
             p.id AS p_id, p.name AS p_name, p.email AS p_email,
             p.avatar AS p_avatar, p.role AS p_role, p.color AS p_color
      FROM action_items a
      JOIN participants p ON a.assignee_id = p.id
      WHERE a.meeting_id = ?
      ORDER BY a.timestamp ASC
    `).all(id) as any[];

    const actionItems = actionRows.map(row => ({
      id: row.id,
      title: row.title,
      completed: Boolean(row.completed),
      timestamp: row.timestamp,
      sourceQuote: row.sourceQuote,
      assignee: {
        id: row.p_id,
        name: row.p_name,
        email: row.p_email,
        avatar: row.p_avatar,
        role: row.p_role,
        color: row.p_color
      }
    }));

    res.json({
      meetingId: id,
      count: actionItems.length,
      actionItems
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

    const action = db.prepare(`
      SELECT * FROM action_items WHERE id = ? AND meeting_id = ?
    `).get(actionId, id) as any;

    if (!action) {
      return res.status(404).json({ error: 'Action item not found', actionId, meetingId: id });
    }

    const updates: string[] = [];
    const params: any = { actionId, meetingId: id };

    if (completed !== undefined) {
      updates.push('completed = @completed');
      params.completed = completed ? 1 : 0;
    }
    if (title !== undefined) {
      updates.push('title = @title');
      params.title = title.trim();
    }
    if (assigneeId !== undefined) {
      const participant = db.prepare('SELECT id FROM participants WHERE id = ?').get(assigneeId);
      if (!participant) {
        return res.status(400).json({ error: 'Invalid assigneeId', assigneeId });
      }
      updates.push('assignee_id = @assigneeId');
      params.assigneeId = assigneeId;
    }

    if (updates.length > 0) {
      const sql = `UPDATE action_items SET ${updates.join(', ')} WHERE id = @actionId AND meeting_id = @meetingId`;
      db.prepare(sql).run(params);
    }

    // Fetch updated row with assignee details
    const updatedRow = db.prepare(`
      SELECT a.id, a.title, a.completed, a.timestamp, a.source_quote AS sourceQuote,
             p.id AS p_id, p.name AS p_name, p.email AS p_email,
             p.avatar AS p_avatar, p.role AS p_role, p.color AS p_color
      FROM action_items a
      JOIN participants p ON a.assignee_id = p.id
      WHERE a.id = ? AND a.meeting_id = ?
    `).get(actionId, id) as any;

    res.json({
      success: true,
      actionItem: {
        id: updatedRow.id,
        title: updatedRow.title,
        completed: Boolean(updatedRow.completed),
        timestamp: updatedRow.timestamp,
        sourceQuote: updatedRow.sourceQuote,
        assignee: {
          id: updatedRow.p_id,
          name: updatedRow.p_name,
          email: updatedRow.p_email,
          avatar: updatedRow.p_avatar,
          role: updatedRow.p_role,
          color: updatedRow.p_color
        }
      }
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
    const meetingExists = db.prepare('SELECT id FROM meetings WHERE id = ?').get(id);
    if (!meetingExists) {
      return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    }

    const decisions = db.prepare(`
      SELECT id, text, timestamp
      FROM decisions
      WHERE meeting_id = ?
      ORDER BY sequence_order ASC
    `).all(id) as any[];

    res.json({
      meetingId: id,
      count: decisions.length,
      decisions: decisions.map(d => ({
        id: d.id,
        text: d.text,
        timestamp: d.timestamp !== null ? d.timestamp : undefined
      }))
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
    const meetingExists = db.prepare('SELECT id FROM meetings WHERE id = ?').get(id);
    if (!meetingExists) {
      return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    }

    const questions = db.prepare(`
      SELECT id, question, timestamp, speaker_name AS speakerName, context
      FROM open_questions
      WHERE meeting_id = ?
      ORDER BY timestamp ASC
    `).all(id) as any[];

    res.json({
      meetingId: id,
      count: questions.length,
      openQuestions: questions.map(q => ({
        id: q.id,
        question: q.question,
        timestamp: q.timestamp !== null ? q.timestamp : undefined,
        speakerName: q.speakerName || undefined,
        context: q.context || undefined
      }))
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

    let sql = `
      SELECT a.id, a.meeting_id AS meetingId, m.title AS meetingTitle, m.date AS meetingDate,
             a.title, a.completed, a.timestamp, a.source_quote AS sourceQuote,
             p.id AS ownerId, p.name AS ownerName, p.email AS ownerEmail, p.avatar AS ownerAvatar
      FROM action_items a
      JOIN meetings m ON a.meeting_id = m.id
      JOIN participants p ON a.assignee_id = p.id
      WHERE a.assignee_id = ?
    `;
    const params: any[] = [userId];

    if (completedParam !== undefined) {
      sql += ` AND a.completed = ?`;
      params.push(completedParam === 'true' || completedParam === '1' ? 1 : 0);
    }

    sql += ` ORDER BY a.completed ASC, m.date DESC, a.timestamp ASC`;

    const rows = db.prepare(sql).all(...params) as any[];

    const actionItems = rows.map((r, idx) => {
      const isCompleted = Boolean(r.completed);
      const mDate = new Date(r.meetingDate);
      // Relative due date logic:
      const dueObj = new Date(mDate.getTime() + (idx % 2 === 0 ? 1 : 3) * 24 * 60 * 60 * 1000);
      const dueDateLabel = isCompleted
        ? `Completed ${mDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : idx === 0 ? 'Due tomorrow' : `Due ${dueObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

      return {
        id: r.id,
        meetingId: r.meetingId,
        meetingTitle: r.meetingTitle,
        meetingDate: r.meetingDate,
        title: r.title,
        ownerId: r.ownerId,
        ownerName: r.ownerName,
        ownerEmail: r.ownerEmail,
        ownerAvatar: r.ownerAvatar,
        completed: isCompleted,
        dueDate: dueObj.toISOString().split('T')[0],
        dueDateLabel,
        isDueSoon: !isCompleted && idx < 2,
        timestamp: r.timestamp,
        sourceQuote: r.sourceQuote
      };
    });

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

    // Fetch meetings where user attended, owns actions, or spoke
    const meetingRows = db.prepare(`
      SELECT DISTINCT m.id, m.title, m.original_calendar_title AS originalCalendarTitle,
             m.date, m.duration_seconds AS durationSeconds, m.overview,
             m.active_template AS activeTemplate, m.tags_json AS tagsJson
      FROM meetings m
      LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
      LEFT JOIN action_items a ON m.id = a.meeting_id
      LEFT JOIN transcript_utterances u ON m.id = u.meeting_id
      WHERE mp.participant_id = ? OR a.assignee_id = ? OR u.speaker_id = ?
      ORDER BY m.date DESC
    `).all(userId, userId, userId) as any[];

    const meetings = meetingRows.map((m) => {
      const participants = db.prepare(`
        SELECT p.id, p.name, p.email, p.avatar, p.role, p.color
        FROM participants p
        JOIN meeting_participants mp ON p.id = mp.participant_id
        WHERE mp.meeting_id = ?
      `).all(m.id);

      const isAttendee = (db.prepare(`
        SELECT COUNT(*) AS cnt FROM meeting_participants WHERE meeting_id = ? AND participant_id = ?
      `).get(m.id, userId) as any).cnt > 0;

      const myActions = db.prepare(`
        SELECT COUNT(*) AS total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed
        FROM action_items
        WHERE meeting_id = ? AND assignee_id = ?
      `).get(m.id, userId) as any;

      const totalActionStats = db.prepare(`
        SELECT COUNT(*) AS total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) AS completed
        FROM action_items
        WHERE meeting_id = ?
      `).get(m.id) as any;

      const decisionsCount = (db.prepare(`
        SELECT COUNT(*) AS cnt FROM decisions WHERE meeting_id = ?
      `).get(m.id) as any).cnt;

      const questionsCount = (db.prepare(`
        SELECT COUNT(*) AS cnt FROM open_questions WHERE meeting_id = ?
      `).get(m.id) as any).cnt;

      const spokeCount = (db.prepare(`
        SELECT COUNT(*) AS cnt FROM transcript_utterances WHERE meeting_id = ? AND speaker_id = ?
      `).get(m.id, userId) as any).cnt;

      const myActionsCount = myActions?.total || 0;
      const myCompletedActionsCount = myActions?.completed || 0;
      const myPendingActionsCount = myActionsCount - myCompletedActionsCount;

      return {
        id: m.id,
        title: m.title,
        originalCalendarTitle: m.originalCalendarTitle || undefined,
        date: m.date,
        durationSeconds: m.durationSeconds,
        overview: m.overview,
        activeTemplate: m.activeTemplate,
        tags: JSON.parse(m.tagsJson || '[]'),
        participants,
        stats: {
          totalActions: totalActionStats?.total || 0,
          completedActions: totalActionStats?.completed || 0,
          decisionsCount,
          questionsCount,
          myActionsCount,
          myPendingActionsCount
        },
        involvement: {
          attended: isAttendee,
          myActionsCount,
          decisionsCount,
          spokeCount
        }
      };
    });

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

    const decisions = db.prepare(`
      SELECT d.id, d.meeting_id AS meetingId, m.title AS meetingTitle, m.date AS meetingDate,
             d.text, d.timestamp
      FROM decisions d
      JOIN meetings m ON d.meeting_id = m.id
      WHERE d.meeting_id IN (
        SELECT DISTINCT m2.id
        FROM meetings m2
        LEFT JOIN meeting_participants mp ON m2.id = mp.meeting_id
        LEFT JOIN action_items a ON m2.id = a.meeting_id
        LEFT JOIN transcript_utterances u ON m2.id = u.meeting_id
        WHERE mp.participant_id = ? OR a.assignee_id = ? OR u.speaker_id = ?
      )
      ORDER BY m.date DESC, d.sequence_order ASC
    `).all(userId, userId, userId) as any[];

    res.json({
      userId,
      count: decisions.length,
      decisions: decisions.map(d => ({
        id: d.id,
        meetingId: d.meetingId,
        meetingTitle: d.meetingTitle,
        meetingDate: d.meetingDate,
        text: d.text,
        timestamp: d.timestamp !== null ? d.timestamp : undefined
      }))
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

    const questions = db.prepare(`
      SELECT q.id, q.meeting_id AS meetingId, m.title AS meetingTitle, m.date AS meetingDate,
             q.question, q.speaker_name AS speakerName, q.timestamp, q.context
      FROM open_questions q
      JOIN meetings m ON q.meeting_id = m.id
      WHERE q.meeting_id IN (
        SELECT DISTINCT m2.id
        FROM meetings m2
        LEFT JOIN meeting_participants mp ON m2.id = mp.meeting_id
        LEFT JOIN action_items a ON m2.id = a.meeting_id
        LEFT JOIN transcript_utterances u ON m2.id = u.meeting_id
        WHERE mp.participant_id = ? OR a.assignee_id = ? OR u.speaker_id = ?
      )
      ORDER BY m.date DESC, q.timestamp ASC
    `).all(userId, userId, userId) as any[];

    res.json({
      userId,
      count: questions.length,
      openQuestions: questions.map(q => ({
        id: q.id,
        meetingId: q.meetingId,
        meetingTitle: q.meetingTitle,
        meetingDate: q.meetingDate,
        question: q.question,
        speakerName: q.speakerName || undefined,
        timestamp: q.timestamp !== null ? q.timestamp : undefined,
        context: q.context || undefined
      }))
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

    let sql = `
      SELECT a.id, a.meeting_id AS meetingId, m.title AS meetingTitle, m.date AS meetingDate,
             a.title, a.completed, a.timestamp, a.source_quote AS sourceQuote,
             p.id AS ownerId, p.name AS ownerName, p.email AS ownerEmail, p.avatar AS ownerAvatar
      FROM action_items a
      JOIN meetings m ON a.meeting_id = m.id
      JOIN participants p ON a.assignee_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (userId) {
      sql += ` AND a.assignee_id = ?`;
      params.push(userId);
    }
    if (completed !== undefined) {
      sql += ` AND a.completed = ?`;
      params.push(completed === 'true' || completed === '1' ? 1 : 0);
    }

    sql += ` ORDER BY a.completed ASC, m.date DESC, a.timestamp ASC`;

    const rows = db.prepare(sql).all(...params) as any[];

    const actionItems = rows.map((r) => ({
      id: r.id,
      meetingId: r.meetingId,
      meetingTitle: r.meetingTitle,
      meetingDate: r.meetingDate,
      title: r.title,
      ownerId: r.ownerId,
      ownerName: r.ownerName,
      ownerEmail: r.ownerEmail,
      ownerAvatar: r.ownerAvatar,
      completed: Boolean(r.completed),
      timestamp: r.timestamp,
      sourceQuote: r.sourceQuote
    }));

    res.json({
      count: actionItems.length,
      actionItems
    });
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
    const decisions = db.prepare(`
      SELECT d.id, d.meeting_id AS meetingId, m.title AS meetingTitle, m.date AS meetingDate,
             d.text, d.timestamp
      FROM decisions d
      JOIN meetings m ON d.meeting_id = m.id
      ORDER BY m.date DESC, d.sequence_order ASC
    `).all() as any[];

    res.json({
      count: decisions.length,
      decisions: decisions.map(d => ({
        id: d.id,
        meetingId: d.meetingId,
        meetingTitle: d.meetingTitle,
        meetingDate: d.meetingDate,
        text: d.text,
        timestamp: d.timestamp !== null ? d.timestamp : undefined
      }))
    });
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
    const questions = db.prepare(`
      SELECT q.id, q.meeting_id AS meetingId, m.title AS meetingTitle, m.date AS meetingDate,
             q.question, q.speaker_name AS speakerName, q.timestamp, q.context
      FROM open_questions q
      JOIN meetings m ON q.meeting_id = m.id
      ORDER BY m.date DESC, q.timestamp ASC
    `).all() as any[];

    res.json({
      count: questions.length,
      openQuestions: questions.map(q => ({
        id: q.id,
        meetingId: q.meetingId,
        meetingTitle: q.meetingTitle,
        meetingDate: q.meetingDate,
        question: q.question,
        speakerName: q.speakerName || undefined,
        timestamp: q.timestamp !== null ? q.timestamp : undefined,
        context: q.context || undefined
      }))
    });
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

    const existing = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id) as any;
    if (!existing) {
      return res.status(404).json({ error: 'Meeting not found', meetingId: id });
    }

    const updates: string[] = [];
    const params: any = { id };

    if (title !== undefined && title.trim()) {
      updates.push('title = @title');
      params.title = title.trim();
    }
    if (activeTemplate !== undefined && activeTemplate.trim()) {
      updates.push('active_template = @activeTemplate');
      params.activeTemplate = activeTemplate.trim();
    }
    if (overview !== undefined) {
      updates.push('overview = @overview');
      params.overview = overview.trim();
    }

    if (updates.length > 0) {
      updates.push("updated_at = datetime('now')");
      const sql = `UPDATE meetings SET ${updates.join(', ')} WHERE id = @id`;
      db.prepare(sql).run(params);
    }

    const updatedMeeting = getFullMeetingById(id);
    res.json({
      success: true,
      meeting: updatedMeeting
    });
  } catch (err: any) {
    console.error(`Error updating meeting ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to update meeting', details: err.message });
  }
});

// ==========================================
// 10. GET /api/search?q=query (Database-backed search with User Context)
// ==========================================
app.get('/api/search', (req: Request, res: Response) => {
  try {
    const rawQuery = ((req.query.q as string) || '').trim();
    const userId = ((req.query.userId as string) || 'p-david').trim();

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

    // 1. Natural language check: "my actions", "my pending actions", "my overdue actions"
    const isMyActionsQuery = /\bmy\s+(pending\s+|overdue\s+|open\s+)?(action|task)s?\b/i.test(qLower) ||
      /\b(assigned\s+to\s+me)\b/i.test(qLower);
    const isOnlyPending = qLower.includes('pending') || qLower.includes('overdue') || qLower.includes('open');

    if (isMyActionsQuery) {
      let sql = `
        SELECT a.id, a.meeting_id AS meetingId, m.title AS meetingTitle,
               a.title, p.name AS assigneeName, p.id AS assigneeId, a.timestamp, a.completed
        FROM action_items a
        JOIN meetings m ON a.meeting_id = m.id
        JOIN participants p ON a.assignee_id = p.id
        WHERE a.assignee_id = ?
      `;
      if (isOnlyPending) {
        sql += ` AND a.completed = 0`;
      }
      sql += ` ORDER BY m.date DESC, a.timestamp ASC`;

      const userActions = db.prepare(sql).all(userId) as any[];

      // Also get the distinct meetings where these actions belong
      const meetingIds = [...new Set(userActions.map(a => a.meetingId))];
      let userMeetings: any[] = [];
      if (meetingIds.length > 0) {
        const placeholders = meetingIds.map(() => '?').join(',');
        userMeetings = db.prepare(`
          SELECT id, title, overview, date, duration_seconds AS durationSeconds, tags_json AS tagsJson
          FROM meetings
          WHERE id IN (${placeholders})
          ORDER BY date DESC
        `).all(...meetingIds) as any[];
      }

      return res.json({
        query: rawQuery,
        totalMatches: userActions.length + userMeetings.length,
        isUserScoped: true,
        meetings: userMeetings.map(m => ({
          ...m,
          tags: JSON.parse(m.tagsJson || '[]')
        })),
        transcripts: [],
        actionItems: userActions.map(a => ({
          id: a.id,
          meetingId: a.meetingId,
          meetingTitle: a.meetingTitle,
          title: a.title,
          assigneeName: a.assigneeName,
          assigneeId: a.assigneeId,
          timestamp: a.timestamp,
          completed: Boolean(a.completed)
        })),
        decisions: [],
        openQuestions: []
      });
    }

    // 1b. Check for generic "pending actions" or "pending tasks"
    const isGenericPendingQuery = /\b(pending\s+actions?|pending\s+tasks?|open\s+actions?|open\s+tasks?)\b/i.test(qLower) ||
      qLower === 'pending' || qLower === 'actions' || qLower === 'tasks';

    if (isGenericPendingQuery) {
      const pendingActions = db.prepare(`
        SELECT a.id, a.meeting_id AS meetingId, m.title AS meetingTitle,
               a.title, p.name AS assigneeName, p.id AS assigneeId, a.timestamp, a.completed
        FROM action_items a
        JOIN meetings m ON a.meeting_id = m.id
        JOIN participants p ON a.assignee_id = p.id
        WHERE a.completed = 0
        ORDER BY (CASE WHEN a.assignee_id = ? THEN 0 ELSE 1 END), m.date DESC, a.timestamp ASC
      `).all(userId) as any[];

      const meetingIds = [...new Set(pendingActions.map(a => a.meetingId))];
      let relatedMeetings: any[] = [];
      if (meetingIds.length > 0) {
        const placeholders = meetingIds.map(() => '?').join(',');
        relatedMeetings = db.prepare(`
          SELECT id, title, overview, date, duration_seconds AS durationSeconds, tags_json AS tagsJson
          FROM meetings
          WHERE id IN (${placeholders})
          ORDER BY date DESC
        `).all(...meetingIds) as any[];
      }

      return res.json({
        query: rawQuery,
        totalMatches: pendingActions.length + relatedMeetings.length,
        isUserScoped: false,
        meetings: relatedMeetings.map(m => ({
          ...m,
          tags: JSON.parse(m.tagsJson || '[]')
        })),
        transcripts: [],
        actionItems: pendingActions.map(a => ({
          id: a.id,
          meetingId: a.meetingId,
          meetingTitle: a.meetingTitle,
          title: a.title,
          assigneeName: a.assigneeName,
          assigneeId: a.assigneeId,
          timestamp: a.timestamp,
          completed: Boolean(a.completed)
        })),
        decisions: [],
        openQuestions: [],
        people: []
      });
    }

    // 2. Natural language check: "decisions" or "decisions this week"
    if (qLower === 'decisions' || qLower === 'decisions this week' || qLower === 'all decisions') {
      const allDecisions = db.prepare(`
        SELECT d.id, d.meeting_id AS meetingId, m.title AS meetingTitle,
               d.text, d.timestamp
        FROM decisions d
        JOIN meetings m ON d.meeting_id = m.id
        ORDER BY m.date DESC, d.sequence_order ASC
        LIMIT 30
      `).all() as any[];

      return res.json({
        query: rawQuery,
        totalMatches: allDecisions.length,
        meetings: [],
        transcripts: [],
        actionItems: [],
        decisions: allDecisions,
        openQuestions: [],
        people: []
      });
    }

    // 3. Natural language check: "open questions" or "unresolved questions"
    if (qLower === 'open questions' || qLower === 'unresolved questions' || qLower === 'questions') {
      const allQuestions = db.prepare(`
        SELECT q.id, q.meeting_id AS meetingId, m.title AS meetingTitle,
               q.question, q.speaker_name AS speakerName, q.timestamp
        FROM open_questions q
        JOIN meetings m ON q.meeting_id = m.id
        ORDER BY m.date DESC, q.timestamp ASC
        LIMIT 30
      `).all() as any[];

      return res.json({
        query: rawQuery,
        totalMatches: allQuestions.length,
        meetings: [],
        transcripts: [],
        actionItems: [],
        decisions: [],
        openQuestions: allQuestions,
        people: []
      });
    }

    // 4. General Keyword Search across all categories including People
    const pattern = `%${rawQuery}%`;

    // Category 1: People (Participants)
    const matchingPeople = db.prepare(`
      SELECT id, name, email, avatar, role, color
      FROM participants
      WHERE name LIKE ? OR email LIKE ? OR role LIKE ?
      ORDER BY (CASE WHEN id = ? THEN 0 ELSE 1 END), name ASC
      LIMIT 10
    `).all(pattern, pattern, pattern, userId) as any[];

    // Category 2: Meetings
    const matchingMeetings = db.prepare(`
      SELECT id, title, overview, date, duration_seconds AS durationSeconds, tags_json AS tagsJson
      FROM meetings
      WHERE title LIKE ? OR overview LIKE ? OR tags_json LIKE ?
      ORDER BY date DESC
      LIMIT 20
    `).all(pattern, pattern, pattern) as any[];

    // Category 3: Decisions
    const matchingDecisions = db.prepare(`
      SELECT d.id, d.meeting_id AS meetingId, m.title AS meetingTitle,
             d.text, d.timestamp
      FROM decisions d
      JOIN meetings m ON d.meeting_id = m.id
      WHERE d.text LIKE ?
      ORDER BY m.date DESC
      LIMIT 20
    `).all(pattern) as any[];

    // Category 4: Action Items (prioritize user actions)
    const matchingActions = db.prepare(`
      SELECT a.id, a.meeting_id AS meetingId, m.title AS meetingTitle,
             a.title, p.name AS assigneeName, p.id AS assigneeId, a.timestamp, a.completed
      FROM action_items a
      JOIN meetings m ON a.meeting_id = m.id
      JOIN participants p ON a.assignee_id = p.id
      WHERE a.title LIKE ? OR p.name LIKE ? OR a.source_quote LIKE ?
      ORDER BY (CASE WHEN a.assignee_id = ? THEN 0 ELSE 1 END), m.date DESC
      LIMIT 20
    `).all(pattern, pattern, pattern, userId) as any[];

    // Category 5: Open Questions
    const matchingQuestions = db.prepare(`
      SELECT q.id, q.meeting_id AS meetingId, m.title AS meetingTitle,
             q.question, q.speaker_name AS speakerName, q.timestamp
      FROM open_questions q
      JOIN meetings m ON q.meeting_id = m.id
      WHERE q.question LIKE ? OR q.speaker_name LIKE ?
      ORDER BY m.date DESC
      LIMIT 20
    `).all(pattern, pattern) as any[];

    // Category 6: Spoken Evidence (Transcripts)
    const matchingUtterances = db.prepare(`
      SELECT u.id, u.meeting_id AS meetingId, m.title AS meetingTitle,
             u.speaker_name AS speakerName, u.start_time AS timestamp, u.text
      FROM transcript_utterances u
      JOIN meetings m ON u.meeting_id = m.id
      WHERE u.text LIKE ? OR u.speaker_name LIKE ?
      ORDER BY m.date DESC, u.start_time ASC
      LIMIT 30
    `).all(pattern, pattern) as any[];

    const totalMatches =
      matchingPeople.length +
      matchingMeetings.length +
      matchingDecisions.length +
      matchingActions.length +
      matchingQuestions.length +
      matchingUtterances.length;

    res.json({
      query: rawQuery,
      totalMatches,
      people: matchingPeople,
      meetings: matchingMeetings.map(m => ({
        ...m,
        tags: JSON.parse(m.tagsJson || '[]')
      })),
      decisions: matchingDecisions,
      actionItems: matchingActions.map(a => ({
        id: a.id,
        meetingId: a.meetingId,
        meetingTitle: a.meetingTitle,
        title: a.title,
        assigneeName: a.assigneeName,
        assigneeId: a.assigneeId,
        timestamp: a.timestamp,
        completed: Boolean(a.completed)
      })),
      openQuestions: matchingQuestions,
      transcripts: matchingUtterances
    });
  } catch (err: any) {
    console.error('Error during search:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

// ==========================================
// Helper: Format seconds to MM:SS
// ==========================================
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
    const { question, userId = 'p-david' } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const meeting = db.prepare('SELECT id, title, overview, date FROM meetings WHERE id = ?').get(meetingId) as any;
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found', meetingId });
    }

    // Load meeting entities from database
    const decisions = db.prepare(`
      SELECT id, text, timestamp
      FROM decisions
      WHERE meeting_id = ?
      ORDER BY sequence_order ASC
    `).all(meetingId) as any[];

    const actions = db.prepare(`
      SELECT a.id, a.title, a.completed, a.timestamp, a.source_quote AS sourceQuote,
             p.name AS assigneeName, p.id AS assigneeId
      FROM action_items a
      JOIN participants p ON a.assignee_id = p.id
      WHERE a.meeting_id = ?
      ORDER BY a.timestamp ASC
    `).all(meetingId) as any[];

    const questions = db.prepare(`
      SELECT id, question, timestamp, speaker_name AS speakerName, context
      FROM open_questions
      WHERE meeting_id = ?
      ORDER BY timestamp ASC
    `).all(meetingId) as any[];

    const utterances = db.prepare(`
      SELECT id, speaker_name AS speakerName, start_time AS timestamp, text
      FROM transcript_utterances
      WHERE meeting_id = ?
      ORDER BY sequence_order ASC
    `).all(meetingId) as any[];

    const qLower = question.trim().toLowerCase();
    let answer = '';
    const sources: Array<{
      meetingId: string;
      meetingTitle: string;
      timestamp: number;
      speakerName?: string;
      quote: string;
    }> = [];

    // --- Intent 1: Decisions ---
    if (/\b(decis(ion|ions)|decid(e|ed)|agree(d|ment|ments)?)\b/i.test(qLower)) {
      if (decisions.length > 0) {
        answer = `The team agreed on ${decisions.length} key decision${decisions.length > 1 ? 's' : ''} during "${meeting.title}":\n\n` +
          decisions.map((d, i) => `${i + 1}. ${d.text}${d.timestamp !== null ? ` (${formatTimestamp(d.timestamp)})` : ''}`).join('\n');

        // Link sources to matching transcript utterances or decisions
        for (const d of decisions) {
          const matchU = utterances.find(u =>
            (d.timestamp !== null && Math.abs(u.timestamp - d.timestamp) <= 15) ||
            u.text.toLowerCase().includes('sqlite') ||
            u.text.toLowerCase().includes('decid') ||
            u.text.toLowerCase().includes('agree')
          );
          sources.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            timestamp: d.timestamp !== null ? d.timestamp : (matchU?.timestamp || 0),
            speakerName: matchU?.speakerName || 'Meeting Decision',
            quote: matchU?.text ? matchU.text.slice(0, 140) + '...' : d.text
          });
        }
      } else {
        answer = `No formal decisions were recorded in the database for "${meeting.title}".`;
      }
    }

    // --- Intent 2: Tasks, Action Items & Ownership ---
    else if (/\b(who\s+owns|assigned|action(s)?|task(s)?|commit(ment|ted)?|owner|to\s+me)\b/i.test(qLower)) {
      const isUserQuery = /\b(my|me|assigned to me)\b/i.test(qLower);

      if (isUserQuery) {
        const userActions = actions.filter(a => a.assigneeId === userId);
        if (userActions.length > 0) {
          answer = `You have ${userActions.length} action item${userActions.length > 1 ? 's' : ''} assigned to you in this meeting:\n\n` +
            userActions.map((a, i) => `${i + 1}. ${a.title} [${a.completed ? 'Completed' : 'Pending'}] (${formatTimestamp(a.timestamp)})`).join('\n');

          for (const a of userActions) {
            sources.push({
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              timestamp: a.timestamp,
              speakerName: a.assigneeName,
              quote: a.sourceQuote || a.title
            });
          }
        } else {
          answer = `No action items are currently assigned to you in "${meeting.title}".`;
        }
      } else {
        // Check for specific topic (e.g. sqlite, benchmark, test, runner, etc.)
        const topicWords = qLower.split(/\s+/).filter(w =>
          w.length > 3 && !['what', 'when', 'where', 'which', 'owns', 'task', 'actions', 'item', 'items', 'this', 'meeting'].includes(w)
        );

        let filteredActions = actions;
        if (topicWords.length > 0) {
          const matched = actions.filter(a =>
            topicWords.some(tw => a.title.toLowerCase().includes(tw) || (a.sourceQuote && a.sourceQuote.toLowerCase().includes(tw)))
          );
          if (matched.length > 0) {
            filteredActions = matched;
          }
        }

        if (filteredActions.length > 0) {
          answer = `Identified ${filteredActions.length} action item${filteredActions.length > 1 ? 's' : ''} in "${meeting.title}":\n\n` +
            filteredActions.map((a, i) => `${i + 1}. "${a.title}"\n   • Assignee: ${a.assigneeName}\n   • Status: ${a.completed ? 'Completed' : 'Pending'}\n   • Evidence time: ${formatTimestamp(a.timestamp)}`).join('\n\n');

          for (const a of filteredActions) {
            sources.push({
              meetingId: meeting.id,
              meetingTitle: meeting.title,
              timestamp: a.timestamp,
              speakerName: a.assigneeName,
              quote: a.sourceQuote || a.title
            });
          }
        } else {
          answer = `No action items matching your query were found in "${meeting.title}".`;
        }
      }
    }

    // --- Intent 3: Open Questions / Unresolved ---
    else if (/\b(question(s)?|unresolved|unanswered|open)\b/i.test(qLower)) {
      if (questions.length > 0) {
        answer = `There ${questions.length > 1 ? 'are' : 'is'} ${questions.length} unresolved open question${questions.length > 1 ? 's' : ''} recorded for this meeting:\n\n` +
          questions.map((q, i) => `${i + 1}. "${q.question}"${q.speakerName ? ` — Raised by ${q.speakerName}` : ''}${q.timestamp !== null ? ` at ${formatTimestamp(q.timestamp)}` : ''}`).join('\n');

        for (const q of questions) {
          sources.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            timestamp: q.timestamp !== null ? q.timestamp : 0,
            speakerName: q.speakerName || 'Participant',
            quote: q.question
          });
        }
      } else {
        answer = `All questions in "${meeting.title}" were addressed or no open questions were recorded.`;
      }
    }

    // --- Intent 4: Keyword / Spoken Evidence Search in Transcripts ---
    else {
      const stopWords = new Set([
        'what', 'when', 'where', 'how', 'who', 'which', 'this', 'that', 'were',
        'made', 'have', 'been', 'with', 'from', 'about', 'does', 'will', 'would',
        'could', 'should', 'tell', 'show', 'meeting', 'call', 'said', 'say', 'did',
        'the', 'and', 'for', 'are', 'not', 'any', 'can', 'our', 'you', 'your', 'his', 'her', 'them', 'is', 'it', 'to', 'in', 'at'
      ]);
      const keywords = qLower
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !stopWords.has(w));

      // Check if a specific speaker is named in the question (e.g. "Sarah", "David", "Elena", etc.)
      const namedSpeaker = ['sarah', 'david', 'elena', 'marcus', 'maya', 'thomas', 'rachel', 'alex'].find(name =>
        new RegExp(`\\b${name}\\b`, 'i').test(qLower)
      );

      // Score utterances by whole-word keyword matches and speaker affinity
      const keywordRegexes = keywords.map(kw => ({
        word: kw,
        regex: new RegExp(`\\b${kw}\\b`, 'i')
      }));

      const scoredUtterances = utterances.map(u => {
        const uText = u.text;
        const uSpeaker = u.speakerName || '';
        let score = 0;

        // If query explicitly names this speaker, give a strong match boost
        if (namedSpeaker && new RegExp(`\\b${namedSpeaker}\\b`, 'i').test(uSpeaker)) {
          score += 4;
        }

        for (const { regex } of keywordRegexes) {
          if (regex.test(uText)) score += 2;
          if (regex.test(uSpeaker)) score += 1;
        }

        return { ...u, score };
      }).filter(u => u.score >= 2).sort((a, b) => b.score - a.score);

      if (scoredUtterances.length > 0) {
        const topMatches = scoredUtterances.slice(0, 2);
        const primarySpeaker = topMatches[0].speakerName;

        if (namedSpeaker && primarySpeaker.toLowerCase().includes(namedSpeaker)) {
          answer = `${primarySpeaker} stated during "${meeting.title}":\n\n` +
            topMatches.map(u => `"${u.text}" (${formatTimestamp(u.timestamp)})`).join('\n\n');
        } else {
          answer = `Based on the spoken evidence in "${meeting.title}":\n\n` +
            topMatches.map(u => `"${u.text}"\n— ${u.speakerName} (${formatTimestamp(u.timestamp)})`).join('\n\n');
        }

        for (const u of topMatches) {
          sources.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            timestamp: u.timestamp,
            speakerName: u.speakerName,
            quote: u.text
          });
        }
      } else {
        // Clean, grounded enterprise statement when evidence is insufficient
        answer = `The available meeting records and spoken transcript do not contain enough information to answer: "${question}". Meetwise responses are strictly restricted to verified evidence.`;
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

    const qLower = question.trim().toLowerCase();

    // Check for "my actions" across all meetings
    if (/\b(my|me|assigned to me)\b/i.test(qLower) && /\b(action(s)?|task(s)?)\b/i.test(qLower)) {
      const userActions = db.prepare(`
        SELECT a.id, a.meeting_id AS meetingId, m.title AS meetingTitle,
               a.title, a.timestamp, a.completed, a.source_quote AS sourceQuote, p.name AS assigneeName
        FROM action_items a
        JOIN meetings m ON a.meeting_id = m.id
        JOIN participants p ON a.assignee_id = p.id
        WHERE a.assignee_id = ?
        ORDER BY m.date DESC, a.timestamp ASC
      `).all(userId) as any[];

      const answer = userActions.length > 0
        ? `Across your meetings, you have ${userActions.length} action items assigned to you:\n\n` +
        userActions.map((a, i) => `${i + 1}. "${a.title}" [${a.completed ? 'Completed' : 'Pending'}]\n   • Meeting: ${a.meetingTitle} (${formatTimestamp(a.timestamp)})`).join('\n\n')
        : 'You have no action items assigned to you across any meetings.';

      const sources = userActions.map(a => ({
        meetingId: a.meetingId,
        meetingTitle: a.meetingTitle,
        timestamp: a.timestamp,
        speakerName: a.assigneeName,
        quote: a.sourceQuote || a.title
      }));

      return res.json({
        question: question.trim(),
        answer,
        sources,
        llmProviderConfigured: false
      });
    }

    // Ownership or topic actions across all meetings (e.g. "Who owns the SQLite benchmark?")
    if (/\b(who\s+owns|assigned|action(s)?|task(s)?|commit(ment|ted)?|owner)\b/i.test(qLower)) {
      const topicWords = qLower.split(/\s+/).filter(w =>
        w.length > 3 && !['what', 'when', 'where', 'which', 'owns', 'task', 'actions', 'item', 'items', 'this', 'meeting'].includes(w)
      );

      if (topicWords.length > 0) {
        const allActions = db.prepare(`
          SELECT a.id, a.meeting_id AS meetingId, m.title AS meetingTitle,
                 a.title, a.timestamp, a.completed, a.source_quote AS sourceQuote, p.name AS assigneeName
          FROM action_items a
          JOIN meetings m ON a.meeting_id = m.id
          JOIN participants p ON a.assignee_id = p.id
          ORDER BY m.date DESC
        `).all() as any[];

        const matched = allActions.filter(a =>
          topicWords.some(tw =>
            a.title.toLowerCase().includes(tw) ||
            (a.sourceQuote && a.sourceQuote.toLowerCase().includes(tw)) ||
            a.assigneeName.toLowerCase().includes(tw)
          )
        );

        if (matched.length > 0) {
          const answer = `Found ${matched.length} action item${matched.length > 1 ? 's' : ''} across meetings matching your query:\n\n` +
            matched.map((a, i) => `${i + 1}. "${a.title}"\n   • Assignee: ${a.assigneeName}\n   • Status: ${a.completed ? 'Completed' : 'Pending'}\n   • Meeting: ${a.meetingTitle} (${formatTimestamp(a.timestamp)})`).join('\n\n');

          const sources = matched.map(a => ({
            meetingId: a.meetingId,
            meetingTitle: a.meetingTitle,
            timestamp: a.timestamp,
            speakerName: a.assigneeName,
            quote: a.sourceQuote || a.title
          }));

          const intelStatus = getIntelligenceStatus();
          return res.json({
            question: question.trim(),
            answer,
            sources,
            provider: intelStatus.providerId,
            llmProviderConfigured: intelStatus.isLlmConfigured
          });
        }
      }
    }

    // Decisions across meetings
    if (/\b(decis(ion|ions)|decid(e|ed))\b/i.test(qLower)) {
      const allDecisions = db.prepare(`
        SELECT d.id, d.meeting_id AS meetingId, m.title AS meetingTitle,
               d.text, d.timestamp
        FROM decisions d
        JOIN meetings m ON d.meeting_id = m.id
        ORDER BY m.date DESC
        LIMIT 10
      `).all() as any[];

      const answer = `Here are the latest decisions agreed across your meetings:\n\n` +
        allDecisions.map((d, i) => `${i + 1}. ${d.text} (${d.meetingTitle}${d.timestamp !== null ? ` · ${formatTimestamp(d.timestamp)}` : ''})`).join('\n');

      const sources = allDecisions.map(d => ({
        meetingId: d.meetingId,
        meetingTitle: d.meetingTitle,
        timestamp: d.timestamp !== null ? d.timestamp : 0,
        quote: d.text
      }));

      const intelStatus = getIntelligenceStatus();
      return res.json({
        question: question.trim(),
        answer,
        sources,
        provider: intelStatus.providerId,
        llmProviderConfigured: intelStatus.isLlmConfigured
      });
    }

    // Default cross-meeting search for matching transcripts
    const pattern = `%${question.trim()}%`;
    const matchingUtterances = db.prepare(`
      SELECT u.id, u.meeting_id AS meetingId, m.title AS meetingTitle,
             u.speaker_name AS speakerName, u.start_time AS timestamp, u.text
      FROM transcript_utterances u
      JOIN meetings m ON u.meeting_id = m.id
      WHERE u.text LIKE ? OR u.speaker_name LIKE ?
      ORDER BY m.date DESC
      LIMIT 3
    `).all(pattern, pattern) as any[];

    const intelStatus = getIntelligenceStatus();
    if (matchingUtterances.length > 0) {
      const answer = `Relevant meeting evidence found across ${matchingUtterances.length} transcript record${matchingUtterances.length > 1 ? 's' : ''}:\n\n` +
        matchingUtterances.map(u => `"${u.text}"\n— ${u.speakerName} in "${u.meetingTitle}" (${formatTimestamp(u.timestamp)})`).join('\n\n');

      const sources = matchingUtterances.map(u => ({
        meetingId: u.meetingId,
        meetingTitle: u.meetingTitle,
        timestamp: u.timestamp,
        speakerName: u.speakerName,
        quote: u.text
      }));

      return res.json({
        question: question.trim(),
        answer,
        sources,
        provider: intelStatus.providerId,
        llmProviderConfigured: intelStatus.isLlmConfigured
      });
    }

    res.json({
      question: question.trim(),
      answer: `The available meeting records and spoken transcripts do not contain enough information to answer: "${question}". Meetwise responses are strictly restricted to verified evidence.`,
      sources: [],
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

/// Start server locally, but let Vercel handle the serverless function
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Meetwise API server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health`);
    console.log(`   Meetings list: http://localhost:${PORT}/api/meetings`);
  });
}

export default app;
