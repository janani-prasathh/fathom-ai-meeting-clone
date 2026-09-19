# Fathom AI Meeting Notetaker — Product Clone

## Overview

A product-focused recreation of the core Fathom meeting-notetaking workflow, built as part of the 8x "Rebuild a live product in 24 hours" assignment.

## Core Experience

* Meeting dashboard
* Meeting playback experience
* Synchronized transcript
* AI-style meeting summaries
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

This implementation prioritizes the highest-value post-meeting workflows: understanding what happened, verifying decisions against the conversation, identifying actions, resolving open questions, searching across meetings, and communicating outcomes.

In line with the assignment guidelines:
* **Deterministic / Local Post-Meeting Intelligence:** AI responses, citations, decisions, and summaries are driven by deterministic local synthesis engines and pre-indexed conversation models. This provides instant, reliable, zero-latency interactions without external API rate-limiting or network volatility during evaluation.
* **Traceable Evidence Principle:** Every critical takeaway, decision, open question, and action item is directly linked to an exact timestamp in the media player and transcript, allowing immediate verification against what was actually said.
* **Simulated Capture Pipeline:** The recording bot and meeting ingest pipeline are simulated where appropriate, enabling testers to trigger live meeting capture workflows and generate post-meeting notes on demand.

## Tech Stack

* React
* TypeScript
* Vite
* CSS
* LocalStorage for persistence

## Running Locally

To run the application locally in development mode:

```bash
npm install
npm run dev
```

To validate TypeScript compilation and create a production build:

```bash
npm run build
```

## Assignment

Built for the 8x live-product reconstruction assignment ("Rebuild a live product in 24 hours").
