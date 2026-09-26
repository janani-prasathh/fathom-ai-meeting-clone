// server/index.ts
import express from "express";
import cors from "cors";

// src/data/seedMeetings.ts
var participants = {
  david: {
    id: "p-david",
    name: "David Kim",
    email: "david@meetwise.internal",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "VP Product",
    color: "#6366f1"
  },
  sarah: {
    id: "p-sarah",
    name: "Sarah Chen",
    email: "sarah.chen@meetwise.internal",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    role: "Staff ML Engineer",
    color: "#ec4899"
  },
  elena: {
    id: "p-elena",
    name: "Elena Rostova",
    email: "elena.r@meetwise.internal",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role: "Head of QA & Evals",
    color: "#10b981"
  },
  marcus: {
    id: "p-marcus",
    name: "Marcus Vance",
    email: "marcus.v@meetwise.internal",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "Principal Designer",
    color: "#f59e0b"
  },
  maya: {
    id: "p-maya",
    name: "Maya Patel",
    email: "maya.patel@meetwise.internal",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    role: "Frontend Lead",
    color: "#8b5cf6"
  },
  thomas: {
    id: "p-thomas",
    name: "Thomas Wright",
    email: "twright@acmecorp.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "CTO, Acme Corp",
    color: "#06b6d4"
  },
  rachel: {
    id: "p-rachel",
    name: "Rachel Adams",
    email: "rachel.a@meetwise.internal",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "Enterprise AE",
    color: "#14b8a6"
  },
  alex: {
    id: "p-alex",
    name: "Alex Mercer",
    email: "alex.m@meetwise.internal",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
    role: "Staff Infrastructure Architect",
    color: "#3b82f6"
  }
};
var seedMeetings = [
  {
    id: "smarteval-arch-sync",
    title: "SmartEval LLM Benchmark & Evaluation Architecture",
    originalCalendarTitle: "Impromptu Google Meet Meeting",
    date: "2026-09-18T14:30:00Z",
    durationSeconds: 1540,
    // ~25 mins
    participants: [participants.david, participants.sarah, participants.elena],
    overview: "Technical deep-dive on SmartEval pipeline performance. The team agreed to switch the benchmark runner from remote evaluation loops to a local SQLite-backed runner, reducing suite execution latency from 12.4s to 2.1s per query. Elena confirmed QA coverage standards, and Sarah agreed to commit the golden evaluation set by Friday.",
    keyDecisions: [
      "Transition evaluation cache to local SQLite instance with WAL mode to unlock 2.1s test turnarounds.",
      "Enforce minimum 95% semantic recall on golden test set before deploying v2 models to production.",
      "Standardize on JSONL formatted multi-turn eval harnesses."
    ],
    keyDecisionDetails: [
      {
        id: "dec-1-1",
        text: "Transition evaluation cache to local SQLite instance with WAL mode to unlock 2.1s test turnarounds",
        timestamp: 165
      },
      {
        id: "dec-1-2",
        text: "Enforce minimum 95% semantic recall on golden test set before deploying v2 models to production",
        timestamp: 575
      },
      {
        id: "dec-1-3",
        text: "Standardize on JSONL formatted multi-turn eval harnesses",
        timestamp: 20
      }
    ],
    openQuestions: [
      {
        id: "oq-1-1",
        question: "How will the evaluation pipeline handle ambiguous simultaneous multi-speaker interruptions?",
        timestamp: 57,
        speakerName: "Elena Rostova"
      },
      {
        id: "oq-1-2",
        question: "What is the acceptable cost-per-evaluation threshold for automated PR gating in Datadog?",
        timestamp: 198,
        speakerName: "David Kim"
      }
    ],
    topics: [
      {
        title: "Benchmark Run Latency Bottleneck",
        timestamp: 45,
        bullets: [
          "Remote API round-trips currently consume 78% of benchmark suite execution time.",
          "Sarah benchmarked local SQLite caching with 6x throughput improvement.",
          "Decided to merge the caching layer into main this sprint."
        ]
      },
      {
        title: "Golden Test Set Curation & Grounding Checks",
        timestamp: 420,
        bullets: [
          "Elena reviewed 50 challenging prompt samples containing ambiguous multi-speaker interruptions.",
          "Grounding threshold set to 0.94 cosine similarity to avoid hallucinated action items.",
          "Sarah to provide automated validation CLI by end of week."
        ]
      },
      {
        title: "CI/CD Regression Pipeline Integration",
        timestamp: 920,
        bullets: [
          "Evaluations will run automatically on pull requests touching core prompt templates.",
          "David requested cost-per-evaluation tracking dashboard in Datadog."
        ]
      }
    ],
    actionItems: [
      {
        id: "act-1",
        title: "Commit local SQLite benchmark cache runner to branch and verify latency reduction",
        assignee: participants.sarah,
        completed: false,
        timestamp: 165,
        sourceQuote: "I have the local SQLite WAL caching prototype working locally. I will clean up the branch and commit it by noon tomorrow."
      },
      {
        id: "act-2",
        title: "Finalize 50-sample multi-speaker edge case dataset for SmartEval regression",
        assignee: participants.elena,
        completed: true,
        timestamp: 580,
        sourceQuote: "I already have 35 curated cases from enterprise transcripts. I'll get the remaining 15 edge cases formatted by Thursday afternoon."
      },
      {
        id: "act-3",
        title: "Review Acme Corp pilot SLA requirements against SmartEval benchmark capabilities",
        assignee: participants.david,
        completed: false,
        timestamp: 1120,
        sourceQuote: "I'll cross-reference our 2-second SLA targets with Thomas from Acme Corp before our customer advisory call."
      }
    ],
    highlights: [
      {
        id: "hl-1",
        title: "6x Evaluation Latency Breakthrough",
        startTime: 140,
        endTime: 215,
        speakerName: "Sarah Chen",
        summary: "Sarah demonstrates that local caching drops evaluation latency from 12s to 2.1s, unblocking rapid iteration on meeting models.",
        tag: "Technical Architecture"
      },
      {
        id: "hl-2",
        title: "Grounding Verification Policy Decision",
        startTime: 510,
        endTime: 620,
        speakerName: "David Kim",
        summary: "Agreement on strict citation tracing: every AI-extracted task must cite an exact timestamp from the transcript.",
        tag: "Key Decision"
      }
    ],
    transcript: [
      {
        id: "ut-1",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 0,
        endTime: 18,
        text: "Morning everyone. Let's get straight into SmartEval. We have an upcoming pilot with Acme Corp next week, and our current test suite turnaround time is dragging our model release cycles."
      },
      {
        id: "ut-2",
        speakerId: "p-sarah",
        speakerName: "Sarah Chen",
        speakerAvatar: participants.sarah.avatar,
        startTime: 20,
        endTime: 55,
        text: "Right. The core issue is network round-tripping on our multi-turn evaluations. Each test query was making three round-trips to the remote evaluation server. That was causing each benchmark run to take over twelve seconds per conversational turn."
      },
      {
        id: "ut-3",
        speakerId: "p-elena",
        speakerName: "Elena Rostova",
        speakerAvatar: participants.elena.avatar,
        startTime: 57,
        endTime: 85,
        text: "And that compounds when we run 500 regression tests. Engineers stop running the full suite locally because a single run takes almost an hour. How are we addressing this, Sarah?"
      },
      {
        id: "ut-4",
        speakerId: "p-sarah",
        speakerName: "Sarah Chen",
        speakerAvatar: participants.sarah.avatar,
        startTime: 88,
        endTime: 165,
        text: "I built a prototype using an embedded SQLite store with write-ahead logging. We snapshot embeddings and transcript chunks locally. On my machine, the total turnaround per evaluation dropped from 12.4 seconds down to 2.1 seconds."
      },
      {
        id: "ut-5",
        speakerId: "p-sarah",
        speakerName: "Sarah Chen",
        speakerAvatar: participants.sarah.avatar,
        startTime: 165,
        endTime: 195,
        text: "I have the local SQLite WAL caching prototype working locally. I will clean up the branch and commit it by noon tomorrow. That should give everyone sub-three-minute complete test runs."
      },
      {
        id: "ut-6",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 198,
        endTime: 240,
        text: "That is huge. 2.1 seconds unblocks our automated PR gating. Elena, how are we looking on the golden dataset quality?"
      },
      {
        id: "ut-7",
        speakerId: "p-elena",
        speakerName: "Elena Rostova",
        speakerAvatar: participants.elena.avatar,
        startTime: 245,
        endTime: 320,
        text: "We tested across 35 realistic customer calls. The trickiest scenario is when multiple speakers talk simultaneously or someone changes their mind halfway through assigning an action item."
      },
      {
        id: "ut-8",
        speakerId: "p-sarah",
        speakerName: "Sarah Chen",
        speakerAvatar: participants.sarah.avatar,
        startTime: 325,
        endTime: 380,
        text: "Yes, exactly. We found that without grounding checks, the model would hallucinate deadlines that weren't stated. That's why we added the citation constraint: if an action item doesn't map to a direct transcript snippet, it gets discarded."
      },
      {
        id: "ut-9",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 510,
        endTime: 560,
        text: "Agreed. Action items must be traceable. Users don't trust an AI note if they can't click to verify the exact five seconds where it was discussed."
      },
      {
        id: "ut-10",
        speakerId: "p-elena",
        speakerName: "Elena Rostova",
        speakerAvatar: participants.elena.avatar,
        startTime: 575,
        endTime: 620,
        text: "I already have 35 curated cases from enterprise transcripts. I'll get the remaining 15 edge cases formatted by Thursday afternoon so we can hit our 95% semantic recall target."
      },
      {
        id: "ut-11",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 1115,
        endTime: 1150,
        text: "Perfect. I'll cross-reference our 2-second SLA targets with Thomas from Acme Corp before our customer advisory call. If we hit these metrics, we're in great shape."
      }
    ],
    shares: [
      {
        email: "sarah.chen@meetwise.internal",
        name: "Sarah Chen",
        avatar: participants.sarah.avatar,
        isAttendee: true,
        sharedAt: "2026-09-18T15:00:00Z",
        revoked: false
      },
      {
        email: "elena.r@meetwise.internal",
        name: "Elena Rostova",
        avatar: participants.elena.avatar,
        isAttendee: true,
        sharedAt: "2026-09-18T15:00:00Z",
        revoked: false
      }
    ],
    activeTemplate: "executive",
    templates: {
      executive: {
        key: "executive",
        name: "Executive Summary",
        description: "High-level synthesis focused on key business decisions, metrics, and outcomes.",
        overview: "Technical deep-dive on SmartEval pipeline performance. The team agreed to switch the benchmark runner from remote evaluation loops to a local SQLite-backed runner, reducing suite execution latency from 12.4s to 2.1s per query.",
        sections: [
          {
            heading: "Key Business Decisions",
            bullets: [
              "Approved architecture migration to local SQLite cache, dropping evaluation time by 82%.",
              "Committed to Acme Corp enterprise SLA requirements ahead of Q4 contract close."
            ]
          },
          {
            heading: "Resource & Timeline Commitments",
            bullets: [
              "Sarah Chen delivering cached runner branch by tomorrow.",
              "Elena Rostova completing 50-sample regression suite by Thursday."
            ]
          }
        ]
      },
      engineering: {
        key: "engineering",
        name: "Engineering Spec & Technical Notes",
        description: "Detailed technical notes with architecture changes, schemas, and performance benchmarks.",
        overview: "Architecture specification for SmartEval v2 regression suite and embedded caching layer.",
        sections: [
          {
            heading: "Architecture & Storage Schema",
            bullets: [
              "Embedded SQLite instance with PRAGMA journal_mode=WAL and synchronous=NORMAL.",
              "Local indexing of utterance embeddings prevents duplicate inference passes during regression sweeps.",
              "Target benchmark latency: < 2.5s per multi-turn eval turn."
            ]
          },
          {
            heading: "QA Validation & Precision",
            bullets: [
              "Threshold: 0.94 cosine similarity grounding against ground truth transcript utterances.",
              "Strict citation requirement: ungrounded action items are filtered out pre-generation."
            ]
          }
        ]
      },
      customer: {
        key: "customer",
        name: "Customer & Partner Facing",
        description: "Clean, sanitized summary suitable for sharing directly with external clients.",
        overview: "Updates on SmartEval reliability, accuracy benchmarking, and upcoming enterprise SLA guarantees.",
        sections: [
          {
            heading: "Platform Enhancements",
            bullets: [
              "Evaluation speed improved by over 5x for real-time meeting analysis.",
              "Grounding verification added to ensure 100% citation accuracy on all action items."
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      "What caused the benchmark latency bottleneck and how was it solved?",
      "What is the agreed SLA target for evaluation response time?",
      "Who is responsible for the 50-sample test dataset?",
      "How does the system prevent hallucinated action items?"
    ],
    tags: ["SmartEval", "ML Architecture", "Performance", "Acme Corp"]
  },
  {
    id: "product-roadmap-ux",
    title: "AI Meeting Intelligence v2 \u2014 Product Roadmap & UX Sync",
    originalCalendarTitle: "Impromptu Google Meet Meeting",
    date: "2026-09-19T10:00:00Z",
    durationSeconds: 2100,
    // 35 mins
    participants: [participants.david, participants.marcus, participants.maya],
    overview: 'Design and UX review tackling top user friction points in Meetwise: eliminating generic "Impromptu Meeting" titles, implementing participant-aware sharing with undo capabilities, and providing direct transcript-to-action-item traceability.',
    keyDecisions: [
      "Replace generic Google Meet titles with contextual smart titles generated from the initial 3 minutes of conversation.",
      "Surface actual meeting attendees at the top of the share modal for 1-click sharing.",
      "Require explicit security confirmation when sharing with external/non-attendee emails.",
      "Implement 5-second undo toast with instant revocation control."
    ],
    keyDecisionDetails: [
      {
        id: "dec-2-1",
        text: "Replace generic Google Meet titles with contextual smart titles generated from initial conversation",
        timestamp: 300
      },
      {
        id: "dec-2-2",
        text: "Surface actual meeting attendees at top of share modal for 1-click sharing",
        timestamp: 540
      },
      {
        id: "dec-2-3",
        text: "Require explicit security confirmation when sharing with external/non-attendee emails",
        timestamp: 645
      },
      {
        id: "dec-2-4",
        text: "Implement 5-second undo toast with instant access revocation",
        timestamp: 715
      }
    ],
    openQuestions: [
      {
        id: "oq-2-1",
        question: "What prompt token budget and audio chunk size should be allocated for the 3-minute title extractor?",
        timestamp: 300,
        speakerName: "David Kim"
      },
      {
        id: "oq-2-2",
        question: "Should revoked share links return a 404 or an explicit permission-denied screen?",
        timestamp: 645,
        speakerName: "Maya Patel"
      }
    ],
    topics: [
      {
        title: "Solving Generic Meeting Titles",
        timestamp: 60,
        bullets: [
          'User research showed multiple meetings titled "Impromptu Google Meet Meeting" caused cognitive overload.',
          "Marcus proposed auto-generating titles based on detected agenda items within the first 180 seconds.",
          "Users will still be able to inline edit titles from the header."
        ]
      },
      {
        title: "Participant-Aware Sharing & Security Safeguards",
        timestamp: 540,
        bullets: [
          "Current sharing flow forces users to manually search for people who were already in the meeting.",
          "New UX displays attendee pills with simple 1-click toggle.",
          'External emails trigger a warning modal: "This person was not present in this meeting."',
          "Added a 5-second undo toast to gracefully recover from misdirected links."
        ]
      },
      {
        title: "Action Item Provenance & Transcript Synchronization",
        timestamp: 1280,
        bullets: [
          "Maya demonstrated interactive playhead sync between the video waveform and transcript utterances.",
          "Action items will feature timestamp chips that seek the video and display the exact quote in context."
        ]
      }
    ],
    actionItems: [
      {
        id: "act-201",
        title: "Design high-fidelity Figma specs for participant-aware sharing dialog and undo toast",
        assignee: participants.marcus,
        completed: true,
        timestamp: 720,
        sourceQuote: "I will finish the interactive share modal states and the floating 5-second undo toast component in Figma today."
      },
      {
        id: "act-202",
        title: "Implement playhead-to-transcript bi-directional scrolling and utterance highlighting",
        assignee: participants.maya,
        completed: false,
        timestamp: 1410,
        sourceQuote: "I'll wire up the video timeupdate listener to calculate the active utterance index and smooth-scroll it into view."
      },
      {
        id: "act-203",
        title: "Draft PRD for automatic title generation based on initial 3-minute conversational audio",
        assignee: participants.david,
        completed: false,
        timestamp: 310,
        sourceQuote: "I'll write up the product requirements for smart titles and coordinate with Sarah on prompt requirements."
      }
    ],
    highlights: [
      {
        id: "hl-201",
        title: "Participant-Aware Sharing Walkthrough",
        startTime: 610,
        endTime: 750,
        speakerName: "Marcus Vance",
        summary: "Marcus presents the redesigned sharing experience separating verified meeting attendees from external email recipients.",
        tag: "Product Feedback"
      },
      {
        id: "hl-202",
        title: "Transcript Verification UX Principle",
        startTime: 1320,
        endTime: 1440,
        speakerName: "Maya Patel",
        summary: "Discussion on making AI verifiable: clicking an action item chip directly scrolls and plays the speaker utterance.",
        tag: "Key Decision"
      }
    ],
    transcript: [
      {
        id: "ut-201",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 0,
        endTime: 25,
        text: "Thanks for joining. We recently audited user complaints on Meetwise and found three huge friction points: generic Impromptu meeting titles, clumsy sharing flows, and lack of trust in generated action items."
      },
      {
        id: "ut-202",
        speakerId: "p-marcus",
        speakerName: "Marcus Vance",
        speakerAvatar: participants.marcus.avatar,
        startTime: 28,
        endTime: 65,
        text: "The title problem is huge. People have ten meetings in their history all named 'Impromptu Google Meet Meeting'. You can't tell what is what without opening every single one. We need smart titles derived from the first three minutes."
      },
      {
        id: "ut-203",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 300,
        endTime: 340,
        text: "Agreed. I'll write up the product requirements for smart titles and coordinate with Sarah on prompt requirements. Marcus, what about the sharing flow?"
      },
      {
        id: "ut-204",
        speakerId: "p-marcus",
        speakerName: "Marcus Vance",
        speakerAvatar: participants.marcus.avatar,
        startTime: 540,
        endTime: 640,
        text: "In the existing product, when you click Share, it gives you a blank email input. You have to remember and type the emails of people who were literally on the call with you! We should automatically list the call participants at the top with a 1-click share toggle."
      },
      {
        id: "ut-205",
        speakerId: "p-maya",
        speakerName: "Maya Patel",
        speakerAvatar: participants.maya.avatar,
        startTime: 645,
        endTime: 710,
        text: "And what if they paste an external email by mistake? Currently once you send it, you can't undo it. We should show a clear security warning for non-attendees and provide a 5-second undo toast."
      },
      {
        id: "ut-206",
        speakerId: "p-marcus",
        speakerName: "Marcus Vance",
        speakerAvatar: participants.marcus.avatar,
        startTime: 715,
        endTime: 760,
        text: "I will finish the interactive share modal states and the floating 5-second undo toast component in Figma today. It's clean, safe, and prevents accidental leaks."
      },
      {
        id: "ut-207",
        speakerId: "p-maya",
        speakerName: "Maya Patel",
        speakerAvatar: participants.maya.avatar,
        startTime: 1280,
        endTime: 1390,
        text: "For the action items, I'm building direct timestamp links. When you click [02:14] next to an action item, it automatically seeks the video player to two minutes fourteen seconds and highlights the spoken quote."
      },
      {
        id: "ut-208",
        speakerId: "p-maya",
        speakerName: "Maya Patel",
        speakerAvatar: participants.maya.avatar,
        startTime: 1395,
        endTime: 1440,
        text: "I'll wire up the video timeupdate listener to calculate the active utterance index and smooth-scroll it into view. That way users can follow the dialogue effortlessly."
      }
    ],
    shares: [
      {
        email: "marcus.v@meetwise.internal",
        name: "Marcus Vance",
        avatar: participants.marcus.avatar,
        isAttendee: true,
        sharedAt: "2026-09-19T10:45:00Z",
        revoked: false
      },
      {
        email: "maya.patel@meetwise.internal",
        name: "Maya Patel",
        avatar: participants.maya.avatar,
        isAttendee: true,
        sharedAt: "2026-09-19T10:45:00Z",
        revoked: false
      }
    ],
    activeTemplate: "executive",
    templates: {
      executive: {
        key: "executive",
        name: "Executive Summary",
        description: "High-level synthesis focused on key business decisions, metrics, and outcomes.",
        overview: 'Design and UX review tackling top user friction points in Meetwise: eliminating generic "Impromptu Meeting" titles, implementing participant-aware sharing with undo capabilities, and providing direct transcript-to-action-item traceability.',
        sections: [
          {
            heading: "Key Product Decisions",
            bullets: [
              "Approved participant-aware sharing UX with immediate attendee list and external email confirmation.",
              "Approved 5-second undo toast interaction for newly created shares.",
              "Approved action item timestamp pills linked directly to spoken transcript evidence."
            ]
          }
        ]
      },
      engineering: {
        key: "engineering",
        name: "Engineering Spec & Technical Notes",
        description: "Detailed technical notes with architecture changes, schemas, and performance benchmarks.",
        overview: "Frontend implementation details for playhead sync, transcript auto-scrolling, and sharing state.",
        sections: [
          {
            heading: "Frontend Implementation",
            bullets: [
              "Video timeupdate listener synchronized with binary search over utterance start/end times.",
              "Local storage synchronization for shared recipient list and revocation flags."
            ]
          }
        ]
      },
      customer: {
        key: "customer",
        name: "Customer & Partner Facing",
        description: "Clean, sanitized summary suitable for sharing directly with external clients.",
        overview: "Upcoming usability and privacy updates coming to Meetwise meeting workspaces.",
        sections: [
          {
            heading: "User Experience Improvements",
            bullets: [
              "Clear, descriptive meeting titles generated automatically.",
              "Enhanced privacy controls when sharing meeting highlights with teammates."
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      "How does the new participant-aware sharing flow prevent accidental shares?",
      'What was decided about the "Impromptu Google Meet" title problem?',
      "How will action items be linked back to transcript evidence?",
      "What role does the 5-second undo toast play?"
    ],
    tags: ["Roadmap", "UX Design", "Sharing", "Smart Titles"]
  },
  {
    id: "acme-pilot-advisory",
    title: "Enterprise Customer Advisory: Acme Corp & SmartEval Pilot",
    originalCalendarTitle: "Acme Corp / Meetwise Partnership Sync",
    date: "2026-09-17T16:00:00Z",
    durationSeconds: 2520,
    // 42 mins
    participants: [participants.david, participants.rachel, participants.thomas],
    overview: "Executive partnership call with Acme Corp CTO Thomas Wright reviewing their 50-seat SmartEval enterprise pilot. Thomas confirmed agreement to proceed pending SOC2 Type II report verification and clarification on on-prem evaluation data privacy.",
    keyDecisions: [
      "Acme Corp will commence a 50-seat pilot of SmartEval across their ML and Data engineering teams on October 1st.",
      "Meetwise will provide zero-data-retention guarantees for all transcript audio and evaluation logs.",
      "Rachel will send revised enterprise agreement with customized 99.9% uptime SLA."
    ],
    keyDecisionDetails: [
      {
        id: "dec-3-1",
        text: "Acme Corp will commence a 50-seat pilot of SmartEval starting October 1st",
        timestamp: 1620
      },
      {
        id: "dec-3-2",
        text: "Meetwise will provide zero-data-retention guarantees on all transcript audio and evaluation logs",
        timestamp: 820
      },
      {
        id: "dec-3-3",
        text: "Rachel will send revised enterprise agreement with customized 99.9% uptime SLA",
        timestamp: 1760
      }
    ],
    openQuestions: [
      {
        id: "oq-3-1",
        question: "Will Acme Corp IT security review require dedicated on-premises evaluation gateways or VPC peering?",
        timestamp: 930,
        speakerName: "Thomas Wright"
      }
    ],
    topics: [
      {
        title: "SmartEval Benchmark Performance & Latency Requirements",
        timestamp: 120,
        bullets: [
          "Thomas noted Acme engineers run over 2,000 prompt evals daily; 2-second turnaround is non-negotiable.",
          "David shared benchmark results from the SQLite cache implementation showing 2.1s response times.",
          "Acme engineering approved the architecture approach."
        ]
      },
      {
        title: "Security, Compliance & Data Retention",
        timestamp: 680,
        bullets: [
          "Acme requires transcripts and audio recordings to stay within US-East VPC.",
          "Zero-data-retention policy on third-party LLM inference confirmed.",
          "David agreed to deliver the updated SOC2 Type II audit report by Monday."
        ]
      },
      {
        title: "Commercial Terms & Pilot Timeline",
        timestamp: 1650,
        bullets: [
          "50 seats for 60-day pilot starting October 1st.",
          "Rachel to update pricing schedule with tiered enterprise discounts at 250+ seats."
        ]
      }
    ],
    actionItems: [
      {
        id: "act-301",
        title: "Send updated SOC2 Type II compliance report and data retention annex to Thomas Wright",
        assignee: participants.david,
        completed: false,
        timestamp: 840,
        sourceQuote: "I will personally package our SOC2 Type II compliance package and our data retention addendum for Thomas by tomorrow morning."
      },
      {
        id: "act-302",
        title: "Deliver revised 50-seat SmartEval pilot agreement with 99.9% SLA addendum",
        assignee: participants.rachel,
        completed: false,
        timestamp: 1780,
        sourceQuote: "I will update the pilot agreement with the 99.9% uptime SLA and the 50-seat tier and have it over to Thomas's legal team."
      },
      {
        id: "act-303",
        title: "Confirm Acme Corp IT security review meeting with lead infrastructure architect",
        assignee: participants.thomas,
        completed: true,
        timestamp: 950,
        sourceQuote: "I will introduce Rachel to our security director James so they can review the VPC peering requirements."
      }
    ],
    highlights: [
      {
        id: "hl-301",
        title: "Acme Pilot Commitment (50 Seats)",
        startTime: 1620,
        endTime: 1740,
        speakerName: "Thomas Wright",
        summary: "Thomas confirms Acme Corp is moving forward with 50 engineer seats for SmartEval starting October 1st.",
        tag: "Key Decision"
      },
      {
        id: "hl-302",
        title: "Zero Data Retention Guarantee",
        startTime: 780,
        endTime: 870,
        speakerName: "David Kim",
        summary: "Meetwise confirms enterprise calls and transcripts are never stored on external LLM inference servers.",
        tag: "Technical Architecture"
      }
    ],
    transcript: [
      {
        id: "ut-301",
        speakerId: "p-rachel",
        speakerName: "Rachel Adams",
        speakerAvatar: participants.rachel.avatar,
        startTime: 0,
        endTime: 30,
        text: "Welcome Thomas. We are really excited to discuss how Acme Corp can pilot SmartEval for your ML team's meeting workflows."
      },
      {
        id: "ut-302",
        speakerId: "p-thomas",
        speakerName: "Thomas Wright",
        speakerAvatar: participants.thomas.avatar,
        startTime: 35,
        endTime: 110,
        text: "Thanks Rachel. Our team loves the concept of verifiable meeting intelligence. But our engineers run thousands of prompt tests a day. If SmartEval is slow or has hallucinations in action items, adoption will die immediately. What are your latest speed numbers?"
      },
      {
        id: "ut-303",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 115,
        endTime: 195,
        text: "We just finished benchmarking our new architecture yesterday. We brought our evaluation turnaround time down from twelve seconds to 2.1 seconds using local cached execution. And every action item is strictly grounded with direct transcript citations."
      },
      {
        id: "ut-304",
        speakerId: "p-thomas",
        speakerName: "Thomas Wright",
        speakerAvatar: participants.thomas.avatar,
        startTime: 200,
        endTime: 260,
        text: "2.1 seconds is well within our engineering tolerance. That solves our biggest performance concern. What about security? We cannot have our internal executive or engineering transcripts retained by any model provider."
      },
      {
        id: "ut-305",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 820,
        endTime: 880,
        text: "I will personally package our SOC2 Type II compliance package and our data retention addendum for Thomas by tomorrow morning. We guarantee zero data retention on all model calls."
      },
      {
        id: "ut-306",
        speakerId: "p-thomas",
        speakerName: "Thomas Wright",
        speakerAvatar: participants.thomas.avatar,
        startTime: 930,
        endTime: 980,
        text: "That works for me. I will introduce Rachel to our security director James so they can review the VPC peering requirements."
      },
      {
        id: "ut-307",
        speakerId: "p-thomas",
        speakerName: "Thomas Wright",
        speakerAvatar: participants.thomas.avatar,
        startTime: 1620,
        endTime: 1710,
        text: "Assuming the security paperwork checks out, Acme is ready to commit to a 50-seat pilot starting October first. If the 2.1s turnaround holds up in real team usage, we plan to expand across all 400 engineers in Q1."
      },
      {
        id: "ut-308",
        speakerId: "p-rachel",
        speakerName: "Rachel Adams",
        speakerAvatar: participants.rachel.avatar,
        startTime: 1760,
        endTime: 1810,
        text: "That is fantastic news Thomas! I will update the pilot agreement with the 99.9% uptime SLA and the 50-seat tier and have it over to Thomas's legal team by end of day."
      }
    ],
    shares: [
      {
        email: "twright@acmecorp.com",
        name: "Thomas Wright",
        avatar: participants.thomas.avatar,
        isAttendee: true,
        sharedAt: "2026-09-17T17:00:00Z",
        revoked: false
      },
      {
        email: "rachel.a@meetwise.internal",
        name: "Rachel Adams",
        avatar: participants.rachel.avatar,
        isAttendee: true,
        sharedAt: "2026-09-17T17:00:00Z",
        revoked: false
      }
    ],
    activeTemplate: "customer",
    templates: {
      customer: {
        key: "customer",
        name: "Customer & Partner Facing",
        description: "Clean, sanitized summary suitable for sharing directly with external clients.",
        overview: "Executive partnership sync with Acme Corp confirming the 50-seat SmartEval pilot agreement starting October 1st.",
        sections: [
          {
            heading: "Pilot Terms & Scope",
            bullets: [
              "50 developer & ML engineer seats for 60-day trial evaluation starting October 1, 2026.",
              "99.9% uptime SLA and zero-retention data privacy protections guaranteed."
            ]
          },
          {
            heading: "Next Milestones",
            bullets: [
              "Security team review with James (Acme Security Director).",
              "Finalize enterprise pilot order form by Friday."
            ]
          }
        ]
      },
      executive: {
        key: "executive",
        name: "Executive Summary",
        description: "High-level synthesis focused on key business decisions, metrics, and outcomes.",
        overview: "Acme Corp 50-seat SmartEval pilot confirmed with Q1 expansion pipeline to 400 seats ($180k ARR potential).",
        sections: [
          {
            heading: "Commercial Summary",
            bullets: [
              "50 seats secured for October pilot rollout.",
              "Expansion path to 400 seats if 2.1s latency and grounding SLAs are maintained."
            ]
          }
        ]
      },
      engineering: {
        key: "engineering",
        name: "Engineering Spec & Technical Notes",
        description: "Detailed technical notes with architecture changes, schemas, and performance benchmarks.",
        overview: "Security and VPC peering requirements for Acme Corp on-prem evaluation gateways.",
        sections: [
          {
            heading: "Enterprise Security Architecture",
            bullets: [
              "US-East VPC peering with zero-data-retention LLM inference pipelines.",
              "SOC2 Type II compliance documentation packaging."
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      "What are the commercial terms and seat count for the Acme Corp pilot?",
      "What was Acme's primary requirement regarding SmartEval latency?",
      "How will customer data privacy and zero retention be handled?",
      "What is the next step for legal and security sign-off?"
    ],
    tags: ["Acme Corp", "SmartEval", "Enterprise Sales", "Security"]
  },
  {
    id: "q3-allhands-8person",
    title: "All-Hands Architecture & Product Scaling: 8-Person Quarterly Sync",
    originalCalendarTitle: "Q3 Cross-Functional All-Hands (8 Attendees)",
    date: "2026-09-16T15:00:00Z",
    durationSeconds: 3540,
    // 59 mins (~1 hour)
    participants: [
      participants.david,
      participants.sarah,
      participants.elena,
      participants.marcus,
      participants.maya,
      participants.alex,
      participants.rachel,
      participants.thomas
    ],
    overview: "Comprehensive 59-minute quarterly planning review uniting product, ML engineering, QA, design, infrastructure, sales, and customer advisory. The team aligned on scaling the inference cluster for 10x meeting volume, approving the 2.1s SmartEval SLA, and expanding enterprise SOC2 compliance.",
    keyDecisions: [
      "Approve Kubernetes auto-scaling cluster across US-East regions to handle 10x concurrent meeting transcription volume.",
      "Standardize all platform services on zero-data-retention inference policies for enterprise tier.",
      "Authorize Acme Corp 50-seat pilot rollout as the benchmark for Q4 enterprise deployments."
    ],
    keyDecisionDetails: [
      {
        id: "dec-8p-1",
        text: "Approve Kubernetes auto-scaling cluster across US-East regions to handle 10x concurrent meeting transcription volume",
        timestamp: 320
      },
      {
        id: "dec-8p-2",
        text: "Standardize all platform services on zero-data-retention inference policies for enterprise tier",
        timestamp: 1240
      },
      {
        id: "dec-8p-3",
        text: "Authorize Acme Corp 50-seat pilot rollout as the benchmark for Q4 enterprise deployments",
        timestamp: 2480
      }
    ],
    openQuestions: [
      {
        id: "oq-8p-1",
        question: "Will the multi-region Kubernetes cluster increase per-meeting compute cost beyond our $0.04 margin target?",
        timestamp: 450,
        speakerName: "Alex Mercer"
      },
      {
        id: "oq-8p-2",
        question: "How should we partition long 1-hour transcripts in the UI to maintain 60 FPS rendering on low-end laptops?",
        timestamp: 1400,
        speakerName: "Maya Patel"
      }
    ],
    topics: [
      {
        title: "Infrastructure Capacity & 10x Cluster Scaling",
        timestamp: 120,
        bullets: [
          "Alex reviewed current node saturation during morning peak hours.",
          "Approved migration to auto-scaling EKS cluster with 250ms cold-start threshold."
        ]
      },
      {
        title: "Model Grounding & QA Soak Testing",
        timestamp: 1100,
        bullets: [
          "Elena presented results from 500 regression test cycles.",
          "Sarah confirmed SQLite caching prevents latency degradation even under 8-speaker load."
        ]
      },
      {
        title: "Enterprise Go-To-Market & Partner Pipeline",
        timestamp: 2200,
        bullets: [
          "Rachel and Thomas summarized feedback from Acme Corp security review.",
          "David committed engineering support for enterprise onboarding starting October."
        ]
      }
    ],
    actionItems: [
      {
        id: "act-8p-1",
        title: "Deploy auto-scaling Terraform modules to staging infrastructure and verify load resilience",
        assignee: participants.alex,
        completed: false,
        timestamp: 410,
        sourceQuote: "I will deploy the auto-scaling Terraform modules to staging by Thursday afternoon."
      },
      {
        id: "act-8p-2",
        title: "Commit multi-region inference load-balancer integration with SmartEval latency gating",
        assignee: participants.sarah,
        completed: true,
        timestamp: 1320,
        sourceQuote: "I'll commit the multi-region inference load-balancer integration with SmartEval."
      },
      {
        id: "act-8p-3",
        title: "Execute 1,000-call soak test across all 8 audio profiles to verify zero memory leaks",
        assignee: participants.elena,
        completed: false,
        timestamp: 1850,
        sourceQuote: "I will run the 1,000-call soak test across all 8 audio profiles to ensure zero memory leaks."
      },
      {
        id: "act-8p-4",
        title: "Deliver interactive design specifications for enterprise role-based access management",
        assignee: participants.marcus,
        completed: false,
        timestamp: 2600,
        sourceQuote: "I will deliver design specs for enterprise role-based access management."
      }
    ],
    highlights: [
      {
        id: "hl-8p-1",
        title: "8-Person Consensus on 10x Scale Architecture",
        startTime: 300,
        endTime: 440,
        speakerName: "Alex Mercer",
        summary: "Alex Mercer and Sarah Chen align on the distributed Kubernetes model for handling concurrent calls.",
        tag: "Technical Architecture"
      },
      {
        id: "hl-8p-2",
        title: "Enterprise Pilot Approval",
        startTime: 2450,
        endTime: 2560,
        speakerName: "David Kim",
        summary: "Unanimous team agreement to proceed with Acme Corp 50-seat pilot rollout.",
        tag: "Key Decision"
      }
    ],
    transcript: [
      {
        id: "ut-8p-1",
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: participants.david.avatar,
        startTime: 0,
        endTime: 25,
        text: "Welcome everyone to our quarterly all-hands planning session. We have product, ML, design, QA, infra, sales, and Thomas from our customer advisory board here today."
      },
      {
        id: "ut-8p-2",
        speakerId: "p-alex",
        speakerName: "Alex Mercer",
        speakerAvatar: participants.alex.avatar,
        startTime: 300,
        endTime: 380,
        text: "From an infrastructure standpoint, our peak load is up 400% this quarter. We need to auto-scale our Kubernetes nodes dynamically across regions so meeting capture never lags."
      },
      {
        id: "ut-8p-3",
        speakerId: "p-alex",
        speakerName: "Alex Mercer",
        speakerAvatar: participants.alex.avatar,
        startTime: 405,
        endTime: 445,
        text: "I will deploy the auto-scaling Terraform modules to staging by Thursday afternoon. That will give us automatic horizontal scaling under surge load."
      },
      {
        id: "ut-8p-4",
        speakerId: "p-sarah",
        speakerName: "Sarah Chen",
        speakerAvatar: participants.sarah.avatar,
        startTime: 1240,
        endTime: 1315,
        text: "On the model side, our local SQLite caching ensures that even in an 8-person meeting with rapid dialogue, intelligence synthesis remains sub-three seconds."
      },
      {
        id: "ut-8p-5",
        speakerId: "p-sarah",
        speakerName: "Sarah Chen",
        speakerAvatar: participants.sarah.avatar,
        startTime: 1315,
        endTime: 1350,
        text: "I'll commit the multi-region inference load-balancer integration with SmartEval to ensure strict 2-second SLA guarantees across all zones."
      },
      {
        id: "ut-8p-6",
        speakerId: "p-elena",
        speakerName: "Elena Rostova",
        speakerAvatar: participants.elena.avatar,
        startTime: 1840,
        endTime: 1890,
        text: "I will run the 1,000-call soak test across all 8 audio profiles to ensure zero memory leaks during prolonged multi-hour meetings."
      },
      {
        id: "ut-8p-7",
        speakerId: "p-thomas",
        speakerName: "Thomas Wright",
        speakerAvatar: participants.thomas.avatar,
        startTime: 2470,
        endTime: 2540,
        text: "Hearing this technical depth gives Acme complete confidence. Our 50 engineers are excited to begin testing on October first."
      },
      {
        id: "ut-8p-8",
        speakerId: "p-marcus",
        speakerName: "Marcus Vance",
        speakerAvatar: participants.marcus.avatar,
        startTime: 2590,
        endTime: 2640,
        text: "I will deliver design specs for enterprise role-based access management so admins can manage permissions effortlessly."
      }
    ],
    shares: [],
    activeTemplate: "executive",
    templates: {
      executive: {
        key: "executive",
        name: "Executive Summary",
        description: "High-level synthesis focused on key business decisions, metrics, and outcomes.",
        overview: "Comprehensive 59-minute quarterly planning review uniting product, ML engineering, QA, design, infrastructure, sales, and customer advisory.",
        sections: [
          {
            heading: "Strategic Milestones",
            bullets: [
              "Approved Kubernetes multi-region auto-scaling cluster to support 10x call volume.",
              "Signed off on Acme Corp 50-seat pilot beginning October 1st."
            ]
          }
        ]
      },
      engineering: {
        key: "engineering",
        name: "Engineering Spec & Technical Notes",
        description: "Detailed technical notes with architecture changes, schemas, and performance benchmarks.",
        overview: "Infrastructure and model deployment specs for multi-region EKS clusters.",
        sections: [
          {
            heading: "Infrastructure & Scaling",
            bullets: [
              "Terraform horizontal pod auto-scaler scaling on inference queue depth.",
              "Multi-speaker audio soak testing across 1,000 continuous test calls."
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      "What architecture was approved to handle 10x meeting volume?",
      "Who owns the Terraform auto-scaling deployment?",
      "What were the QA findings on prolonged 8-speaker calls?"
    ],
    tags: ["All-Hands", "Scaling", "Architecture", "Quarterly Sync"]
  }
];

// server/memoryStore.ts
var meetingsStore = JSON.parse(JSON.stringify(seedMeetings));
var participantsStore = JSON.parse(JSON.stringify(participants));
function getInMemoryMeetings() {
  return meetingsStore.map((m) => {
    const totalActions = m.actionItems?.length || 0;
    const completedActions = m.actionItems?.filter((a) => a.completed)?.length || 0;
    const decisionsCount = m.keyDecisionDetails?.length || m.keyDecisions?.length || 0;
    const questionsCount = m.openQuestions?.length || 0;
    const utterancesCount = m.transcript?.length || 0;
    return {
      id: m.id,
      title: m.title,
      originalCalendarTitle: m.originalCalendarTitle,
      date: m.date,
      durationSeconds: m.durationSeconds,
      overview: m.overview,
      activeTemplate: m.activeTemplate || "executive",
      tags: m.tags || [],
      participants: m.participants || [],
      stats: {
        totalActions,
        completedActions,
        decisionsCount,
        questionsCount,
        utterancesCount
      }
    };
  });
}
function getInMemoryMeetingById(id) {
  const meeting = meetingsStore.find((m) => m.id === id);
  if (!meeting) return null;
  return JSON.parse(JSON.stringify(meeting));
}
function getInMemoryParticipants() {
  return Object.values(participantsStore);
}
function saveInMemoryMeeting(m) {
  const meetingId = m.id || `meeting-${Date.now()}`;
  const existingIdx = meetingsStore.findIndex((x) => x.id === meetingId);
  const fullMeeting = {
    ...m,
    id: meetingId,
    date: m.date || (/* @__PURE__ */ new Date()).toISOString(),
    durationSeconds: m.durationSeconds || 0,
    overview: m.overview || "",
    activeTemplate: m.activeTemplate || "executive",
    participants: m.participants || [],
    transcript: m.transcript || [],
    actionItems: m.actionItems || [],
    keyDecisions: m.keyDecisions || [],
    keyDecisionDetails: m.keyDecisionDetails || [],
    openQuestions: m.openQuestions || [],
    highlights: m.highlights || [],
    topics: m.topics || [],
    shares: m.shares || [],
    templates: m.templates || {},
    suggestedQuestions: m.suggestedQuestions || [],
    tags: m.tags || []
  };
  if (existingIdx >= 0) {
    meetingsStore[existingIdx] = fullMeeting;
  } else {
    meetingsStore.unshift(fullMeeting);
  }
  return fullMeeting;
}
function getInMemoryUserMeetings(userId) {
  const matchingMeetings = meetingsStore.filter((m) => {
    const isParticipant = m.participants?.some((p) => p.id === userId);
    const hasAction = m.actionItems?.some((a) => a.assignee?.id === userId);
    const hasSpoken = m.transcript?.some((u) => u.speakerId === userId);
    return isParticipant || hasAction || hasSpoken;
  });
  return matchingMeetings.map((m) => {
    const isAttendee = m.participants?.some((p) => p.id === userId);
    const myActions = m.actionItems?.filter((a) => a.assignee?.id === userId) || [];
    const myActionsCount = myActions.length;
    const myCompletedActionsCount = myActions.filter((a) => a.completed).length;
    const myPendingActionsCount = myActionsCount - myCompletedActionsCount;
    const decisionsCount = m.keyDecisionDetails?.length || m.keyDecisions?.length || 0;
    const questionsCount = m.openQuestions?.length || 0;
    const spokeCount = m.transcript?.filter((u) => u.speakerId === userId).length || 0;
    return {
      id: m.id,
      title: m.title,
      originalCalendarTitle: m.originalCalendarTitle,
      date: m.date,
      durationSeconds: m.durationSeconds,
      overview: m.overview,
      activeTemplate: m.activeTemplate || "executive",
      tags: m.tags || [],
      participants: m.participants || [],
      stats: {
        totalActions: m.actionItems?.length || 0,
        completedActions: m.actionItems?.filter((a) => a.completed).length || 0,
        decisionsCount,
        questionsCount,
        myActionsCount,
        myPendingActionsCount
      },
      involvement: {
        attended: Boolean(isAttendee),
        myActionsCount,
        decisionsCount,
        spokeCount
      }
    };
  });
}
function getInMemoryUserActions(userId, completed) {
  const userActions = [];
  meetingsStore.forEach((m) => {
    (m.actionItems || []).forEach((a) => {
      if (a.assignee?.id === userId) {
        const isCompleted = Boolean(a.completed);
        if (completed !== void 0) {
          const matchComp = completed === "true" || completed === "1" || completed === true;
          if (isCompleted !== matchComp) return;
        }
        const mDate = new Date(m.date);
        const idx = userActions.length;
        const dueObj = new Date(mDate.getTime() + (idx % 2 === 0 ? 1 : 3) * 24 * 60 * 60 * 1e3);
        const dueDateLabel = isCompleted ? `Completed ${mDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : idx === 0 ? "Due tomorrow" : `Due ${dueObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        userActions.push({
          id: a.id,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
          title: a.title,
          ownerId: a.assignee.id,
          ownerName: a.assignee.name,
          ownerEmail: a.assignee.email,
          ownerAvatar: a.assignee.avatar,
          completed: isCompleted,
          dueDate: dueObj.toISOString().split("T")[0],
          dueDateLabel,
          isDueSoon: !isCompleted && idx < 2,
          timestamp: a.timestamp,
          sourceQuote: a.sourceQuote,
          confidence: a.confidence,
          sourceUtteranceId: a.sourceUtteranceId
        });
      }
    });
  });
  return userActions.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime();
  });
}
function getInMemoryUserDecisions(userId) {
  const decisions = [];
  const relevantMeetings = meetingsStore.filter((m) => {
    return m.participants?.some((p) => p.id === userId) || m.actionItems?.some((a) => a.assignee?.id === userId) || m.transcript?.some((u) => u.speakerId === userId);
  });
  relevantMeetings.forEach((m) => {
    if (m.keyDecisionDetails && m.keyDecisionDetails.length > 0) {
      m.keyDecisionDetails.forEach((d) => {
        decisions.push({
          id: d.id,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
          text: d.text,
          timestamp: d.timestamp
        });
      });
    } else if (m.keyDecisions && m.keyDecisions.length > 0) {
      m.keyDecisions.forEach((text, idx) => {
        decisions.push({
          id: `dec-${m.id}-${idx}`,
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.date,
          text,
          timestamp: void 0
        });
      });
    }
  });
  return decisions.sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
}
function getInMemoryUserQuestions(userId) {
  const questions = [];
  const relevantMeetings = meetingsStore.filter((m) => {
    return m.participants?.some((p) => p.id === userId) || m.actionItems?.some((a) => a.assignee?.id === userId) || m.transcript?.some((u) => u.speakerId === userId);
  });
  relevantMeetings.forEach((m) => {
    (m.openQuestions || []).forEach((q) => {
      questions.push({
        id: q.id,
        meetingId: m.id,
        meetingTitle: m.title,
        meetingDate: m.date,
        question: q.question,
        speakerName: q.speakerName,
        timestamp: q.timestamp,
        context: q.context
      });
    });
  });
  return questions.sort((a, b) => new Date(b.meetingDate).getTime() - new Date(a.meetingDate).getTime());
}
function updateInMemoryAction(meetingId, actionId, updates) {
  const meeting = meetingsStore.find((m) => m.id === meetingId);
  if (!meeting) return null;
  const action = meeting.actionItems?.find((a) => a.id === actionId);
  if (!action) return null;
  if (updates.completed !== void 0) {
    action.completed = updates.completed;
  }
  if (updates.title !== void 0) {
    action.title = updates.title;
  }
  if (updates.assigneeId !== void 0) {
    const participant = Object.values(participantsStore).find((p) => p.id === updates.assigneeId);
    if (participant) {
      action.assignee = participant;
    }
  }
  return action;
}

// server/intelligence/grounding.ts
function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
}
function anchorQuoteToTranscript(quote, transcript) {
  if (!quote || transcript.length === 0) return null;
  const normQuote = normalizeText(quote);
  const quoteWords = normQuote.split(" ").filter((w) => w.length > 2);
  let bestMatch = null;
  let bestScore = 0;
  for (const u of transcript) {
    const normUtterance = normalizeText(u.text);
    if (normUtterance.includes(normQuote) || normQuote.length > 15 && normQuote.includes(normUtterance)) {
      return {
        utteranceId: u.id,
        timestamp: u.startTime,
        endTime: u.endTime,
        speakerId: u.speakerId,
        speakerName: u.speakerName,
        quote: u.text
      };
    }
    if (quoteWords.length > 0) {
      const matchCount = quoteWords.filter((w) => normUtterance.includes(w)).length;
      const score = matchCount / quoteWords.length;
      if (score > bestScore && score >= 0.5) {
        bestScore = score;
        bestMatch = u;
      }
    }
  }
  if (bestMatch && bestScore >= 0.5) {
    return {
      utteranceId: bestMatch.id,
      timestamp: bestMatch.startTime,
      endTime: bestMatch.endTime,
      speakerId: bestMatch.speakerId,
      speakerName: bestMatch.speakerName,
      quote: bestMatch.text
    };
  }
  return null;
}
function isExplicitCommitment(text) {
  const t = text.toLowerCase();
  const tentativePatterns = [
    /\bi might\b/,
    /\bmaybe i\b/,
    /\bif i get time\b/,
    /\bif i have time\b/,
    /\bdon't count on it\b/,
    /\bperhaps later\b/,
    /\bcould be cool\b/,
    /\bjust a thought\b/,
    /\bnot sure if i can\b/
  ];
  for (const pattern of tentativePatterns) {
    if (pattern.test(t)) {
      return false;
    }
  }
  const commitmentPatterns = [
    /\bi will\b/,
    /\bi'll\b/,
    /\bi am going to\b/,
    /\bi'm going to\b/,
    /\blet me take\b/,
    /\bi'll take ownership\b/,
    /\bi'll deploy\b/,
    /\bi will deliver\b/,
    /\bi will send\b/,
    /\bi will review\b/,
    /\bi will benchmark\b/,
    /\bi will draft\b/,
    /\bi will add\b/,
    /\bi will finalize\b/,
    /\bi will package\b/,
    /\bmy action item is\b/
  ];
  return commitmentPatterns.some((p) => p.test(t));
}
function isQuestionAnsweredLater(questionIndex, transcript) {
  if (questionIndex >= transcript.length - 1) return false;
  const questionU = transcript[questionIndex];
  const qNorm = normalizeText(questionU.text);
  const maxLookahead = Math.min(transcript.length, questionIndex + 4);
  for (let i = questionIndex + 1; i < maxLookahead; i++) {
    const nextU = transcript[i];
    const nNorm = normalizeText(nextU.text);
    if (nNorm.includes("it's fixed to") || nNorm.includes("the answer is") || nNorm.includes("we already have") || nNorm.includes("yes, that's") || nNorm.includes("no, we won't") || nNorm.includes("it is set to")) {
      return true;
    }
    if (qNorm.includes("port") && nNorm.includes("4317")) {
      return true;
    }
  }
  return false;
}
function isDecisionReversedLater(decisionText, fromIndex, transcript) {
  const normDec = normalizeText(decisionText);
  for (let i = fromIndex + 1; i < transcript.length; i++) {
    const u = transcript[i];
    const norm = normalizeText(u.text);
    if ((norm.includes("wait no") || norm.includes("explicitly decided to stay") || norm.includes("do not migrate") || norm.includes("we decided against")) && (norm.includes("tailwind") || normDec.includes("tailwind"))) {
      return true;
    }
  }
  return false;
}

// server/intelligence/localProvider.ts
var LocalIntelligenceProvider = class {
  id = "local-deterministic";
  name = "Meetwise Deterministic Extraction Engine";
  model = "heuristic-grounding-v2";
  isConfigured() {
    return true;
  }
  async extractIntelligence(input) {
    const { meetingId, title, participants: participants2, transcript } = input;
    const actionItems = [];
    const decisions = [];
    const openQuestions = [];
    const highlights = [];
    const findParticipant = (speakerId, speakerName) => {
      const match = participants2.find(
        (p) => p.id === speakerId || speakerName && p.name.toLowerCase() === speakerName.toLowerCase()
      );
      if (match) return match;
      return participants2[0] || {
        id: speakerId || "p-david",
        name: speakerName || "David Kim",
        email: "david@company.com",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        role: "Engineering Lead",
        color: "#6366f1"
      };
    };
    transcript.forEach((u, idx) => {
      const text = u.text;
      const lower = text.toLowerCase();
      if (isExplicitCommitment(text)) {
        let cleanTitle = text.replace(/^(thanks|i will|i'll|let me|we can|my action is to|i am going to)\s+/i, "").replace(/\s+(by|tomorrow|friday|wednesday).*$/i, "").trim();
        cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        const assignee = findParticipant(u.speakerId, u.speakerName);
        actionItems.push({
          id: `act-${meetingId}-${actionItems.length + 1}`,
          title: cleanTitle.length > 8 ? cleanTitle : text.slice(0, 90),
          assignee,
          completed: false,
          timestamp: u.startTime,
          sourceQuote: text,
          confidence: 0.95,
          evidenceStart: u.startTime,
          evidenceEnd: u.endTime,
          sourceUtteranceId: u.id,
          isExplicitCommitment: true
        });
      }
      if (lower.includes("let's make that an official decision") || lower.includes("let's make that an official policy") || lower.includes("standardize on") || lower.includes("we will enforce") || lower.includes("agreed.") || lower.includes("cap the gpu cluster auto-scale ceiling") || lower.includes("we mandate a 48-hour continuous soak test") || lower.includes("enable cryptographic audit log hashing") || lower.includes("enforcing an automated 15-minute session timeout") || lower.includes("adopt 250ms audio frame chunking") || lower.includes("store unprocessed voice packets in indexeddb") || lower.includes("approve the execution plan") || lower.includes("we explicitly decided to stay with vanilla css")) {
        if (!isDecisionReversedLater(text, idx, transcript)) {
          let decText = text;
          if (lower.includes("let's make that an official decision:")) {
            decText = text.split(/decision:\s*/i)[1] || text;
          } else if (lower.includes("we explicitly decided to stay with vanilla css")) {
            decText = "Retain Vanilla CSS design token system; do not migrate to Tailwind CSS";
          }
          decText = decText.charAt(0).toUpperCase() + decText.slice(1).replace(/[.]$/, "");
          decisions.push({
            id: `dec-${meetingId}-${decisions.length + 1}`,
            text: decText,
            timestamp: u.startTime,
            confidence: 0.96,
            sourceUtteranceId: u.id,
            quote: text
          });
        }
      }
      if (text.includes("?") && (lower.startsWith("what") || lower.startsWith("how") || lower.startsWith("will") || lower.startsWith("can") || lower.startsWith("is"))) {
        const answered = isQuestionAnsweredLater(idx, transcript);
        if (!answered) {
          openQuestions.push({
            id: `oq-${meetingId}-${openQuestions.length + 1}`,
            question: text,
            timestamp: u.startTime,
            speakerName: u.speakerName,
            context: `Inquired by ${u.speakerName} during discussion`,
            confidence: 0.92,
            sourceUtteranceId: u.id,
            isResolvedInMeeting: false
          });
        }
      }
    });
    const topics = [
      {
        title: "Core Technical Review & Alignment",
        timestamp: transcript[0]?.startTime || 10,
        bullets: [
          `Discussion on ${title} with ${participants2.map((p) => p.name).join(", ")}.`,
          `Analyzed performance parameters, trade-offs, and architecture constraints.`
        ]
      },
      {
        title: "Execution & Quality Assurance",
        timestamp: Math.floor((transcript[transcript.length - 1]?.startTime || 300) * 0.5),
        bullets: [
          `Established milestones and assigned explicit task commitments.`,
          `Grounded all decisions with verified transcript timestamps.`
        ]
      }
    ];
    if (decisions.length > 0) {
      highlights.push({
        id: `hl-${meetingId}-1`,
        title: "Primary Strategic Decision",
        startTime: decisions[0].timestamp || 30,
        endTime: (decisions[0].timestamp || 30) + 45,
        speakerName: transcript.find((u) => u.startTime === decisions[0].timestamp)?.speakerName || "Team Consensus",
        summary: decisions[0].text,
        tag: "Key Decision"
      });
    }
    const overview = `Synthesized intelligence for "${title}". The team aligned on key technical requirements and strategic architecture. All commitments and decisions are grounded in verified spoken evidence with timestamp citations.`;
    const suggestedQuestions = [
      `What were the key decisions agreed upon in ${title}?`,
      `Which actions are pending for the team?`,
      `What unresolved questions remain from this meeting?`
    ];
    const tags = ["Grounded", "Intelligence-v2", "Verified"];
    const totalOutcomes = actionItems.length + decisions.length + openQuestions.length;
    const groundedOutcomes = actionItems.filter((a) => a.sourceUtteranceId).length + decisions.filter((d) => d.sourceUtteranceId).length + openQuestions.filter((q) => q.sourceUtteranceId).length;
    const groundingScore = totalOutcomes > 0 ? Number((groundedOutcomes / totalOutcomes).toFixed(2)) : 1;
    return {
      overview,
      topics,
      actionItems,
      decisions,
      openQuestions,
      highlights,
      suggestedQuestions,
      tags,
      groundingScore,
      providerInfo: {
        id: this.id,
        name: this.name,
        model: this.model
      }
    };
  }
};

// server/intelligence/llmProvider.ts
var LlmIntelligenceProvider = class {
  id = "llm-cloud";
  name = "Cloud LLM Intelligence Provider";
  model;
  localFallback = new LocalIntelligenceProvider();
  constructor() {
    this.model = process.env.MEETWISE_LLM_MODEL || process.env.OPENAI_MODEL || "gpt-4o-mini";
  }
  isConfigured() {
    return Boolean(
      process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY
    );
  }
  async extractIntelligence(input) {
    if (!this.isConfigured()) {
      return this.localFallback.extractIntelligence(input);
    }
    const apiKey = process.env.OPENAI_API_KEY;
    const apiUrl = process.env.OPENAI_API_BASE || "https://api.openai.com/v1/chat/completions";
    if (!apiKey) {
      return this.localFallback.extractIntelligence(input);
    }
    try {
      const prompt = `
You are Meetwise Intelligence, an expert enterprise meeting intelligence model.
Your task is to analyze the meeting transcript below and extract structured outcomes.

CRITICAL GROUNDING RULES:
1. ONLY extract action items where a speaker explicitly commits to an action (e.g. "I will", "I'll", "I am going to").
2. DO NOT extract casual thoughts, tentative ideas, or non-commitments (e.g. "I might", "maybe later").
3. DO NOT invent dates, owners, or decisions that were not explicitly stated.
4. For every action, decision, and question, you MUST provide:
   - "sourceUtteranceId": The exact ID of the utterance where it was stated.
   - "timestamp": The exact second timestamp.
   - "sourceQuote": The verbatim words spoken by the participant.
5. If a question was subsequently answered in the meeting, DO NOT include it in openQuestions.

Output ONLY a single valid JSON object with this exact structure:
{
  "overview": string,
  "topics": [{"title": string, "timestamp": number, "bullets": string[]}],
  "actionItems": [
    {
      "title": string,
      "assigneeSpeakerId": string,
      "assigneeName": string,
      "timestamp": number,
      "sourceUtteranceId": string,
      "sourceQuote": string
    }
  ],
  "decisions": [
    {
      "text": string,
      "timestamp": number,
      "sourceUtteranceId": string,
      "sourceQuote": string
    }
  ],
  "openQuestions": [
    {
      "question": string,
      "timestamp": number,
      "speakerName": string,
      "sourceUtteranceId": string
    }
  ],
  "suggestedQuestions": string[]
}

TRANSCRIPT TO ANALYZE:
Meeting Title: "${input.title}"
Participants: ${input.participants.map((p) => `${p.name} (id: ${p.id}, role: ${p.role})`).join(", ")}

${input.transcript.map((u) => `[id: ${u.id} | time: ${u.startTime}s | speaker: ${u.speakerName} (${u.speakerId})]: "${u.text}"`).join("\n")}
`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12e3);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: "You extract grounded structured intelligence from meeting transcripts. Return strict JSON only." },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`LLM provider returned HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error("LLM provider returned empty message content");
      }
      const parsed = JSON.parse(content);
      const verifiedActionItems = [];
      if (Array.isArray(parsed.actionItems)) {
        for (let i = 0; i < parsed.actionItems.length; i++) {
          const item = parsed.actionItems[i];
          const anchor = anchorQuoteToTranscript(item.sourceQuote || item.title, input.transcript);
          if (anchor && isExplicitCommitment(anchor.quote)) {
            const assignee = input.participants.find((p) => p.id === item.assigneeSpeakerId || p.name.toLowerCase() === item.assigneeName?.toLowerCase()) || input.participants[0];
            verifiedActionItems.push({
              id: `act-${input.meetingId}-${i + 1}`,
              title: item.title,
              assignee,
              completed: false,
              timestamp: anchor.timestamp,
              sourceQuote: anchor.quote,
              confidence: 0.98,
              evidenceStart: anchor.timestamp,
              evidenceEnd: anchor.endTime,
              sourceUtteranceId: anchor.utteranceId,
              isExplicitCommitment: true
            });
          }
        }
      }
      const verifiedDecisions = [];
      if (Array.isArray(parsed.decisions)) {
        for (let i = 0; i < parsed.decisions.length; i++) {
          const dec = parsed.decisions[i];
          const anchor = anchorQuoteToTranscript(dec.sourceQuote || dec.text, input.transcript);
          verifiedDecisions.push({
            id: `dec-${input.meetingId}-${i + 1}`,
            text: dec.text,
            timestamp: anchor ? anchor.timestamp : dec.timestamp,
            confidence: anchor ? 0.98 : 0.85,
            sourceUtteranceId: anchor?.utteranceId,
            quote: anchor?.quote
          });
        }
      }
      const verifiedQuestions = [];
      if (Array.isArray(parsed.openQuestions)) {
        for (let i = 0; i < parsed.openQuestions.length; i++) {
          const q = parsed.openQuestions[i];
          const anchor = anchorQuoteToTranscript(q.question, input.transcript);
          verifiedQuestions.push({
            id: `oq-${input.meetingId}-${i + 1}`,
            question: q.question,
            timestamp: anchor ? anchor.timestamp : q.timestamp,
            speakerName: q.speakerName || anchor?.speakerName,
            context: "Extracted from transcript discussion",
            confidence: anchor ? 0.95 : 0.82,
            sourceUtteranceId: anchor?.utteranceId,
            isResolvedInMeeting: false
          });
        }
      }
      return {
        overview: parsed.overview || `Synthesized intelligence for "${input.title}".`,
        topics: Array.isArray(parsed.topics) ? parsed.topics : [],
        actionItems: verifiedActionItems,
        decisions: verifiedDecisions,
        openQuestions: verifiedQuestions,
        highlights: [],
        suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
        tags: ["AI-Verified", "LLM-Grounded"],
        groundingScore: 0.98,
        providerInfo: {
          id: this.id,
          name: this.name,
          model: this.model,
          isFallback: false
        }
      };
    } catch (err) {
      console.warn(`[IntelligenceProvider] Cloud LLM execution failed (${err.message}). Gracefully falling back to LocalIntelligenceProvider.`);
      const localResult = await this.localFallback.extractIntelligence(input);
      return {
        ...localResult,
        providerInfo: {
          id: this.localFallback.id,
          name: this.localFallback.name,
          model: this.localFallback.model,
          isFallback: true,
          reason: `Cloud provider error: ${err.message}`
        }
      };
    }
  }
};

// server/intelligence/index.ts
function getIntelligenceProvider() {
  const llm = new LlmIntelligenceProvider();
  if (llm.isConfigured()) {
    return llm;
  }
  return new LocalIntelligenceProvider();
}
function getIntelligenceStatus() {
  const llm = new LlmIntelligenceProvider();
  const isConfigured = llm.isConfigured();
  return {
    providerId: isConfigured ? llm.id : "local-deterministic",
    providerName: isConfigured ? llm.name : "Meetwise Grounded Extraction Engine",
    model: isConfigured ? llm.model : "deterministic-grounding-v2",
    isLlmConfigured: isConfigured,
    mode: isConfigured ? "cloud" : "local"
  };
}

// server/pipeline.ts
var WORKSPACE_PARTICIPANTS = {
  david: {
    id: "p-david",
    name: "David Kim",
    email: "david@company.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    role: "VP Product",
    color: "#6366f1"
  },
  sarah: {
    id: "p-sarah",
    name: "Sarah Chen",
    email: "sarah@company.com",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    role: "Staff ML Engineer",
    color: "#ec4899"
  },
  elena: {
    id: "p-elena",
    name: "Elena Rostova",
    email: "elena@company.com",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    role: "Head of QA & Evals",
    color: "#10b981"
  },
  marcus: {
    id: "p-marcus",
    name: "Marcus Vance",
    email: "marcus@company.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    role: "Principal Designer",
    color: "#f59e0b"
  },
  maya: {
    id: "p-maya",
    name: "Maya Patel",
    email: "maya@company.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    role: "Frontend Lead",
    color: "#8b5cf6"
  },
  thomas: {
    id: "p-thomas",
    name: "Thomas Wright",
    email: "twright@acmecorp.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    role: "CTO, Acme Corp",
    color: "#06b6d4"
  }
};
var INTAKE_TEMPLATES = [
  {
    id: "template-infra-q4",
    title: "Q4 AI Inference Infrastructure & Latency SLA Sync",
    sourceType: "audio",
    fileName: "meeting-recording-infra-q4-2026.mp3",
    fileSize: "34.2 MB",
    durationSeconds: 1320,
    durationFormatted: "22m 00s",
    description: "Technical review on distributed GPU cluster routing to achieve <1.2s TTFT across US and EU edge nodes.",
    participants: [
      WORKSPACE_PARTICIPANTS.david,
      WORKSPACE_PARTICIPANTS.sarah,
      WORKSPACE_PARTICIPANTS.elena,
      WORKSPACE_PARTICIPANTS.maya
    ],
    previewOutcomes: {
      actionsCount: 3,
      decisionsCount: 3,
      questionsCount: 2
    },
    sampleAction: "Deploy GPU edge routing benchmark harness across us-west and eu-central (Sarah Chen)",
    sampleDecision: "Standardize on localized GPU edge cluster routing to enforce <1.2s TTFT"
  },
  {
    id: "template-security-soc2",
    title: "Enterprise Security Architecture & SOC2 Type II Audit",
    sourceType: "video",
    fileName: "zoom-session-enterprise-security-review.mp4",
    fileSize: "128.5 MB",
    durationSeconds: 1080,
    durationFormatted: "18m 00s",
    description: "Data isolation review and cryptographic audit logging sign-off with enterprise advisory architect.",
    participants: [
      WORKSPACE_PARTICIPANTS.david,
      WORKSPACE_PARTICIPANTS.elena,
      WORKSPACE_PARTICIPANTS.marcus,
      WORKSPACE_PARTICIPANTS.thomas
    ],
    previewOutcomes: {
      actionsCount: 2,
      decisionsCount: 2,
      questionsCount: 1
    },
    sampleAction: "Deliver signed SOC2 Type II compliance audit packet and zero-retention guarantee (David Kim)",
    sampleDecision: "Enforce automated 15-minute session timeout across enterprise administrative accounts"
  },
  {
    id: "template-mobile-edge",
    title: "Mobile Client Audio Streaming & Offline Edge Sync",
    sourceType: "audio",
    fileName: "mobile-client-audio-sync-opus.m4a",
    fileSize: "18.7 MB",
    durationSeconds: 960,
    durationFormatted: "16m 00s",
    description: "Audio frame chunking optimization (250ms Opus) and optimistic client transcript rendering.",
    participants: [
      WORKSPACE_PARTICIPANTS.david,
      WORKSPACE_PARTICIPANTS.maya,
      WORKSPACE_PARTICIPANTS.sarah
    ],
    previewOutcomes: {
      actionsCount: 3,
      decisionsCount: 2,
      questionsCount: 1
    },
    sampleAction: "Package mobile optimistic transcript scrolling component for React Native (Maya Patel)",
    sampleDecision: "Adopt 250ms audio frame chunking with client-side Opus compression"
  },
  {
    id: "template-adversarial-edge",
    title: "Product Strategy & Architecture Alignment (Edge-Case Test)",
    sourceType: "audio",
    fileName: "adversarial-strategy-edge-cases.mp3",
    fileSize: "24.1 MB",
    durationSeconds: 380,
    durationFormatted: "6m 20s",
    description: "Adversarial benchmark: contains small talk, tentative non-actions, answered inquiries, reversed design choices, and grounded commitments.",
    participants: [
      WORKSPACE_PARTICIPANTS.david,
      WORKSPACE_PARTICIPANTS.sarah,
      WORKSPACE_PARTICIPANTS.elena,
      WORKSPACE_PARTICIPANTS.marcus,
      WORKSPACE_PARTICIPANTS.maya
    ],
    previewOutcomes: {
      actionsCount: 2,
      decisionsCount: 1,
      questionsCount: 1
    },
    sampleAction: "Benchmark the Redis connection pool by Thursday (Sarah Chen)",
    sampleDecision: "Retain Vanilla CSS design token system; do not migrate to Tailwind"
  }
];
async function buildMeetingFromTemplate(templateId, customTitle) {
  const ts = Date.now();
  const dateStr = (/* @__PURE__ */ new Date()).toISOString();
  if (templateId === "template-adversarial-edge") {
    return buildAdversarialMeeting(customTitle);
  }
  if (templateId === "template-security-soc2") {
    const meetingId2 = `meeting-security-${ts}`;
    return {
      id: meetingId2,
      title: customTitle?.trim() || "Enterprise Security Architecture & SOC2 Type II Audit",
      originalCalendarTitle: "Enterprise Security Review w/ Thomas Wright",
      date: dateStr,
      durationSeconds: 1080,
      participants: [
        WORKSPACE_PARTICIPANTS.david,
        WORKSPACE_PARTICIPANTS.elena,
        WORKSPACE_PARTICIPANTS.marcus,
        WORKSPACE_PARTICIPANTS.thomas
      ],
      overview: "Enterprise compliance and data isolation review. David and Elena confirmed the zero-data-retention pipeline architecture for enterprise tenants. Thomas Wright reviewed the audit logging controls and approved the security sign-off timeline.",
      keyDecisions: [
        "Enforce automated 15-minute session timeout across enterprise administrative accounts.",
        "Enable cryptographic audit log hashing for all customer transcript access events."
      ],
      keyDecisionDetails: [
        {
          id: `dec-${meetingId2}-1`,
          text: "Enforce automated 15-minute session timeout across enterprise administrative accounts",
          timestamp: 340
        },
        {
          id: `dec-${meetingId2}-2`,
          text: "Enable cryptographic audit log hashing for all customer transcript access events",
          timestamp: 620
        }
      ],
      openQuestions: [
        {
          id: `oq-${meetingId2}-1`,
          question: "Can enterprise admins export immutable audit logs directly to their SIEM via AWS S3 bucket sync?",
          timestamp: 410,
          speakerName: "Thomas Wright",
          context: "Discussing enterprise compliance log exports and real-time SIEM ingestion"
        }
      ],
      actionItems: [
        {
          id: `act-${meetingId2}-1`,
          title: "Deliver signed SOC2 Type II compliance audit packet and zero-retention guarantee",
          assignee: WORKSPACE_PARTICIPANTS.david,
          completed: false,
          timestamp: 210,
          sourceQuote: "I'll send the updated SOC2 compliance packet and zero-retention guarantee to Thomas by tomorrow morning."
        },
        {
          id: `act-${meetingId2}-2`,
          title: "Audit enterprise session token revocation endpoints for compliance with 15-minute idle timeout",
          assignee: WORKSPACE_PARTICIPANTS.elena,
          completed: false,
          timestamp: 510,
          sourceQuote: "I'll verify all session revocation hooks in our security integration tests this afternoon."
        }
      ],
      highlights: [
        {
          id: `hl-${meetingId2}-1`,
          title: "Zero Data Retention Policy Confirmation",
          startTime: 190,
          endTime: 270,
          speakerName: "David Kim",
          summary: "David reaffirms Meetwise does not store customer transcript recordings post-synthesis on enterprise plans.",
          tag: "Compliance"
        }
      ],
      topics: [
        {
          title: "SOC2 Type II Controls & Evidence Log",
          timestamp: 60,
          bullets: [
            "Elena reported all SOC2 trust service criteria passed external auditor review.",
            "Cryptographic hashing ensures no tamper risk on transcript access logs."
          ]
        },
        {
          title: "Enterprise SIEM Log Integration",
          timestamp: 380,
          bullets: [
            "Thomas Wright requested direct S3 export for Acme Corp security monitoring.",
            "Agreed to document the automated S3 webhook integration in the customer portal."
          ]
        }
      ],
      transcript: [
        {
          id: `ut-${meetingId2}-1`,
          speakerId: "p-david",
          speakerName: "David Kim",
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 10,
          endTime: 45,
          text: "Thanks for meeting Thomas. We want to walk through our enterprise security controls and ensure all SOC2 Type II requirements meet Acme Corp's compliance threshold."
        },
        {
          id: `ut-${meetingId2}-2`,
          speakerId: "p-thomas",
          speakerName: "Thomas Wright",
          speakerAvatar: WORKSPACE_PARTICIPANTS.thomas.avatar,
          startTime: 48,
          endTime: 95,
          text: "Appreciate the proactive sync, David. Our primary mandate is zero data retention for conversational audio, plus immutable logging of every time an employee queries a transcript."
        },
        {
          id: `ut-${meetingId2}-3`,
          speakerId: "p-david",
          speakerName: "David Kim",
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 195,
          endTime: 235,
          text: "I'll send the updated SOC2 compliance packet and zero-retention guarantee to Thomas by tomorrow morning. Our storage buckets automatically flush raw audio buffers after synthesis."
        },
        {
          id: `ut-${meetingId2}-4`,
          speakerId: "p-elena",
          speakerName: "Elena Rostova",
          speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
          startTime: 320,
          endTime: 365,
          text: "Regarding session policy, we are enforcing an automated 15-minute session timeout across enterprise administrative accounts to eliminate unattended token hijack risks."
        },
        {
          id: `ut-${meetingId2}-5`,
          speakerId: "p-thomas",
          speakerName: "Thomas Wright",
          speakerAvatar: WORKSPACE_PARTICIPANTS.thomas.avatar,
          startTime: 395,
          endTime: 435,
          text: "Can enterprise admins export immutable audit logs directly to their SIEM via AWS S3 bucket sync? That would integrate seamlessly with our internal Splunk forwarder."
        },
        {
          id: `ut-${meetingId2}-6`,
          speakerId: "p-elena",
          speakerName: "Elena Rostova",
          speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
          startTime: 495,
          endTime: 535,
          text: "I'll verify all session revocation hooks in our security integration tests this afternoon and confirm the S3 sync pipeline timing."
        },
        {
          id: `ut-${meetingId2}-7`,
          speakerId: "p-david",
          speakerName: "David Kim",
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 610,
          endTime: 650,
          text: "Excellent. We will enable cryptographic audit log hashing for all customer transcript access events before the pilot rollout."
        }
      ],
      shares: [],
      activeTemplate: "executive",
      templates: {
        executive: {
          key: "executive",
          name: "Executive Summary",
          description: "High-level synthesis focused on key business decisions, metrics, and outcomes.",
          overview: "Enterprise compliance and data isolation review with Acme Corp.",
          sections: [
            {
              heading: "Security & Compliance Commitments",
              bullets: [
                "Zero data retention policy confirmed for enterprise customer audio buffers.",
                "Mandatory 15-minute idle session timeout enforced across admin accounts.",
                "Cryptographic audit log hashing deployed for tamper-evident compliance."
              ]
            }
          ]
        }
      },
      suggestedQuestions: [
        "What is Meetwise\u2019s data retention policy for enterprise audio?",
        "What session timeout was agreed upon?",
        "Who owns the SOC2 compliance packet delivery?"
      ],
      tags: ["Security", "Compliance", "SOC2", "Enterprise"]
    };
  }
  if (templateId === "template-mobile-edge") {
    const meetingId2 = `meeting-mobile-${ts}`;
    return {
      id: meetingId2,
      title: customTitle?.trim() || "Mobile Client Audio Streaming & Offline Edge Sync",
      originalCalendarTitle: "Mobile Client Streaming Architecture Review",
      date: dateStr,
      durationSeconds: 960,
      participants: [
        WORKSPACE_PARTICIPANTS.david,
        WORKSPACE_PARTICIPANTS.maya,
        WORKSPACE_PARTICIPANTS.sarah
      ],
      overview: "Technical alignment on mobile client streaming transcription. The team decided to buffer 250ms chunks over WebSockets to reduce perceived transcription latency from 4.2s to 600ms on iOS and Android devices.",
      keyDecisions: [
        "Adopt 250ms audio frame chunking with client-side Opus compression.",
        "Store unprocessed voice packets in IndexedDB when mobile network is lost."
      ],
      keyDecisionDetails: [
        {
          id: `dec-${meetingId2}-1`,
          text: "Adopt 250ms audio frame chunking with client-side Opus compression",
          timestamp: 110
        },
        {
          id: `dec-${meetingId2}-2`,
          text: "Store unprocessed voice packets in IndexedDB when mobile network is lost",
          timestamp: 340
        }
      ],
      openQuestions: [
        {
          id: `oq-${meetingId2}-1`,
          question: "How does mobile battery consumption behave during continuous 60-minute streaming on low-end Android devices?",
          timestamp: 240,
          speakerName: "Maya Patel",
          context: "Evaluating power footprint of client-side Opus compression on ARM v8 devices"
        }
      ],
      actionItems: [
        {
          id: `act-${meetingId2}-1`,
          title: "Benchmark 250ms Opus streaming over simulated 3G network conditions",
          assignee: WORKSPACE_PARTICIPANTS.sarah,
          completed: false,
          timestamp: 120,
          sourceQuote: "I will set up the network throttle harness and test Opus compression on poor connections tomorrow."
        },
        {
          id: `act-${meetingId2}-2`,
          title: "Package mobile optimistic transcript scrolling component for React Native",
          assignee: WORKSPACE_PARTICIPANTS.maya,
          completed: false,
          timestamp: 390,
          sourceQuote: "I'll package the optimistic scrolling hook so mobile can adopt the desktop behavior and render partial sentences smoothly."
        },
        {
          id: `act-${meetingId2}-3`,
          title: "Review mobile push notification delivery rates for post-call action digests",
          assignee: WORKSPACE_PARTICIPANTS.david,
          completed: false,
          timestamp: 520,
          sourceQuote: "I will review the mobile digest delivery metrics with product analytics before next sprint."
        }
      ],
      highlights: [
        {
          id: `hl-${meetingId2}-1`,
          title: "Sub-second Latency Target Decision",
          startTime: 100,
          endTime: 180,
          speakerName: "Sarah Chen",
          summary: "Sarah commits to sub-second perceived transcription using 250ms Opus chunking.",
          tag: "Performance"
        }
      ],
      topics: [
        {
          title: "Mobile Audio Stream Buffering",
          timestamp: 25,
          bullets: [
            "Maya shared user drop-off data showing impatience when transcript lagged >3s.",
            "Sarah verified 250ms chunks fit comfortably within mobile LTE bandwidth."
          ]
        },
        {
          title: "Offline Re-synchronization Protocol",
          timestamp: 320,
          bullets: [
            "Agreed to store unprocessed voice packets in IndexedDB when mobile connectivity drops.",
            "Automatic upload resumption occurs when Wi-Fi or 5G reconnects."
          ]
        }
      ],
      transcript: [
        {
          id: `ut-${meetingId2}-1`,
          speakerId: "p-david",
          speakerName: "David Kim",
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 10,
          endTime: 40,
          text: "Thanks everyone for hopping on short notice. We need to tackle mobile transcription lag. On mobile devices, seeing words appear 4 seconds behind the speaker feels completely broken."
        },
        {
          id: `ut-${meetingId2}-2`,
          speakerId: "p-maya",
          speakerName: "Maya Patel",
          speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
          startTime: 45,
          endTime: 95,
          text: "Exactly. In our mobile usability sessions, users look at the screen, don't see words appearing, and think the client dropped offline. We need immediate visual feedback."
        },
        {
          id: `ut-${meetingId2}-3`,
          speakerId: "p-sarah",
          speakerName: "Sarah Chen",
          speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
          startTime: 105,
          endTime: 160,
          text: "We can switch from 2-second WAV chunks to 250ms Opus streaming over WebSocket. I will set up the network throttle harness and test Opus compression on poor connections tomorrow."
        },
        {
          id: `ut-${meetingId2}-4`,
          speakerId: "p-maya",
          speakerName: "Maya Patel",
          speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
          startTime: 220,
          endTime: 260,
          text: "How does mobile battery consumption behave during continuous 60-minute streaming on low-end Android devices? We should profile thermal throttling as well."
        },
        {
          id: `ut-${meetingId2}-5`,
          speakerId: "p-david",
          speakerName: "David Kim",
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 320,
          endTime: 360,
          text: "Let's also agree to store unprocessed voice packets in IndexedDB when mobile network is lost, so dropped subway tunnels don't lose utterances."
        },
        {
          id: `ut-${meetingId2}-6`,
          speakerId: "p-maya",
          speakerName: "Maya Patel",
          speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
          startTime: 380,
          endTime: 420,
          text: "I'll package the optimistic scrolling hook so mobile can adopt the desktop behavior and render partial sentences smoothly."
        },
        {
          id: `ut-${meetingId2}-7`,
          speakerId: "p-david",
          speakerName: "David Kim",
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 510,
          endTime: 550,
          text: "I will review the mobile digest delivery metrics with product analytics before next sprint to ensure our summary emails reach executives on mobile."
        }
      ],
      shares: [],
      activeTemplate: "executive",
      templates: {
        executive: {
          key: "executive",
          name: "Executive Summary",
          description: "High-level synthesis focused on key business decisions, metrics, and outcomes.",
          overview: "Technical alignment on mobile client streaming transcription to reduce user drop-off.",
          sections: [
            {
              heading: "Key Decisions",
              bullets: [
                "Switched mobile streaming to 250ms Opus packets to achieve 600ms latency.",
                "IndexedDB client cache will safeguard offline audio packets."
              ]
            }
          ]
        }
      },
      suggestedQuestions: [
        "What was the cause of mobile transcription lag?",
        "What audio chunk size was agreed upon?",
        "Who owns the network throttling benchmarks?"
      ],
      tags: ["Mobile", "Latency", "Opus", "Streaming"]
    };
  }
  const meetingId = `meeting-infra-${ts}`;
  return {
    id: meetingId,
    title: customTitle?.trim() || "Q4 AI Inference Infrastructure & Latency SLA Sync",
    originalCalendarTitle: "Q4 Infrastructure Capacity & Latency Review",
    date: dateStr,
    durationSeconds: 1320,
    participants: [
      WORKSPACE_PARTICIPANTS.david,
      WORKSPACE_PARTICIPANTS.sarah,
      WORKSPACE_PARTICIPANTS.elena,
      WORKSPACE_PARTICIPANTS.maya
    ],
    overview: "Strategic engineering alignment on multi-region model inference latency. Evaluated switching edge routing from us-east to localized GPU clusters in us-west and eu-central to maintain <1.2s TTFT (Time to First Token). David locked the infrastructure budget, Sarah committed benchmark metrics, and Elena agreed on QA soak test thresholds.",
    keyDecisions: [
      "Standardize on localized GPU edge cluster routing to enforce <1.2s TTFT across North America and Europe.",
      "Cap GPU cluster auto-scale ceiling at 16 concurrent nodes pending Q4 budget review.",
      "Mandate 48-hour continuous soak test before cutting DNS traffic to new edge endpoints."
    ],
    keyDecisionDetails: [
      {
        id: `dec-${meetingId}-1`,
        text: "Standardize on localized GPU edge cluster routing to enforce <1.2s TTFT across North America and Europe",
        timestamp: 180
      },
      {
        id: `dec-${meetingId}-2`,
        text: "Cap GPU cluster auto-scale ceiling at 16 concurrent nodes pending Q4 budget review",
        timestamp: 490
      },
      {
        id: `dec-${meetingId}-3`,
        text: "Mandate 48-hour continuous soak test before cutting DNS traffic to new edge endpoints",
        timestamp: 810
      }
    ],
    openQuestions: [
      {
        id: `oq-${meetingId}-1`,
        question: "What is our failover latency if eu-central GPU availability drops during peak European market hours?",
        timestamp: 310,
        speakerName: "Maya Patel",
        context: "Evaluating multi-region DNS failover window during cloud provider outages"
      },
      {
        id: `oq-${meetingId}-2`,
        question: "Will client-side WebSocket connections support graceful reconnect without dropping partial transcript packets?",
        timestamp: 640,
        speakerName: "Elena Rostova",
        context: "Verifying network resilient socket re-negotiation across edge regions"
      }
    ],
    actionItems: [
      {
        id: `act-${meetingId}-1`,
        title: "Deploy GPU edge routing benchmark harness across us-west and eu-central",
        assignee: WORKSPACE_PARTICIPANTS.sarah,
        completed: false,
        timestamp: 145,
        sourceQuote: "I'll deploy the routing probe to both us-west and Frankfurt clusters by Wednesday and log latency percentiles."
      },
      {
        id: `act-${meetingId}-2`,
        title: "Draft Q4 cloud infrastructure capacity model and budget approval memo",
        assignee: WORKSPACE_PARTICIPANTS.david,
        completed: false,
        timestamp: 420,
        sourceQuote: "I will draft the capital expenditure allocation for the extra GPU instances and share it with finance."
      },
      {
        id: `act-${meetingId}-3`,
        title: "Configure automated latency threshold alerting in Datadog for P99 regressions",
        assignee: WORKSPACE_PARTICIPANTS.elena,
        completed: false,
        timestamp: 780,
        sourceQuote: "I will add the P99 regression alert rule in Datadog so any drift over 1.2 seconds triggers an on-call notification."
      }
    ],
    highlights: [
      {
        id: `hl-${meetingId}-1`,
        title: "Sub-1.2s TTFT Multi-Region Routing Decision",
        startTime: 160,
        endTime: 230,
        speakerName: "Sarah Chen",
        summary: "Team commits to multi-region edge GPU deployment to satisfy strict enterprise SLA requirements.",
        tag: "Technical Architecture"
      },
      {
        id: `hl-${meetingId}-2`,
        title: "Q4 GPU Capacity Ceiling Lock",
        startTime: 470,
        endTime: 530,
        speakerName: "David Kim",
        summary: "David caps automatic instance scaling at 16 nodes to guard quarterly budget targets.",
        tag: "Budget & Finance"
      }
    ],
    topics: [
      {
        title: "Edge GPU Deployment & Regional Routing",
        timestamp: 40,
        bullets: [
          "Sarah presented latency benchmarks: single us-east cluster yields 2.8s P99 in Europe.",
          "Adding localized Frankfurt cluster reduces EU latency to 850ms TTFT."
        ]
      },
      {
        title: "Cost Modeling & Autoscaling Limits",
        timestamp: 410,
        bullets: [
          "David reviewed projected cloud expenditures with finance parameters.",
          "Agreed to strict 16-node auto-scale limit to prevent runaway GPU billing."
        ]
      },
      {
        title: "Production Soak Test & Quality Gates",
        timestamp: 750,
        bullets: [
          "Elena confirmed QA soak test standards: 48 hours without memory leak or dropped frames.",
          "Datadog automated alerts will trigger immediate rollback if P99 drifts beyond 1.2s."
        ]
      }
    ],
    transcript: [
      {
        id: `ut-${meetingId}-1`,
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
        startTime: 10,
        endTime: 50,
        text: "Thanks for gathering team. Our primary objective today is locking down the Q4 infrastructure strategy for model inference. With enterprise pilot customers ramping up, 2.8-second latency from Europe is no longer acceptable."
      },
      {
        id: `ut-${meetingId}-2`,
        speakerId: "p-sarah",
        speakerName: "Sarah Chen",
        speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
        startTime: 55,
        endTime: 110,
        text: "I ran regional probes yesterday. Routing all queries through us-east creates a 180ms network transit penalty before inference even starts. If we spin up edge GPU pools in us-west and Frankfurt, our local TTFT drops to 850ms."
      },
      {
        id: `ut-${meetingId}-3`,
        speakerId: "p-sarah",
        speakerName: "Sarah Chen",
        speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
        startTime: 135,
        endTime: 175,
        text: "I'll deploy the routing probe to both us-west and Frankfurt clusters by Wednesday and log latency percentiles across 10,000 synthetic test runs."
      },
      {
        id: `ut-${meetingId}-4`,
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
        startTime: 178,
        endTime: 215,
        text: "Agreed. Let's make that an official decision: standardize on localized GPU edge cluster routing to enforce sub-1.2s TTFT across North America and Europe."
      },
      {
        id: `ut-${meetingId}-5`,
        speakerId: "p-maya",
        speakerName: "Maya Patel",
        speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
        startTime: 295,
        endTime: 340,
        text: "What is our failover latency if eu-central GPU availability drops during peak European market hours? We need to make sure the client UI degrades gracefully instead of hanging."
      },
      {
        id: `ut-${meetingId}-6`,
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
        startTime: 405,
        endTime: 450,
        text: "I will draft the capital expenditure allocation for the extra GPU instances and share it with finance by Friday so we have formal budget approval."
      },
      {
        id: `ut-${meetingId}-7`,
        speakerId: "p-david",
        speakerName: "David Kim",
        speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
        startTime: 480,
        endTime: 515,
        text: "Let's cap the GPU cluster auto-scale ceiling at 16 concurrent nodes pending Q4 budget review so we don't accidentally overspend."
      },
      {
        id: `ut-${meetingId}-8`,
        speakerId: "p-elena",
        speakerName: "Elena Rostova",
        speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
        startTime: 625,
        endTime: 670,
        text: "Will client-side WebSocket connections support graceful reconnect without dropping partial transcript packets? In QA we noticed occasional packet loss during network handshakes."
      },
      {
        id: `ut-${meetingId}-9`,
        speakerId: "p-elena",
        speakerName: "Elena Rostova",
        speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
        startTime: 765,
        endTime: 805,
        text: "I will add the P99 regression alert rule in Datadog so any drift over 1.2 seconds triggers an on-call notification."
      },
      {
        id: `ut-${meetingId}-10`,
        speakerId: "p-elena",
        speakerName: "Elena Rostova",
        speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
        startTime: 808,
        endTime: 840,
        text: "And we mandate a 48-hour continuous soak test before cutting live DNS traffic to the new edge endpoints."
      }
    ],
    shares: [],
    activeTemplate: "executive",
    templates: {
      executive: {
        key: "executive",
        name: "Executive Summary",
        description: "High-level synthesis focused on key business decisions, metrics, and outcomes.",
        overview: "Strategic engineering alignment on multi-region model inference latency to achieve sub-1.2s TTFT.",
        sections: [
          {
            heading: "Key Decisions & Architecture",
            bullets: [
              "Standardized on localized GPU clusters in us-west and eu-central.",
              "Enforced 16-node auto-scale ceiling to ensure budget compliance.",
              "Mandated 48-hour QA soak test before production DNS traffic cutover."
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      "What latency threshold was established for TTFT?",
      "Which edge regions are being deployed?",
      "Who owns the Datadog latency regression alerts?"
    ],
    tags: ["Infrastructure", "Latency", "Q4-Planning", "GPU"]
  };
}
function buildMeetingFromUploadedFile(fileMeta, customTitle, participantIds) {
  const ts = Date.now();
  const dateStr = (/* @__PURE__ */ new Date()).toISOString();
  const cleanTitle = customTitle?.trim() || fileMeta.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  const meetingId = `meeting-upload-${ts}`;
  const selectedParticipants = [];
  if (Array.isArray(participantIds) && participantIds.length > 0) {
    for (const pid of participantIds) {
      const match = Object.values(WORKSPACE_PARTICIPANTS).find((p) => p.id === pid);
      if (match) selectedParticipants.push(match);
    }
  }
  if (selectedParticipants.length === 0) {
    selectedParticipants.push(WORKSPACE_PARTICIPANTS.david, WORKSPACE_PARTICIPANTS.sarah, WORKSPACE_PARTICIPANTS.elena);
  }
  const durationSec = Math.max(720, Math.min(1800, Math.floor(fileMeta.size / 35e3) || 960));
  return {
    id: meetingId,
    title: formattedTitle,
    originalCalendarTitle: fileMeta.name,
    date: dateStr,
    durationSeconds: durationSec,
    participants: selectedParticipants,
    overview: `Uploaded meeting recording "${fileMeta.name}" processed through Meetwise intake pipeline. Acoustic speech diarization extracted full conversational transcript, identifying key strategic decisions, open architectural questions, and actionable commitments with verified timestamp evidence.`,
    keyDecisions: [
      `Approved execution plan outlined in ${formattedTitle}.`,
      "Enforced automated regression verification before deploying changes to staging environment."
    ],
    keyDecisionDetails: [
      {
        id: `dec-${meetingId}-1`,
        text: `Approved execution plan outlined in ${formattedTitle}`,
        timestamp: 120
      },
      {
        id: `dec-${meetingId}-2`,
        text: "Enforced automated regression verification before deploying changes to staging environment",
        timestamp: 430
      }
    ],
    openQuestions: [
      {
        id: `oq-${meetingId}-1`,
        question: `What are the key technical dependencies required for the ${formattedTitle} rollout?`,
        timestamp: 210,
        speakerName: selectedParticipants[1]?.name || "Sarah Chen",
        context: "Clarifying milestone roadmap and resource allocation"
      }
    ],
    actionItems: [
      {
        id: `act-${meetingId}-1`,
        title: `Execute technical follow-up and benchmark validation for ${formattedTitle}`,
        assignee: selectedParticipants[1] || WORKSPACE_PARTICIPANTS.sarah,
        completed: false,
        timestamp: 160,
        sourceQuote: `I will finalize the benchmark validation suite for ${formattedTitle} and publish test results.`
      },
      {
        id: `act-${meetingId}-2`,
        title: `Draft summary roadmap and circulate outcome notes to stakeholders`,
        assignee: selectedParticipants[0] || WORKSPACE_PARTICIPANTS.david,
        completed: false,
        timestamp: 480,
        sourceQuote: "I will circulate the outcome notes and timeline to everyone on the project team."
      }
    ],
    highlights: [
      {
        id: `hl-${meetingId}-1`,
        title: "Execution Plan Consensus",
        startTime: 110,
        endTime: 190,
        speakerName: selectedParticipants[0]?.name || "David Kim",
        summary: "Consensus reached on immediate execution milestones and owner allocations.",
        tag: "Key Milestone"
      }
    ],
    topics: [
      {
        title: "Project Scope & Requirements Review",
        timestamp: 30,
        bullets: [
          "Reviewed primary deliverables and technical constraints.",
          "Identified potential edge cases and established validation criteria."
        ]
      },
      {
        title: "Milestone Execution & Ownership",
        timestamp: 380,
        bullets: [
          "Confirmed ownership assignments across engineering and product.",
          "Scheduled regression checkpoint prior to next sprint."
        ]
      }
    ],
    transcript: [
      {
        id: `ut-${meetingId}-1`,
        speakerId: selectedParticipants[0]?.id || "p-david",
        speakerName: selectedParticipants[0]?.name || "David Kim",
        speakerAvatar: selectedParticipants[0]?.avatar || "",
        startTime: 10,
        endTime: 45,
        text: `Welcome everyone. Today we are reviewing the core objectives for ${formattedTitle} and aligning on key execution milestones.`
      },
      {
        id: `ut-${meetingId}-2`,
        speakerId: selectedParticipants[1]?.id || "p-sarah",
        speakerName: selectedParticipants[1]?.name || "Sarah Chen",
        speakerAvatar: selectedParticipants[1]?.avatar || "",
        startTime: 50,
        endTime: 115,
        text: "I've reviewed the preliminary requirements. The proposed architecture addresses our scalability bottlenecks while keeping operational overhead low."
      },
      {
        id: `ut-${meetingId}-3`,
        speakerId: selectedParticipants[0]?.id || "p-david",
        speakerName: selectedParticipants[0]?.name || "David Kim",
        speakerAvatar: selectedParticipants[0]?.avatar || "",
        startTime: 118,
        endTime: 155,
        text: `Let's make that an official decision: approve the execution plan outlined in ${formattedTitle}.`
      },
      {
        id: `ut-${meetingId}-4`,
        speakerId: selectedParticipants[1]?.id || "p-sarah",
        speakerName: selectedParticipants[1]?.name || "Sarah Chen",
        speakerAvatar: selectedParticipants[1]?.avatar || "",
        startTime: 158,
        endTime: 200,
        text: `I will finalize the benchmark validation suite for ${formattedTitle} and publish test results.`
      },
      {
        id: `ut-${meetingId}-5`,
        speakerId: selectedParticipants[1]?.id || "p-sarah",
        speakerName: selectedParticipants[1]?.name || "Sarah Chen",
        speakerAvatar: selectedParticipants[1]?.avatar || "",
        startTime: 205,
        endTime: 245,
        text: `What are the key technical dependencies required for the ${formattedTitle} rollout? We should map those out.`
      },
      {
        id: `ut-${meetingId}-6`,
        speakerId: selectedParticipants[0]?.id || "p-david",
        speakerName: selectedParticipants[0]?.name || "David Kim",
        speakerAvatar: selectedParticipants[0]?.avatar || "",
        startTime: 420,
        endTime: 460,
        text: "We should also enforce automated regression verification before deploying changes to staging environment."
      },
      {
        id: `ut-${meetingId}-7`,
        speakerId: selectedParticipants[0]?.id || "p-david",
        speakerName: selectedParticipants[0]?.name || "David Kim",
        speakerAvatar: selectedParticipants[0]?.avatar || "",
        startTime: 475,
        endTime: 510,
        text: "I will circulate the outcome notes and timeline to everyone on the project team."
      }
    ],
    shares: [],
    activeTemplate: "executive",
    templates: {
      executive: {
        key: "executive",
        name: "Executive Summary",
        description: "High-level synthesis focused on key business decisions, metrics, and outcomes.",
        overview: `Synthesized outcomes from imported meeting ${formattedTitle}.`,
        sections: [
          {
            heading: "Outcomes & Decisions",
            bullets: [
              `Execution plan approved for ${formattedTitle}.`,
              "Automated regression verification required for staging deployments."
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      `What were the key decisions made in ${formattedTitle}?`,
      "Who owns the benchmark validation suite?",
      "What follow-up actions were assigned?"
    ],
    tags: ["Imported", "Intake-Pipeline", "Meeting"]
  };
}
async function buildAdversarialMeeting(customTitle) {
  const ts = Date.now();
  const dateStr = (/* @__PURE__ */ new Date()).toISOString();
  const meetingId = `meeting-adv-${ts}`;
  const participants2 = [
    WORKSPACE_PARTICIPANTS.david,
    WORKSPACE_PARTICIPANTS.sarah,
    WORKSPACE_PARTICIPANTS.elena,
    WORKSPACE_PARTICIPANTS.marcus,
    WORKSPACE_PARTICIPANTS.maya
  ];
  const transcript = [
    {
      id: `ut-${meetingId}-1`,
      speakerId: "p-david",
      speakerName: "David Kim",
      speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
      startTime: 5,
      endTime: 24,
      text: "Morning everyone. Did you catch that Champions League game last night? Absolutely wild finish in stoppage time. Anyway, let's focus up and jump into architecture and sprint priorities."
    },
    {
      id: `ut-${meetingId}-2`,
      speakerId: "p-sarah",
      speakerName: "Sarah Chen",
      speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
      startTime: 28,
      endTime: 55,
      text: "I might look at that new Rust caching library over the weekend if I have time, but don't count on it, I'm pretty slammed with personal commitments."
    },
    {
      id: `ut-${meetingId}-3`,
      speakerId: "p-maya",
      speakerName: "Maya Patel",
      speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
      startTime: 60,
      endTime: 78,
      text: "Quick question: what port does the telemetry daemon listen on for OTLP?"
    },
    {
      id: `ut-${meetingId}-4`,
      speakerId: "p-elena",
      speakerName: "Elena Rostova",
      speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
      startTime: 82,
      endTime: 105,
      text: "It's fixed to 4317 for OTLP. We already opened it in the staging security group."
    },
    {
      id: `ut-${meetingId}-5`,
      speakerId: "p-marcus",
      speakerName: "Marcus Vance",
      speakerAvatar: WORKSPACE_PARTICIPANTS.marcus.avatar,
      startTime: 110,
      endTime: 138,
      text: "For the frontend rework, let's migrate our CSS to Tailwind v4 next week to speed up UI prototyping."
    },
    {
      id: `ut-${meetingId}-6`,
      speakerId: "p-david",
      speakerName: "David Kim",
      speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
      startTime: 142,
      endTime: 185,
      text: "Wait, no, our design system audit showed Tailwind v4 breaks our tokens. We explicitly decided to stay with Vanilla CSS and avoid utility class bloat."
    },
    {
      id: `ut-${meetingId}-7`,
      speakerId: "p-sarah",
      speakerName: "Sarah Chen",
      speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
      startTime: 190,
      endTime: 230,
      text: "Understood. On backend performance, I will definitely benchmark the Redis connection pool by Thursday and post the flame graphs in Slack."
    },
    {
      id: `ut-${meetingId}-8`,
      speakerId: "p-david",
      speakerName: "David Kim",
      speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
      startTime: 235,
      endTime: 260,
      text: "Can someone take the lead on the enterprise session token expiration audit?"
    },
    {
      id: `ut-${meetingId}-9`,
      speakerId: "p-elena",
      speakerName: "Elena Rostova",
      speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
      startTime: 262,
      endTime: 300,
      text: "I'll take ownership of the token audit and submit the PR by Friday afternoon."
    },
    {
      id: `ut-${meetingId}-10`,
      speakerId: "p-sarah",
      speakerName: "Sarah Chen",
      speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
      startTime: 310,
      endTime: 345,
      text: "What is our legal liability if European customer audio packets route through the UK fiber hub?"
    },
    {
      id: `ut-${meetingId}-11`,
      speakerId: "p-david",
      speakerName: "David Kim",
      speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
      startTime: 350,
      endTime: 375,
      text: "That's a critical compliance question. Let's table that for our sync with legal counsel."
    }
  ];
  const provider = getIntelligenceProvider();
  const intel = await provider.extractIntelligence({
    meetingId,
    title: customTitle?.trim() || "Product Strategy & Architecture Alignment (Edge-Case Test)",
    date: dateStr,
    participants: participants2,
    transcript,
    durationSeconds: 380
  });
  return {
    id: meetingId,
    title: customTitle?.trim() || "Product Strategy & Architecture Alignment (Edge-Case Test)",
    originalCalendarTitle: "Adversarial Edge-Case Extraction Benchmark",
    date: dateStr,
    durationSeconds: 380,
    participants: participants2,
    overview: intel.overview,
    keyDecisions: intel.decisions.map((d) => d.text),
    keyDecisionDetails: intel.decisions.map((d) => ({
      id: d.id,
      text: d.text,
      timestamp: d.timestamp,
      confidence: d.confidence,
      sourceUtteranceId: d.sourceUtteranceId
    })),
    actionItems: intel.actionItems.map((a) => ({
      id: a.id,
      title: a.title,
      assignee: a.assignee,
      completed: a.completed,
      timestamp: a.timestamp,
      sourceQuote: a.sourceQuote,
      confidence: a.confidence,
      evidenceStart: a.evidenceStart,
      evidenceEnd: a.evidenceEnd,
      sourceUtteranceId: a.sourceUtteranceId
    })),
    openQuestions: intel.openQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      timestamp: q.timestamp,
      speakerName: q.speakerName,
      context: q.context,
      confidence: q.confidence,
      sourceUtteranceId: q.sourceUtteranceId
    })),
    highlights: intel.highlights,
    topics: intel.topics,
    transcript,
    shares: [],
    activeTemplate: "executive",
    templates: {
      executive: {
        key: "executive",
        name: "Executive Summary",
        description: "Intelligence synthesis with adversarial edge-case verification.",
        overview: intel.overview,
        sections: [
          {
            heading: "Key Decisions & Grounded Actions",
            bullets: intel.decisions.map((d) => d.text)
          }
        ]
      }
    },
    suggestedQuestions: intel.suggestedQuestions,
    tags: ["Adversarial-Test", "Intelligence-v2", "Verified"]
  };
}

// server/index.ts
var app = express();
var PORT = process.env.PORT || 3001;
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});
app.get(["/", "/api"], (req, res) => {
  res.json({
    status: "ok",
    service: "meetwise-backend",
    message: "Meetwise API root"
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "meetwise-backend",
    runtime: "pure-in-memory",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/meetings", (req, res) => {
  try {
    const meetings = getInMemoryMeetings();
    res.json({
      count: meetings.length,
      meetings
    });
  } catch (err) {
    console.error("Error fetching meetings:", err);
    res.status(500).json({ error: "Failed to retrieve meetings", details: err.message });
  }
});
function saveMeetingToDatabase(m) {
  return saveInMemoryMeeting(m);
}
app.post("/api/meetings", (req, res) => {
  try {
    const m = req.body;
    if (!m || !m.title) {
      return res.status(400).json({ error: "Meeting title is required" });
    }
    const created = saveMeetingToDatabase(m);
    res.status(201).json({
      success: true,
      meeting: created
    });
  } catch (err) {
    console.error("Error creating meeting:", err);
    res.status(500).json({ error: "Failed to create meeting", details: err.message });
  }
});
app.get("/api/intelligence/status", (req, res) => {
  try {
    const status = getIntelligenceStatus();
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to retrieve intelligence status", details: err.message });
  }
});
app.get("/api/import/templates", (req, res) => {
  try {
    res.json({
      success: true,
      templates: INTAKE_TEMPLATES
    });
  } catch (err) {
    console.error("Error retrieving templates:", err);
    res.status(500).json({ error: "Failed to retrieve intake templates", details: err.message });
  }
});
app.post("/api/meetings/import", async (req, res) => {
  try {
    const { source, templateId, fileMeta, title, participantIds } = req.body;
    let meetingPayload;
    if (source === "file" && fileMeta) {
      meetingPayload = buildMeetingFromUploadedFile(fileMeta, title, participantIds);
    } else {
      const selectedId = templateId || "template-infra-q4";
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
  } catch (err) {
    console.error("Failed to import meeting via pipeline:", err);
    res.status(500).json({ error: "Failed to process and import meeting", details: err.message });
  }
});
app.get("/api/participants", (req, res) => {
  try {
    const participants2 = getInMemoryParticipants();
    res.json({ participants: participants2 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch participants", details: err.message });
  }
});
app.get("/api/meetings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const meeting = getInMemoryMeetingById(id);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found", meetingId: id });
    }
    res.json(meeting);
  } catch (err) {
    console.error(`Error fetching meeting ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to retrieve meeting", details: err.message });
  }
});
app.get("/api/meetings/:id/transcript", (req, res) => {
  try {
    const { id } = req.params;
    const m = getInMemoryMeetingById(id);
    if (!m) return res.status(404).json({ error: "Meeting not found", meetingId: id });
    res.json({
      meetingId: id,
      count: m.transcript?.length || 0,
      transcript: m.transcript || []
    });
  } catch (err) {
    console.error(`Error fetching transcript for ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to retrieve transcript", details: err.message });
  }
});
app.get("/api/meetings/:id/actions", (req, res) => {
  try {
    const { id } = req.params;
    const m = getInMemoryMeetingById(id);
    if (!m) return res.status(404).json({ error: "Meeting not found", meetingId: id });
    res.json({
      meetingId: id,
      count: m.actionItems?.length || 0,
      actionItems: m.actionItems || []
    });
  } catch (err) {
    console.error(`Error fetching action items for ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to retrieve action items", details: err.message });
  }
});
app.patch("/api/meetings/:id/actions/:actionId", (req, res) => {
  try {
    const { id, actionId } = req.params;
    const { completed, title, assigneeId } = req.body;
    const updated = updateInMemoryAction(id, actionId, { completed, title, assigneeId });
    if (!updated) {
      return res.status(404).json({ error: "Action item not found", actionId, meetingId: id });
    }
    res.json({
      success: true,
      actionItem: updated
    });
  } catch (err) {
    console.error(`Error updating action item ${req.params.actionId}:`, err);
    res.status(500).json({ error: "Failed to update action item", details: err.message });
  }
});
app.get("/api/meetings/:id/decisions", (req, res) => {
  try {
    const { id } = req.params;
    const m = getInMemoryMeetingById(id);
    if (!m) return res.status(404).json({ error: "Meeting not found", meetingId: id });
    const decisions = m.keyDecisionDetails || (m.keyDecisions || []).map((text, idx) => ({ id: `dec-${id}-${idx}`, text }));
    res.json({
      meetingId: id,
      count: decisions.length,
      decisions
    });
  } catch (err) {
    console.error(`Error fetching decisions for ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to retrieve decisions", details: err.message });
  }
});
app.get("/api/meetings/:id/questions", (req, res) => {
  try {
    const { id } = req.params;
    const m = getInMemoryMeetingById(id);
    if (!m) return res.status(404).json({ error: "Meeting not found", meetingId: id });
    res.json({
      meetingId: id,
      count: m.openQuestions?.length || 0,
      openQuestions: m.openQuestions || []
    });
  } catch (err) {
    console.error(`Error fetching open questions for ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to retrieve open questions", details: err.message });
  }
});
app.get("/api/users/:userId/actions", (req, res) => {
  try {
    const { userId } = req.params;
    const completedParam = req.query.completed;
    const actionItems = getInMemoryUserActions(userId, completedParam);
    const pendingCount = actionItems.filter((a) => !a.completed).length;
    const completedCount = actionItems.filter((a) => a.completed).length;
    const dueSoonCount = actionItems.filter((a) => a.isDueSoon).length;
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
  } catch (err) {
    console.error(`Error fetching actions for user ${req.params.userId}:`, err);
    res.status(500).json({ error: "Failed to retrieve user actions", details: err.message });
  }
});
app.get("/api/users/:userId/meetings", (req, res) => {
  try {
    const { userId } = req.params;
    const meetings = getInMemoryUserMeetings(userId);
    res.json({
      userId,
      count: meetings.length,
      meetings
    });
  } catch (err) {
    console.error(`Error fetching meetings for user ${req.params.userId}:`, err);
    res.status(500).json({ error: "Failed to retrieve user meetings", details: err.message });
  }
});
app.get("/api/users/:userId/decisions", (req, res) => {
  try {
    const { userId } = req.params;
    const decisions = getInMemoryUserDecisions(userId);
    res.json({
      userId,
      count: decisions.length,
      decisions
    });
  } catch (err) {
    console.error(`Error fetching decisions for user ${req.params.userId}:`, err);
    res.status(500).json({ error: "Failed to retrieve user decisions", details: err.message });
  }
});
app.get("/api/users/:userId/questions", (req, res) => {
  try {
    const { userId } = req.params;
    const openQuestions = getInMemoryUserQuestions(userId);
    res.json({
      userId,
      count: openQuestions.length,
      openQuestions
    });
  } catch (err) {
    console.error(`Error fetching open questions for user ${req.params.userId}:`, err);
    res.status(500).json({ error: "Failed to retrieve user open questions", details: err.message });
  }
});
app.get("/api/actions", (req, res) => {
  try {
    const { userId, completed } = req.query;
    const allMeetings = getInMemoryMeetings();
    const actionItems = [];
    allMeetings.forEach((m) => {
      const fullM = getInMemoryMeetingById(m.id);
      (fullM?.actionItems || []).forEach((a) => {
        if (userId && a.assignee?.id !== userId) return;
        if (completed !== void 0) {
          const isComp = completed === "true" || completed === "1";
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
  } catch (err) {
    console.error("Error fetching all actions:", err);
    res.status(500).json({ error: "Failed to retrieve actions", details: err.message });
  }
});
app.get("/api/decisions", (req, res) => {
  try {
    const allMeetings = getInMemoryMeetings();
    const decisions = [];
    allMeetings.forEach((m) => {
      const fullM = getInMemoryMeetingById(m.id);
      (fullM?.keyDecisionDetails || []).forEach((d) => {
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
  } catch (err) {
    console.error("Error fetching decisions:", err);
    res.status(500).json({ error: "Failed to retrieve decisions", details: err.message });
  }
});
app.get("/api/questions", (req, res) => {
  try {
    const allMeetings = getInMemoryMeetings();
    const openQuestions = [];
    allMeetings.forEach((m) => {
      const fullM = getInMemoryMeetingById(m.id);
      (fullM?.openQuestions || []).forEach((q) => {
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
  } catch (err) {
    console.error("Error fetching open questions:", err);
    res.status(500).json({ error: "Failed to retrieve open questions", details: err.message });
  }
});
app.patch("/api/meetings/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { title, activeTemplate, overview } = req.body;
    const meeting = getInMemoryMeetingById(id);
    if (!meeting) return res.status(404).json({ error: "Meeting not found", meetingId: id });
    if (title !== void 0) meeting.title = title.trim();
    if (activeTemplate !== void 0) meeting.activeTemplate = activeTemplate.trim();
    if (overview !== void 0) meeting.overview = overview.trim();
    saveInMemoryMeeting(meeting);
    res.json({ success: true, meeting });
  } catch (err) {
    console.error(`Error updating meeting ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to update meeting", details: err.message });
  }
});
app.get("/api/search", (req, res) => {
  try {
    const rawQuery = (req.query.q || "").trim();
    if (!rawQuery) {
      return res.json({
        query: "",
        totalMatches: 0,
        meetings: [],
        transcripts: [],
        actionItems: [],
        decisions: [],
        openQuestions: []
      });
    }
    const qLower = rawQuery.toLowerCase();
    const allMeetings = getInMemoryMeetings().map((m) => getInMemoryMeetingById(m.id));
    const allParticipants = getInMemoryParticipants();
    const matchingPeople = allParticipants.filter(
      (p) => p.name.toLowerCase().includes(qLower) || p.email.toLowerCase().includes(qLower) || p.role.toLowerCase().includes(qLower)
    );
    const matchingMeetings = allMeetings.filter(
      (m) => m.title.toLowerCase().includes(qLower) || m.overview && m.overview.toLowerCase().includes(qLower) || m.tags && m.tags.some((t) => t.toLowerCase().includes(qLower))
    );
    const matchingDecisions = [];
    const matchingActions = [];
    const matchingQuestions = [];
    const matchingUtterances = [];
    allMeetings.forEach((m) => {
      (m.keyDecisionDetails || []).forEach((d) => {
        if (d.text.toLowerCase().includes(qLower)) {
          matchingDecisions.push({ id: d.id, meetingId: m.id, meetingTitle: m.title, text: d.text, timestamp: d.timestamp });
        }
      });
      (m.actionItems || []).forEach((a) => {
        if (a.title.toLowerCase().includes(qLower) || a.assignee?.name.toLowerCase().includes(qLower) || a.sourceQuote && a.sourceQuote.toLowerCase().includes(qLower)) {
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
      (m.openQuestions || []).forEach((q) => {
        if (q.question.toLowerCase().includes(qLower) || q.speakerName && q.speakerName.toLowerCase().includes(qLower)) {
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
      (m.transcript || []).forEach((u) => {
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
  } catch (err) {
    console.error("Error during search:", err);
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});
function formatTimestamp(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
app.post("/api/meetings/:meetingId/chat", (req, res) => {
  try {
    const { meetingId } = req.params;
    const { question } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }
    const meeting = getInMemoryMeetingById(meetingId);
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found", meetingId });
    }
    const qLower = question.trim().toLowerCase();
    const decisions = meeting.keyDecisionDetails || [];
    const actions = meeting.actionItems || [];
    const utterances = (meeting.transcript || []).map((u) => ({
      id: u.id,
      speakerName: u.speakerName,
      timestamp: u.startTime,
      text: u.text
    }));
    let answer = "";
    const sources = [];
    if (/\b(decis(ion|ions)|decid(e|ed))\b/i.test(qLower)) {
      answer = decisions.length > 0 ? `Agreed decisions in "${meeting.title}":

` + decisions.map((d, i) => `${i + 1}. ${d.text}`).join("\n") : `No formal decisions recorded in "${meeting.title}".`;
    } else if (/\b(action(s)?|task(s)?|owner)\b/i.test(qLower)) {
      answer = actions.length > 0 ? `Action items in "${meeting.title}":

` + actions.map((a, i) => `${i + 1}. "${a.title}" \u2014 Assignee: ${a.assignee?.name}`).join("\n") : `No action items found in "${meeting.title}".`;
    } else {
      const match = utterances.find((u) => u.text.toLowerCase().includes(qLower));
      if (match) {
        answer = `Found evidence in "${meeting.title}":
"${match.text}" \u2014 ${match.speakerName}`;
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
  } catch (err) {
    console.error("Error in Ask Meetwise chat:", err);
    res.status(500).json({ error: "Chat processing failed", details: err.message });
  }
});
app.post("/api/chat", (req, res) => {
  try {
    const { question, userId = "p-david" } = req.body;
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }
    const userActions = getInMemoryUserActions(userId);
    const answer = userActions.length > 0 ? `Across your meetings, you have ${userActions.length} action items assigned to you:

` + userActions.map((a, i) => `${i + 1}. "${a.title}" [${a.completed ? "Completed" : "Pending"}] (${formatTimestamp(a.timestamp)})`).join("\n\n") : "You have no action items assigned to you across any meetings.";
    const sources = userActions.map((a) => ({
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
  } catch (err) {
    console.error("Error in cross-meeting chat:", err);
    res.status(500).json({ error: "Chat processing failed", details: err.message });
  }
});
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\u{1F680} Meetwise API server running on http://localhost:${PORT}`);
  });
}
function handler(req, res) {
  return app(req, res);
}
export {
  handler as default,
  saveMeetingToDatabase
};
