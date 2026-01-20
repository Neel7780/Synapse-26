"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { Fluid } from "@whatisjery/react-fluid-distortion";
import { memo, useEffect, useState } from "react";
import type { FC } from "react";

interface FluidCanvasProps {
  className?: string;
}

const FluidCanvas: FC<FluidCanvasProps> = memo(function FluidCanvas({ className }) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  // Pause rendering when tab is not visible to save resources
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Check for reduced motion preference and low-power devices
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Check if device might be low-powered (rough heuristic)
    const isLowPowerDevice = 
      navigator.hardwareConcurrency !== undefined && 
      navigator.hardwareConcurrency <= 2;

    if (prefersReducedMotion || isLowPowerDevice) {
      setShouldRender(false);
    }
  }, []);

  // Don't render the canvas if user prefers reduced motion or on low-power devices
  if (!shouldRender) {
    return null;
  }

  return (
    <Canvas
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9990,
        mixBlendMode: "lighten",
        pointerEvents: "none",
      }}
      dpr={[1, 1.5]} // Reduced max DPR for better performance
      frameloop={isVisible ? "always" : "never"} // Pause when tab not visible
      gl={{
        powerPreference: "high-performance",
        antialias: false, // Disable for better performance
        stencil: false,
        depth: false,
      }}
    >
      <EffectComposer multisampling={0}>
        <Fluid
          rainbow={false}
          fluidColor="#D2042D"
          intensity={6} // Slightly reduced for performance
          force={1.5}
          distortion={1.5}
          radius={0.18}
        />
      </EffectComposer>
    </Canvas>
  );
});

export default FluidCanvas;
