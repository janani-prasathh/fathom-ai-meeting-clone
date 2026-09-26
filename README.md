# Meetwise — Meeting Intelligence Workspace

**Meetwise** is an enterprise meeting intelligence and post-meeting outcome workspace.

For this assignment, I kept the core meeting-intelligence concept and **rebuilt the frontend with my own layout, navigation, interaction patterns, and visual design** rather than reproducing the original interface.

The result is a complete meeting workflow covering onboarding, workspace management, meetings, transcripts, decisions, action items, open questions, highlights, evidence, AI-assisted meeting queries, follow-up communication, and sharing.

> **This is a functional application, not a static UI prototype.**
> The React frontend communicates with a Node.js/Express backend through REST APIs. Meeting data and user interactions are handled through the backend data layer rather than being implemented as isolated hardcoded frontend responses.

---

## 🎯 Assignment Implementation

The assignment required:

> **“An interface you designed yourself. Keep your idea and your backend, and rebuild the frontend with your own layout and visual design. The backend has to be real and connected: a working database and API, not mock data or hardcoded responses.”**

Meetwise addresses these requirements in two parts:

### 1. Original frontend design

The frontend was rebuilt independently with a custom:

* Navigation structure
* Workspace layout
* Meeting detail layout
* Dashboard hierarchy
* Design system
* Typography and spacing
* Interaction patterns
* Evidence presentation
* Action/decision/question workflows
* Responsive UI

The interface is organized around **meeting outcomes and follow-through**, rather than simply reproducing the source application's visual structure.

### 2. Real backend connection

The frontend communicates with a Node.js + Express REST API using HTTP requests.

Examples include:

* Loading meetings
* Loading individual meeting details
* Searching meetings
* Loading transcripts
* Loading action items
* Updating action completion
* Loading decisions
* Loading open questions
* Loading highlights
* Updating meeting information
* Managing meeting sharing
* Loading workspace-level information
* Querying meeting intelligence

The frontend therefore does not rely on a collection of independent static UI objects for these interactions.

---

# 🧭 Product Walkthrough

Meetwise is designed around a complete post-meeting workflow.

## 1. Authentication & Onboarding

The application begins with a dedicated sign-in experience.

Users can:

* Sign in with email
* Continue with Google
* Continue with Microsoft
* Use enterprise-style SSO

After signing in, users can connect their calendar, including services such as Google Calendar or Microsoft Outlook.

The onboarding flow also allows users to choose what Meetwise should surface for them.

### Personalization preferences

Users can choose to prioritize:

* My action items and follow-throughs
* Decisions affecting me
* Unresolved open questions

After completing setup, users reach the **You're Ready** screen and enter their workspace.

---

# 🏠 2. My Workspace

The workspace provides a personalized overview of everything that requires attention.

The overview surfaces information such as:

* Pending actions
* Actions due within the next 48 hours
* Open questions
* Recent discussions
* My meetings
* Important follow-through items

### My Actions

Users can see their outstanding action items without opening every individual meeting.

Actions approaching their deadline receive additional visual emphasis so that urgent follow-through is immediately visible.

Selecting an action can take the user directly to:

**Meeting → Relevant item → Transcript/video timestamp**

This reduces the need to manually search through meetings to understand the context behind an action.

---

# 📅 3. All Meetings

The All Meetings dashboard provides a centralized view of meetings available to the user.

Users can:

* Browse meetings
* Search meetings
* Search by title
* Search by attendee
* Search by topic
* Open individual meetings
* Access meetings shared with them
* Import meeting recordings

### Meeting Import

If a meeting was recorded outside Meetwise, users can import the recording and process it through the meeting-intelligence workflow.

This provides a meeting-intake path in addition to connected calendar workflows.

---

# 🔎 4. Global Search

Meetwise supports cross-meeting search.

Users can search across:

* Meeting titles
* Attendees
* Topics
* Transcript content
* Decisions
* Action items
* Open questions

Search results can take users directly to the relevant meeting context and, where applicable, the corresponding transcript position.

The search layer uses parameterized backend queries rather than filtering only a hardcoded frontend list.

---

# 📝 5. Meeting Intelligence

Opening an individual meeting provides a structured intelligence view.

Instead of presenting one large AI-generated block, Meetwise separates the meeting into meaningful outcome categories.

### Executive Summary

