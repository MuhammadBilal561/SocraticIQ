import { useRef, useMemo, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/* ───── Torus Knot ───── */

function TorusKnot() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock, pointer }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.rotation.x = t * 0.08 + pointer.y * 0.2;
      meshRef.current.rotation.y = t * 0.12 + pointer.x * 0.3;
      meshRef.current.position.x = Math.sin(t * 0.15) * 0.3;
      meshRef.current.position.y = Math.sin(t * 0.12) * 0.2;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={meshRef} scale={0.85}>
        <torusKnotGeometry args={[1, 0.35, 128, 16]} />
        <MeshDistortMaterial
          color="#00ff41"
          emissive="#00ff41"
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.9}
          distort={0.2}
          speed={3}
          transparent
          opacity={0.9}
        />
      </mesh>
    </Float>
  );
}

/* ───── Particles with mouse interaction ───── */

function Particles({ count = 2500 }) {
  const points = useRef<THREE.Points>(null!);
  const mouse = useRef({ x: 0, y: 0 });

  // Track mouse on the canvas
  const onPointerMove = useCallback((e: { clientX: number; clientY: number }) => {
    const rect = (e as any).target?.getBoundingClientRect?.();
    if (rect) {
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
  }, []);

  // Attach/detach listener
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const handler = (e: PointerEvent) => onPointerMove(e as any);
    canvas.addEventListener("pointermove", handler);
    return () => canvas.removeEventListener("pointermove", handler);
  }, [onPointerMove]);

  const [positions, velocities, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      new THREE.Color("#00ff41"), // neon green
      new THREE.Color("#00d4ff"), // cyan
      new THREE.Color("#39ff14"), // bright green
      new THREE.Color("#00cc33"), // medium green
    ];

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 7 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.5;
      pos[i3 + 2] = radius * Math.cos(phi);

      // Slight random velocity for drift
      vel[i3] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.002;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.002;

      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i3] = c.r;
      col[i3 + 1] = c.g;
      col[i3 + 2] = c.b;
    }
    return [pos, vel, col];
  }, [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    const pos = points.current.geometry.attributes.position.array as Float32Array;
    const mx = mouse.current.x;
    const my = mouse.current.y;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Drift
      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      // Mouse influence — push particles away from cursor
      const dx = pos[i3] - mx * 5;
      const dy = pos[i3 + 1] - my * 3;
      const dz = pos[i3 + 2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 2.5 && dist > 0.01) {
        const force = 0.003 / dist;
        pos[i3] += (dx / dist) * force;
        pos[i3 + 1] += (dy / dist) * force;
        pos[i3 + 2] += (dz / dist) * force;
      }

      // Keep within bounds
      const bound = 12;
      for (let j = 0; j < 3; j++) {
        if (Math.abs(pos[i3 + j]) > bound) {
          pos[i3 + j] = (Math.random() - 0.5) * 10;
        }
      }
    }

    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = t * 0.008;
    points.current.rotation.x = Math.sin(t * 0.005) * 0.03;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ───── Scene ───── */

function Scene() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <directionalLight position={[-5, -3, -5]} intensity={0.3} color="#00ff41" />
      <TorusKnot />
      <Particles count={3000} />
    </>
  );
}

/* ───── Canvas wrapper ───── */

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}