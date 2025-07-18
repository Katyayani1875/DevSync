import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// The Ethereal Material is perfect, we keep it.
const EtherealMaterial = new THREE.MeshStandardMaterial({
    color: '#ff69b4',
    emissive: '#ff69b4',
    emissiveIntensity: 3,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.8,
    wireframe: true,
});

// A single segment of a finger
const FingerSegment = ({ position, rotation }) => {
    return (
        <mesh position={position} rotation={rotation} material={EtherealMaterial}>
            <boxGeometry args={[0.2, 0.5, 0.2]} />
        </mesh>
    );
};

// A full finger made of multiple segments
const Finger = ({ position, rotation }) => {
    return (
        <group position={position} rotation={rotation}>
            <FingerSegment position={[0, 0.25, 0]} />
            <FingerSegment position={[0, 0.75, 0.05]} rotation={[0.3, 0, 0]} />
            <FingerSegment position={[0, 1.2, 0.2]} rotation={[0.6, 0, 0]} />
        </group>
    );
};

export function GhostHand() {
  const handRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  // Mouse tracking logic remains the same
  React.useEffect(() => {
    const handleMouseMove = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Frame update logic for movement remains the same
  useFrame((state) => {
    if (handRef.current) {
      const targetPosition = new THREE.Vector3(mouse.current.x * 2.5, mouse.current.y * 2.5, 0);
      handRef.current.position.lerp(targetPosition, 0.07);
      handRef.current.rotation.y = THREE.MathUtils.lerp(handRef.current.rotation.y, mouse.current.x * -0.5, 0.05);
      handRef.current.rotation.x = THREE.MathUtils.lerp(handRef.current.rotation.x, mouse.current.y * 0.5, 0.05);
    }
  });

  return (
    <group ref={handRef} scale={1.5} rotation={[0, -0.5, 0]}>
        {/* Palm */}
        <mesh material={EtherealMaterial} position={[0, -0.5, 0]}>
            <boxGeometry args={[1, 1, 0.2]} />
        </mesh>

        {/* Fingers */}
        <Finger position={[-0.4, 0, 0]} rotation={[0, 0, 0.1]} />
        <Finger position={[-0.1, 0.1, 0]} rotation={[0, 0, 0.05]} />
        <Finger position={[0.2, 0.1, 0]} rotation={[0, 0, -0.05]} />
        <Finger position={[0.5, 0, 0]} rotation={[0, 0, -0.1]} />

        {/* Thumb */}
        <group position={[-0.6, -0.8, 0]} rotation={[0, 0, 0.8]}>
            <FingerSegment position={[0, 0.25, 0]} />
            <FingerSegment position={[0, 0.7, 0.05]} rotation={[0.5, 0, 0]} />
        </group>
    </group>
  );
}