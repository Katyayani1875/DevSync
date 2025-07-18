// src/components/InteractiveBackground.jsx

import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { vertexShader as etherealVertex, fragmentShader as etherealFragment } from '../shaders/etherealShader';

// DriftingParticles component is unchanged and correct
const DriftingParticles = () => {
    const pointsRef = useRef();
    const count = 200;
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = Math.random() * 20 - 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;
        }
        return positions;
    }, []);
    useFrame((state, delta) => {
        if (pointsRef.current) {
            const positions = pointsRef.current.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                positions[i * 3 + 1] += 0.5 * delta;
                if (positions[i * 3 + 1] > 10) { positions[i * 3 + 1] = -10; }
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });
    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={particles} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#F7879A" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </points>
    );
};

// SyncedTori component is unchanged and correct
const SyncedTori = ({ scrollY }) => {
  const meshRef = useRef();
  const uniforms = useMemo(() => ({ uGlowColor: { value: new THREE.Color('#F7879A') }, uOpacity: { value: 0.7 } }), []);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const scrollValue = typeof scrollY.current === 'number' ? scrollY.current : 0;
    if (meshRef.current) {
      meshRef.current.rotation.y = -scrollValue * Math.PI * 1.5;
      const child1 = meshRef.current.children[0];
      const child2 = meshRef.current.children[1];
      if(child1 && child2) {
        child1.rotation.x = t * 0.1; child2.rotation.x = t * 0.1;
        child1.rotation.y = t * 0.2; child2.rotation.y = -t * 0.2;
      }
    }
  });
  return (
    <group ref={meshRef} scale={2.5} position={[0, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.05, 32, 100]} />
        <shaderMaterial vertexShader={etherealVertex} fragmentShader={etherealFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI / 2, Math.PI / 2, 0]}>
        <torusGeometry args={[1.5, 0.05, 32, 100]} />
        <shaderMaterial vertexShader={etherealVertex} fragmentShader={etherealFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
};

// --- NEW: Component for the atmospheric glow at the bottom ---
const BottomGlow = () => {
    const glowVertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const glowFragmentShader = `
        varying vec2 vUv;
        uniform vec3 uColor;
        void main() {
            float strength = smoothstep(0.7, 0.0, vUv.y);
            gl_FragColor = vec4(uColor, strength * 0.5);
        }
    `;
    return (
        <mesh position={[0, -5, -5]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[50, 20]} />
            <shaderMaterial
                vertexShader={glowVertexShader}
                fragmentShader={glowFragmentShader}
                uniforms={{ uColor: { value: new THREE.Color('#F7879A') } }}
                transparent
                depthWrite={false}
            />
        </mesh>
    );
};


// The main background component now includes the BottomGlow
const InteractiveBackground = ({ scrollY }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 75 }}>
        <color attach="background" args={['#000000']} />
        <Stars radius={150} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <DriftingParticles />
        <Suspense fallback={null}>
          <SyncedTori scrollY={scrollY} />
        </Suspense>
        {/* The new attractive glow effect */}
        <BottomGlow />
      </Canvas>
    </div>
  );
};

export default InteractiveBackground;