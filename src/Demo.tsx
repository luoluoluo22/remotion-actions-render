import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Html5Audio,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const SYNC_FRAME = 150;

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();

  const enter = interpolate(frame, [0, 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const hue = interpolate(frame, [0, durationInFrames - 1], [205, 325]);
  const hue2 = (hue + 72) % 360;
  const hue3 = (hue + 140) % 360;

  // Linear playhead and orbit — continuous motion makes chunk seams obvious if concat is wrong.
  const playheadX = interpolate(frame, [0, durationInFrames - 1], [80, width - 80]);
  const orbit = (frame / durationInFrames) * Math.PI * 2;
  const orbX = width / 2 + Math.cos(orbit) * 420;
  const orbY = height / 2 + Math.sin(orbit) * 220;
  const rot = frame * 1.2;

  const t = frame / fps;
  const timecode = `${String(Math.floor(t / 60)).padStart(2, '0')}:${(t % 60)
    .toFixed(2)
    .padStart(5, '0')}`;
  const progress = frame / (durationInFrames - 1);
  const syncFlash = interpolate(frame, [SYNC_FRAME, SYNC_FRAME + 12], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 85% 16%) 0%, hsl(${hue2} 80% 26%) 55%, hsl(${hue3} 75% 14%) 100%)`,
        color: 'white',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
      }}
    >
      <Html5Audio src={staticFile('music.wav')} volume={0.7} />
      <Sequence from={SYNC_FRAME}>
        <Html5Audio src={staticFile('sync-hit.wav')} />
      </Sequence>

      <div
        style={{
          position: 'absolute',
          width: 720,
          height: 720,
          borderRadius: '50%',
          left: orbX - 360,
          top: orbY - 360,
          background: `radial-gradient(circle, hsl(${hue2} 90% 60% / 0.45), transparent 68%)`,
          filter: 'blur(8px)',
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          opacity: enter,
          transform: `translateY(${interpolate(enter, [0, 1], [36, 0])}px) scale(${interpolate(enter, [0, 1], [0.88, 1])})`,
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: 'uppercase',
            opacity: 0.75,
            marginBottom: 22,
            fontWeight: 600,
          }}
        >
          Parallel chunk render
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -1.5,
            textAlign: 'center',
            lineHeight: 1.1,
            textShadow: '0 16px 60px rgba(0,0,0,0.35)',
          }}
        >
          Remotion × GitHub Actions
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 32,
            opacity: 0.88,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          1920×1080 · 30fps · 10 seconds · with audio
        </div>
        <div
          style={{
            marginTop: 48,
            width: 96,
            height: 96,
            border: '6px solid rgba(255,255,255,0.35)',
            borderTopColor: 'white',
            borderRadius: 18,
            transform: `rotate(${rot}deg)`,
          }}
        />
      </AbsoluteFill>

      {syncFlash > 0 ? (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(255, 236, 160, ${0.55 * syncFlash})`,
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: 4,
              textTransform: 'uppercase',
              opacity: syncFlash,
              textShadow: '0 8px 32px rgba(0,0,0,0.45)',
            }}
          >
            Sync hit · 5.00s
          </div>
        </AbsoluteFill>
      ) : null}

      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          bottom: 64,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 16,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <div style={{fontSize: 42, fontWeight: 700}}>
            FRAME {String(frame).padStart(3, '0')} / {durationInFrames}
          </div>
          <div style={{fontSize: 36, opacity: 0.9}}>{timecode}</div>
        </div>
        <div
          style={{
            height: 14,
            borderRadius: 99,
            background: 'rgba(255,255,255,0.18)',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              borderRadius: 99,
              background: 'white',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -18,
              left: '50%',
              width: 4,
              height: 50,
              marginLeft: -2,
              background: '#ffe8a0',
              borderRadius: 2,
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: -11,
              left: playheadX - 80,
              width: 36,
              height: 36,
              marginLeft: -18,
              borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 0 0 8px rgba(255,255,255,0.25)',
            }}
          />
        </div>
        <div
          style={{
            marginTop: 14,
            fontSize: 22,
            opacity: 0.7,
            letterSpacing: 0.4,
          }}
        >
          Music bed + 2 kHz sync hit at frame 150 (5.00s). Playhead and counter must stay continuous across chunk joins.
        </div>
      </div>
    </AbsoluteFill>
  );
};
