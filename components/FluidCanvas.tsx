"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { Fluid } from "@whatisjery/react-fluid-distortion";

export default function FluidCanvas() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas style={{ width: "100%", height: "100%" }}>
                <EffectComposer>
                    <Fluid />
                </EffectComposer>
            </Canvas>
        </div>
    );
}
