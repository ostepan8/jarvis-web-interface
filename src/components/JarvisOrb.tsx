import React, { useRef, useState, useMemo, useCallback } from 'react';
import {
  Canvas,
  useFrame,
  extend,
  useThree,
  type ThreeEvent
} from '@react-three/fiber';
import { Sphere, Torus, OrbitControls, Stars, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Custom shader materials
const EnergyCoreMaterial = shaderMaterial(
  {
    time: 0,
    intensity: 1.0,
    pulseFreq: 2.0,
    coreColor: new THREE.Color(0.2, 0.8, 1.0),
    rimColor: new THREE.Color(0.0, 0.4, 1.0),
  },
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    uniform float time;
    uniform float intensity;
    uniform float pulseFreq;
    uniform vec3 coreColor;
    uniform vec3 rimColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel effect
      float fresnel = 1.0 - abs(dot(normal, viewDir));
      fresnel = pow(fresnel, 2.0);
      
      // Pulsing animation
      float pulse = sin(time * pulseFreq) * 0.5 + 0.5;
      pulse = pow(pulse, 3.0);
      
      // Noise patterns
      float noise = sin(vUv.x * 10.0 + time) * sin(vUv.y * 10.0 + time * 1.3) * 0.1;
      
      // Energy core effect
      vec3 color = mix(coreColor, rimColor, fresnel);
      color += pulse * 0.8;
      color += noise;
      
      float alpha = fresnel * intensity + pulse * 0.3;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);

const HologramRingMaterial = shaderMaterial(
  {
    time: 0,
    opacity: 0.6,
    speed: 1.0,
    glowColor: new THREE.Color(0.0, 0.8, 1.0),
    wireColor: new THREE.Color(0.2, 1.0, 0.8),
  },
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float time;
    uniform float opacity;
    uniform float speed;
    uniform vec3 glowColor;
    uniform vec3 wireColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    
    void main() {
      // Animated wireframe pattern
      float wire = sin(vUv.x * 40.0 + time * speed) * sin(vUv.y * 40.0 + time * speed * 0.7);
      wire = smoothstep(0.8, 1.0, wire);
      
      // Traveling energy pulse
      float pulse = sin(vUv.x * 6.28 - time * speed * 2.0) * 0.5 + 0.5;
      pulse = pow(pulse, 4.0);
      
      vec3 color = mix(glowColor, wireColor, wire);
      color += pulse * wireColor * 2.0;
      
      float alpha = (wire + pulse) * opacity;
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);

const ParticleMaterial = shaderMaterial(
  {
    time: 0,
    size: 1.0,
    color: new THREE.Color(0.3, 0.8, 1.0),
  },
  `
    uniform float time;
    uniform float size;
    attribute float phase;
    attribute float speed;
    varying float vAlpha;
    
    void main() {
      vec3 pos = position;
      
      // Orbital motion
      float angle = time * speed + phase;
      pos.x = cos(angle) * length(position);
      pos.z = sin(angle) * length(position);
      pos.y += sin(time * 2.0 + phase) * 0.5;
      
      vAlpha = sin(time + phase) * 0.5 + 0.5;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  `
    uniform vec3 color;
    varying float vAlpha;
    
    void main() {
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      float alpha = (1.0 - dist * 2.0) * vAlpha;
      vec3 finalColor = color * (2.0 - dist);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);

// Extend the materials to make them available in JSX
extend({ EnergyCoreMaterial, HologramRingMaterial, ParticleMaterial });

// Type declarations for custom materials
type EnergyCoreMaterialType = {
  time?: number;
  intensity?: number;
  pulseFreq?: number;
  coreColor?: THREE.Color;
  rimColor?: THREE.Color;
  transparent?: boolean;
  side?: THREE.Side;
  blending?: THREE.Blending;
  ref?: React.Ref<THREE.ShaderMaterial>;
};

type HologramRingMaterialType = {
  time?: number;
  opacity?: number;
  speed?: number;
  glowColor?: THREE.Color;
  wireColor?: THREE.Color;
  transparent?: boolean;
  side?: THREE.Side;
  blending?: THREE.Blending;
  ref?: React.Ref<THREE.ShaderMaterial>;
};

type ParticleMaterialType = {
  time?: number;
  size?: number;
  color?: THREE.Color;
  transparent?: boolean;
  blending?: THREE.Blending;
  ref?: React.Ref<THREE.ShaderMaterial>;
};

// Augment the JSX namespace to include custom materials
declare module '@react-three/fiber' {
  interface ThreeElements {
    energyCoreMaterial: EnergyCoreMaterialType;
    hologramRingMaterial: HologramRingMaterialType;
    particleMaterial: ParticleMaterialType;
  }
}

const ParticleSystem: React.FC<{ count: number; radius: number }> = ({ count, radius }) => {
  const mesh = useRef<THREE.Points>(null!);
  const materialRef = useRef<(THREE.ShaderMaterial & { time: number }) | null>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 2;

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.5 + Math.random() * 0.5;
    }

    return { positions, phases, speeds };
  }, [count, radius]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.time = clock.getElapsedTime();
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          args={[particles.positions, 3]}
          attach="attributes-position"
        />
        <bufferAttribute
          args={[particles.phases, 1]}
          attach="attributes-phase"
        />
        <bufferAttribute
          args={[particles.speeds, 1]}
          attach="attributes-speed"
        />
      </bufferGeometry>
      <particleMaterial ref={materialRef} size={4} transparent blending={THREE.AdditiveBlending} />
    </points>
  );
};

