# Fathom AI Meeting Notetaker — Product Clone

A product-focused recreation of the core Fathom meeting-notetaking workflow, built as part of the 8x **“Rebuild a live product in 24 hours”** assignment.

## Live Demo

**Deployed application:** https://fathom-ai-meeting-clone.vercel.app

## Core Experience

* Meeting dashboard
* Meeting playback experience
* Synchronized transcript
* Meeting summaries
* Summary templates
* Action items with evidence
* Meeting Intelligence
* Decisions and unresolved questions
* Ask Fathom workflow
* Highlights
* Global search
* Participant-aware sharing
* Follow-up email generation
* Meeting simulator
* Long-meeting / 8-person experience

## Product Decisions

The implementation prioritizes the highest-value post-meeting workflows: understanding what happened, verifying decisions against the conversation, identifying actions, resolving open questions, searching across meetings, and communicating outcomes.

### Deterministic Post-Meeting Intelligence

The prototype uses deterministic local synthesis and pre-indexed meeting data for summaries, decisions, action items, questions, Ask Fathom responses, and evidence citations.

This was a deliberate scope decision for the 24-hour assignment: it keeps the experience fast and reliable during evaluation while allowing the implementation to focus on the core product workflow rather than external API dependencies.

### Traceable Evidence

Critical takeaways, decisions, open questions, and action items are linked to exact timestamps in the transcript and playback experience.

This allows users to move from an insight directly to the underlying conversation and verify the information.

### Simulated Capture

The recording and meeting-ingest layer is simulated where appropriate, as permitted by the assignment. This allowed the implementation to focus on the post-meeting intelligence and collaboration experience.

## How to Explore

A recommended flow:

1. Open the dashboard and select a meeting.
2. Explore synchronized playback and transcript.
3. Review the meeting summary and switch templates.
4. Inspect action items and jump to their evidence.
5. Explore Meeting Intelligence and trace decisions to the transcript.
6. Try Ask Fathom and global search.
7. Generate a follow-up email.
8. Try participant-aware sharing.
9. Explore the seeded 8-person, long-meeting experience.

## Tech Stack

* React
* TypeScript
* Vite
* CSS
* LocalStorage for persistence

## Running Locally

```bash
npm install
npm run dev
```

To validate TypeScript compilation and create a production build:

```bash
npm run build
```

## Assignment

Built for the 8x live-product reconstruction assignment:

**“Rebuild a live product in 24 hours.”**
