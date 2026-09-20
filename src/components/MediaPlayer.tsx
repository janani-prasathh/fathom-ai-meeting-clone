import React, { useEffect, useRef, useState } from 'react';
import { useMeeting } from '../context/MeetingContext';
import { Play, Pause, RotateCcw, RotateCw, Volume2, FastForward, User } from 'lucide-react';

export const MediaPlayer: React.FC = () => {
  const {
    activeMeeting,
    currentTime,
    isPlaying,
    playbackRate,
    seekTo,
    togglePlayPause,
    setPlaybackRate
  } = useMeeting();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Playhead ticking effect
  useEffect(() => {
    if (!isPlaying || !activeMeeting) return;

    const interval = setInterval(() => {
      seekTo(currentTime + 0.5 * playbackRate, false);
      if (currentTime >= activeMeeting.durationSeconds) {
        seekTo(0, false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, currentTime, playbackRate, activeMeeting, seekTo]);

  // Find active speaker from current time
  const currentUtterance = activeMeeting?.transcript.find(
    (u) => currentTime >= u.startTime && currentTime <= u.endTime
  );
  const activeSpeaker = activeMeeting?.participants.find(
    (p) => p.name === currentUtterance?.speakerName
  ) || activeMeeting?.participants[0];

  // Canvas visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let waveOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background subtle gradient
      const bgGrad = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        20,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 1.5
      );
      bgGrad.addColorStop(0, '#151926');
      bgGrad.addColorStop(1, '#0b0d13');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Animated Sound Waves when playing
      if (isPlaying) {
        waveOffset += 0.08 * playbackRate;
        ctx.lineWidth = 2.5;

        // Wave 1
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.45)';
        ctx.beginPath();
        const waveCenterY = canvas.height * 0.72;
        for (let x = 0; x < canvas.width; x += 4) {
          const amp = Math.sin(x * 0.02 + waveOffset) * Math.cos(x * 0.01 + waveOffset * 0.5) * 22;
          if (x === 0) ctx.moveTo(x, waveCenterY + amp);
          else ctx.lineTo(x, waveCenterY + amp);
        }
        ctx.stroke();

        // Wave 2 (Accent)
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.55)';
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 4) {
          const amp = Math.sin(x * 0.03 - waveOffset * 0.8) * 16;
          if (x === 0) ctx.moveTo(x, waveCenterY + amp);
          else ctx.lineTo(x, waveCenterY + amp);
        }
        ctx.stroke();
      }

      // Draw Center Speaker Avatar or Graphic
      const centerX = canvas.width / 2;
      const centerY = canvas.height * 0.42;
      const radius = 48;

      // Glow ring if speaking
      if (isPlaying && currentUtterance) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 8 + Math.sin(waveOffset * 3) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Avatar circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1e2436';
      ctx.fill();
      ctx.strokeStyle = currentUtterance ? '#10b981' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackRate, currentUtterance]);

  if (!activeMeeting) return null;

  const totalSeconds = activeMeeting.durationSeconds || 1;
  const progressPercent = Math.min(100, Math.max(0, (currentTime / totalSeconds) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seekTo(ratio * totalSeconds, isPlaying);
  };

  const toggleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  return (
    <div className="media-pane">
      <div className="video-container">
        <canvas
          ref={canvasRef}
          className="canvas-player"
          width={640}
          height={360}
        />

        {/* Top overlay */}
        <div className="video-overlay-top">
          <div className="active-speaker-badge">
            <span className="pulse-dot" />
            <span>
              {currentUtterance
                ? `Speaking: ${currentUtterance.speakerName}`
                : 'Playback Paused'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.75rem' }}>
            <Volume2 size={14} />
            <span>Simulated Recording</span>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="video-controls">
          {/* Progress bar with topic chapter markers */}
          <div
            ref={progressBarRef}
            className="progress-bar-wrap"
            onClick={handleProgressBarClick}
          >
            <div
              className="progress-filled"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="scrubber-handle" />
            </div>

            {/* Chapter markers */}
            {activeMeeting.topics.map((t) => {
              const markerPercent = (t.timestamp / totalSeconds) * 100;
              return (
                <div
                  key={t.title}
                  style={{
                    position: 'absolute',
                    left: `${markerPercent}%`,
                    top: '-2px',
                    width: '3px',
                    height: '12px',
                    background: 'rgba(255, 255, 255, 0.4)',
                    borderRadius: '1px',
                    pointerEvents: 'none'
                  }}
                  title={`${t.title} (${formatTime(t.timestamp)})`}
                />
              );
            })}
          </div>

          <div className="controls-row">
            <div className="controls-left">
              <button
                className="btn-ctrl"
                onClick={togglePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>

              <button
                className="btn-ctrl"
                onClick={() => seekTo(currentTime - 10, isPlaying)}
                title="Rewind 10 seconds"
              >
                <RotateCcw size={16} />
              </button>

              <button
                className="btn-ctrl"
                onClick={() => seekTo(currentTime + 10, isPlaying)}
                title="Forward 10 seconds"
              >
                <RotateCw size={16} />
              </button>

              <span className="time-display">
                {formatTime(currentTime)} / {formatTime(totalSeconds)}
              </span>
            </div>

            <div className="controls-right">
              <span
                className="speed-badge"
                onClick={toggleSpeed}
                title="Click to cycle playback speed"
              >
                {playbackRate}x
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Attendees Card */}
      <div className="media-pane-card">
        <h4>People in this meeting ({activeMeeting.participants.length})</h4>
        <div className="call-attendee-list">
          {activeMeeting.participants.map((p) => {
            const isSpeakingNow = currentUtterance?.speakerName === p.name;
            return (
              <div key={p.id} className="call-attendee-row">
                <div className="call-attendee-info">
                  <img src={p.avatar} alt={p.name} />
                  <div>
                    <div className="attendee-name" style={{ color: isSpeakingNow ? '#34d399' : 'inherit' }}>
                      {p.name}
                    </div>
                    <div className="attendee-role">{p.role}</div>
                  </div>
                </div>

                {isSpeakingNow && (
                  <span style={{ fontSize: '0.7rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="pulse-dot" style={{ width: 5, height: 5 }} />
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
