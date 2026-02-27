import React from 'react';
import {Composition} from 'remotion';
import {BuoyPromoVideo} from './Video';
import {BeforeAfterVideo} from './compositions/BeforeAfterVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BuoyPromo"
        component={BuoyPromoVideo}
        durationInFrames={450}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="BeforeAfter"
        component={BeforeAfterVideo}
        durationInFrames={450}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
