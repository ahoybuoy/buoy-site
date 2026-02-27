import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Scene1Problem} from './scenes/Scene1Problem';
import {Scene2Detection} from './scenes/Scene2Detection';
import {Scene3Resolution} from './scenes/Scene3Resolution';
import {Scene4Brand} from './scenes/Scene4Brand';

// 15 seconds @ 30fps = 450 frames
// Scene 1: Problem    — frames 0–150   (5s)
// Scene 2: Detection  — frames 140–270 (4s, overlaps 10 frames for crossfade)
// Scene 3: Resolution — frames 260–360 (3s, overlaps 10 frames)
// Scene 4: Brand      — frames 350–450 (3s, overlaps 10 frames)

const CrossFade: React.FC<{
  startFrame: number;
  duration?: number;
  children: React.ReactNode;
}> = ({startFrame, duration = 12, children}) => {
  const frame = useCurrentFrame();
  const globalFrame = frame; // within this sequence, frame is local

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: interpolate(globalFrame, [0, duration], [0, 1], {extrapolateRight: 'clamp'}),
      }}
    >
      {children}
    </div>
  );
};

export const BuoyPromoVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Scene 1: Problem (0–155) */}
      <Sequence from={0} durationInFrames={155}>
        <Scene1Problem />
      </Sequence>

      {/* Scene 2: Detection (143–275) — crossfades out scene 1 */}
      <Sequence from={143} durationInFrames={132}>
        <CrossFade startFrame={143}>
          <Scene2Detection />
        </CrossFade>
      </Sequence>

      {/* Scene 3: Resolution (263–365) */}
      <Sequence from={263} durationInFrames={102}>
        <CrossFade startFrame={263}>
          <Scene3Resolution />
        </CrossFade>
      </Sequence>

      {/* Scene 4: Brand (353–450) */}
      <Sequence from={353} durationInFrames={97}>
        <CrossFade startFrame={353}>
          <Scene4Brand />
        </CrossFade>
      </Sequence>
    </AbsoluteFill>
  );
};
