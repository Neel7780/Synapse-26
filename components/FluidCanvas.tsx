"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { Fluid } from "@whatisjery/react-fluid-distortion";
import type { FC } from "react";

interface FluidCanvasProps {
  className?: string;
}

const FluidCanvas: FC<FluidCanvasProps> = ({ className }) => {
    return (
        <Canvas
            className={className}
            style={{
                position: "fixed",
                inset: 0,
                width: "100vw",
                height: "100dvh",

        zIndex: 9999,
        mixBlendMode: "lighten",
        pointerEvents: "none",
      }}
      dpr={[1, 2]}
    >
      <EffectComposer>
        <Fluid
          rainbow={false}
          fluidColor="#D2042D" // joker pink-red
          intensity={8}
          force={2}
          distortion={1.8}
          radius={0.2}
          //   velocityDissipation={0.985}
          //   densityDissipation={0.92}
        />
      </EffectComposer>
    </Canvas>
  );
};

export default FluidCanvas;
