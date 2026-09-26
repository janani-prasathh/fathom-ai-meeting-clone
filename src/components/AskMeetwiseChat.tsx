import React, { useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { api, ApiError } from '../api/client';
import { ChatMessage } from '../types';
import { Sparkles, Send, Play, Bot, User, CheckCircle2, AlertCircle, AlertTriangle, Loader2, Search, ExternalLink } from 'lucide-react';

export const AskMeetwiseChat: React.FC = () => {
  const { activeMeeting, seekTo, currentUser, setActiveDetailTab, navigateToMeeting } = useMeeting();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I am Ask Meetwise. I answer questions strictly grounded in the verified transcript, decisions, action items, and open questions of "${activeMeeting?.title}". Every response provides clickable timestamps to verify against spoken meeting evidence.`
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!activeMeeting) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q || isThinking) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsThinking(true);

    try {
      // Real backend endpoint grounded in SQLite meeting records
      const res = await api.askMeetingChat(activeMeeting.id, q, currentUser?.id);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.answer,
        citations: res.sources.map((s) => ({
          meetingId: s.meetingId,
          meetingTitle: s.meetingTitle,
          timestamp: s.timestamp,
          speakerName: s.speakerName,
          quote: s.quote
        }))
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Ask Meetwise error:', err);
      const msg = err instanceof ApiError ? err.message : err.message || 'Failed to query meeting evidence';
      setErrorMsg(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `Error retrieving meeting evidence: ${msg}. Please check the backend connection and try again.`
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleJumpToEvidence = (timestamp: number, meetingId?: string) => {
    if (meetingId && meetingId !== activeMeeting.id) {
      navigateToMeeting(meetingId, 'transcript', timestamp);
    } else {
      seekTo(timestamp, true);
      setActiveDetailTab('transcript');
    }
  };

  const isInsufficientEvidence = (text: string) => {
    const t = text.toLowerCase();
    return (
      t.includes('not contain enough information') ||
      t.includes('insufficient evidence') ||
      t.includes("couldn't find supporting information")
    );
  };

  const renderTextWithClickableTimestamps = (text: string, citations?: { meetingId?: string; timestamp?: number }[]) => {
    const regex = /([(\[])?(\d{1,2}):(\d{2})([)\]])?/g;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        elements.push(text.slice(lastIndex, matchIndex));
      }

      const minStr = match[2];
      const secStr = match[3];
      const secs = parseInt(minStr, 10) * 60 + parseInt(secStr, 10);

      // Match against citations to locate cross-meeting target if applicable
      const matchedCit = citations?.find(
        (c) => c.timestamp !== undefined && Math.abs(c.timestamp - secs) <= 3
      );
      const targetMeetingId = matchedCit?.meetingId || activeMeeting.id;

      elements.push(
        <button
          key={matchIndex}
          onClick={() => handleJumpToEvidence(secs, targetMeetingId)}
          style={{
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '4px',
            color: '#38bdf8',
            fontWeight: 600,
            padding: '1px 5px',
            margin: '0 2px',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}
          title={`Jump to ${minStr}:${secStr} in transcript`}
        >
          <Play size={9} fill="#38bdf8" />
          <span>[{minStr}:{secStr}]</span>
        </button>
      );

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements;
  };

  return (
    <div className="ask-meetwise-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '840px', gap: '16px' }}>
      {/* Header Info Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f172a',
          border: '1px solid #1e283b',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '0.8rem',
          color: '#94a3b8'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={14} style={{ color: '#38bdf8' }} />
          <span>
            <strong style={{ color: '#f1f5f9' }}>Grounded Assistant:</strong> Responses reference meeting transcripts, decisions, and action items.
          </span>
        </div>
        <span
          style={{
            background: '#1e283b',
            border: '1px solid #334155',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '0.7rem',
            color: '#94a3b8',
            fontWeight: 500
          }}
        >
          Verified Records
        </span>
      </div>

      {/* Suggested Questions */}
      {activeMeeting.suggestedQuestions && activeMeeting.suggestedQuestions.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '0.76rem',
              color: '#64748b',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 600
            }}
          >
            <Search size={12} style={{ color: '#64748b' }} />
            <span>Suggested Inquiries:</span>
          </div>
          <div className="suggested-prompts-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {activeMeeting.suggestedQuestions.map((sq, i) => (
              <button
                key={i}
                className="suggested-prompt-chip"
                onClick={() => handleSendMessage(sq)}
                disabled={isThinking}
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e283b',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages Log */}
      <div
        className="chat-history"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '4px'
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-bubble ${m.sender}`}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '14px 16px',
              borderRadius: '6px',
              background: m.sender === 'user' ? 'rgba(37, 99, 235, 0.08)' : '#0f172a',
              border: m.sender === 'user' ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid #1e283b',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'stretch',
              maxWidth: m.sender === 'user' ? '85%' : '100%'
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {m.sender === 'assistant' ? (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '6px',
                    background: '#1e283b',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8'
                  }}
                >
                  <Bot size={15} />
                </div>
              ) : (
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '6px',
                    background: '#1e283b',
                    border: '1px solid #334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#cbd5e1'
                  }}
                >
                  <User size={16} />
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontWeight: 600, color: m.sender === 'assistant' ? '#38bdf8' : '#f8fafc' }}>
                  {m.sender === 'assistant' ? 'Ask Meetwise' : 'You'}
                </span>
                <span>•</span>
                <span>{m.timestamp}</span>
              </div>

              {m.sender === 'assistant' && isInsufficientEvidence(m.text) ? (
                <div
                  style={{
                    background: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '8px',
                    padding: '16px 18px',
                    marginTop: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', marginBottom: '8px' }}>
                    <AlertTriangle size={15} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      INSUFFICIENT EVIDENCE
                    </span>
                  </div>

                  <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: '#f0f6fc', lineHeight: 1.5 }}>
                    Meetwise couldn't find supporting information in the available meeting records.
                  </p>

                  <div style={{ fontSize: '0.76rem', color: '#8b949e', borderTop: '1px solid #21262d', paddingTop: '10px' }}>
                    <div style={{ fontWeight: 600, color: '#c9d1d9', marginBottom: '6px' }}>Searched across:</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <li>Meetings & title metadata</li>
                      <li>Verbatim transcript utterances</li>
                      <li>Key decisions & consensus records</li>
                      <li>Action items & explicit commitments</li>
                      <li>Open questions & discussions</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    color: '#f1f5f9',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {m.sender === 'assistant' ? renderTextWithClickableTimestamps(m.text, m.citations) : m.text}
                </div>
              )}

              {/* Grounded Evidence Sources */}
              {m.citations && m.citations.length > 0 && (
                <div
                  style={{
                    marginTop: '14px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.72rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#38bdf8',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span>Sources ({m.citations.length})</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {m.citations.map((cit, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          background: 'rgba(28, 33, 40, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.2)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#94a3b8' }}>
                            <span style={{ color: '#38bdf8', fontWeight: 600 }}>{formatTime(cit.timestamp)}</span>
                            <span>—</span>
                            <span style={{ fontWeight: 600, color: '#f8fafc' }}>{cit.speakerName || 'Speaker'}</span>
                            {cit.meetingTitle && (
                              <>
                                <span style={{ color: '#484f58' }}>·</span>
                                <span style={{ color: '#8b949e', fontSize: '0.74rem' }}>{cit.meetingTitle}</span>
                              </>
                            )}
                          </div>
                          {cit.quote && (
                            <p
                              style={{
                                fontSize: '0.76rem',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic',
                                margin: '3px 0 0 0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              "{cit.quote}"
                            </p>
                          )}
                        </div>

                        <button
                          className="btn-secondary"
                          onClick={() => handleJumpToEvidence(cit.timestamp, cit.meetingId)}
                          style={{
                            flexShrink: 0,
                            padding: '4px 10px',
                            fontSize: '0.72rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            borderColor: 'rgba(56, 189, 248, 0.3)',
                            color: '#38bdf8'
                          }}
                          title={`Jump to transcript evidence at ${formatTime(cit.timestamp)}`}
                        >
                          <Play size={10} />
                          <span>Jump to evidence</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div
            className="chat-bubble assistant"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <Loader2 size={18} style={{ color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              Querying meeting records and retrieving evidence citations...
            </span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
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
        style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px'
        }}
      >
        <input
          type="text"
          className="ask-input"
          placeholder="Ask Meetwise about decisions, tasks, or who said what..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={isThinking}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#f8fafc',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          title="Send question to Ask Meetwise"
          disabled={isThinking || !inputVal.trim()}
          style={{
            padding: '6px 14px',
            fontSize: '0.82rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Send size={14} />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
