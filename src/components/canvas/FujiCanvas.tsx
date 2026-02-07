'use client';

import { useFilmStore } from "@/store/filmStore";
import { Canvas } from "@react-three/fiber";
import { SimulationMesh } from "@/components/canvas/SimulationMesh";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function FujiCanvas() {
  const imageUrl = useFilmStore((state) => state.imageUrl);

  if (!imageUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-950 text-zinc-500">
        <p>Drop an image to start simulation</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-zinc-950">
      <Canvas orthographic camera={{ zoom: 50, position: [0, 0, 100] }}>
        <Suspense fallback={null}>
            <SimulationMesh image={imageUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}
