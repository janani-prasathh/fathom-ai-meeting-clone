import { db, initDatabase } from './db.ts';
import { participants, seedMeetings } from '../src/data/seedMeetings.ts';
import { Meeting, Participant } from '../src/types.ts';

export function seedDatabase() {
  console.log('🌱 Starting database seed migration from seedMeetings.ts...');

  initDatabase();

  const insertParticipant = db.prepare(`
    INSERT OR IGNORE INTO participants (id, name, email, avatar, role, color)
    VALUES (@id, @name, @email, @avatar, @role, @color)
  `);

  const insertMeeting = db.prepare(`
    INSERT OR REPLACE INTO meetings (
      id, title, original_calendar_title, date, duration_seconds,
      overview, active_template, templates_json, suggested_questions_json, tags_json
    ) VALUES (
      @id, @title, @original_calendar_title, @date, @duration_seconds,
      @overview, @active_template, @templates_json, @suggested_questions_json, @tags_json
    )
  `);

  const insertMeetingParticipant = db.prepare(`
    INSERT OR REPLACE INTO meeting_participants (meeting_id, participant_id)
    VALUES (?, ?)
  `);

  const insertUtterance = db.prepare(`
    INSERT OR REPLACE INTO transcript_utterances (
      id, meeting_id, speaker_id, speaker_name, speaker_avatar,
      start_time, end_time, text, sequence_order
    ) VALUES (
      @id, @meeting_id, @speaker_id, @speaker_name, @speaker_avatar,
      @start_time, @end_time, @text, @sequence_order
    )
  `);

  const insertActionItem = db.prepare(`
    INSERT OR REPLACE INTO action_items (
      id, meeting_id, title, assignee_id, completed, timestamp, source_quote
    ) VALUES (
      @id, @meeting_id, @title, @assignee_id, @completed, @timestamp, @source_quote
    )
  `);

  const insertDecision = db.prepare(`
    INSERT OR REPLACE INTO decisions (
      id, meeting_id, text, timestamp, sequence_order
    ) VALUES (
      @id, @meeting_id, @text, @timestamp, @sequence_order
    )
  `);

  const insertOpenQuestion = db.prepare(`
    INSERT OR REPLACE INTO open_questions (
      id, meeting_id, question, timestamp, speaker_name, context
    ) VALUES (
      @id, @meeting_id, @question, @timestamp, @speaker_name, @context
    )
  `);

  const insertHighlight = db.prepare(`
    INSERT OR REPLACE INTO highlights (
      id, meeting_id, title, start_time, end_time, speaker_name, summary, tag
    ) VALUES (
      @id, @meeting_id, @title, @start_time, @end_time, @speaker_name, @summary, @tag
    )
  `);

  const insertTopic = db.prepare(`
    INSERT OR REPLACE INTO topic_discussions (
      id, meeting_id, title, timestamp, bullets_json, sequence_order
    ) VALUES (
      @id, @meeting_id, @title, @timestamp, @bullets_json, @sequence_order
    )
  `);

  const insertShare = db.prepare(`
    INSERT OR REPLACE INTO shares (
      id, meeting_id, email, name, avatar, is_attendee, shared_at, revoked
    ) VALUES (
      @id, @meeting_id, @email, @name, @avatar, @is_attendee, @shared_at, @revoked
    )
  `);

  let totalUtterances = 0;
  let totalActions = 0;
  let totalDecisions = 0;
  let totalQuestions = 0;

  // Execute in a single transaction
  const seedTransaction = db.transaction(() => {
    // Clean existing data for deterministic re-seeding
    db.exec(`
      DELETE FROM shares;
      DELETE FROM topic_discussions;
      DELETE FROM highlights;
      DELETE FROM open_questions;
      DELETE FROM decisions;
      DELETE FROM action_items;
      DELETE FROM transcript_utterances;
      DELETE FROM meeting_participants;
      DELETE FROM meetings;
      DELETE FROM participants;
    `);

    // 1. Seed global participants
    const allParticipants: Participant[] = Object.values(participants);
    for (const p of allParticipants) {
      insertParticipant.run(p);
    }
    console.log(`✅ Seeded ${allParticipants.length} participants.`);

    // 2. Seed meetings and relational children
    for (const m of seedMeetings) {
      insertMeeting.run({
        id: m.id,
        title: m.title,
        original_calendar_title: m.originalCalendarTitle || null,
        date: m.date,
        duration_seconds: m.durationSeconds,
        overview: m.overview,
        active_template: m.activeTemplate || 'executive',
        templates_json: JSON.stringify(m.templates || {}),
        suggested_questions_json: JSON.stringify(m.suggestedQuestions || []),
        tags_json: JSON.stringify(m.tags || [])
      });

      // Meeting Participants
      for (const p of m.participants) {
        insertParticipant.run(p); // Ensure meeting-specific participants exist
        insertMeetingParticipant.run(m.id, p.id);
      }

      // Transcript Utterances
      m.transcript.forEach((u, idx) => {
        insertUtterance.run({
          id: u.id,
          meeting_id: m.id,
          speaker_id: u.speakerId,
          speaker_name: u.speakerName,
          speaker_avatar: u.speakerAvatar,
          start_time: u.startTime,
          end_time: u.endTime,
          text: u.text,
          sequence_order: idx
        });
        totalUtterances++;
      });

      // Action Items
      for (const a of m.actionItems) {
        insertParticipant.run(a.assignee);
        insertActionItem.run({
          id: a.id,
          meeting_id: m.id,
          title: a.title,
          assignee_id: a.assignee.id,
          completed: a.completed ? 1 : 0,
          timestamp: a.timestamp,
          source_quote: a.sourceQuote
        });
        totalActions++;
      }

      // Decisions
      if (m.keyDecisionDetails && m.keyDecisionDetails.length > 0) {
        m.keyDecisionDetails.forEach((d, idx) => {
          insertDecision.run({
            id: d.id || `dec-${m.id}-${idx}`,
            meeting_id: m.id,
            text: d.text,
            timestamp: d.timestamp !== undefined ? d.timestamp : null,
            sequence_order: idx
          });
          totalDecisions++;
        });
      } else if (m.keyDecisions && m.keyDecisions.length > 0) {
        m.keyDecisions.forEach((text, idx) => {
          insertDecision.run({
            id: `dec-${m.id}-${idx}`,
            meeting_id: m.id,
            text,
            timestamp: null,
            sequence_order: idx
          });
          totalDecisions++;
        });
      }

      // Open Questions
      if (m.openQuestions && m.openQuestions.length > 0) {
        for (const q of m.openQuestions) {
          insertOpenQuestion.run({
            id: q.id,
            meeting_id: m.id,
            question: q.question,
            timestamp: q.timestamp !== undefined ? q.timestamp : null,
            speaker_name: q.speakerName || null,
            context: q.context || null
          });
          totalQuestions++;
        }
      }

      // Highlights
      if (m.highlights && m.highlights.length > 0) {
        for (const h of m.highlights) {
          insertHighlight.run({
            id: h.id,
            meeting_id: m.id,
            title: h.title,
            start_time: h.startTime,
            end_time: h.endTime,
            speaker_name: h.speakerName,
            summary: h.summary,
            tag: h.tag
          });
        }
      }

      // Topics
      if (m.topics && m.topics.length > 0) {
        m.topics.forEach((t, idx) => {
          insertTopic.run({
            id: `topic-${m.id}-${idx}`,
            meeting_id: m.id,
            title: t.title,
            timestamp: t.timestamp,
            bullets_json: JSON.stringify(t.bullets),
            sequence_order: idx
          });
        });
      }

      // Shares
      if (m.shares && m.shares.length > 0) {
        m.shares.forEach((s, idx) => {
          insertShare.run({
            id: `share-${m.id}-${idx}`,
            meeting_id: m.id,
            email: s.email,
            name: s.name || null,
            avatar: s.avatar || null,
            is_attendee: s.isAttendee ? 1 : 0,
            shared_at: s.sharedAt,
            revoked: s.revoked ? 1 : 0
          });
        });
      }
    }
  });

  seedTransaction();

  console.log(`🎉 Database seeded successfully:`);
  console.log(`   • ${seedMeetings.length} meetings`);
  console.log(`   • ${totalUtterances} transcript utterances`);
  console.log(`   • ${totalDecisions} decisions`);
  console.log(`   • ${totalActions} action items`);
  console.log(`   • ${totalQuestions} open questions`);
}

// Allow direct CLI invocation: `npx tsx server/seed.ts`
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase();
  process.exit(0);
}