**What happened?**

A concise overview of the meeting and the major discussion points.

### Key Decisions

**What was decided?**

Important decisions extracted from the conversation.

### Action Items

**What did someone commit to doing?**

Each action contains information such as:

* Assignee
* Status
* Due information
* Supporting context
* Source evidence

### Open Questions

**What remains unresolved?**

Questions that were raised during the meeting but were not conclusively resolved.

### Topics & Discussion Threads

**What was discussed?**

Topics provide a structured view of the major themes and progression of the meeting.

---

# 🔍 6. Evidence Explorer

One of the central design ideas in Meetwise is **Traceable Evidence**.

Meeting intelligence should not simply tell users *what* the system thinks happened. Users should be able to verify *why* it was identified.

For supported outcomes, the Evidence Explorer provides:

* Speaker
* Timestamp
* Verbatim transcript quote
* Grounding information
* Confidence information
* Explanation of why the item appears

This creates a direct connection between:

**Meeting → Outcome → Evidence → Transcript**

The goal is to make meeting intelligence easier to verify rather than treating generated results as unquestionable output.

---

# 🎙️ 7. Transcript & Playback

The transcript experience combines meeting playback with the conversation itself.

The layout provides:

### Left side

Meeting recording/playback experience.

### Right side

Full transcript with:

* Speaker attribution
* Timestamp information
* Conversation sequence
* Deep-linkable transcript positions

Selecting relevant transcript evidence can take the user to the corresponding point in the meeting.

This same timestamp-based structure is also used by meeting intelligence features.

---

# 💬 8. Ask Meetwise

Users can ask questions about a meeting through **Ask Meetwise**.

The interface also provides suggested questions for faster access to common meeting queries.

Examples include questions about:

* Decisions
* Action items
* Unresolved issues
* Responsibilities
* Discussion topics
* Meeting outcomes

The assistant is designed to remain grounded in available meeting records.

When the available meeting evidence is insufficient, Meetwise can explicitly indicate that there is not enough evidence rather than fabricating an answer.

Where applicable, answers include timestamp references that allow the user to inspect the supporting meeting context.

---

# ⭐ 9. Highlights

Important moments can be surfaced as meeting highlights.

Instead of sharing an entire meeting when only one section matters, users can work with a specific highlighted segment.

A highlight contains a defined start/end range, allowing users to:

* Identify an important moment
* Review the relevant section
* Share that specific segment

This is particularly useful for decisions, announcements, important explanations, or notable discussion moments.

---

# ✉️ 10. Follow-Up

Meetwise includes a **Follow Up** workflow for post-meeting communication.

Users can prepare follow-up communication based on the meeting, including:

* Meeting agenda
* Key decisions
* Meeting summary
* Relevant outcomes

The follow-up experience automatically uses the meeting context and participant information so the user does not need to manually reconstruct the meeting details.

---

# 🔗 11. Meeting Sharing

Meetings can be shared with participants without manually rebuilding the participant list.

The sharing experience recognizes people associated with the meeting and provides controls for managing their access.

Users can:

* Share a meeting
* Enable/disable access for participants
* Revoke previously granted access
* Review who has access

If an unrelated person is entered, Meetwise can warn that the person is not associated with the organization or meeting rather than silently granting access.

---

# ☑️ 12. Cross-Workspace Action Tracking

Action items are not isolated inside individual meeting pages.

Users can view their actions from the workspace and action-specific views.

When an action item is updated—for example, marked as completed—the change is reflected through the backend and can be represented consistently wherever that action appears.

This creates a single source of truth for action status across the application.

---

# 🧠 Core Product Principle — Traceable Evidence

Meetwise is built around one central principle:

> **Meeting intelligence should be traceable back to the conversation that produced it.**

The application therefore connects:

```text
Meeting
   ↓
Transcript
   ↓
Conversation Context
   ↓
Decision / Action / Question
   ↓
Evidence
   ↓
Timestamp
   ↓
Original Meeting Context
```

This structure makes the system more useful for teams where decisions and commitments need to be verified later.

---

# 🏗️ Architecture

Meetwise follows a client-server architecture.

