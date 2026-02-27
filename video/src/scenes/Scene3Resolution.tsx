import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../tokens';

const cleanCodeLines = [
  {text: '// Design-system compliant', type: 'comment'},
  {text: 'function PricingCard() {', type: 'code'},
  {text: '  return (', type: 'code'},
  {text: '    <div className={', type: 'code'},
  {text: '      "text-buoy bg-navy-dark', type: 'good', badge: 'Token ✓'},
  {text: '       px-6 py-3"', type: 'good', badge: 'Scale ✓'},
  {text: '    }>', type: 'code'},
  {text: '      Subscribe', type: 'code'},
  {text: '    </div>', type: 'code'},
  {text: '  )', type: 'code'},
  {text: '}', type: 'code'},
];

const lineColors: Record<string, string> = {
  comment: colors.slateDark,
  code: colors.lightMuted,
  good: '#86efac',
};

export const Scene3Resolution: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Window entrance
  const windowOpacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const windowY = interpolate(frame, [0, 20], [20, 0], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  // CI passed card
  const ciOpacity = interpolate(frame, [55, 75], [0, 1], {extrapolateRight: 'clamp'});
  const ciY = interpolate(frame, [55, 75], [20, 0], {
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  // Success headline
  const headlineOpacity = interpolate(frame, [75, 90], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.navyDark,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.body,
        gap: 28,
      }}
    >
      {/* Code window (clean) */}
      <div
        style={{
          transform: `translateY(${windowY}px)`,
          opacity: windowOpacity,
          width: 620,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: `0 32px 80px rgba(0,0,0,0.5), 0 0 60px rgba(16,185,129,0.08)`,
          border: `1px solid rgba(16,185,129,0.3)`,
        }}
      >
        {/* Title bar */}
        <div
          style={{
            backgroundColor: '#111827',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#EF4444'}} />
          <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#F59E0B'}} />
          <div style={{width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10B981'}} />
          <span style={{marginLeft: 12, fontFamily: fonts.mono, fontSize: 12, color: colors.slateDark}}>
            PricingCard.tsx
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: colors.success,
              fontFamily: fonts.body,
              fontWeight: 600,
              backgroundColor: 'rgba(16,185,129,0.12)',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            drift-free
          </span>
        </div>

        {/* Code body */}
        <div
          style={{
            backgroundColor: '#0d1117',
            padding: '20px 24px',
            fontFamily: fonts.mono,
            fontSize: 14,
            lineHeight: '26px',
          }}
        >
          {cleanCodeLines.map((line, i) => {
            const lineDelay = i * 5;
            const lineOpacity = interpolate(frame, [lineDelay, lineDelay + 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            const badgeOpacity = interpolate(frame, [35, 50], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={i}
                style={{
                  opacity: lineOpacity,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: line.type === 'good' ? 'rgba(16,185,129,0.06)' : 'transparent',
                  margin: '0 -24px',
                  padding: '0 24px',
                }}
              >
                <span style={{color: colors.slateDark, width: 24, textAlign: 'right', flexShrink: 0, fontSize: 12}}>
                  {i + 1}
                </span>
                <span style={{color: lineColors[line.type], flex: 1}}>{line.text}</span>

                {line.type === 'good' && line.badge && (
                  <span
                    style={{
                      opacity: badgeOpacity,
                      fontSize: 11,
                      color: colors.success,
                      backgroundColor: 'rgba(16,185,129,0.12)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      borderRadius: 4,
                      padding: '1px 6px',
                      flexShrink: 0,
                      fontFamily: fonts.body,
                    }}
                  >
                    {line.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CI Passed card */}
      <div
        style={{
          transform: `translateY(${ciY}px)`,
          opacity: ciOpacity,
          width: 620,
          borderRadius: 10,
          border: `1px solid rgba(16,185,129,0.4)`,
          backgroundColor: colors.navy,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: `0 0 40px rgba(16,185,129,0.1)`,
        }}
      >
        <span style={{fontSize: 22}}>🛟</span>
        <div style={{flex: 1}}>
          <div
            style={{
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 14,
              color: colors.light,
            }}
          >
            Buoy Design System Check
          </div>
          <div style={{fontSize: 12, color: colors.slateDark, marginTop: 2}}>
            PR #247 · feat/ai-pricing-card
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: colors.success,
              boxShadow: `0 0 10px ${colors.success}`,
            }}
          />
          <span
            style={{
              fontFamily: fonts.body,
              fontWeight: 700,
              fontSize: 14,
              color: colors.success,
            }}
          >
            PASSED
          </span>
        </div>
      </div>

      {/* Success headline */}
      <div
        style={{
          opacity: headlineOpacity,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: 22,
            fontWeight: 600,
            color: colors.light,
            margin: 0,
          }}
        >
          Design system enforced. Every time.
        </p>
      </div>
    </AbsoluteFill>
  );
};
