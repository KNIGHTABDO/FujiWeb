"use client";

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { fujiFragmentShader, fujiVertexShader } from '@/lib/shaders/fujiShader';
import { useFilmStore } from '@/store/filmStore';

interface SimulationMeshProps {
  image: string;
}

export function SimulationMesh({ image }: SimulationMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(image);
  const { viewport } = useThree();
  
  // Connect to Zustand store
  const { 
    exposure, contrast, grainStrength, grainScale, 
    halationThreshold, halationIntensity 
  } = useFilmStore();

  // Shader Uniforms
  const uniforms = useMemo(
    () => ({
      tDiffuse: { value: texture },
      uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
      uTime: { value: 0 },
      uExposure: { value: exposure },
      uContrast: { value: contrast },
      uGrainStrength: { value: grainStrength },
      uGrainScale: { value: grainScale },
      uHalationThreshold: { value: halationThreshold },
      uHalationIntensity: { value: halationIntensity },
    }),
    [texture, viewport]
  );

  // Sync Uniforms on Render
  useFrame((state) => {
    if (meshRef.current) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        material.uniforms.uTime.value = state.clock.elapsedTime;
        material.uniforms.uExposure.value = exposure;
        material.uniforms.uContrast.value = contrast;
        material.uniforms.uGrainStrength.value = grainStrength;
        material.uniforms.uGrainScale.value = grainScale;
        material.uniforms.uHalationThreshold.value = halationThreshold;
        material.uniforms.uHalationIntensity.value = halationIntensity;
    }
  });

  // Aspect Ratio Fitting
  const ratio = texture.image.width / texture.image.height;
  const width = viewport.width;
  const height = width / ratio;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        vertexShader={fujiVertexShader}
        fragmentShader={fujiFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
