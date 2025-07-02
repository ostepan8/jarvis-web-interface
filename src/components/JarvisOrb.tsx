import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const OrbContent: React.FC = () => {
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);

  const baseColor = useMemo(() => {
    const hour = new Date().getHours();
    const hue = (hour / 24) * 360;
    return new THREE.Color(`hsl(${hue}, 100%, 50%)`);
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.5;
    group.current.rotation.x = t * 0.25;
    group.current.position.y = Math.sin(t) * 0.1;
  });

  return (
    <group
      ref={group}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Central core */}
      <mesh scale={hovered ? 1.2 : 1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={hovered ? 1.2 : 0.6}
        />
      </mesh>
      {/* Energy rings */}
      {[1.5, 1.8, 2.1].map((r, idx) => (
        <Torus
          key={idx}
          args={[r, 0.02, 16, 100]}
          rotation={[Math.PI / (idx + 1), Math.PI / 2, 0]}
        >
          <meshStandardMaterial
            color={baseColor}
            emissive={baseColor}
            transparent
            opacity={0.5 - idx * 0.1}
          />
        </Torus>
      ))}
    </group>
  );
};

const JarvisOrb: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center">
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} />
      <OrbContent />
      <Stars radius={30} depth={50} count={2000} factor={4} fade speed={2} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  </div>
);

export default JarvisOrb;
