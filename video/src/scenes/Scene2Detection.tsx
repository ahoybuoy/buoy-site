import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../tokens';

const terminalLines = [
  {text: '$ buoy check .', type: 'command', delay: 20},
  {text: 'Scanning components...', type: 'info', delay: 35},
  {text: '', type: 'spacer', delay: 42},
  {text: '  ✕  Button.tsx:12  — hardcoded color #F97316', type: 'error', delay: 45},
  {text: '  ✕  PricingCard.tsx:5  — hardcoded color #1a2744', type: 'error', delay: 55},
  {text: '  ✕  PricingCard.tsx:7  — arbitrary spacing 13px', type: 'error', delay: 65},
  {text: '  ⚠  Nav.tsx:34  — non-token border-radius 6px', type: 'warning', delay: 75},
  {text: '', type: 'spacer', delay: 82},
  {text: '  4 violations found across 3 files', type: 'summary', delay: 85},
];

const lineColor: Record<string, string> = {
  command: colors.buoy,
  info: colors.slate,
  error: colors.critical,
  warning: colors.warning,
  summary: '#fca5a5',
  spacer: 'transparent',
};

export const Scene2Detection: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Logo drop from top
  const logoProgress = spring({
    frame,
    fps,
    config: {damping: 14, stiffness: 180, mass: 1},
  });
  const logoY = interpolate(logoProgress, [0, 1], [-120, 0]);
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  // Terminal slides from left
  const terminalX = interpolate(frame, [18, 50], [-480, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const terminalOpacity = interpolate(frame, [18, 45], [0, 1], {extrapolateRight: 'clamp'});

  // CI check slides from right
  const ciX = interpolate(frame, [80, 110], [480, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const ciOpacity = interpolate(frame, [80, 105], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.navyDark,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.body,
        gap: 32,
      }}
    >
      {/* Logo drops in at top */}
      <div
        style={{
          position: 'absolute',
          top: 48,
          left: '50%',
          transform: `translateX(-50%) translateY(${logoY}px)`,
          opacity: logoOpacity,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span style={{fontSize: 36}}>🛟</span>
        <span
          style={{
            fontFamily: fonts.display,
            fontSize: 28,
            fontWeight: 700,
            color: colors.light,
            letterSpacing: '-0.5px',
          }}
        >
          Buoy
        </span>
      </div>

      {/* Two-column layout: terminal + CI check */}
      <div style={{display: 'flex', gap: 28, alignItems: 'flex-start', marginTop: 32}}>
        {/* Terminal */}
        <div
          style={{
            transform: `translateX(${terminalX}px)`,
            opacity: terminalOpacity,
            width: 460,
            borderRadius: 10,
            overflow: 'hidden',
            border: `1px solid ${colors.navyLight}`,
            boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Title bar */}
          <div
            style={{
              backgroundColor: '#111827',
              padding: '9px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <div style={{width: 11, height: 11, borderRadius: '50%', backgroundColor: '#EF4444'}} />
            <div style={{width: 11, height: 11, borderRadius: '50%', backgroundColor: '#F59E0B'}} />
            <div style={{width: 11, height: 11, borderRadius: '50%', backgroundColor: '#10B981'}} />
            <span style={{marginLeft: 10, fontFamily: fonts.mono, fontSize: 11, color: colors.slateDark}}>
              terminal
            </span>
          </div>

          {/* Terminal body */}
          <div
            style={{
              backgroundColor: '#090e1a',
              padding: '16px 18px',
              fontFamily: fonts.mono,
              fontSize: 12.5,
              lineHeight: '22px',
              minHeight: 220,
            }}
          >
            {terminalLines.map((line, i) => {
              const lineOpacity = interpolate(
                frame,
                [line.delay, line.delay + 8],
                [0, 1],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
              );

              if (line.type === 'spacer') {
                return <div key={i} style={{height: 8}} />;
              }

              return (
                <div
                  key={i}
                  style={{
                    opacity: lineOpacity,
                    color: lineColor[line.type],
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {line.type === 'command' && (
                    <span style={{color: colors.success, marginRight: 6}}>›</span>
                  )}
                  {line.text}
                </div>
              );
            })}

            {/* Scan line glow */}
            {frame >= 35 && frame <= 95 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${colors.buoy}88, transparent)`,
                  top: interpolate(frame, [35, 95], [60, 240], {extrapolateRight: 'clamp'}),
                  opacity: 0.6,
                }}
              />
            )}
          </div>
        </div>

        {/* CI Check card */}
        <div
          style={{
            transform: `translateX(${ciX}px)`,
            opacity: ciOpacity,
            width: 340,
            borderRadius: 10,
            overflow: 'hidden',
            border: `1px solid rgba(239,68,68,0.4)`,
            boxShadow: `0 0 40px rgba(239,68,68,0.12), 0 24px 60px rgba(0,0,0,0.5)`,
            backgroundColor: colors.navy,
          }}
        >
          {/* CI header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: `1px solid rgba(239,68,68,0.2)`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{fontSize: 20}}>🛟</span>
            <div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: 13,
                  color: colors.light,
                }}
              >
                Buoy Design System Check
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: colors.slateDark,
                  marginTop: 2,
                }}
              >
                on PR #247 · feat/ai-pricing-card
              </div>
            </div>
          </div>

          {/* CI status */}
          <div style={{padding: '14px 18px'}}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: colors.critical,
                  boxShadow: `0 0 8px ${colors.critical}`,
                }}
              />
              <span
                style={{
                  fontFamily: fonts.body,
                  fontWeight: 700,
                  fontSize: 14,
                  color: colors.critical,
                }}
              >
                FAILED
              </span>
            </div>

            {/* Violations list */}
            {[
              'Hardcoded colors detected (2)',
              'Arbitrary spacing values (1)',
              'Non-token border-radius (1)',
            ].map((item, i) => {
              const itemOpacity = interpolate(
                frame,
                [95 + i * 8, 110 + i * 8],
                [0, 1],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
              );
              return (
                <div
                  key={i}
                  style={{
                    opacity: itemOpacity,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 0',
                    borderTop: i === 0 ? 'none' : `1px solid rgba(255,255,255,0.05)`,
                    fontSize: 12,
                    color: colors.slate,
                    fontFamily: fonts.body,
                  }}
                >
                  <span style={{color: colors.critical}}>✕</span>
                  {item}
                </div>
              );
            })}

            <div
              style={{
                marginTop: 14,
                padding: '8px 12px',
                borderRadius: 6,
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                fontSize: 12,
                color: '#fca5a5',
                fontFamily: fonts.body,
              }}
            >
              Merge blocked — fix drift violations first
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
