import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../tokens';

const WaveLayer: React.FC<{
  frame: number;
  speed: number;
  opacity: number;
  color: string;
  yOffset: number;
  amplitude: number;
}> = ({frame, speed, opacity, color, yOffset, amplitude}) => {
  const width = 1280;
  const height = 720;
  const segments = 20;
  const offset = (frame * speed) % width;

  const points = Array.from({length: segments + 2}, (_, i) => {
    const x = (i / segments) * width - offset;
    const y = yOffset + Math.sin((i / segments) * Math.PI * 4 + frame * 0.05) * amplitude;
    return `${x},${y}`;
  });

  const firstX = (-offset).toString();
  const lastX = (width - offset + width / segments).toString();

  const pathD = `M ${firstX},${height} L ${points.join(' L ')} L ${lastX},${height} Z`;

  return (
    <svg
      style={{position: 'absolute', inset: 0, opacity}}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={pathD} fill={color} />
      {/* Second pass for seamless loop */}
      <path
        d={pathD.replace(new RegExp(firstX, 'g'), (Number(firstX) + width).toString())}
        fill={color}
      />
    </svg>
  );
};

export const Scene4Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Background gradient fade in
  const bgOpacity = interpolate(frame, [0, 25], [0, 1], {extrapolateRight: 'clamp'});

  // Stars twinkle
  const stars = Array.from({length: 40}, (_, i) => ({
    x: (i * 127 + 53) % 1280,
    y: (i * 83 + 19) % 340,
    size: 1 + (i % 3),
    phase: i * 0.4,
  }));

  // Logo scale-in with spring
  const logoSpring = spring({
    frame: frame - 10,
    fps,
    config: {damping: 16, stiffness: 200, mass: 0.8},
  });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(frame, [10, 28], [0, 1], {extrapolateRight: 'clamp'});

  // Tagline fade + slide up
  const taglineOpacity = interpolate(frame, [35, 55], [0, 1], {extrapolateRight: 'clamp'});
  const taglineY = interpolate(frame, [35, 55], [16, 0], {extrapolateRight: 'clamp'});

  // URL fade + glow pulse
  const urlOpacity = interpolate(frame, [55, 72], [0, 1], {extrapolateRight: 'clamp'});
  const urlGlow = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2);

  // Wave entrance
  const waveOpacity = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});

  // Emoji ring animation
  const ringScale = 1 + 0.04 * Math.sin((frame / fps) * Math.PI * 1.5);

  return (
    <AbsoluteFill style={{overflow: 'hidden', fontFamily: fonts.body}}>
      {/* Sky gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: bgOpacity,
          background: `linear-gradient(180deg,
            #0d1b35 0%,
            #1a2744 30%,
            #1e3a5f 55%,
            #1b4f7a 70%,
            #174d72 85%,
            #0f3a5c 100%
          )`,
        }}
      />

      {/* Stars */}
      <div style={{position: 'absolute', inset: 0, opacity: bgOpacity}}>
        {stars.map((star, i) => {
          const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.05 + star.phase));
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                borderRadius: '50%',
                backgroundColor: 'white',
                opacity: twinkle,
                boxShadow: star.size > 2 ? '0 0 4px rgba(255,255,255,0.8)' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Ocean waves */}
      <div style={{position: 'absolute', inset: 0, opacity: waveOpacity}}>
        <WaveLayer
          frame={frame}
          speed={1.2}
          opacity={0.5}
          color="#0f3a5c"
          yOffset={510}
          amplitude={28}
        />
        <WaveLayer
          frame={frame}
          speed={0.8}
          opacity={0.7}
          color="#174d72"
          yOffset={530}
          amplitude={22}
        />
        <WaveLayer
          frame={frame}
          speed={1.8}
          opacity={0.9}
          color="#1b4f7a"
          yOffset={548}
          amplitude={18}
        />
        {/* Ocean floor */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 172,
            background: 'linear-gradient(180deg, transparent 0%, #0f3a5c 40%, #091a2e 100%)',
          }}
        />
      </div>

      {/* Horizon glow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: 490,
          width: 600,
          height: 120,
          background: `radial-gradient(ellipse at center, rgba(249,115,22,0.18) 0%, transparent 70%)`,
          opacity: bgOpacity,
        }}
      />

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 80,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              transform: `scale(${ringScale})`,
              filter: `drop-shadow(0 0 24px rgba(249,115,22,0.6)) drop-shadow(0 0 48px rgba(249,115,22,0.3))`,
            }}
          >
            <span style={{fontSize: 92, lineHeight: 1}}>🛟</span>
          </div>

          <span
            style={{
              fontFamily: fonts.display,
              fontSize: 72,
              fontWeight: 800,
              color: colors.light,
              letterSpacing: '-2px',
              lineHeight: 1,
            }}
          >
            Buoy
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 24,
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: fonts.display,
              fontSize: 26,
              fontWeight: 500,
              color: colors.lightMuted,
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            Catch design drift{' '}
            <span
              style={{
                color: colors.buoy,
                fontWeight: 700,
              }}
            >
              before it ships
            </span>
          </p>
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: 28,
            opacity: urlOpacity,
          }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 18,
              color: colors.buoy,
              letterSpacing: '0.5px',
              textShadow: `0 0 ${16 + urlGlow * 12}px rgba(249,115,22,${0.4 + urlGlow * 0.3})`,
            }}
          >
            getbuoy.io
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
