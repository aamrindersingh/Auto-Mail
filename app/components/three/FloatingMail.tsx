"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function MailEnvelope() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    meshRef.current.rotation.y = Math.sin(t * 0.5) * 0.3;
    meshRef.current.rotation.x = Math.sin(t * 0.3) * 0.1 + 0.1;
    meshRef.current.position.y = Math.sin(t * 0.8) * 0.15;
    glowRef.current.rotation.y = t * 0.2;
    glowRef.current.rotation.z = t * 0.1;
  });

  return (
    <group>
      {/* Envelope body */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1.8, 1.2, 0.15]} />
        <meshStandardMaterial
          color="#7c5cfc"
          metalness={0.4}
          roughness={0.3}
          emissive="#4c2ca0"
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Glow ring */}
      <mesh ref={glowRef}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshBasicMaterial color="#7c5cfc" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const count = 60;
  const mesh = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    mesh.current.rotation.y = t * 0.02;
    mesh.current.rotation.x = t * 0.01;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#7c5cfc" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function FloatingMail({ className = "" }: { className?: string }) {
  return (
    <div className={`${className}`} style={{ width: "100%", height: "100%" }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#7c5cfc" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#c084fc" />
        <MailEnvelope />
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
