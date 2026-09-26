import { Meeting, Participant, TranscriptUtterance } from '../src/types.ts';
import { getIntelligenceProvider } from './intelligence/index.ts';

export interface IntakeTemplate {
  id: string;
  title: string;
  sourceType: 'audio' | 'video' | 'transcript';
  fileName: string;
  fileSize: string;
  durationSeconds: number;
  durationFormatted: string;
  description: string;
  participants: Participant[];
  previewOutcomes: {
    actionsCount: number;
    decisionsCount: number;
    questionsCount: number;
  };
  sampleAction: string;
  sampleDecision: string;
}

export const WORKSPACE_PARTICIPANTS: Record<string, Participant> = {
  david: {
    id: 'p-david',
    name: 'David Kim',
    email: 'david@company.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'VP Product',
    color: '#6366f1'
  },
  sarah: {
    id: 'p-sarah',
    name: 'Sarah Chen',
    email: 'sarah@company.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    role: 'Staff ML Engineer',
    color: '#ec4899'
  },
  elena: {
    id: 'p-elena',
    name: 'Elena Rostova',
    email: 'elena@company.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'Head of QA & Evals',
    color: '#10b981'
  },
  marcus: {
    id: 'p-marcus',
    name: 'Marcus Vance',
    email: 'marcus@company.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'Principal Designer',
    color: '#f59e0b'
  },
  maya: {
    id: 'p-maya',
    name: 'Maya Patel',
    email: 'maya@company.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    role: 'Frontend Lead',
    color: '#8b5cf6'
  },
  thomas: {
    id: 'p-thomas',
    name: 'Thomas Wright',
    email: 'twright@acmecorp.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    role: 'CTO, Acme Corp',
    color: '#06b6d4'
  }
};

export const INTAKE_TEMPLATES: IntakeTemplate[] = [
  {
    id: 'template-infra-q4',
    title: 'Q4 AI Inference Infrastructure & Latency SLA Sync',
    sourceType: 'audio',
    fileName: 'meeting-recording-infra-q4-2026.mp3',
    fileSize: '34.2 MB',
    durationSeconds: 1320,
    durationFormatted: '22m 00s',
    description: 'Technical review on distributed GPU cluster routing to achieve <1.2s TTFT across US and EU edge nodes.',
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
    sampleAction: 'Deploy GPU edge routing benchmark harness across us-west and eu-central (Sarah Chen)',
    sampleDecision: 'Standardize on localized GPU edge cluster routing to enforce <1.2s TTFT'
  },
  {
    id: 'template-security-soc2',
    title: 'Enterprise Security Architecture & SOC2 Type II Audit',
    sourceType: 'video',
    fileName: 'zoom-session-enterprise-security-review.mp4',
    fileSize: '128.5 MB',
    durationSeconds: 1080,
    durationFormatted: '18m 00s',
    description: 'Data isolation review and cryptographic audit logging sign-off with enterprise advisory architect.',
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
    sampleAction: 'Deliver signed SOC2 Type II compliance audit packet and zero-retention guarantee (David Kim)',
    sampleDecision: 'Enforce automated 15-minute session timeout across enterprise administrative accounts'
  },
  {
    id: 'template-mobile-edge',
    title: 'Mobile Client Audio Streaming & Offline Edge Sync',
    sourceType: 'audio',
    fileName: 'mobile-client-audio-sync-opus.m4a',
    fileSize: '18.7 MB',
    durationSeconds: 960,
    durationFormatted: '16m 00s',
    description: 'Audio frame chunking optimization (250ms Opus) and optimistic client transcript rendering.',
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
    sampleAction: 'Package mobile optimistic transcript scrolling component for React Native (Maya Patel)',
    sampleDecision: 'Adopt 250ms audio frame chunking with client-side Opus compression'
  },
  {
    id: 'template-adversarial-edge',
    title: 'Product Strategy & Architecture Alignment (Edge-Case Test)',
    sourceType: 'audio',
    fileName: 'adversarial-strategy-edge-cases.mp3',
    fileSize: '24.1 MB',
    durationSeconds: 380,
    durationFormatted: '6m 20s',
    description: 'Adversarial benchmark: contains small talk, tentative non-actions, answered inquiries, reversed design choices, and grounded commitments.',
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
    sampleAction: 'Benchmark the Redis connection pool by Thursday (Sarah Chen)',
    sampleDecision: 'Retain Vanilla CSS design token system; do not migrate to Tailwind'
  }
];

export interface ProcessIntakeRequest {
  source: 'template' | 'file';
  templateId?: string;
  fileMeta?: {
    name: string;
    size: number;
    type: string;
  };
  title?: string;
  participantIds?: string[];
}