```text
┌─────────────────────────────────────────────────────────┐
│                 React + TypeScript Frontend             │
│                                                         │
│  Custom UI / Navigation / Workspace / Meeting Views     │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ HTTP / JSON
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Node.js + Express Backend               │
│                                                         │
│  Meetings / Transcript / Actions / Decisions / Search   │
│  Questions / Highlights / Sharing / Intelligence        │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│                                                         │
│        SQLite persistence for local application         │
│        + serverless-compatible deployment layer         │
└─────────────────────────────────────────────────────────┘
```

---

# 🔌 Frontend ↔ Backend Communication

The frontend communicates with the backend through a dedicated API client.

```text
React Component
      │
      ▼
API Client
      │
      ▼
HTTP Request
      │
      ▼
Express REST Endpoint
      │
      ▼
Data Layer
      │
      ▼
JSON Response
      │
      ▼
React State Update
```

This means the UI is not simply rendering a collection of hardcoded meeting objects.

For example, an action completion flow follows the pattern:

```text
User clicks "Complete"
        ↓
Frontend sends API request
        ↓
Express receives request
        ↓
Backend updates action state
        ↓
API returns updated result
        ↓
Frontend synchronizes state
```

---

# 🗄️ Database & Data Model

For local development, Meetwise uses **SQLite through `better-sqlite3`**.

The database is relational and includes interconnected entities rather than a single JSON document.

The schema includes tables for:

### `meetings`

Core meeting information including:

* Title
* Date/time
* Duration
* Summary
* Templates
* Tags

### `participants`

Workspace users and meeting participants:

* Name
* Email
* Role
* Avatar information

### `meeting_participants`

Many-to-many relationship between meetings and participants.

### `transcript_utterances`

Individual transcript entries containing:

* Speaker
* Text
* Sequence
* Start timestamp
* End timestamp

### `action_items`

Action commitments containing:

* Action description
* Assignee
* Completion state
* Timestamps
* Source evidence

### `decisions`

Meeting decisions containing:

* Decision content
* Timestamp
* Sequence
* Grounding information

### `open_questions`

Unresolved questions containing:

* Question
* Speaker
* Timestamp
* Context

### `highlights`

Important meeting segments containing:

* Highlight metadata
* Start time
* End time
* Associated meeting

### Additional relational data

The backend also maintains relationships for topics, shares, and other meeting-level intelligence.

---

# 🧪 Meeting Intelligence Pipeline

Meetwise organizes meeting processing into a structured pipeline:

```text
1. Transcript Preparation
          ↓
2. Context Analysis
          ↓
3. Outcome Extraction
          ↓
4. Evidence Grounding
          ↓
5. Data Persistence
```

The resulting information can then be consumed by the workspace, meeting pages, search, Ask Meetwise, sharing, and follow-up workflows.

---

# 🔎 API Surface

The backend exposes REST endpoints for the major application resources.

Examples include:

```text
GET    /api/health

GET    /api/meetings
GET    /api/meetings/:id

GET    /api/users/:userId/meetings
GET    /api/users/:userId/actions
GET    /api/users/:userId/decisions
GET    /api/users/:userId/questions

PATCH  /api/meetings/:id
PATCH  /api/meetings/:meetingId/actions/:actionId

GET    /api/intelligence/status
```

The exact API surface can evolve with the application, but the important architectural principle remains the same:

**The frontend consumes backend resources through API calls rather than directly owning the application's source data.**

---

# 🧱 Technology Stack

### Frontend

* React 18
* TypeScript
* Vite
* Lucide Icons
* Custom Vanilla CSS design system

### Backend

* Node.js
* Express
* TypeScript
* REST API
* `tsx`

### Data

* SQLite
* `better-sqlite3`
* Relational schema
* Foreign key constraints
* Transactions
* WAL mode for local persistence

### Application Architecture

* React Context for frontend state synchronization
* Typed API client
* RESTful HTTP communication
* Modular meeting-intelligence pipeline
* Serverless-compatible API build for deployment

---

# 🚀 Deployment

The project is structured so that the frontend and backend can be built and served through the deployment environment.

For local development:

```bash
npm install
npm run dev
```

The frontend communicates with the local Express backend through the configured development setup.

Production builds are generated with:

```bash
npm run build
```

The backend also has a serverless-compatible build path so that the API can run in a Vercel environment without depending on the local development server process.

---

# 🧩 Why the Backend Matters in This Assignment

The assignment specifically asked for:

> **“A working database and API, not mock data or hardcoded responses.”**

