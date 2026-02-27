import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {colors, fonts} from '../tokens';

// ─── helpers ────────────────────────────────────────────────────────────────

const fadeIn = (frame: number, start: number, duration = 14) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const slideUp = (frame: number, start: number, duration = 14, dist = 18) =>
  interpolate(frame, [start, start + duration], [dist, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

// ─── shared code window ─────────────────────────────────────────────────────

const badCode = [
  {text: '// AI generated component', type: 'comment'},
  {text: 'function HeroButton() {', type: 'code'},
  {text: '  return <button style={{', type: 'code'},
  {text: "    color: '#F97316',", type: 'bad'},
  {text: "    background: '#1a2744',", type: 'bad'},
  {text: "    padding: '13px 22px',", type: 'bad'},
  {text: '  }}>Get Started</button>', type: 'code'},
  {text: '}', type: 'code'},
];

const lineColor: Record<string, string> = {
  comment: '#4b5563',
  code: '#9ca3af',
  bad: '#fca5a5',
};

const CodeWindow: React.FC<{
  frame: number;
  startFrame: number;
  showViolations: boolean;
  violationStart: number;
  filename?: string;
  scale?: number;
}> = ({frame, startFrame, showViolations, violationStart, filename = 'HeroButton.tsx', scale = 1}) => {
  const opacity = fadeIn(frame, startFrame);
  const y = slideUp(frame, startFrame, 14, 24);

  return (
    <div
      style={{
        transform: `translateY(${y}px) scale(${scale})`,
        opacity,
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid rgba(255,255,255,0.08)`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        transformOrigin: 'top center',
      }}
    >
      {/* title bar */}
      <div
        style={{
          backgroundColor: '#111827',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {['#EF4444', '#F59E0B', '#10B981'].map((c, i) => (
          <div key={i} style={{width: 10, height: 10, borderRadius: '50%', backgroundColor: c}} />
        ))}
        <span style={{marginLeft: 10, fontFamily: fonts.mono, fontSize: 11, color: '#4b5563'}}>
          {filename}
        </span>
        <span style={{marginLeft: 'auto', fontSize: 10, color: colors.buoy, fontFamily: fonts.body, fontWeight: 600, backgroundColor: 'rgba(249,115,22,0.1)', padding: '1px 6px', borderRadius: 3}}>
          AI generated
        </span>
      </div>

      {/* code */}
      <div style={{backgroundColor: '#090e1a', padding: '14px 16px', fontFamily: fonts.mono, fontSize: 12, lineHeight: '22px'}}>
        {badCode.map((line, i) => {
          const lOpacity = fadeIn(frame, startFrame + 5 + i * 5);
          const violationOpacity = showViolations ? fadeIn(frame, violationStart + i * 3) : 0;
          return (
            <div
              key={i}
              style={{
                opacity: lOpacity,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: line.type === 'bad' ? 'rgba(239,68,68,0.07)' : 'transparent',
                margin: '0 -16px',
                padding: '0 16px',
              }}
            >
              <span style={{color: '#374151', width: 18, textAlign: 'right', flexShrink: 0, fontSize: 10}}>{i + 1}</span>
              <span style={{color: lineColor[line.type], flex: 1}}>{line.text}</span>
              {line.type === 'bad' && (
                <span style={{opacity: violationOpacity, fontSize: 10, color: colors.critical, backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 3, padding: '0 5px', flexShrink: 0, fontFamily: fonts.body}}>
                  ✕ hardcoded
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── left panel: BEFORE ─────────────────────────────────────────────────────

const BeforePanel: React.FC<{frame: number}> = ({frame}) => {
  const labelOpacity = fadeIn(frame, 5);

  // merged badge (no checks)
  const mergedOpacity = fadeIn(frame, 120);
  const mergedY = slideUp(frame, 120, 12);

  // consequence items
  const items = [
    {icon: '💬', text: '"Button color is wrong again"', delay: 165},
    {icon: '❌', text: 'Design review rejected', delay: 185},
    {icon: '⏱', text: '3 hrs of manual fixes', delay: 205},
    {icon: '📈', text: 'Design debt: +4 violations', delay: 225},
  ];

  // "WHO MERGED THIS" comment
  const ragOpacity = fadeIn(frame, 245);
  const ragY = slideUp(frame, 245, 14);

  return (
    <div style={{width: 640, height: 720, backgroundColor: '#1a0f0f', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 32px', boxSizing: 'border-box'}}>
      {/* subtle red noise overlay */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.08) 0%, transparent 60%)', pointerEvents: 'none'}} />

      {/* BEFORE label */}
      <div style={{marginTop: 36, marginBottom: 20, opacity: labelOpacity, textAlign: 'center'}}>
        <span style={{fontFamily: fonts.display, fontSize: 13, fontWeight: 700, color: '#ef4444', letterSpacing: '3px', textTransform: 'uppercase'}}>
          ✕ Before Buoy
        </span>
      </div>

      {/* code window */}
      <CodeWindow
        frame={frame}
        startFrame={40}
        showViolations={false}
        violationStart={999}
        scale={0.9}
      />

      {/* "No checks configured" */}
      <div style={{opacity: fadeIn(frame, 100), marginTop: 12, display: 'flex', alignItems: 'center', gap: 6}}>
        <span style={{fontSize: 11, color: '#6b7280', fontFamily: fonts.body}}>No CI checks configured</span>
        <span style={{fontSize: 11, color: '#4b5563'}}>·</span>
        <span style={{fontSize: 11, color: '#6b7280', fontFamily: fonts.body}}>No design validation</span>
      </div>

      {/* Merged badge */}
      <div
        style={{
          marginTop: 14,
          opacity: mergedOpacity,
          transform: `translateY(${mergedY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 8,
          padding: '8px 16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0}} />
        <div>
          <div style={{fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: '#f1f5f9'}}>PR #247 merged</div>
          <div style={{fontFamily: fonts.body, fontSize: 11, color: '#6b7280'}}>feat/ai-hero-button · no checks ran</div>
        </div>
        <span style={{marginLeft: 'auto', fontSize: 18}}>⚠️</span>
      </div>

      {/* Consequence items */}
      <div style={{width: '100%', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8}}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              opacity: fadeIn(frame, item.delay),
              transform: `translateY(${slideUp(frame, item.delay, 12)})`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              backgroundColor: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 6,
              padding: '7px 12px',
              fontFamily: fonts.body,
              fontSize: 12,
              color: '#fca5a5',
            }}
          >
            <span style={{fontSize: 14}}>{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>

      {/* Frustrated Slack-style message */}
      <div
        style={{
          marginTop: 16,
          opacity: ragOpacity,
          transform: `translateY(${ragY}px)`,
          backgroundColor: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          padding: '10px 14px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5}}>
          <div style={{width: 22, height: 22, borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10}}>👩</div>
          <span style={{fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: '#e2e8f0'}}>Sarah (Design)</span>
          <span style={{fontFamily: fonts.body, fontSize: 10, color: '#4b5563'}}>2:14 PM</span>
        </div>
        <p style={{fontFamily: fonts.body, fontSize: 12, color: '#fca5a5', margin: 0}}>
          WHO merged this?? The buttons are completely off-brand AGAIN 🤦‍♀️
        </p>
      </div>
    </div>
  );
};

// ─── right panel: WITH BUOY ──────────────────────────────────────────────────

const terminalOutput = [
  {text: '$ buoy check .', color: colors.buoy, delay: 100},
  {text: 'Scanning 3 files...', color: colors.slate, delay: 112},
  {text: '  ✕  HeroButton.tsx:4  hardcoded color', color: colors.critical, delay: 124},
  {text: '  ✕  HeroButton.tsx:5  hardcoded color', color: colors.critical, delay: 133},
  {text: '  ✕  HeroButton.tsx:6  arbitrary spacing', color: colors.warning, delay: 142},
  {text: '', color: 'transparent', delay: 150},
  {text: '  3 violations · merge blocked', color: '#fca5a5', delay: 152},
];

const AfterPanel: React.FC<{frame: number}> = ({frame}) => {
  const labelOpacity = fadeIn(frame, 5);

  // PR blocked badge
  const blockedOpacity = fadeIn(frame, 160);
  const blockedY = slideUp(frame, 160, 12);

  // fixed code items
  const fixItems = [
    {delay: 215, text: 'className="text-buoy"', badge: 'Token ✓'},
    {delay: 230, text: 'className="bg-navy-dark"', badge: 'Token ✓'},
    {delay: 245, text: 'className="px-6 py-3"', badge: 'Scale ✓'},
  ];

  // CI passed
  const ciOpacity = fadeIn(frame, 290);
  const ciY = slideUp(frame, 290, 12);

  // Happy message
  const happyOpacity = fadeIn(frame, 330);
  const happyY = slideUp(frame, 330, 14);

  return (
    <div style={{width: 640, height: 720, backgroundColor: colors.navyDark, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 32px', boxSizing: 'border-box'}}>
      {/* orange glow top */}
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 55%)', pointerEvents: 'none'}} />

      {/* WITH BUOY label */}
      <div style={{marginTop: 36, marginBottom: 20, opacity: labelOpacity, textAlign: 'center', display: 'flex', alignItems: 'center', gap: 8}}>
        <span style={{fontSize: 16}}>🛟</span>
        <span style={{fontFamily: fonts.display, fontSize: 13, fontWeight: 700, color: colors.buoy, letterSpacing: '3px', textTransform: 'uppercase'}}>
          With Buoy
        </span>
      </div>

      {/* same code window, violations revealed */}
      <CodeWindow
        frame={frame}
        startFrame={40}
        showViolations
        violationStart={90}
        scale={0.9}
      />

      {/* terminal */}
      <div
        style={{
          opacity: fadeIn(frame, 95),
          transform: `translateY(${slideUp(frame, 95, 12)})`,
          marginTop: 12,
          width: '100%',
          borderRadius: 8,
          overflow: 'hidden',
          border: `1px solid ${colors.navyLight}`,
          backgroundColor: '#090e1a',
        }}
      >
        <div style={{backgroundColor: '#111827', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6}}>
          {['#EF4444','#F59E0B','#10B981'].map((c,i) => <div key={i} style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: c}} />)}
          <span style={{fontFamily: fonts.mono, fontSize: 10, color: '#4b5563', marginLeft: 8}}>CI · Buoy check</span>
        </div>
        <div style={{padding: '10px 14px', fontFamily: fonts.mono, fontSize: 11, lineHeight: '19px'}}>
          {terminalOutput.map((line, i) => (
            <div key={i} style={{opacity: fadeIn(frame, line.delay), color: line.color}}>
              {line.text || '\u00A0'}
            </div>
          ))}
        </div>
      </div>

      {/* Merge blocked */}
      <div
        style={{
          marginTop: 12,
          opacity: blockedOpacity,
          transform: `translateY(${blockedY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          backgroundColor: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: 8,
          padding: '8px 16px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.critical, flexShrink: 0, boxShadow: `0 0 6px ${colors.critical}`}} />
        <div>
          <div style={{fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: '#f1f5f9'}}>Merge blocked 🛟</div>
          <div style={{fontFamily: fonts.body, fontSize: 11, color: colors.slateDark}}>Fix 3 drift violations before merging</div>
        </div>
      </div>

      {/* Developer fixes — token replacements */}
      <div style={{width: '100%', marginTop: 14}}>
        <div style={{fontFamily: fonts.body, fontSize: 11, color: colors.slateDark, marginBottom: 6, opacity: fadeIn(frame, 208)}}>
          Developer replaces hardcoded values:
        </div>
        {fixItems.map((item, i) => (
          <div
            key={i}
            style={{
              opacity: fadeIn(frame, item.delay),
              transform: `translateY(${slideUp(frame, item.delay, 10)})`,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: 'rgba(16,185,129,0.06)',
              borderLeft: `2px solid ${colors.success}`,
              padding: '5px 10px',
              marginBottom: 4,
              borderRadius: '0 4px 4px 0',
              fontFamily: fonts.mono,
              fontSize: 11,
              color: '#86efac',
            }}
          >
            <span style={{flex: 1}}>{item.text}</span>
            <span style={{fontFamily: fonts.body, fontSize: 10, color: colors.success, backgroundColor: 'rgba(16,185,129,0.12)', padding: '1px 5px', borderRadius: 3}}>{item.badge}</span>
          </div>
        ))}
      </div>

      {/* CI Passed */}
      <div
        style={{
          marginTop: 12,
          opacity: ciOpacity,
          transform: `translateY(${ciY}px)`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          backgroundColor: 'rgba(16,185,129,0.08)',
          border: `1px solid rgba(16,185,129,0.3)`,
          borderRadius: 8,
          padding: '8px 14px',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 0 24px rgba(16,185,129,0.08)',
        }}
      >
        <span style={{fontSize: 16}}>🛟</span>
        <div style={{flex: 1}}>
          <div style={{fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: colors.light}}>Buoy Design Check</div>
          <div style={{fontFamily: fonts.body, fontSize: 10, color: colors.slateDark}}>0 violations · ready to merge</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 5}}>
          <div style={{width: 8, height: 8, borderRadius: '50%', backgroundColor: colors.success, boxShadow: `0 0 8px ${colors.success}`}} />
          <span style={{fontFamily: fonts.body, fontWeight: 700, fontSize: 13, color: colors.success}}>PASSED</span>
        </div>
      </div>

      {/* Happy designer message */}
      <div
        style={{
          marginTop: 12,
          opacity: happyOpacity,
          transform: `translateY(${happyY}px)`,
          backgroundColor: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 8,
          padding: '10px 14px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5}}>
          <div style={{width: 22, height: 22, borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10}}>👩</div>
          <span style={{fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: '#e2e8f0'}}>Sarah (Design)</span>
          <span style={{fontFamily: fonts.body, fontSize: 10, color: '#4b5563'}}>2:14 PM</span>
        </div>
        <p style={{fontFamily: fonts.body, fontSize: 12, color: '#86efac', margin: 0}}>
          Love that Buoy caught those before merge. Design system looking 🔥
        </p>
      </div>
    </div>
  );
};

// ─── outro ───────────────────────────────────────────────────────────────────

const Outro: React.FC<{frame: number}> = ({frame}) => {
  const {fps} = useVideoConfig();

  const bgOpacity = fadeIn(frame, 0, 20);

  const logoSpring = spring({frame: frame - 5, fps, config: {damping: 16, stiffness: 200}});
  const logoScale = interpolate(logoSpring, [0, 1], [0.6, 1]);

  const taglineOpacity = fadeIn(frame, 25);
  const taglineY = slideUp(frame, 25, 14);

  const urlOpacity = fadeIn(frame, 42);
  const urlGlow = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2);

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, #0d1b35 0%, #1a2744 40%, #1e3a5f 70%, #0f3a5c 100%)`,
        opacity: bgOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
      }}
    >
      <div style={{transform: `scale(${logoScale})`, opacity: fadeIn(frame, 5), textAlign: 'center'}}>
        <div style={{filter: `drop-shadow(0 0 24px rgba(249,115,22,0.6))`, marginBottom: 12}}>
          <span style={{fontSize: 72, lineHeight: 1}}>🛟</span>
        </div>
        <span style={{fontFamily: fonts.display, fontSize: 56, fontWeight: 800, color: colors.light, letterSpacing: '-1.5px'}}>
          Buoy
        </span>
      </div>

      <div style={{opacity: taglineOpacity, transform: `translateY(${taglineY}px)`, marginTop: 16, textAlign: 'center'}}>
        <p style={{fontFamily: fonts.display, fontSize: 20, fontWeight: 500, color: colors.lightMuted, margin: 0}}>
          Catch design drift{' '}
          <span style={{color: colors.buoy, fontWeight: 700}}>before it ships</span>
        </p>
      </div>

      <div style={{opacity: urlOpacity, marginTop: 20}}>
        <span style={{fontFamily: fonts.mono, fontSize: 16, color: colors.buoy, textShadow: `0 0 ${14 + urlGlow * 10}px rgba(249,115,22,${0.4 + urlGlow * 0.3})`}}>
          getbuoy.io
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ─── main composition ────────────────────────────────────────────────────────

export const BeforeAfterVideo: React.FC = () => {
  const frame = useCurrentFrame();

  // Divider glow pulses subtly
  const dividerGlow = 0.4 + 0.15 * Math.sin((frame / 30) * Math.PI);

  // Outro takes over at frame 380
  const outroFrame = frame - 380;
  const outroOpacity = interpolate(frame, [375, 400], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{backgroundColor: '#0d0d0d', overflow: 'hidden'}}>
      {/* Split screen */}
      <div style={{display: 'flex', width: 1280, height: 720}}>
        <BeforePanel frame={frame} />
        <AfterPanel frame={frame} />
      </div>

      {/* Center divider */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 639,
          width: 2,
          background: `linear-gradient(180deg, rgba(239,68,68,${dividerGlow}) 0%, rgba(249,115,22,${dividerGlow + 0.2}) 50%, rgba(16,185,129,${dividerGlow}) 100%)`,
          boxShadow: `0 0 12px rgba(249,115,22,${dividerGlow * 0.6})`,
        }}
      />

      {/* Outro overlay */}
      {frame >= 370 && (
        <div style={{position: 'absolute', inset: 0, opacity: outroOpacity}}>
          <Outro frame={outroFrame} />
        </div>
      )}
    </AbsoluteFill>
  );
};