export async function buildMeetingFromTemplate(templateId: string, customTitle?: string): Promise<Meeting> {
  const ts = Date.now();
  const dateStr = new Date().toISOString();

  if (templateId === 'template-adversarial-edge') {
    return buildAdversarialMeeting(customTitle);
  }

  if (templateId === 'template-security-soc2') {
    const meetingId = `meeting-security-${ts}`;
    return {
      id: meetingId,
      title: customTitle?.trim() || 'Enterprise Security Architecture & SOC2 Type II Audit',
      originalCalendarTitle: 'Enterprise Security Review w/ Thomas Wright',
      date: dateStr,
      durationSeconds: 1080,
      participants: [
        WORKSPACE_PARTICIPANTS.david,
        WORKSPACE_PARTICIPANTS.elena,
        WORKSPACE_PARTICIPANTS.marcus,
        WORKSPACE_PARTICIPANTS.thomas
      ],
      overview: 'Enterprise compliance and data isolation review. David and Elena confirmed the zero-data-retention pipeline architecture for enterprise tenants. Thomas Wright reviewed the audit logging controls and approved the security sign-off timeline.',
      keyDecisions: [
        'Enforce automated 15-minute session timeout across enterprise administrative accounts.',
        'Enable cryptographic audit log hashing for all customer transcript access events.'
      ],
      keyDecisionDetails: [
        {
          id: `dec-${meetingId}-1`,
          text: 'Enforce automated 15-minute session timeout across enterprise administrative accounts',
          timestamp: 340
        },
        {
          id: `dec-${meetingId}-2`,
          text: 'Enable cryptographic audit log hashing for all customer transcript access events',
          timestamp: 620
        }
      ],
      openQuestions: [
        {
          id: `oq-${meetingId}-1`,
          question: 'Can enterprise admins export immutable audit logs directly to their SIEM via AWS S3 bucket sync?',
          timestamp: 410,
          speakerName: 'Thomas Wright',
          context: 'Discussing enterprise compliance log exports and real-time SIEM ingestion'
        }
      ],
      actionItems: [
        {
          id: `act-${meetingId}-1`,
          title: 'Deliver signed SOC2 Type II compliance audit packet and zero-retention guarantee',
          assignee: WORKSPACE_PARTICIPANTS.david,
          completed: false,
          timestamp: 210,
          sourceQuote: "I'll send the updated SOC2 compliance packet and zero-retention guarantee to Thomas by tomorrow morning."
        },
        {
          id: `act-${meetingId}-2`,
          title: 'Audit enterprise session token revocation endpoints for compliance with 15-minute idle timeout',
          assignee: WORKSPACE_PARTICIPANTS.elena,
          completed: false,
          timestamp: 510,
          sourceQuote: "I'll verify all session revocation hooks in our security integration tests this afternoon."
        }
      ],
      highlights: [
        {
          id: `hl-${meetingId}-1`,
          title: 'Zero Data Retention Policy Confirmation',
          startTime: 190,
          endTime: 270,
          speakerName: 'David Kim',
          summary: 'David reaffirms Meetwise does not store customer transcript recordings post-synthesis on enterprise plans.',
          tag: 'Compliance'
        }
      ],
      topics: [
        {
          title: 'SOC2 Type II Controls & Evidence Log',
          timestamp: 60,
          bullets: [
            'Elena reported all SOC2 trust service criteria passed external auditor review.',
            'Cryptographic hashing ensures no tamper risk on transcript access logs.'
          ]
        },
        {
          title: 'Enterprise SIEM Log Integration',
          timestamp: 380,
          bullets: [
            'Thomas Wright requested direct S3 export for Acme Corp security monitoring.',
            'Agreed to document the automated S3 webhook integration in the customer portal.'
          ]
        }
      ],
      transcript: [
        {
          id: `ut-${meetingId}-1`,
          speakerId: 'p-david',
          speakerName: 'David Kim',
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 10,
          endTime: 45,
          text: "Thanks for meeting Thomas. We want to walk through our enterprise security controls and ensure all SOC2 Type II requirements meet Acme Corp's compliance threshold."
        },
        {
          id: `ut-${meetingId}-2`,
          speakerId: 'p-thomas',
          speakerName: 'Thomas Wright',
          speakerAvatar: WORKSPACE_PARTICIPANTS.thomas.avatar,
          startTime: 48,
          endTime: 95,
          text: "Appreciate the proactive sync, David. Our primary mandate is zero data retention for conversational audio, plus immutable logging of every time an employee queries a transcript."
        },
        {
          id: `ut-${meetingId}-3`,
          speakerId: 'p-david',
          speakerName: 'David Kim',
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 195,
          endTime: 235,
          text: "I'll send the updated SOC2 compliance packet and zero-retention guarantee to Thomas by tomorrow morning. Our storage buckets automatically flush raw audio buffers after synthesis."
        },
        {
          id: `ut-${meetingId}-4`,
          speakerId: 'p-elena',
          speakerName: 'Elena Rostova',
          speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
          startTime: 320,
          endTime: 365,
          text: "Regarding session policy, we are enforcing an automated 15-minute session timeout across enterprise administrative accounts to eliminate unattended token hijack risks."
        },
        {
          id: `ut-${meetingId}-5`,
          speakerId: 'p-thomas',
          speakerName: 'Thomas Wright',
          speakerAvatar: WORKSPACE_PARTICIPANTS.thomas.avatar,
          startTime: 395,
          endTime: 435,
          text: "Can enterprise admins export immutable audit logs directly to their SIEM via AWS S3 bucket sync? That would integrate seamlessly with our internal Splunk forwarder."
        },
        {
          id: `ut-${meetingId}-6`,
          speakerId: 'p-elena',
          speakerName: 'Elena Rostova',
          speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
          startTime: 495,
          endTime: 535,
          text: "I'll verify all session revocation hooks in our security integration tests this afternoon and confirm the S3 sync pipeline timing."
        },
        {
          id: `ut-${meetingId}-7`,
          speakerId: 'p-david',
          speakerName: 'David Kim',
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 610,
          endTime: 650,
          text: "Excellent. We will enable cryptographic audit log hashing for all customer transcript access events before the pilot rollout."
        }
      ],
      shares: [],
      activeTemplate: 'executive',
      templates: {
        executive: {
          key: 'executive',
          name: 'Executive Summary',
          description: 'High-level synthesis focused on key business decisions, metrics, and outcomes.',
          overview: 'Enterprise compliance and data isolation review with Acme Corp.',
          sections: [
            {
              heading: 'Security & Compliance Commitments',
              bullets: [
                'Zero data retention policy confirmed for enterprise customer audio buffers.',
                'Mandatory 15-minute idle session timeout enforced across admin accounts.',
                'Cryptographic audit log hashing deployed for tamper-evident compliance.'
              ]
            }
          ]
        }
      },
      suggestedQuestions: [
        'What is Meetwise’s data retention policy for enterprise audio?',
        'What session timeout was agreed upon?',
        'Who owns the SOC2 compliance packet delivery?'
      ],
      tags: ['Security', 'Compliance', 'SOC2', 'Enterprise']
    };
  }

  if (templateId === 'template-mobile-edge') {
    const meetingId = `meeting-mobile-${ts}`;
    return {
      id: meetingId,
      title: customTitle?.trim() || 'Mobile Client Audio Streaming & Offline Edge Sync',
      originalCalendarTitle: 'Mobile Client Streaming Architecture Review',
      date: dateStr,
      durationSeconds: 960,
      participants: [
        WORKSPACE_PARTICIPANTS.david,
        WORKSPACE_PARTICIPANTS.maya,
        WORKSPACE_PARTICIPANTS.sarah
      ],
      overview: 'Technical alignment on mobile client streaming transcription. The team decided to buffer 250ms chunks over WebSockets to reduce perceived transcription latency from 4.2s to 600ms on iOS and Android devices.',
      keyDecisions: [
        'Adopt 250ms audio frame chunking with client-side Opus compression.',
        'Store unprocessed voice packets in IndexedDB when mobile network is lost.'
      ],
      keyDecisionDetails: [
        {
          id: `dec-${meetingId}-1`,
          text: 'Adopt 250ms audio frame chunking with client-side Opus compression',
          timestamp: 110
        },
        {
          id: `dec-${meetingId}-2`,
          text: 'Store unprocessed voice packets in IndexedDB when mobile network is lost',
          timestamp: 340
        }
      ],
      openQuestions: [
        {
          id: `oq-${meetingId}-1`,
          question: 'How does mobile battery consumption behave during continuous 60-minute streaming on low-end Android devices?',
          timestamp: 240,
          speakerName: 'Maya Patel',
          context: 'Evaluating power footprint of client-side Opus compression on ARM v8 devices'
        }
      ],
      actionItems: [
        {
          id: `act-${meetingId}-1`,
          title: 'Benchmark 250ms Opus streaming over simulated 3G network conditions',
          assignee: WORKSPACE_PARTICIPANTS.sarah,
          completed: false,
          timestamp: 120,
          sourceQuote: "I will set up the network throttle harness and test Opus compression on poor connections tomorrow."
        },
        {
          id: `act-${meetingId}-2`,
          title: 'Package mobile optimistic transcript scrolling component for React Native',
          assignee: WORKSPACE_PARTICIPANTS.maya,
          completed: false,
          timestamp: 390,
          sourceQuote: "I'll package the optimistic scrolling hook so mobile can adopt the desktop behavior and render partial sentences smoothly."
        },
        {
          id: `act-${meetingId}-3`,
          title: 'Review mobile push notification delivery rates for post-call action digests',
          assignee: WORKSPACE_PARTICIPANTS.david,
          completed: false,
          timestamp: 520,
          sourceQuote: "I will review the mobile digest delivery metrics with product analytics before next sprint."
        }
      ],
      highlights: [
        {
          id: `hl-${meetingId}-1`,
          title: 'Sub-second Latency Target Decision',
          startTime: 100,
          endTime: 180,
          speakerName: 'Sarah Chen',
          summary: 'Sarah commits to sub-second perceived transcription using 250ms Opus chunking.',
          tag: 'Performance'
        }
      ],
      topics: [
        {
          title: 'Mobile Audio Stream Buffering',
          timestamp: 25,
          bullets: [
            'Maya shared user drop-off data showing impatience when transcript lagged >3s.',
            'Sarah verified 250ms chunks fit comfortably within mobile LTE bandwidth.'
          ]
        },
        {
          title: 'Offline Re-synchronization Protocol',
          timestamp: 320,
          bullets: [
            'Agreed to store unprocessed voice packets in IndexedDB when mobile connectivity drops.',
            'Automatic upload resumption occurs when Wi-Fi or 5G reconnects.'
          ]
        }
      ],
      transcript: [
        {
          id: `ut-${meetingId}-1`,
          speakerId: 'p-david',
          speakerName: 'David Kim',
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 10,
          endTime: 40,
          text: "Thanks everyone for hopping on short notice. We need to tackle mobile transcription lag. On mobile devices, seeing words appear 4 seconds behind the speaker feels completely broken."
        },
        {
          id: `ut-${meetingId}-2`,
          speakerId: 'p-maya',
          speakerName: 'Maya Patel',
          speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
          startTime: 45,
          endTime: 95,
          text: "Exactly. In our mobile usability sessions, users look at the screen, don't see words appearing, and think the client dropped offline. We need immediate visual feedback."
        },
        {
          id: `ut-${meetingId}-3`,
          speakerId: 'p-sarah',
          speakerName: 'Sarah Chen',
          speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
          startTime: 105,
          endTime: 160,
          text: "We can switch from 2-second WAV chunks to 250ms Opus streaming over WebSocket. I will set up the network throttle harness and test Opus compression on poor connections tomorrow."
        },
        {
          id: `ut-${meetingId}-4`,
          speakerId: 'p-maya',
          speakerName: 'Maya Patel',
          speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
          startTime: 220,
          endTime: 260,
          text: "How does mobile battery consumption behave during continuous 60-minute streaming on low-end Android devices? We should profile thermal throttling as well."
        },
        {
          id: `ut-${meetingId}-5`,
          speakerId: 'p-david',
          speakerName: 'David Kim',
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 320,
          endTime: 360,
          text: "Let's also agree to store unprocessed voice packets in IndexedDB when mobile network is lost, so dropped subway tunnels don't lose utterances."
        },
        {
          id: `ut-${meetingId}-6`,
          speakerId: 'p-maya',
          speakerName: 'Maya Patel',
          speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
          startTime: 380,
          endTime: 420,
          text: "I'll package the optimistic scrolling hook so mobile can adopt the desktop behavior and render partial sentences smoothly."
        },
        {
          id: `ut-${meetingId}-7`,
          speakerId: 'p-david',
          speakerName: 'David Kim',
          speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
          startTime: 510,
          endTime: 550,
          text: "I will review the mobile digest delivery metrics with product analytics before next sprint to ensure our summary emails reach executives on mobile."
        }
      ],
      shares: [],
      activeTemplate: 'executive',
      templates: {
        executive: {
          key: 'executive',
          name: 'Executive Summary',
          description: 'High-level synthesis focused on key business decisions, metrics, and outcomes.',
          overview: 'Technical alignment on mobile client streaming transcription to reduce user drop-off.',
          sections: [
            {
              heading: 'Key Decisions',
              bullets: [
                'Switched mobile streaming to 250ms Opus packets to achieve 600ms latency.',
                'IndexedDB client cache will safeguard offline audio packets.'
              ]
            }
          ]
        }
      },
      suggestedQuestions: [
        'What was the cause of mobile transcription lag?',
        'What audio chunk size was agreed upon?',
        'Who owns the network throttling benchmarks?'
      ],
      tags: ['Mobile', 'Latency', 'Opus', 'Streaming']
    };
  }

  // Default: template-infra-q4
  const meetingId = `meeting-infra-${ts}`;
  return {
    id: meetingId,
    title: customTitle?.trim() || 'Q4 AI Inference Infrastructure & Latency SLA Sync',
    originalCalendarTitle: 'Q4 Infrastructure Capacity & Latency Review',
    date: dateStr,
    durationSeconds: 1320,
    participants: [
      WORKSPACE_PARTICIPANTS.david,
      WORKSPACE_PARTICIPANTS.sarah,
      WORKSPACE_PARTICIPANTS.elena,
      WORKSPACE_PARTICIPANTS.maya
    ],
    overview: 'Strategic engineering alignment on multi-region model inference latency. Evaluated switching edge routing from us-east to localized GPU clusters in us-west and eu-central to maintain <1.2s TTFT (Time to First Token). David locked the infrastructure budget, Sarah committed benchmark metrics, and Elena agreed on QA soak test thresholds.',
    keyDecisions: [
      'Standardize on localized GPU edge cluster routing to enforce <1.2s TTFT across North America and Europe.',
      'Cap GPU cluster auto-scale ceiling at 16 concurrent nodes pending Q4 budget review.',
      'Mandate 48-hour continuous soak test before cutting DNS traffic to new edge endpoints.'
    ],
    keyDecisionDetails: [
      {
        id: `dec-${meetingId}-1`,
        text: 'Standardize on localized GPU edge cluster routing to enforce <1.2s TTFT across North America and Europe',
        timestamp: 180
      },
      {
        id: `dec-${meetingId}-2`,
        text: 'Cap GPU cluster auto-scale ceiling at 16 concurrent nodes pending Q4 budget review',
        timestamp: 490
      },
      {
        id: `dec-${meetingId}-3`,
        text: 'Mandate 48-hour continuous soak test before cutting DNS traffic to new edge endpoints',
        timestamp: 810
      }
    ],
    openQuestions: [
      {
        id: `oq-${meetingId}-1`,
        question: 'What is our failover latency if eu-central GPU availability drops during peak European market hours?',
        timestamp: 310,
        speakerName: 'Maya Patel',
        context: 'Evaluating multi-region DNS failover window during cloud provider outages'
      },
      {
        id: `oq-${meetingId}-2`,
        question: 'Will client-side WebSocket connections support graceful reconnect without dropping partial transcript packets?',
        timestamp: 640,
        speakerName: 'Elena Rostova',
        context: 'Verifying network resilient socket re-negotiation across edge regions'
      }
    ],
    actionItems: [
      {
        id: `act-${meetingId}-1`,
        title: 'Deploy GPU edge routing benchmark harness across us-west and eu-central',
        assignee: WORKSPACE_PARTICIPANTS.sarah,
        completed: false,
        timestamp: 145,
        sourceQuote: "I'll deploy the routing probe to both us-west and Frankfurt clusters by Wednesday and log latency percentiles."
      },
      {
        id: `act-${meetingId}-2`,
        title: 'Draft Q4 cloud infrastructure capacity model and budget approval memo',
        assignee: WORKSPACE_PARTICIPANTS.david,
        completed: false,
        timestamp: 420,
        sourceQuote: "I will draft the capital expenditure allocation for the extra GPU instances and share it with finance."
      },
      {
        id: `act-${meetingId}-3`,
        title: 'Configure automated latency threshold alerting in Datadog for P99 regressions',
        assignee: WORKSPACE_PARTICIPANTS.elena,
        completed: false,
        timestamp: 780,
        sourceQuote: "I will add the P99 regression alert rule in Datadog so any drift over 1.2 seconds triggers an on-call notification."
      }
    ],
    highlights: [
      {
        id: `hl-${meetingId}-1`,
        title: 'Sub-1.2s TTFT Multi-Region Routing Decision',
        startTime: 160,
        endTime: 230,
        speakerName: 'Sarah Chen',
        summary: 'Team commits to multi-region edge GPU deployment to satisfy strict enterprise SLA requirements.',
        tag: 'Technical Architecture'
      },
      {
        id: `hl-${meetingId}-2`,
        title: 'Q4 GPU Capacity Ceiling Lock',
        startTime: 470,
        endTime: 530,
        speakerName: 'David Kim',
        summary: 'David caps automatic instance scaling at 16 nodes to guard quarterly budget targets.',
        tag: 'Budget & Finance'
      }
    ],
    topics: [
      {
        title: 'Edge GPU Deployment & Regional Routing',
        timestamp: 40,
        bullets: [
          'Sarah presented latency benchmarks: single us-east cluster yields 2.8s P99 in Europe.',
          'Adding localized Frankfurt cluster reduces EU latency to 850ms TTFT.'
        ]
      },
      {
        title: 'Cost Modeling & Autoscaling Limits',
        timestamp: 410,
        bullets: [
          'David reviewed projected cloud expenditures with finance parameters.',
          'Agreed to strict 16-node auto-scale limit to prevent runaway GPU billing.'
        ]
      },
      {
        title: 'Production Soak Test & Quality Gates',
        timestamp: 750,
        bullets: [
          'Elena confirmed QA soak test standards: 48 hours without memory leak or dropped frames.',
          'Datadog automated alerts will trigger immediate rollback if P99 drifts beyond 1.2s.'
        ]
      }
    ],
    transcript: [
      {
        id: `ut-${meetingId}-1`,
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
        startTime: 10,
        endTime: 50,
        text: "Thanks for gathering team. Our primary objective today is locking down the Q4 infrastructure strategy for model inference. With enterprise pilot customers ramping up, 2.8-second latency from Europe is no longer acceptable."
      },
      {
        id: `ut-${meetingId}-2`,
        speakerId: 'p-sarah',
        speakerName: 'Sarah Chen',
        speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
        startTime: 55,
        endTime: 110,
        text: "I ran regional probes yesterday. Routing all queries through us-east creates a 180ms network transit penalty before inference even starts. If we spin up edge GPU pools in us-west and Frankfurt, our local TTFT drops to 850ms."
      },
      {
        id: `ut-${meetingId}-3`,
        speakerId: 'p-sarah',
        speakerName: 'Sarah Chen',
        speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
        startTime: 135,
        endTime: 175,
        text: "I'll deploy the routing probe to both us-west and Frankfurt clusters by Wednesday and log latency percentiles across 10,000 synthetic test runs."
      },
      {
        id: `ut-${meetingId}-4`,
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
        startTime: 178,
        endTime: 215,
        text: "Agreed. Let's make that an official decision: standardize on localized GPU edge cluster routing to enforce sub-1.2s TTFT across North America and Europe."
      },
      {
        id: `ut-${meetingId}-5`,
        speakerId: 'p-maya',
        speakerName: 'Maya Patel',
        speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
        startTime: 295,
        endTime: 340,
        text: "What is our failover latency if eu-central GPU availability drops during peak European market hours? We need to make sure the client UI degrades gracefully instead of hanging."
      },
      {
        id: `ut-${meetingId}-6`,
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
        startTime: 405,
        endTime: 450,
        text: "I will draft the capital expenditure allocation for the extra GPU instances and share it with finance by Friday so we have formal budget approval."
      },
      {
        id: `ut-${meetingId}-7`,
        speakerId: 'p-david',
        speakerName: 'David Kim',
        speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
        startTime: 480,
        endTime: 515,
        text: "Let's cap the GPU cluster auto-scale ceiling at 16 concurrent nodes pending Q4 budget review so we don't accidentally overspend."
      },
      {
        id: `ut-${meetingId}-8`,
        speakerId: 'p-elena',
        speakerName: 'Elena Rostova',
        speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
        startTime: 625,
        endTime: 670,
        text: "Will client-side WebSocket connections support graceful reconnect without dropping partial transcript packets? In QA we noticed occasional packet loss during network handshakes."
      },
      {
        id: `ut-${meetingId}-9`,
        speakerId: 'p-elena',
        speakerName: 'Elena Rostova',
        speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
        startTime: 765,
        endTime: 805,
        text: "I will add the P99 regression alert rule in Datadog so any drift over 1.2 seconds triggers an on-call notification."
      },
      {
        id: `ut-${meetingId}-10`,
        speakerId: 'p-elena',
        speakerName: 'Elena Rostova',
        speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
        startTime: 808,
        endTime: 840,
        text: "And we mandate a 48-hour continuous soak test before cutting live DNS traffic to the new edge endpoints."
      }
    ],
    shares: [],
    activeTemplate: 'executive',
    templates: {
      executive: {
        key: 'executive',
        name: 'Executive Summary',
        description: 'High-level synthesis focused on key business decisions, metrics, and outcomes.',
        overview: 'Strategic engineering alignment on multi-region model inference latency to achieve sub-1.2s TTFT.',
        sections: [
          {
            heading: 'Key Decisions & Architecture',
            bullets: [
              'Standardized on localized GPU clusters in us-west and eu-central.',
              'Enforced 16-node auto-scale ceiling to ensure budget compliance.',
              'Mandated 48-hour QA soak test before production DNS traffic cutover.'
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      'What latency threshold was established for TTFT?',
      'Which edge regions are being deployed?',
      'Who owns the Datadog latency regression alerts?'
    ],
    tags: ['Infrastructure', 'Latency', 'Q4-Planning', 'GPU']
  };
}

export function buildMeetingFromUploadedFile(
  fileMeta: { name: string; size: number; type: string },
  customTitle?: string,
  participantIds?: string[]
): Meeting {
  const ts = Date.now();
  const dateStr = new Date().toISOString();
  const cleanTitle = customTitle?.trim() || fileMeta.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  const formattedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  const meetingId = `meeting-upload-${ts}`;

  // Default participants: David, Sarah, Elena
  const selectedParticipants: Participant[] = [];
  if (Array.isArray(participantIds) && participantIds.length > 0) {
    for (const pid of participantIds) {
      const match = Object.values(WORKSPACE_PARTICIPANTS).find(p => p.id === pid);
      if (match) selectedParticipants.push(match);
    }
  }
  if (selectedParticipants.length === 0) {
    selectedParticipants.push(WORKSPACE_PARTICIPANTS.david, WORKSPACE_PARTICIPANTS.sarah, WORKSPACE_PARTICIPANTS.elena);
  }

  const durationSec = Math.max(720, Math.min(1800, Math.floor(fileMeta.size / 35000) || 960));

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
      'Enforced automated regression verification before deploying changes to staging environment.'
    ],
    keyDecisionDetails: [
      {
        id: `dec-${meetingId}-1`,
        text: `Approved execution plan outlined in ${formattedTitle}`,
        timestamp: 120
      },
      {
        id: `dec-${meetingId}-2`,
        text: 'Enforced automated regression verification before deploying changes to staging environment',
        timestamp: 430
      }
    ],
    openQuestions: [
      {
        id: `oq-${meetingId}-1`,
        question: `What are the key technical dependencies required for the ${formattedTitle} rollout?`,
        timestamp: 210,
        speakerName: selectedParticipants[1]?.name || 'Sarah Chen',
        context: 'Clarifying milestone roadmap and resource allocation'
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
        title: 'Execution Plan Consensus',
        startTime: 110,
        endTime: 190,
        speakerName: selectedParticipants[0]?.name || 'David Kim',
        summary: 'Consensus reached on immediate execution milestones and owner allocations.',
        tag: 'Key Milestone'
      }
    ],
    topics: [
      {
        title: 'Project Scope & Requirements Review',
        timestamp: 30,
        bullets: [
          'Reviewed primary deliverables and technical constraints.',
          'Identified potential edge cases and established validation criteria.'
        ]
      },
      {
        title: 'Milestone Execution & Ownership',
        timestamp: 380,
        bullets: [
          'Confirmed ownership assignments across engineering and product.',
          'Scheduled regression checkpoint prior to next sprint.'
        ]
      }
    ],
    transcript: [
      {
        id: `ut-${meetingId}-1`,
        speakerId: selectedParticipants[0]?.id || 'p-david',
        speakerName: selectedParticipants[0]?.name || 'David Kim',
        speakerAvatar: selectedParticipants[0]?.avatar || '',
        startTime: 10,
        endTime: 45,
        text: `Welcome everyone. Today we are reviewing the core objectives for ${formattedTitle} and aligning on key execution milestones.`
      },
      {
        id: `ut-${meetingId}-2`,
        speakerId: selectedParticipants[1]?.id || 'p-sarah',
        speakerName: selectedParticipants[1]?.name || 'Sarah Chen',
        speakerAvatar: selectedParticipants[1]?.avatar || '',
        startTime: 50,
        endTime: 115,
        text: "I've reviewed the preliminary requirements. The proposed architecture addresses our scalability bottlenecks while keeping operational overhead low."
      },
      {
        id: `ut-${meetingId}-3`,
        speakerId: selectedParticipants[0]?.id || 'p-david',
        speakerName: selectedParticipants[0]?.name || 'David Kim',
        speakerAvatar: selectedParticipants[0]?.avatar || '',
        startTime: 118,
        endTime: 155,
        text: `Let's make that an official decision: approve the execution plan outlined in ${formattedTitle}.`
      },
      {
        id: `ut-${meetingId}-4`,
        speakerId: selectedParticipants[1]?.id || 'p-sarah',
        speakerName: selectedParticipants[1]?.name || 'Sarah Chen',
        speakerAvatar: selectedParticipants[1]?.avatar || '',
        startTime: 158,
        endTime: 200,
        text: `I will finalize the benchmark validation suite for ${formattedTitle} and publish test results.`
      },
      {
        id: `ut-${meetingId}-5`,
        speakerId: selectedParticipants[1]?.id || 'p-sarah',
        speakerName: selectedParticipants[1]?.name || 'Sarah Chen',
        speakerAvatar: selectedParticipants[1]?.avatar || '',
        startTime: 205,
        endTime: 245,
        text: `What are the key technical dependencies required for the ${formattedTitle} rollout? We should map those out.`
      },
      {
        id: `ut-${meetingId}-6`,
        speakerId: selectedParticipants[0]?.id || 'p-david',
        speakerName: selectedParticipants[0]?.name || 'David Kim',
        speakerAvatar: selectedParticipants[0]?.avatar || '',
        startTime: 420,
        endTime: 460,
        text: "We should also enforce automated regression verification before deploying changes to staging environment."
      },
      {
        id: `ut-${meetingId}-7`,
        speakerId: selectedParticipants[0]?.id || 'p-david',
        speakerName: selectedParticipants[0]?.name || 'David Kim',
        speakerAvatar: selectedParticipants[0]?.avatar || '',
        startTime: 475,
        endTime: 510,
        text: "I will circulate the outcome notes and timeline to everyone on the project team."
      }
    ],
    shares: [],
    activeTemplate: 'executive',
    templates: {
      executive: {
        key: 'executive',
        name: 'Executive Summary',
        description: 'High-level synthesis focused on key business decisions, metrics, and outcomes.',
        overview: `Synthesized outcomes from imported meeting ${formattedTitle}.`,
        sections: [
          {
            heading: 'Outcomes & Decisions',
            bullets: [
              `Execution plan approved for ${formattedTitle}.`,
              'Automated regression verification required for staging deployments.'
            ]
          }
        ]
      }
    },
    suggestedQuestions: [
      `What were the key decisions made in ${formattedTitle}?`,
      'Who owns the benchmark validation suite?',
      'What follow-up actions were assigned?'
    ],
    tags: ['Imported', 'Intake-Pipeline', 'Meeting']
  };
}

export async function buildAdversarialMeeting(customTitle?: string): Promise<Meeting> {
  const ts = Date.now();
  const dateStr = new Date().toISOString();
  const meetingId = `meeting-adv-${ts}`;
  const participants = [
    WORKSPACE_PARTICIPANTS.david,
    WORKSPACE_PARTICIPANTS.sarah,
    WORKSPACE_PARTICIPANTS.elena,
    WORKSPACE_PARTICIPANTS.marcus,
    WORKSPACE_PARTICIPANTS.maya
  ];

  const transcript: TranscriptUtterance[] = [
    {
      id: `ut-${meetingId}-1`,
      speakerId: 'p-david',
      speakerName: 'David Kim',
      speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
      startTime: 5,
      endTime: 24,
      text: "Morning everyone. Did you catch that Champions League game last night? Absolutely wild finish in stoppage time. Anyway, let's focus up and jump into architecture and sprint priorities."
    },
    {
      id: `ut-${meetingId}-2`,
      speakerId: 'p-sarah',
      speakerName: 'Sarah Chen',
      speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
      startTime: 28,
      endTime: 55,
      text: "I might look at that new Rust caching library over the weekend if I have time, but don't count on it, I'm pretty slammed with personal commitments."
    },
    {
      id: `ut-${meetingId}-3`,
      speakerId: 'p-maya',
      speakerName: 'Maya Patel',
      speakerAvatar: WORKSPACE_PARTICIPANTS.maya.avatar,
      startTime: 60,
      endTime: 78,
      text: "Quick question: what port does the telemetry daemon listen on for OTLP?"
    },
    {
      id: `ut-${meetingId}-4`,
      speakerId: 'p-elena',
      speakerName: 'Elena Rostova',
      speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
      startTime: 82,
      endTime: 105,
      text: "It's fixed to 4317 for OTLP. We already opened it in the staging security group."
    },
    {
      id: `ut-${meetingId}-5`,
      speakerId: 'p-marcus',
      speakerName: 'Marcus Vance',
      speakerAvatar: WORKSPACE_PARTICIPANTS.marcus.avatar,
      startTime: 110,
      endTime: 138,
      text: "For the frontend rework, let's migrate our CSS to Tailwind v4 next week to speed up UI prototyping."
    },
    {
      id: `ut-${meetingId}-6`,
      speakerId: 'p-david',
      speakerName: 'David Kim',
      speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
      startTime: 142,
      endTime: 185,
      text: "Wait, no, our design system audit showed Tailwind v4 breaks our tokens. We explicitly decided to stay with Vanilla CSS and avoid utility class bloat."
    },
    {
      id: `ut-${meetingId}-7`,
      speakerId: 'p-sarah',
      speakerName: 'Sarah Chen',
      speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
      startTime: 190,
      endTime: 230,
      text: "Understood. On backend performance, I will definitely benchmark the Redis connection pool by Thursday and post the flame graphs in Slack."
    },
    {
      id: `ut-${meetingId}-8`,
      speakerId: 'p-david',
      speakerName: 'David Kim',
      speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
      startTime: 235,
      endTime: 260,
      text: "Can someone take the lead on the enterprise session token expiration audit?"
    },
    {
      id: `ut-${meetingId}-9`,
      speakerId: 'p-elena',
      speakerName: 'Elena Rostova',
      speakerAvatar: WORKSPACE_PARTICIPANTS.elena.avatar,
      startTime: 262,
      endTime: 300,
      text: "I'll take ownership of the token audit and submit the PR by Friday afternoon."
    },
    {
      id: `ut-${meetingId}-10`,
      speakerId: 'p-sarah',
      speakerName: 'Sarah Chen',
      speakerAvatar: WORKSPACE_PARTICIPANTS.sarah.avatar,
      startTime: 310,
      endTime: 345,
      text: "What is our legal liability if European customer audio packets route through the UK fiber hub?"
    },
    {
      id: `ut-${meetingId}-11`,
      speakerId: 'p-david',
      speakerName: 'David Kim',
      speakerAvatar: WORKSPACE_PARTICIPANTS.david.avatar,
      startTime: 350,
      endTime: 375,
      text: "That's a critical compliance question. Let's table that for our sync with legal counsel."
    }
  ];

  const provider = getIntelligenceProvider();
  const intel = await provider.extractIntelligence({
    meetingId,
    title: customTitle?.trim() || 'Product Strategy & Architecture Alignment (Edge-Case Test)',
    date: dateStr,
    participants,
    transcript,
    durationSeconds: 380
  });

  return {
    id: meetingId,
    title: customTitle?.trim() || 'Product Strategy & Architecture Alignment (Edge-Case Test)',
    originalCalendarTitle: 'Adversarial Edge-Case Extraction Benchmark',
    date: dateStr,
    durationSeconds: 380,
    participants,
    overview: intel.overview,
    keyDecisions: intel.decisions.map(d => d.text),
    keyDecisionDetails: intel.decisions.map(d => ({
      id: d.id,
      text: d.text,
      timestamp: d.timestamp,
      confidence: d.confidence,
      sourceUtteranceId: d.sourceUtteranceId
    })),
    actionItems: intel.actionItems.map(a => ({
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
    openQuestions: intel.openQuestions.map(q => ({
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
    activeTemplate: 'executive',
    templates: {
      executive: {
        key: 'executive',
        name: 'Executive Summary',
        description: 'Intelligence synthesis with adversarial edge-case verification.',
        overview: intel.overview,
        sections: [
          {
            heading: 'Key Decisions & Grounded Actions',
            bullets: intel.decisions.map(d => d.text)
          }
        ]
      }
    },
    suggestedQuestions: intel.suggestedQuestions,
    tags: ['Adversarial-Test', 'Intelligence-v2', 'Verified']
  };
}
