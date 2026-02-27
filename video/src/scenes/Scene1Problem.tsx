import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, fonts} from '../tokens';

const codeLines = [
  {text: '// AI generated component', type: 'comment'},
  {text: 'function PricingCard() {', type: 'code'},
  {text: '  return (', type: 'code'},
  {text: '    <div style={{', type: 'code'},
  {text: "      color: '#F97316',", type: 'bad', violation: 'Hardcoded color'},
  {text: "      backgroundColor: '#1a2744',", type: 'bad', violation: 'Hardcoded color'},
  {text: "      padding: '13px 24px',", type: 'bad', violation: 'Arbitrary spacing'},
  {text: '    }}>', type: 'code'},
  {text: '      Subscribe', type: 'code'},
  {text: '    </div>', type: 'code'},
  {text: '  )', type: 'code'},
  {text: '}', type: 'code'},
];

const lineColors: Record<string, string> = {
  comment: colors.slateDark,
  code: colors.lightMuted,
  bad: '#fca5a5',
};

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const bgOpacity = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});

  const windowY = interpolate(frame, [15, 45], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const windowOpacity = interpolate(frame, [15, 40], [0, 1], {extrapolateRight: 'clamp'});

  const headlineOpacity = interpolate(frame, [110, 130], [0, 1], {extrapolateRight: 'clamp'});
  const headlineY = interpolate(frame, [110, 130], [15, 0], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.navyDark,
        opacity: bgOpacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fonts.body,
      }}
    >
      {/* Code window */}
      <div
        style={{
          transform: `translateY(${windowY}px)`,
          opacity: windowOpacity,
          width: 680,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
          border: `1px solid ${colors.navyLight}`,
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
          <span
            style={{
              marginLeft: 12,
              fontFamily: fonts.mono,
              fontSize: 12,
              color: colors.slateDark,
            }}
          >
            PricingCard.tsx
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              color: colors.buoy,
              fontFamily: fonts.body,
              fontWeight: 600,
              backgroundColor: 'rgba(249,115,22,0.12)',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            AI generated
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
          {codeLines.map((line, i) => {
            const lineDelay = 30 + i * 6;
            const lineOpacity = interpolate(frame, [lineDelay, lineDelay + 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const lineX = interpolate(frame, [lineDelay, lineDelay + 10], [-8, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            const violationOpacity = interpolate(frame, [90, 105], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={i}
                style={{
                  opacity: lineOpacity,
                  transform: `translateX(${lineX}px)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  position: 'relative',
                  backgroundColor:
                    line.type === 'bad' ? 'rgba(239,68,68,0.08)' : 'transparent',
                  margin: '0 -24px',
                  padding: '0 24px',
                }}
              >
                {/* Line number */}
                <span style={{color: colors.slateDark, width: 24, textAlign: 'right', flexShrink: 0, fontSize: 12}}>
                  {i + 1}
                </span>

                {/* Code text */}
                <span style={{color: lineColors[line.type], flex: 1}}>
                  {line.text}
                </span>

                {/* Violation badge */}
                {line.type === 'bad' && (
                  <span
                    style={{
                      opacity: violationOpacity,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      color: colors.critical,
                      backgroundColor: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 4,
                      padding: '1px 6px',
                      flexShrink: 0,
                      fontFamily: fonts.body,
                    }}
                  >
                    ✕ {line.violation}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Headline below */}
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: fonts.display,
            fontSize: 28,
            fontWeight: 600,
            color: colors.light,
            margin: 0,
          }}
        >
          Every AI commit introduces design drift.
        </p>
      </div>
    </AbsoluteFill>
  );
};