Meetwise was therefore implemented as a connected application rather than only a visual recreation.

The important distinction is:

```text
❌ Static UI
React → Hardcoded objects → UI

❌ Mock API
React → Fake JSON → UI

✅ Meetwise
React
   ↓
HTTP API
   ↓
Express Backend
   ↓
Data Layer / Database
   ↓
Real Response
   ↓
React UI
```

For example, the workspace can obtain action items through the backend, while an action-status change is sent back to the backend instead of simply changing a local visual state.

This allows the same underlying meeting information to be consumed by different parts of the application.

---

# 🎨 Frontend Design Approach

The redesign focuses on **information hierarchy rather than visual replication**.

The main design decisions include:

* Workspace-first navigation
* Clear separation between meetings and personal follow-through
* Outcome-oriented meeting pages
* Evidence presented alongside generated intelligence
* Persistent access to important meeting context
* Direct navigation from actions to their source
* Dedicated views for actions, decisions, and open questions
* Search designed around real meeting information
* Focused sharing and follow-up workflows

The interface was intentionally designed to make the question:

> **“What do I need to know or do after this meeting?”**

easy to answer.

---

# 📌 Key Differentiators

### 1. Traceable Evidence

Meeting outcomes can be connected back to transcript evidence and timestamps.

### 2. Personal Workspace

Users can see what requires their attention across meetings without opening every meeting individually.

### 3. Outcome-Oriented Information Architecture

Decisions, actions, questions, topics, and evidence are treated as separate first-class entities.

### 4. Cross-Meeting Search

Users can search across their meeting knowledge instead of navigating meeting-by-meeting.

### 5. Grounded Ask Meetwise

The assistant is designed around available meeting records and can surface insufficient evidence rather than inventing unsupported information.

### 6. Deep Linking

Actions and intelligence can take users directly back to the relevant meeting context.

### 7. Real Backend Integration

The UI communicates with a real Express API and data layer rather than relying exclusively on frontend mock objects.

---

# 🧑‍💻 Running the Project Locally

Clone the repository and install dependencies:

```bash
npm install
```

Start the application:

```bash
npm run dev
```

For backend development, the Express server can be run through the project's backend development script.

Build the application:

```bash
npm run build
```

---

# 📂 High-Level Project Structure

```text
.
├── src/
│   ├── components/
│   ├── data/
│   ├── api/
│   ├── context/
│   └── ...
│
├── server/
│   ├── index.ts
│   ├── db.ts
│   ├── memoryStore.ts
│   ├── seed.ts
│   ├── pipeline.ts
│   └── intelligence/
│
├── api/
│   └── index.js
│
├── package.json
└── README.md
```

---

# 🎥 Demo

The project walkthrough demonstrates the complete user journey:

```text
Sign In
   ↓
Calendar / Preferences
   ↓
Workspace
   ↓
All Meetings
   ↓
Meeting Intelligence
   ↓
Transcript + Playback
   ↓
Actions / Decisions / Questions
   ↓
Evidence
   ↓
Ask Meetwise
   ↓
Highlights
   ↓
Follow-Up
   ↓
Sharing
```

The walkthrough also demonstrates the backend/API connection and how user interactions flow through the application.

---

# ✅ Assignment Checklist

| Requirement                      | Meetwise |
| -------------------------------- | -------- |
| Own frontend design              | ✅        |
| Custom layout                    | ✅        |
| Custom navigation                | ✅        |
| Custom visual design             | ✅        |
| Working backend                  | ✅        |
| REST API                         | ✅        |
| Database/data layer              | ✅        |
| Frontend ↔ backend communication | ✅        |
| Meeting data retrieval           | ✅        |
| Action updates                   | ✅        |
| Meeting intelligence             | ✅        |
| Search                           | ✅        |
| Transcript                       | ✅        |
| Sharing                          | ✅        |
| Follow-up workflow               | ✅        |
| Evidence grounding               | ✅        |
| Serverless deployment support    | ✅        |

---

# Final Note

Meetwise was built to demonstrate more than a visual redesign.

The objective was to turn meeting intelligence into a **usable post-meeting workspace** where information is:

**structured → searchable → actionable → traceable.**

The frontend provides the experience, the API provides the application boundary, and the backend data layer provides the underlying meeting information that powers the experience.
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
