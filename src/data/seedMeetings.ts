import { Meeting, Participant } from '../types';

export const participants: Record<string, Participant> = {
  david: {
    id: 'p-david',
    name: 'David Kim',
    email: 'david@fathom.internal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'VP Product',
    color: '#6366f1'
  },
  sarah: {
    id: 'p-sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@fathom.internal',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'Staff ML Engineer',
    color: '#ec4899'
  },
  elena: {
    id: 'p-elena',
    name: 'Elena Rostova',
    email: 'elena.r@fathom.internal',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    role: 'Head of QA & Evals',
    color: '#10b981'
  },
  marcus: {
    id: 'p-marcus',
    name: 'Marcus Vance',
    email: 'marcus.v@fathom.internal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Principal Designer',
    color: '#f59e0b'
  },
  maya: {
    id: 'p-maya',
    name: 'Maya Patel',
    email: 'maya.patel@fathom.internal',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'Frontend Lead',
    color: '#8b5cf6'
  },
  thomas: {
    id: 'p-thomas',
    name: 'Thomas Wright',
    email: 'twright@acmecorp.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'CTO, Acme Corp',
    color: '#06b6d4'
  },
  rachel: {
    id: 'p-rachel',
    name: 'Rachel Adams',
    email: 'rachel.a@fathom.internal',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Enterprise AE',
    color: '#14b8a6'
  }
};

