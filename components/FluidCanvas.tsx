"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { Fluid } from "@whatisjery/react-fluid-distortion";
import { memo, useEffect, useState, useRef, useCallback } from "react";
import type { FC } from "react";
import gsap from "gsap";

interface FluidCanvasProps {
  className?: string;
}

// Enhanced fluid controller that responds to scroll and mouse velocity
function FluidController() {
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0, time: Date.now() });
  const scrollVelocityRef = useRef(0);
  const lastScrollRef = useRef({ y: 0, time: Date.now() });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = Math.max(1, now - lastMouseRef.current.time);
      
      velocityRef.current = {
        x: (e.clientX - lastMouseRef.current.x) / dt,
        y: (e.clientY - lastMouseRef.current.y) / dt,
      };
      
      lastMouseRef.current = { x: e.clientX, y: e.clientY, time: now };
    };

    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(1, now - lastScrollRef.current.time);
      const scrollY = window.scrollY;
      
      scrollVelocityRef.current = Math.abs(scrollY - lastScrollRef.current.y) / dt;
      lastScrollRef.current = { y: scrollY, time: now };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}

const FluidCanvas: FC<FluidCanvasProps> = memo(function FluidCanvas({ className }) {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const [intensity, setIntensity] = useState(6);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // GSAP-enhanced scroll-based intensity modulation
  useEffect(() => {
    if (!shouldRender) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateIntensity = () => {
      const scrollY = window.scrollY;
      const velocity = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;

      // Increase intensity based on scroll velocity
      const newIntensity = Math.min(12, 6 + velocity * 0.05);
      
      gsap.to({ value: intensity }, {
        value: newIntensity,
        duration: 0.3,
        ease: "power2.out",
        onUpdate: function() {
          setIntensity(this.targets()[0].value);
        },
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateIntensity);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldRender, intensity]);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current || !shouldRender) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: 1.5, 
        ease: "power2.out",
        delay: 0.5,
      }
    );
  }, [shouldRender]);

  // Don't render the canvas if user prefers reduced motion or on low-power devices
  if (!shouldRender) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{ opacity: 0 }}
    >
      <Canvas
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 9990,
          mixBlendMode: "lighten",
          pointerEvents: "none",
        }}
        dpr={[1, 1.5]}
        frameloop={isVisible ? "always" : "never"}
        gl={{
          powerPreference: "high-performance",
          antialias: false,
          stencil: false,
          depth: false,
        }}
      >
        <FluidController />
        <EffectComposer multisampling={0}>
          <Fluid
            rainbow={false}
            fluidColor="#D2042D"
            intensity={intensity}
            force={1.8}
            distortion={1.6}
            radius={0.2}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
});

export default FluidCanvas;
