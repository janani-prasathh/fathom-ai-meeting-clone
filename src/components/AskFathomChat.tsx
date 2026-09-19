import React, { useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { ChatMessage } from '../types';
import { Sparkles, Send, Play, Bot, User } from 'lucide-react';

export const AskFathomChat: React.FC = () => {
  const { activeMeeting, seekTo } = useMeeting();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I've analyzed "${activeMeeting?.title}". Ask me any question about what was said, decisions made, or who committed to what. You can also click any suggested question below.`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  if (!activeMeeting) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (textToSend: string) => {
    const q = textToSend.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsThinking(true);

    // AI answer resolution logic
    setTimeout(() => {
      const qLower = q.toLowerCase();
      let answerText = '';
      let citations: ChatMessage['citations'] = [];

      // Smart matching against transcript and decisions
      const matchingUtterances = activeMeeting.transcript.filter((u) => {
        const words = qLower.split(/\s+/).filter((w) => w.length > 3);
        return words.some((w) => u.text.toLowerCase().includes(w));
      });

      if (qLower.includes('latency') || qLower.includes('bottleneck') || qLower.includes('sqlite') || qLower.includes('smarteval')) {
        answerText = `The benchmark run was bottlenecked by remote API round-trips (taking 12.4 seconds per query). Sarah Chen developed an embedded SQLite caching architecture with write-ahead logging (WAL), which drastically slashed execution time to 2.1 seconds per turn.`;
        const relevantU = activeMeeting.transcript.find((u) => u.text.includes('SQLite') || u.text.includes('2.1 seconds')) || activeMeeting.transcript[3];
        citations = [
          {
            meetingId: activeMeeting.id,
            meetingTitle: activeMeeting.title,
            timestamp: relevantU.startTime,
            quote: relevantU.text.slice(0, 100) + '...'
          }
        ];
      } else if (qLower.includes('sharing') || qLower.includes('undo') || qLower.includes('participant') || qLower.includes('accidental')) {
        answerText = `To prevent accidental leaks and eliminate manual searching, the team introduced participant-aware sharing. Verified attendees are displayed at the top with a 1-click toggle. For external recipients, a security warning is displayed, paired with a 5-second undo toast that allows instant revocation.`;
        const relevantU = activeMeeting.transcript.find((u) => u.text.includes('share') || u.text.includes('undo')) || activeMeeting.transcript[4];
        citations = [
          {
            meetingId: activeMeeting.id,
            meetingTitle: activeMeeting.title,
            timestamp: relevantU.startTime,
            quote: relevantU.text.slice(0, 100) + '...'
          }
        ];
      } else if (qLower.includes('title') || qLower.includes('impromptu')) {
        answerText = `User research revealed that multiple meetings named "Impromptu Google Meet Meeting" caused high cognitive load. Marcus Vance and David Kim agreed to generate smart titles automatically based on detected agenda items from the first 3 minutes of conversation.`;
        const relevantU = activeMeeting.transcript.find((u) => u.text.includes('Impromptu') || u.text.includes('title')) || activeMeeting.transcript[1];
        citations = [
          {
            meetingId: activeMeeting.id,
            meetingTitle: activeMeeting.title,
            timestamp: relevantU.startTime,
            quote: relevantU.text.slice(0, 100) + '...'
          }
        ];
      } else if (qLower.includes('pilot') || qLower.includes('acme') || qLower.includes('commercial') || qLower.includes('security') || qLower.includes('soc2')) {
        answerText = `Thomas Wright (CTO, Acme Corp) committed to a 50-seat SmartEval pilot starting October 1st, with expansion plans for 400 engineers in Q1. Fathom committed to zero-data-retention on all LLM inference and a 99.9% uptime SLA.`;
        const relevantU = activeMeeting.transcript.find((u) => u.text.includes('50-seat') || u.text.includes('zero data')) || activeMeeting.transcript[4];
        citations = [
          {
            meetingId: activeMeeting.id,
            meetingTitle: activeMeeting.title,
            timestamp: relevantU.startTime,
            quote: relevantU.text.slice(0, 100) + '...'
          }
        ];
      } else if (matchingUtterances.length > 0) {
        const topU = matchingUtterances[0];
        answerText = `Based on what was discussed: ${topU.speakerName} stated: "${topU.text}"`;
        citations = [
          {
            meetingId: activeMeeting.id,
            meetingTitle: activeMeeting.title,
            timestamp: topU.startTime,
            quote: topU.text.slice(0, 120) + '...'
          }
        ];
      } else {
        answerText = `In this meeting, the discussion primarily focused on: "${activeMeeting.overview}". Review the action items and key decisions for specific assignments.`;
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: answerText,
        citations
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 450);
  };

  return (
    <div className="ask-fathom-container">
      {/* Suggested Prompts */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>Suggested Questions:</span>
        </div>
        <div className="suggested-prompts-row">
          {activeMeeting.suggestedQuestions.map((sq, i) => (
            <button
              key={i}
              className="suggested-prompt-chip"
              onClick={() => handleSendMessage(sq)}
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="chat-history">
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.sender}`}>
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {m.sender === 'assistant' ? (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <Bot size={15} />
                </div>
              ) : (
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <User size={15} />
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                {m.sender === 'assistant' ? 'Ask Fathom AI' : 'You'} • {m.timestamp}
              </div>
              <div>{m.text}</div>

              {/* Clickable Citations */}
              {m.citations && m.citations.length > 0 && (
                <div className="chat-citations-list">
                  {m.citations.map((cit, cIdx) => (
                    <button
                      key={cIdx}
                      className="citation-chip"
                      onClick={() => seekTo(cit.timestamp, true)}
                      title={`Jump to video at ${formatTime(cit.timestamp)}`}
                    >
                      <Play size={10} />
                      <span>Evidence: {formatTime(cit.timestamp)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="chat-bubble assistant">
            <Bot size={18} style={{ color: 'var(--accent-primary)', animation: 'pulse 1s infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Analyzing transcript and synthesizing response...
            </span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        className="ask-input-box"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputVal);
        }}
      >
        <input
          type="text"
          className="ask-input"
          placeholder="Ask anything about this meeting (or click a suggestion above)..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button type="submit" className="btn-send-ask" title="Send question">
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
