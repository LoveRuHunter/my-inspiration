/**
 * Мини-3D-планета для шапки сайдбара. Использует ту же PlanetSphere,
 * что и на большой карте — то есть текстура и биом совпадают.
 * Свой Canvas с прозрачным фоном, лёгкая подсветка, без Bloom.
 */

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import * as THREE from 'three';
import { PlanetSphere } from './PlanetSphere';
import { biomeFor } from '@/lib/planet-texture';
import { planetVisual } from '@/lib/planet-visual';
import type { Planet } from '@/lib/types';

interface PlanetHeader3DProps {
  planet: Planet;
  size?: number;
}

export function PlanetHeader3D({ planet, size = 170 }: PlanetHeader3DProps) {
  const visual = planetVisual(planet.id, planet.region);
  const biome = biomeFor(planet.id, planet.climate, planet.terrain);

  return (
    <div style={{ width: size, height: size }} className="pointer-events-none" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 35 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <directionalLight position={[3, 2, 4]} intensity={1.4} color="#ffffff" />
          <pointLight position={[-4, -2, -3]} intensity={0.5} color="#4a6fa8" />
          <PlanetSphere
            planetId={planet.id}
            biome={biome}
            radius={1}
            color={visual.color}
            emissive={visual.emissive}
            accent={visual.emissive}
            active={false}
            hasRing={visual.hasRing}
            ringColor={visual.ringColor}
            textureUrl={planet.textureUrl}
            spinSpeed={0.18}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