const EnergyRings: React.FC<{ hovered: boolean }> = ({ hovered }) => {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const materials = useRef<(
    THREE.ShaderMaterial & { time: number; opacity: number; speed: number }
  )[]>([]);

  const ringConfigs = useMemo(() => [
    { radius: 2.2, thickness: 0.02, speed: 1.0, axis: [1, 0, 0] as const, angle: 0 },
    { radius: 2.6, thickness: 0.015, speed: -0.7, axis: [0, 1, 0] as const, angle: Math.PI / 3 },
    { radius: 3.0, thickness: 0.01, speed: 0.5, axis: [0.7, 0.7, 0] as const, angle: Math.PI / 2 },
    { radius: 3.4, thickness: 0.008, speed: -0.3, axis: [0, 0, 1] as const, angle: Math.PI / 4 },
  ], []);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    rings.current.forEach((ring, index) => {
      if (ring && materials.current[index]) {
        const config = ringConfigs[index];
        const quaternion = new THREE.Quaternion();
        quaternion.setFromAxisAngle(
          new THREE.Vector3(...config.axis).normalize(),
          config.angle + time * config.speed
        );
        ring.quaternion.copy(quaternion);

        materials.current[index].time = time;
        materials.current[index].opacity = hovered ? 0.9 : 0.6;
        materials.current[index].speed = hovered ? 2.0 : 1.0;
      }
    });
  });

  return (
    <>
      {ringConfigs.map((config, index) => (
        <Torus
          key={index}
          ref={(el: THREE.Mesh | null) => { rings.current[index] = el; }}
          args={[config.radius, config.thickness, 8, 64]}
        >
          <hologramRingMaterial
            ref={(el: THREE.ShaderMaterial | null) => {
              if (el) {
                materials.current[index] = el as THREE.ShaderMaterial & {
                  time: number;
                  opacity: number;
                  speed: number;
                };
              }
            }}
            transparent
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </Torus>
      ))}
    </>
  );
};

const DataCore: React.FC = () => {
  const coreRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (coreRef.current) {
      coreRef.current.rotation.y = time * 0.5;
      coreRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
      const scale = 1 + Math.sin(time * 2) * 0.05;
      coreRef.current.scale.setScalar(scale);
    }
  });

  return (
    <Sphere ref={coreRef} args={[0.8, 32, 32]}>
      <energyCoreMaterial
        ref={materialRef}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </Sphere>
  );
};

const HolographicBackground: React.FC = () => {
  const fogSphere = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (fogSphere.current) {
      fogSphere.current.rotation.y = time * 0.05;
      fogSphere.current.rotation.x = time * 0.03;
    }
  });

  return (
    <Sphere ref={fogSphere} args={[15, 16, 16]} position={[0, 0, 0]}>
      <meshBasicMaterial
        color={0x001122}
        transparent
        opacity={0.02}
        side={THREE.BackSide}
      />
    </Sphere>
  );
};

const OrbContent: React.FC = () => {
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const { viewport } = useThree();

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (group.current) {
        const x = (e.point.x / viewport.width) * 2;
        const y = (e.point.y / viewport.height) * 2;

        group.current.rotation.y += x * 0.01;
        group.current.rotation.x += y * 0.01;
      }
    },
    [viewport]
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    if (group.current) {
      // Smooth floating motion
      group.current.position.y = Math.sin(time * 0.8) * 0.15;
      group.current.position.x = Math.cos(time * 0.5) * 0.1;
    }
  });

  return (
    <>
      <HolographicBackground />

      <group
        ref={group}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onPointerMove={handlePointerMove}
      >
        <DataCore />
        <EnergyRings hovered={hovered} />

        {/* Multiple particle systems */}
        <ParticleSystem count={50} radius={4} />
        <ParticleSystem count={30} radius={5.5} />
        <ParticleSystem count={20} radius={7} />

        {/* Additional energy sparks */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <ParticleSystem count={25} radius={3.5} />
        </group>
      </group>
    </>
  );
};

const JarvisOrb: React.FC = () => {
  const gridPattern = `data:image/svg+xml,%3Csvg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.05'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E`;

  return (
    <div className="w-full h-full bg-gradient-to-b from-gray-900 via-blue-900 to-black relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/5 via-transparent to-transparent" />
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url("${gridPattern}")` }}
      />

      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.setClearColor(0x000000, 0);
        }}
      >
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.2} color={0x004466} />
        <pointLight position={[0, 0, 0]} intensity={2} color={0x00aaff} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color={0x0088cc} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color={0x4400aa} />

        {/* Volumetric fog effect */}
        <fog attach="fog" args={[0x001122, 8, 20]} />

        <OrbContent />

        {/* Subtle star field */}
        <Stars
          radius={50}
          depth={30}
          count={1000}
          factor={2}
          fade
          speed={0.5}
          saturation={0.8}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={false}
          minDistance={5}
          maxDistance={25}
          zoomSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default JarvisOrb;