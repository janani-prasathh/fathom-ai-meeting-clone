// Database path: on Vercel, SQLite is bypassed in favor of pure in-memory store
export const DB_PATH = process.env.DB_PATH || path.join('/tmp', 'meetwise.db');

// Lazily instantiate database only if not running in Vercel serverless environment
export let db: any = null;

export function getDb(): any {
  if (process.env.VERCEL) {
    return null;
  }
  if (!db) {
    try {
      // Dynamic non-analyzable module name to avoid bundler resolution
      const pkg = 'better-sqlite3';
      const Database = (eval('require'))(pkg);
      db = new Database(DB_PATH);
      db.pragma('foreign_keys = ON');
      db.pragma('journal_mode = WAL');
    } catch (err) {
      console.warn('SQLite initialization skipped or failed:', err);
    }
  }
  return db;
}

/**
 * Initialize all database tables and indexes.
 */
export function initDatabase() {
  if (process.env.VERCEL) return;
  const database = getDb();
  if (!database) return;
  database.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatar TEXT NOT NULL,
      role TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      original_calendar_title TEXT,
      date TEXT NOT NULL,
      duration_seconds REAL NOT NULL,
      overview TEXT NOT NULL,
      active_template TEXT DEFAULT 'executive',
      templates_json TEXT NOT NULL,
      suggested_questions_json TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS meeting_participants (
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      participant_id TEXT NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
      PRIMARY KEY (meeting_id, participant_id)
    );

    CREATE TABLE IF NOT EXISTS transcript_utterances (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      speaker_id TEXT NOT NULL REFERENCES participants(id),
      speaker_name TEXT NOT NULL,
      speaker_avatar TEXT NOT NULL,
      start_time REAL NOT NULL,
      end_time REAL NOT NULL,
      text TEXT NOT NULL,
      sequence_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS action_items (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      assignee_id TEXT NOT NULL REFERENCES participants(id),
      completed INTEGER NOT NULL DEFAULT 0,
      timestamp REAL NOT NULL,
      source_quote TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      timestamp REAL,
      sequence_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS open_questions (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      question TEXT NOT NULL,
      timestamp REAL,
      speaker_name TEXT,
      context TEXT
    );

    CREATE TABLE IF NOT EXISTS highlights (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      start_time REAL NOT NULL,
      end_time REAL NOT NULL,
      speaker_name TEXT NOT NULL,
      summary TEXT NOT NULL,
      tag TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS topic_discussions (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      timestamp REAL NOT NULL,
      bullets_json TEXT NOT NULL,
      sequence_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS shares (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      name TEXT,
      avatar TEXT,
      is_attendee INTEGER NOT NULL DEFAULT 0,
      shared_at TEXT NOT NULL,
      revoked INTEGER NOT NULL DEFAULT 0
    );

    -- Performance Indexes
    CREATE INDEX IF NOT EXISTS idx_utterances_meeting ON transcript_utterances(meeting_id, sequence_order);
    CREATE INDEX IF NOT EXISTS idx_actions_meeting ON action_items(meeting_id);
    CREATE INDEX IF NOT EXISTS idx_actions_assignee ON action_items(assignee_id);
    CREATE INDEX IF NOT EXISTS idx_decisions_meeting ON decisions(meeting_id);
    CREATE INDEX IF NOT EXISTS idx_questions_meeting ON open_questions(meeting_id);
    CREATE INDEX IF NOT EXISTS idx_topics_meeting ON topic_discussions(meeting_id);
    CREATE INDEX IF NOT EXISTS idx_highlights_meeting ON highlights(meeting_id);
    CREATE INDEX IF NOT EXISTS idx_meeting_participants ON meeting_participants(meeting_id);
    CREATE INDEX IF NOT EXISTS idx_mp_participant ON meeting_participants(participant_id);
  `);

  // Safe Column Migrations for Grounding Metadata
  const safeAddColumn = (table: string, column: string, def: string) => {
    try {
      const cols = database.prepare(`PRAGMA table_info(${table})`).all() as any[];
      if (!cols.some(c => c.name === column)) {
        database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
      }
    } catch {
      // ignore if already added
    }
  };

  safeAddColumn('action_items', 'confidence', 'REAL DEFAULT 1.0');
  safeAddColumn('action_items', 'evidence_start', 'REAL');
  safeAddColumn('action_items', 'evidence_end', 'REAL');
  safeAddColumn('action_items', 'source_utterance_id', 'TEXT');

  safeAddColumn('decisions', 'confidence', 'REAL DEFAULT 1.0');
  safeAddColumn('decisions', 'source_utterance_id', 'TEXT');

  safeAddColumn('open_questions', 'confidence', 'REAL DEFAULT 1.0');
  safeAddColumn('open_questions', 'source_utterance_id', 'TEXT');
}

if (!process.env.VERCEL) {
  initDatabase();
}

/**
 * Helper to fetch a complete Meeting object matching the TypeScript definition in src/types.ts
 */
export function getFullMeetingById(id: string) {
  const meetingRow = db.prepare(`SELECT * FROM meetings WHERE id = ?`).get(id) as any;
  if (!meetingRow) return null;

  // 1. Participants
  const participants = db.prepare(`
    SELECT p.* FROM participants p
    JOIN meeting_participants mp ON p.id = mp.participant_id
    WHERE mp.meeting_id = ?
  `).all(id) as any[];

  // 2. Transcripts
  const transcriptRows = db.prepare(`
    SELECT id, speaker_id AS speakerId, speaker_name AS speakerName,
           speaker_avatar AS speakerAvatar, start_time AS startTime,
           end_time AS endTime, text
    FROM transcript_utterances
    WHERE meeting_id = ?
    ORDER BY sequence_order ASC
  `).all(id) as any[];

  // 3. Action Items
  const actionRows = db.prepare(`
    SELECT a.id, a.title, a.completed, a.timestamp, a.source_quote AS sourceQuote,
           a.confidence, a.evidence_start AS evidenceStart, a.evidence_end AS evidenceEnd,
           a.source_utterance_id AS sourceUtteranceId,
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
    confidence: row.confidence !== null && row.confidence !== undefined ? row.confidence : 1.0,
    evidenceStart: row.evidenceStart !== null ? row.evidenceStart : undefined,
    evidenceEnd: row.evidenceEnd !== null ? row.evidenceEnd : undefined,
    sourceUtteranceId: row.sourceUtteranceId || undefined,
    assignee: {
      id: row.p_id,
      name: row.p_name,
      email: row.p_email,
      avatar: row.p_avatar,
      role: row.p_role,
      color: row.p_color
    }
  }));

  // 4. Decisions
  const decisionRows = db.prepare(`
    SELECT id, text, timestamp, confidence, source_utterance_id AS sourceUtteranceId
    FROM decisions
    WHERE meeting_id = ?
    ORDER BY sequence_order ASC
  `).all(id) as any[];

  const keyDecisions = decisionRows.map(d => d.text);
  const keyDecisionDetails = decisionRows.map(d => ({
    id: d.id,
    text: d.text,
    timestamp: d.timestamp !== null ? d.timestamp : undefined,
    confidence: d.confidence !== null && d.confidence !== undefined ? d.confidence : 1.0,
    sourceUtteranceId: d.sourceUtteranceId || undefined
  }));

  // 5. Open Questions
  const openQuestionRows = db.prepare(`
    SELECT id, question, timestamp, speaker_name AS speakerName, context,
           confidence, source_utterance_id AS sourceUtteranceId
    FROM open_questions
    WHERE meeting_id = ?
    ORDER BY timestamp ASC
  `).all(id) as any[];

  const openQuestions = openQuestionRows.map(q => ({
    id: q.id,
    question: q.question,
    timestamp: q.timestamp !== null ? q.timestamp : undefined,
    speakerName: q.speakerName || undefined,
    context: q.context || undefined,
    confidence: q.confidence !== null && q.confidence !== undefined ? q.confidence : 1.0,
    sourceUtteranceId: q.sourceUtteranceId || undefined
  }));

  // 6. Topics
  const topicRows = db.prepare(`
    SELECT title, timestamp, bullets_json
    FROM topic_discussions
    WHERE meeting_id = ?
    ORDER BY sequence_order ASC
  `).all(id) as any[];

  const topics = topicRows.map(t => ({
    title: t.title,
    timestamp: t.timestamp,
    bullets: JSON.parse(t.bullets_json)
  }));

  // 7. Highlights
  const highlightRows = db.prepare(`
    SELECT id, title, start_time AS startTime, end_time AS endTime,
           speaker_name AS speakerName, summary, tag
    FROM highlights
    WHERE meeting_id = ?
    ORDER BY start_time ASC
  `).all(id) as any[];

  // 8. Shares
  const shareRows = db.prepare(`
    SELECT email, name, avatar, is_attendee AS isAttendee, shared_at AS sharedAt, revoked
    FROM shares
    WHERE meeting_id = ?
    ORDER BY shared_at ASC
  `).all(id) as any[];

  const shares = shareRows.map(s => ({
    email: s.email,
    name: s.name || undefined,
    avatar: s.avatar || undefined,
    isAttendee: Boolean(s.isAttendee),
    sharedAt: s.sharedAt,
    revoked: Boolean(s.revoked)
  }));

  return {
    id: meetingRow.id,
    title: meetingRow.title,
    originalCalendarTitle: meetingRow.original_calendar_title || undefined,
    date: meetingRow.date,
    durationSeconds: meetingRow.duration_seconds,
    participants,
    overview: meetingRow.overview,
    keyDecisions,
    keyDecisionDetails,
    topics,
    actionItems,
    highlights: highlightRows,
    openQuestions,
    transcript: transcriptRows,
    shares,
    activeTemplate: meetingRow.active_template,
    templates: JSON.parse(meetingRow.templates_json || '{}'),
    suggestedQuestions: JSON.parse(meetingRow.suggested_questions_json || '[]'),
    tags: JSON.parse(meetingRow.tags_json || '[]')
  };
}