export const seedMeetings: Meeting[] = [
  {
    id: 'smarteval-arch-sync',
    title: 'SmartEval LLM Benchmark & Evaluation Architecture',
    originalCalendarTitle: 'Impromptu Google Meet Meeting',
    date: '2026-09-18T14:30:00Z',
    durationSeconds: 1540, // ~25 mins
    participants: [participants.david, participants.sarah, participants.elena],
    overview: 'Technical deep-dive on SmartEval pipeline performance. The team agreed to switch the benchmark runner from remote evaluation loops to a local SQLite-backed runner, reducing suite execution latency from 12.4s to 2.1s per query. Elena confirmed QA coverage standards, and Sarah agreed to commit the golden evaluation set by Friday.',
    keyDecisions: [
      'Transition evaluation cache to local SQLite instance with WAL mode to unlock 2.1s test turnarounds.',
      'Enforce minimum 95% semantic recall on golden test set before deploying v2 models to production.',
      'Standardize on JSONL formatted multi-turn eval harnesses.'
    ],
    keyDecisionDetails: [
      {
        id: 'dec-1-1',
        text: 'Transition evaluation cache to local SQLite instance with WAL mode to unlock 2.1s test turnarounds',
        timestamp: 165
      },
      {
        id: 'dec-1-2',
        text: 'Enforce minimum 95% semantic recall on golden test set before deploying v2 models to production',
        timestamp: 575
      },
      {
        id: 'dec-1-3',
        text: 'Standardize on JSONL formatted multi-turn eval harnesses',
        timestamp: 20
      }
    ],
    openQuestions: [
      {
        id: 'oq-1-1',
        question: 'How will the evaluation pipeline handle ambiguous simultaneous multi-speaker interruptions?',
        timestamp: 57,
        speakerName: 'Elena Rostova'
      },
      {
        id: 'oq-1-2',
        question: 'What is the acceptable cost-per-evaluation threshold for automated PR gating in Datadog?',
        timestamp: 198,
        speakerName: 'David Kim'
      }
    ],
    topics: [
      {
        title: 'Benchmark Run Latency Bottleneck',
        timestamp: 45,
        bullets: [
          'Remote API round-trips currently consume 78% of benchmark suite execution time.',
          'Sarah benchmarked local SQLite caching with 6x throughput improvement.',
          'Decided to merge the caching layer into main this sprint.'
        ]
      },
      {
        title: 'Golden Test Set Curation & Grounding Checks',
        timestamp: 420,
        bullets: [
          'Elena reviewed 50 challenging prompt samples containing ambiguous multi-speaker interruptions.',
          'Grounding threshold set to 0.94 cosine similarity to avoid hallucinated action items.',
          'Sarah to provide automated validation CLI by end of week.'
        ]
      },
      {
        title: 'CI/CD Regression Pipeline Integration',
        timestamp: 920,
        bullets: [
          'Evaluations will run automatically on pull requests touching core prompt templates.',
          'David requested cost-per-evaluation tracking dashboard in Datadog.'
        ]
      }
    ],
    actionItems: [
      {
        id: 'act-1',
        title: 'Commit local SQLite benchmark cache runner to branch and verify latency reduction',
        assignee: participants.sarah,
        completed: false,
        timestamp: 165,
        sourceQuote: "I have the local SQLite WAL caching prototype working locally. I will clean up the branch and commit it by noon tomorrow."
      },
      {
        id: 'act-2',
        title: 'Finalize 50-sample multi-speaker edge case dataset for SmartEval regression',
        assignee: participants.elena,
        completed: true,
        timestamp: 580,
        sourceQuote: "I already have 35 curated cases from enterprise transcripts. I'll get the remaining 15 edge cases formatted by Thursday afternoon."
      },
      {
        id: 'act-3',
        title: 'Review Acme Corp pilot SLA requirements against SmartEval benchmark capabilities',
        assignee: participants.david,
        completed: false,
        timestamp: 1120,
        sourceQuote: "I'll cross-reference our 2-second SLA targets with Thomas from Acme Corp before our customer advisory call."
      }
    ],
    highlights: [
      {
        id: 'hl-1',
        title: '6x Evaluation Latency Breakthrough',
        startTime: 140,
        endTime: 215,
        speakerName: 'Sarah Chen',
        summary: 'Sarah demonstrates that local caching drops evaluation latency from 12s to 2.1s, unblocking rapid iteration on meeting models.',
        tag: 'Technical Architecture'
      },
      {
        id: 'hl-2',
        title: 'Grounding Verification Policy Decision',
        startTime: 510,
        endTime: 620,
        speakerName: 'David Kim',
        summary: 'Agreement on strict citation tracing: every AI-extracted task must cite an exact timestamp from the transcript.',
        tag: 'Key Decision'
      }
    ],
    transcript: [
      {
        id: 'ut-1',
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: participants.david.avatar,
        startTime: 0,
        endTime: 18,
        text: "Morning everyone. Let's get straight into SmartEval. We have an upcoming pilot with Acme Corp next week, and our current test suite turnaround time is dragging our model release cycles."
      },
      {
        id: 'ut-2',
        speakerId: 'p-sarah',
        speakerName: 'Sarah Chen',
        speakerAvatar: participants.sarah.avatar,
        startTime: 20,
        endTime: 55,
        text: "Right. The core issue is network round-tripping on our multi-turn evaluations. Each test query was making three round-trips to the remote evaluation server. That was causing each benchmark run to take over twelve seconds per conversational turn."
      },
      {
        id: 'ut-3',
        speakerId: 'p-elena',
        speakerName: 'Elena Rostova',
        speakerAvatar: participants.elena.avatar,
        startTime: 57,
        endTime: 85,
        text: "And that compounds when we run 500 regression tests. Engineers stop running the full suite locally because a single run takes almost an hour. How are we addressing this, Sarah?"
      },
      {
        id: 'ut-4',
        speakerId: 'p-sarah',
        speakerName: 'Sarah Chen',
        speakerAvatar: participants.sarah.avatar,
        startTime: 88,
        endTime: 165,
        text: "I built a prototype using an embedded SQLite store with write-ahead logging. We snapshot embeddings and transcript chunks locally. On my machine, the total turnaround per evaluation dropped from 12.4 seconds down to 2.1 seconds."
      },
      {
        id: 'ut-5',
        speakerId: 'p-sarah',
        speakerName: 'Sarah Chen',
        speakerAvatar: participants.sarah.avatar,
        startTime: 165,
        endTime: 195,
        text: "I have the local SQLite WAL caching prototype working locally. I will clean up the branch and commit it by noon tomorrow. That should give everyone sub-three-minute complete test runs."
      },
      {
        id: 'ut-6',
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: participants.david.avatar,
        startTime: 198,
        endTime: 240,
        text: "That is huge. 2.1 seconds unblocks our automated PR gating. Elena, how are we looking on the golden dataset quality?"
      },
      {
        id: 'ut-7',
        speakerId: 'p-elena',
        speakerName: 'Elena Rostova',
        speakerAvatar: participants.elena.avatar,
        startTime: 245,
        endTime: 320,
        text: "We tested across 35 realistic customer calls. The trickiest scenario is when multiple speakers talk simultaneously or someone changes their mind halfway through assigning an action item."
      },
      {
        id: 'ut-8',
        speakerId: 'p-sarah',
        speakerName: 'Sarah Chen',
        speakerAvatar: participants.sarah.avatar,
        startTime: 325,
        endTime: 380,
        text: "Yes, exactly. We found that without grounding checks, the model would hallucinate deadlines that weren't stated. That's why we added the citation constraint: if an action item doesn't map to a direct transcript snippet, it gets discarded."
      },
      {
        id: 'ut-9',
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: participants.david.avatar,
        startTime: 510,
        endTime: 560,
        text: "Agreed. Action items must be traceable. Users don't trust an AI note if they can't click to verify the exact five seconds where it was discussed."
      },
      {
        id: 'ut-10',
        speakerId: 'p-elena',
        speakerName: 'Elena Rostova',
        speakerAvatar: participants.elena.avatar,
        startTime: 575,
        endTime: 620,
        text: "I already have 35 curated cases from enterprise transcripts. I'll get the remaining 15 edge cases formatted by Thursday afternoon so we can hit our 95% semantic recall target."
      },
      {
        id: 'ut-11',
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: participants.david.avatar,
        startTime: 1115,
        endTime: 1150,
        text: "Perfect. I'll cross-reference our 2-second SLA targets with Thomas from Acme Corp before our customer advisory call. If we hit these metrics, we're in great shape."
      }
    ],
    shares: [
      {
        email: 'sarah.chen@fathom.internal',
        name: 'Sarah Chen',
        avatar: participants.sarah.avatar,
        isAttendee: true,
        sharedAt: '2026-09-18T15:00:00Z',
        revoked: false
      },
      {
        email: 'elena.r@fathom.internal',
        name: 'Elena Rostova',
        avatar: participants.elena.avatar,
        isAttendee: true,
        sharedAt: '2026-09-18T15:00:00Z',
        revoked: false
      }
    ],
    activeTemplate: 'executive',
    templates: {
      executive: {
        key: 'executive',
        name: 'Executive Summary',
        description: 'High-level synthesis focused on key business decisions, metrics, and outcomes.',
        overview: 'Technical deep-dive on SmartEval pipeline performance. The team agreed to switch the benchmark runner from remote evaluation loops to a local SQLite-backed runner, reducing suite execution latency from 12.4s to 2.1s per query.',
        sections: [
          {
            heading: 'Key Business Decisions',
            bullets: [
              'Approved architecture migration to local SQLite cache, dropping evaluation time by 82%.',
              'Committed to Acme Corp enterprise SLA requirements ahead of Q4 contract close.'
            ]
          },
          {
            heading: 'Resource & Timeline Commitments',
            bullets: [
              'Sarah Chen delivering cached runner branch by tomorrow.',
              'Elena Rostova completing 50-sample regression suite by Thursday.'
            ]
          }
        ]
      },
      engineering: {
        key: 'engineering',
        name: 'Engineering Spec & Technical Notes',
        description: 'Detailed technical notes with architecture changes, schemas, and performance benchmarks.',
        overview: 'Architecture specification for SmartEval v2 regression suite and embedded caching layer.',
        sections: [
          {
            heading: 'Architecture & Storage Schema',
            bullets: [
              'Embedded SQLite instance with PRAGMA journal_mode=WAL and synchronous=NORMAL.',
              'Local indexing of utterance embeddings prevents duplicate inference passes during regression sweeps.',
              'Target benchmark latency: < 2.5s per multi-turn eval turn.'
            ]
          },
          {
            heading: 'QA Validation & Precision',
            bullets: [
              'Threshold: 0.94 cosine similarity grounding against ground truth transcript utterances.',
              'Strict citation requirement: ungrounded action items are filtered out pre-generation.'
            ]
          }
        ]
      },
      customer: {
        key: 'customer',
        name: 'Customer & Partner Facing',
        description: 'Clean, sanitized summary suitable for sharing directly with external clients.',
        overview: 'Updates on SmartEval reliability, accuracy benchmarking, and upcoming enterprise SLA guarantees.',
        sections: [
          {
            heading: 'Platform Enhancements',
            bullets: [
              'Evaluation speed improved by over 5x for real-time meeting analysis.',
              'Grounding verification added to ensure 100% citation accuracy on all action items.'
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      'What caused the benchmark latency bottleneck and how was it solved?',
      'What is the agreed SLA target for evaluation response time?',
      'Who is responsible for the 50-sample test dataset?',
      'How does the system prevent hallucinated action items?'
    ],
    tags: ['SmartEval', 'ML Architecture', 'Performance', 'Acme Corp']
  },
  {
    id: 'product-roadmap-ux',
    title: 'AI Meeting Intelligence v2 — Product Roadmap & UX Sync',
    originalCalendarTitle: 'Impromptu Google Meet Meeting',
    date: '2026-09-19T10:00:00Z',
    durationSeconds: 2100, // 35 mins
    participants: [participants.david, participants.marcus, participants.maya],
    overview: 'Design and UX review tackling top user friction points in Fathom: eliminating generic "Impromptu Meeting" titles, implementing participant-aware sharing with undo capabilities, and providing direct transcript-to-action-item traceability.',
    keyDecisions: [
      'Replace generic Google Meet titles with contextual smart titles generated from the initial 3 minutes of conversation.',
      'Surface actual meeting attendees at the top of the share modal for 1-click sharing.',
      'Require explicit security confirmation when sharing with external/non-attendee emails.',
      'Implement 5-second undo toast with instant revocation control.'
    ],
    keyDecisionDetails: [
      {
        id: 'dec-2-1',
        text: 'Replace generic Google Meet titles with contextual smart titles generated from initial conversation',
        timestamp: 300
      },
      {
        id: 'dec-2-2',
        text: 'Surface actual meeting attendees at top of share modal for 1-click sharing',
        timestamp: 540
      },
      {
        id: 'dec-2-3',
        text: 'Require explicit security confirmation when sharing with external/non-attendee emails',
        timestamp: 645
      },
      {
        id: 'dec-2-4',
        text: 'Implement 5-second undo toast with instant access revocation',
        timestamp: 715
      }
    ],
    openQuestions: [
      {
        id: 'oq-2-1',
        question: 'What prompt token budget and audio chunk size should be allocated for the 3-minute title extractor?',
        timestamp: 300,
        speakerName: 'David Kim'
      },
      {
        id: 'oq-2-2',
        question: 'Should revoked share links return a 404 or an explicit permission-denied screen?',
        timestamp: 645,
        speakerName: 'Maya Patel'
      }
    ],
    topics: [
      {
        title: 'Solving Generic Meeting Titles',
        timestamp: 60,
        bullets: [
          'User research showed multiple meetings titled "Impromptu Google Meet Meeting" caused cognitive overload.',
          'Marcus proposed auto-generating titles based on detected agenda items within the first 180 seconds.',
          'Users will still be able to inline edit titles from the header.'
        ]
      },
      {
        title: 'Participant-Aware Sharing & Security Safeguards',
        timestamp: 540,
        bullets: [
          'Current sharing flow forces users to manually search for people who were already in the meeting.',
          'New UX displays attendee pills with simple 1-click toggle.',
          'External emails trigger a warning modal: "This person was not present in this meeting."',
          'Added a 5-second undo toast to gracefully recover from misdirected links.'
        ]
      },
      {
        title: 'Action Item Provenance & Transcript Synchronization',
        timestamp: 1280,
        bullets: [
          'Maya demonstrated interactive playhead sync between the video waveform and transcript utterances.',
          'Action items will feature timestamp chips that seek the video and display the exact quote in context.'
        ]
      }
    ],
    actionItems: [
      {
        id: 'act-201',
        title: 'Design high-fidelity Figma specs for participant-aware sharing dialog and undo toast',
        assignee: participants.marcus,
        completed: true,
        timestamp: 720,
        sourceQuote: "I will finish the interactive share modal states and the floating 5-second undo toast component in Figma today."
      },
      {
        id: 'act-202',
        title: 'Implement playhead-to-transcript bi-directional scrolling and utterance highlighting',
        assignee: participants.maya,
        completed: false,
        timestamp: 1410,
        sourceQuote: "I'll wire up the video timeupdate listener to calculate the active utterance index and smooth-scroll it into view."
      },
      {
        id: 'act-203',
        title: 'Draft PRD for automatic title generation based on initial 3-minute conversational audio',
        assignee: participants.david,
        completed: false,
        timestamp: 310,
        sourceQuote: "I'll write up the product requirements for smart titles and coordinate with Sarah on prompt requirements."
      }
    ],
    highlights: [
      {
        id: 'hl-201',
        title: 'Participant-Aware Sharing Walkthrough',
        startTime: 610,
        endTime: 750,
        speakerName: 'Marcus Vance',
        summary: 'Marcus presents the redesigned sharing experience separating verified meeting attendees from external email recipients.',
        tag: 'Product Feedback'
      },
      {
        id: 'hl-202',
        title: 'Transcript Verification UX Principle',
        startTime: 1320,
        endTime: 1440,
        speakerName: 'Maya Patel',
        summary: 'Discussion on making AI verifiable: clicking an action item chip directly scrolls and plays the speaker utterance.',
        tag: 'Key Decision'
      }
    ],
    transcript: [
      {
        id: 'ut-201',
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: participants.david.avatar,
        startTime: 0,
        endTime: 25,
        text: "Thanks for joining. We recently audited user complaints on Fathom and found three huge friction points: generic Impromptu meeting titles, clumsy sharing flows, and lack of trust in generated action items."
      },
      {
        id: 'ut-202',
        speakerId: 'p-marcus',
        speakerName: 'Marcus Vance',
        speakerAvatar: participants.marcus.avatar,
        startTime: 28,
        endTime: 65,
        text: "The title problem is huge. People have ten meetings in their history all named 'Impromptu Google Meet Meeting'. You can't tell what is what without opening every single one. We need smart titles derived from the first three minutes."
      },
      {
        id: 'ut-203',
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: participants.david.avatar,
        startTime: 300,
        endTime: 340,
        text: "Agreed. I'll write up the product requirements for smart titles and coordinate with Sarah on prompt requirements. Marcus, what about the sharing flow?"
      },
      {
        id: 'ut-204',
        speakerId: 'p-marcus',
        speakerName: 'Marcus Vance',
        speakerAvatar: participants.marcus.avatar,
        startTime: 540,
        endTime: 640,
        text: "In the existing product, when you click Share, it gives you a blank email input. You have to remember and type the emails of people who were literally on the call with you! We should automatically list the call participants at the top with a 1-click share toggle."
      },
      {
        id: 'ut-205',
        speakerId: 'p-maya',
        speakerName: 'Maya Patel',
        speakerAvatar: participants.maya.avatar,
        startTime: 645,
        endTime: 710,
        text: "And what if they paste an external email by mistake? Currently once you send it, you can't undo it. We should show a clear security warning for non-attendees and provide a 5-second undo toast."
      },
      {
        id: 'ut-206',
        speakerId: 'p-marcus',
        speakerName: 'Marcus Vance',
        speakerAvatar: participants.marcus.avatar,
        startTime: 715,
        endTime: 760,
        text: "I will finish the interactive share modal states and the floating 5-second undo toast component in Figma today. It's clean, safe, and prevents accidental leaks."
      },
      {
        id: 'ut-207',
        speakerId: 'p-maya',
        speakerName: 'Maya Patel',
        speakerAvatar: participants.maya.avatar,
        startTime: 1280,
        endTime: 1390,
        text: "For the action items, I'm building direct timestamp links. When you click [02:14] next to an action item, it automatically seeks the video player to two minutes fourteen seconds and highlights the spoken quote."
      },
      {
        id: 'ut-208',
        speakerId: 'p-maya',
        speakerName: 'Maya Patel',
        speakerAvatar: participants.maya.avatar,
        startTime: 1395,
        endTime: 1440,
        text: "I'll wire up the video timeupdate listener to calculate the active utterance index and smooth-scroll it into view. That way users can follow the dialogue effortlessly."
      }
    ],
    shares: [
      {
        email: 'marcus.v@fathom.internal',
        name: 'Marcus Vance',
        avatar: participants.marcus.avatar,
        isAttendee: true,
        sharedAt: '2026-09-19T10:45:00Z',
        revoked: false
      },
      {
        email: 'maya.patel@fathom.internal',
        name: 'Maya Patel',
        avatar: participants.maya.avatar,
        isAttendee: true,
        sharedAt: '2026-09-19T10:45:00Z',
        revoked: false
      }
    ],
    activeTemplate: 'executive',
    templates: {
      executive: {
        key: 'executive',
        name: 'Executive Summary',
        description: 'High-level synthesis focused on key business decisions, metrics, and outcomes.',
        overview: 'Design and UX review tackling top user friction points in Fathom: eliminating generic "Impromptu Meeting" titles, implementing participant-aware sharing with undo capabilities, and providing direct transcript-to-action-item traceability.',
        sections: [
          {
            heading: 'Key Product Decisions',
            bullets: [
              'Approved participant-aware sharing UX with immediate attendee list and external email confirmation.',
              'Approved 5-second undo toast interaction for newly created shares.',
              'Approved action item timestamp pills linked directly to spoken transcript evidence.'
            ]
          }
        ]
      },
      engineering: {
        key: 'engineering',
        name: 'Engineering Spec & Technical Notes',
        description: 'Detailed technical notes with architecture changes, schemas, and performance benchmarks.',
        overview: 'Frontend implementation details for playhead sync, transcript auto-scrolling, and sharing state.',
        sections: [
          {
            heading: 'Frontend Implementation',
            bullets: [
              'Video timeupdate listener synchronized with binary search over utterance start/end times.',
              'Local storage synchronization for shared recipient list and revocation flags.'
            ]
          }
        ]
      },
      customer: {
        key: 'customer',
        name: 'Customer & Partner Facing',
        description: 'Clean, sanitized summary suitable for sharing directly with external clients.',
        overview: 'Upcoming usability and privacy updates coming to Fathom meeting workspaces.',
        sections: [
          {
            heading: 'User Experience Improvements',
            bullets: [
              'Clear, descriptive meeting titles generated automatically.',
              'Enhanced privacy controls when sharing meeting highlights with teammates.'
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      'How does the new participant-aware sharing flow prevent accidental shares?',
      'What was decided about the "Impromptu Google Meet" title problem?',
      'How will action items be linked back to transcript evidence?',
      'What role does the 5-second undo toast play?'
    ],
    tags: ['Roadmap', 'UX Design', 'Sharing', 'Smart Titles']
  },
  {
    id: 'acme-pilot-advisory',
    title: 'Enterprise Customer Advisory: Acme Corp & SmartEval Pilot',
    originalCalendarTitle: 'Acme Corp / Fathom Partnership Sync',
    date: '2026-09-17T16:00:00Z',
    durationSeconds: 2520, // 42 mins
    participants: [participants.david, participants.rachel, participants.thomas],
    overview: 'Executive partnership call with Acme Corp CTO Thomas Wright reviewing their 50-seat SmartEval enterprise pilot. Thomas confirmed agreement to proceed pending SOC2 Type II report verification and clarification on on-prem evaluation data privacy.',
    keyDecisions: [
      'Acme Corp will commence a 50-seat pilot of SmartEval across their ML and Data engineering teams on October 1st.',
      'Fathom will provide zero-data-retention guarantees for all transcript audio and evaluation logs.',
      'Rachel will send revised enterprise agreement with customized 99.9% uptime SLA.'
    ],
    keyDecisionDetails: [
      {
        id: 'dec-3-1',
        text: 'Acme Corp will commence a 50-seat pilot of SmartEval starting October 1st',
        timestamp: 1620
      },
      {
        id: 'dec-3-2',
        text: 'Fathom will provide zero-data-retention guarantees on all transcript audio and evaluation logs',
        timestamp: 820
      },
      {
        id: 'dec-3-3',
        text: 'Rachel will send revised enterprise agreement with customized 99.9% uptime SLA',
        timestamp: 1760
      }
    ],
    openQuestions: [
      {
        id: 'oq-3-1',
        question: 'Will Acme Corp IT security review require dedicated on-premises evaluation gateways or VPC peering?',
        timestamp: 930,
        speakerName: 'Thomas Wright'
      }
    ],
    topics: [
      {
        title: 'SmartEval Benchmark Performance & Latency Requirements',
        timestamp: 120,
        bullets: [
          'Thomas noted Acme engineers run over 2,000 prompt evals daily; 2-second turnaround is non-negotiable.',
          'David shared benchmark results from the SQLite cache implementation showing 2.1s response times.',
          'Acme engineering approved the architecture approach.'
        ]
      },
      {
        title: 'Security, Compliance & Data Retention',
        timestamp: 680,
        bullets: [
          'Acme requires transcripts and audio recordings to stay within US-East VPC.',
          'Zero-data-retention policy on third-party LLM inference confirmed.',
          'David agreed to deliver the updated SOC2 Type II audit report by Monday.'
        ]
      },
      {
        title: 'Commercial Terms & Pilot Timeline',
        timestamp: 1650,
        bullets: [
          '50 seats for 60-day pilot starting October 1st.',
          'Rachel to update pricing schedule with tiered enterprise discounts at 250+ seats.'
        ]
      }
    ],
    actionItems: [
      {
        id: 'act-301',
        title: 'Send updated SOC2 Type II compliance report and data retention annex to Thomas Wright',
        assignee: participants.david,
        completed: false,
        timestamp: 840,
        sourceQuote: "I will personally package our SOC2 Type II compliance package and our data retention addendum for Thomas by tomorrow morning."
      },
      {
        id: 'act-302',
        title: 'Deliver revised 50-seat SmartEval pilot agreement with 99.9% SLA addendum',
        assignee: participants.rachel,
        completed: false,
        timestamp: 1780,
        sourceQuote: "I will update the pilot agreement with the 99.9% uptime SLA and the 50-seat tier and have it over to Thomas's legal team."
      },
      {
        id: 'act-303',
        title: 'Confirm Acme Corp IT security review meeting with lead infrastructure architect',
        assignee: participants.thomas,
        completed: true,
        timestamp: 950,
        sourceQuote: "I will introduce Rachel to our security director James so they can review the VPC peering requirements."
      }
    ],
    highlights: [
      {
        id: 'hl-301',
        title: 'Acme Pilot Commitment (50 Seats)',
        startTime: 1620,
        endTime: 1740,
        speakerName: 'Thomas Wright',
        summary: 'Thomas confirms Acme Corp is moving forward with 50 engineer seats for SmartEval starting October 1st.',
        tag: 'Key Decision'
      },
      {
        id: 'hl-302',
        title: 'Zero Data Retention Guarantee',
        startTime: 780,
        endTime: 870,
        speakerName: 'David Kim',
        summary: 'Fathom confirms enterprise calls and transcripts are never stored on external LLM inference servers.',
        tag: 'Technical Architecture'
      }
    ],
    transcript: [
      {
        id: 'ut-301',
        speakerId: 'p-rachel',
        speakerName: 'Rachel Adams',
        speakerAvatar: participants.rachel.avatar,
        startTime: 0,
        endTime: 30,
        text: "Welcome Thomas. We are really excited to discuss how Acme Corp can pilot SmartEval for your ML team's meeting workflows."
      },
      {
        id: 'ut-302',
        speakerId: 'p-thomas',
        speakerName: 'Thomas Wright',
        speakerAvatar: participants.thomas.avatar,
        startTime: 35,
        endTime: 110,
        text: "Thanks Rachel. Our team loves the concept of verifiable meeting intelligence. But our engineers run thousands of prompt tests a day. If SmartEval is slow or has hallucinations in action items, adoption will die immediately. What are your latest speed numbers?"
      },
      {
        id: 'ut-303',
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: participants.david.avatar,
        startTime: 115,
        endTime: 195,
        text: "We just finished benchmarking our new architecture yesterday. We brought our evaluation turnaround time down from twelve seconds to 2.1 seconds using local cached execution. And every action item is strictly grounded with direct transcript citations."
      },
      {
        id: 'ut-304',
        speakerId: 'p-thomas',
        speakerName: 'Thomas Wright',
        speakerAvatar: participants.thomas.avatar,
        startTime: 200,
        endTime: 260,
        text: "2.1 seconds is well within our engineering tolerance. That solves our biggest performance concern. What about security? We cannot have our internal executive or engineering transcripts retained by any model provider."
      },
      {
        id: 'ut-305',
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: participants.david.avatar,
        startTime: 820,
        endTime: 880,
        text: "I will personally package our SOC2 Type II compliance package and our data retention addendum for Thomas by tomorrow morning. We guarantee zero data retention on all model calls."
      },
      {
        id: 'ut-306',
        speakerId: 'p-thomas',
        speakerName: 'Thomas Wright',
        speakerAvatar: participants.thomas.avatar,
        startTime: 930,
        endTime: 980,
        text: "That works for me. I will introduce Rachel to our security director James so they can review the VPC peering requirements."
      },
      {
        id: 'ut-307',
        speakerId: 'p-thomas',
        speakerName: 'Thomas Wright',
        speakerAvatar: participants.thomas.avatar,
        startTime: 1620,
        endTime: 1710,
        text: "Assuming the security paperwork checks out, Acme is ready to commit to a 50-seat pilot starting October first. If the 2.1s turnaround holds up in real team usage, we plan to expand across all 400 engineers in Q1."
      },
      {
        id: 'ut-308',
        speakerId: 'p-rachel',
        speakerName: 'Rachel Adams',
        speakerAvatar: participants.rachel.avatar,
        startTime: 1760,
        endTime: 1810,
        text: "That is fantastic news Thomas! I will update the pilot agreement with the 99.9% uptime SLA and the 50-seat tier and have it over to Thomas's legal team by end of day."
      }
    ],
    shares: [
      {
        email: 'twright@acmecorp.com',
        name: 'Thomas Wright',
        avatar: participants.thomas.avatar,
        isAttendee: true,
        sharedAt: '2026-09-17T17:00:00Z',
        revoked: false
      },
      {
        email: 'rachel.a@fathom.internal',
        name: 'Rachel Adams',
        avatar: participants.rachel.avatar,
        isAttendee: true,
        sharedAt: '2026-09-17T17:00:00Z',
        revoked: false
      }
    ],
    activeTemplate: 'customer',
    templates: {
      customer: {
        key: 'customer',
        name: 'Customer & Partner Facing',
        description: 'Clean, sanitized summary suitable for sharing directly with external clients.',
        overview: 'Executive partnership sync with Acme Corp confirming the 50-seat SmartEval pilot agreement starting October 1st.',
        sections: [
          {
            heading: 'Pilot Terms & Scope',
            bullets: [
              '50 developer & ML engineer seats for 60-day trial evaluation starting October 1, 2026.',
              '99.9% uptime SLA and zero-retention data privacy protections guaranteed.'
            ]
          },
          {
            heading: 'Next Milestones',
            bullets: [
              'Security team review with James (Acme Security Director).',
              'Finalize enterprise pilot order form by Friday.'
            ]
          }
        ]
      },
      executive: {
        key: 'executive',
        name: 'Executive Summary',
        description: 'High-level synthesis focused on key business decisions, metrics, and outcomes.',
        overview: 'Acme Corp 50-seat SmartEval pilot confirmed with Q1 expansion pipeline to 400 seats ($180k ARR potential).',
        sections: [
          {
            heading: 'Commercial Summary',
            bullets: [
              '50 seats secured for October pilot rollout.',
              'Expansion path to 400 seats if 2.1s latency and grounding SLAs are maintained.'
            ]
          }
        ]
      },
      engineering: {
        key: 'engineering',
        name: 'Engineering Spec & Technical Notes',
        description: 'Detailed technical notes with architecture changes, schemas, and performance benchmarks.',
        overview: 'Security and VPC peering requirements for Acme Corp on-prem evaluation gateways.',
        sections: [
          {
            heading: 'Enterprise Security Architecture',
            bullets: [
              'US-East VPC peering with zero-data-retention LLM inference pipelines.',
              'SOC2 Type II compliance documentation packaging.'
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      'What are the commercial terms and seat count for the Acme Corp pilot?',
      'What was Acme\'s primary requirement regarding SmartEval latency?',
      'How will customer data privacy and zero retention be handled?',
      'What is the next step for legal and security sign-off?'
    ],
    tags: ['Acme Corp', 'SmartEval', 'Enterprise Sales', 'Security']
  }
];
