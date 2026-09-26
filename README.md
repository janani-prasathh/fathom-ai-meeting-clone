# Meetwise — Verified Meeting Intelligence Workspace

Meetwise is an enterprise meeting intelligence and post-meeting outcome workspace. Built around the core principle of **Traceable Evidence**, Meetwise extracts executive summaries, ratified decisions, committed action items, and unresolved open questions from spoken dialogue, grounding every outcome with verbatim quotes and deep-linked transcript timestamps.

---

## Key Capabilities

1. **Evidence Explorer**: Every decision, action item, and open question provides a dedicated Evidence Explorer panel displaying the speaker, exact timestamp, verbatim transcript quote, grounding confidence score, and "Why this appears" transparency criteria.
2. **Meeting Intelligence Hierarchy**: Structured executive view distinguishing:
   - **Executive Summary** (What happened)
   - **Key Decisions** (What was decided)
   - **Action Items** (What someone committed to)
   - **Open Questions** (What remains unresolved)
   - **Key Topics & Discussion Threads** (Progression)
   - **Evidence & Grounding Coverage** (Audit metrics)
3. **Ask Meetwise Grounded Assistant**: Conversational assistant strictly anchored to SQLite meeting records. Cites verifiable timestamps (`[03:10]`) that deep-link into playback and displays distinct evidence sources. Transparently displays an **Insufficient Evidence** card when questions cannot be answered from available meeting records without hallucinating.
4. **Meeting Intake Pipeline**: 5-stage pipeline (Transcript Preparation → Context Analysis → Outcome Extraction → Evidence Grounding → SQLite Persistence) supporting curated audio/video templates and uploaded meeting files.
5. **Cross-Meeting Global Search**: Instant parameterized database search (`⌘K`) across meetings, verbatim utterances, decisions, action items, open questions, and team members with one-click transcript deep-linking.
6. **Personalized Workspace**: Individualized views for *My Actions*, *My Decisions*, *Open Questions*, and *My Meetings* with account switching and task completion tracking.

---

## Architecture

Meetwise is designed with a real, connected backend architecture:

```
┌────────────────────────────────────────────────────────┐
│              React 18 + TypeScript Frontend            │
│  (Tailored Vanilla CSS design system, responsive UI)   │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON API (/api)
┌───────────────────────────▼────────────────────────────┐
│              Node.js + Express Backend Server          │
│               (Port 3001, REST Architecture)           │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼─────────────┐ ┌───────────▼──────────────┐
│     SQLite Database       │ │ Modular Intelligence     │
│   (better-sqlite3 disk)   │ │ Engine & Fallback Layer  │
│  10 relational tables     │ │ (Local rule-based + LLM) │
└───────────────────────────┘ └──────────────────────────┘
```

### Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Lucide Icons, Vanilla CSS design tokens (zero heavy UI framework dependencies).
* **Backend**: Node.js, Express, TypeScript (`tsx`).
* **Database**: SQLite via `better-sqlite3` with persistent disk storage (`server/meetwise.db`), write-ahead logging (WAL), foreign key constraints, and atomic transactions.
* **API Communication**: Native HTTP `fetch` via a dedicated typed client (`src/api/client.ts`), proxied through Vite in development.
* **State Management**: React Context (`MeetingContext.tsx`) maintaining in-memory caching and real-time synchronization with SQLite backend endpoints.

---

## Database Schema

Meetwise persists all workspace data in SQLite across 10 relational tables:

* `meetings`: Core meeting metadata, duration, summary overview, template configurations, and tags.
* `participants`: Workspace team members and attendees (name, email, role, avatar).
* `meeting_participants`: Many-to-many relationship linking participants to meetings.
* `transcript_utterances`: Sequential dialogue lines with millisecond start/end timestamps, speaker attributions, and text.
* `action_items`: Explicit commitments, assignee foreign keys, completion states, timestamps, and verbatim source quotes.
* `decisions`: Consensus resolutions, timestamps, sequence ordering, and grounding confidence.
* `open_questions`: Unresolved inquiries, speaker attributions, timestamps, and conversational context.
* `highlights`: Key moments and topical segments with start/end time ranges.
* `topic_discussions`: Agenda themes and structured discussion bullets.
* `shares`: Share recipients, permissions, and sharing timestamps.

---

## Intelligence Layer

Meetwise features a provider-independent intelligence architecture:

1. **Local Deterministic Provider (Default / Offline)**:
   - Operates completely offline without external API keys or network volatility.
   - Extracts explicit commitments, verifies proposal reversals, checks whether questions were answered in subsequent dialogue, and calculates grounding confidence.
   - Powers Ask Meetwise with deterministic transcript keyword scanning and semantic intent matching.
2. **Optional LLM Provider**:
   - Configurable via server-side environment variables (`OPENAI_API_KEY` or `ANTHROPIC_API_KEY`).
   - Automatically detected by the server; gracefully falls back to the local deterministic provider if unconfigured or rate-limited.
   - API keys remain exclusively on the server and are never exposed to the client.

---

## Getting Started

### Prerequisites

* Node.js 18+ (tested on Node 20 & 22)
* npm 9+

### Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd fanthom_clone
npm install
```

### Running Locally

To run both the backend API server and frontend development server concurrently:

**Terminal 1 (Backend Server — Port 3001):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend Client — Port 3000):**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Initialization & Seeding

The SQLite database automatically initializes its schema on server startup if the database file does not exist.

To re-seed the database with the initial benchmark meetings:

```bash
npm run db:seed
```

### Production Build & Type Checking

To validate TypeScript compilation and produce an optimized production bundle:

```bash
npm run build
```

---

## Configuration & Environment Variables

Create an optional `.env` file in the project root for custom configuration:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Backend Express server port | `3001` |
| `DB_PATH` | Path to persistent SQLite database file | `server/meetwise.db` |
| `OPENAI_API_KEY` | Optional OpenAI key for LLM intelligence (server-side only) | *(empty — uses local provider)* |
| `GEMINI_API_KEY` | Optional Google Gemini key for LLM intelligence (server-side only) | *(empty — uses local provider)* |
| `ANTHROPIC_API_KEY` | Optional Anthropic key for LLM intelligence (server-side only) | *(empty — uses local provider)* |

> **Note:** LLM API keys are read exclusively by the backend server and are never exposed to the frontend client. The application runs fully offline using the local deterministic intelligence provider when no API keys are configured.

---

## Current Scope & Limitations

* **Audio/Video Playback**: Media player runs in simulated playback mode synchronized with transcript timestamps; real-time hardware microphone recording is not tied to an external Zoom/Google Meet bot.
* **Authentication**: Workspace login utilizes single-click profile switching and work-email matching across registered workspace accounts without external OAuth credentials.
* **Deterministic Intelligence**: When running without external API keys, meeting intelligence extraction uses rule-based heuristic patterns designed to pass adversarial tests (tentative remarks, reversed decisions, and answered inquiries).
