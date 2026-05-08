import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { GeometryType } from '@twinforge/shared';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

// ── Shared types ──────────────────────────────────────────────────────────────

interface LiveParams {
  heartRate?: number;
  loadPercent?: number;
}

// ── Human Figures ─────────────────────────────────────────────────────────────

function HumanDefaultFigure({ color = '#6366F1', liveParams }: { color?: string; liveParams?: LiveParams }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      const speed = Math.max(0.1, (liveParams?.heartRate ?? 70) / 233);
      groupRef.current.rotation.y += delta * speed;
    }
  });
  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={color} metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.2, 8]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.32, 0.7, 8, 16]} />
        <meshStandardMaterial color={color} metalness={0.15} roughness={0.65} />
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.52, 0.6, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.1, 0.65, 6, 12]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Right arm */}
      <mesh position={[0.52, 0.6, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.1, 0.65, 6, 12]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.2, -0.45, 0]}>
        <capsuleGeometry args={[0.12, 0.75, 6, 12]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.2, -0.45, 0]}>
        <capsuleGeometry args={[0.12, 0.75, 6, 12]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>
      {/* Accent ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.1, 0.015, 8, 64]} />
        <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function HumanCardiacFigure({ liveParams }: { liveParams?: LiveParams }) {
  const groupRef = useRef<THREE.Group>(null);
  const heartRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y += 0.004;
    if (heartRef.current) {
      const freq = liveParams?.heartRate ? Math.max(0.5, liveParams.heartRate / 30) : 4;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * freq) * 0.08;
      heartRef.current.scale.setScalar(pulse);
    }
  });
  return (
    <group ref={groupRef}>
      <HumanDefaultFigure color="#EF4444" liveParams={liveParams} />
      {/* Heart indicator */}
      <mesh ref={heartRef} position={[0, 0.65, 0.34]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.5} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

function HumanAthleticFigure() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });
  return (
    <group ref={groupRef} scale={[1.1, 1.1, 1.1]}>
      <HumanDefaultFigure color="#10B981" />
    </group>
  );
}

function HumanChildFigure() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.35;
  });
  return (
    <group ref={groupRef} scale={[0.75, 0.75, 0.75]}>
      <HumanDefaultFigure color="#F59E0B" />
    </group>
  );
}

function HumanSurgicalFigure() {
  return (
    <group>
      <HumanDefaultFigure color="#94A3B8" />
      {/* Surgical glow overlay */}
      <mesh position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.42, 0.9, 8, 16]} />
        <meshStandardMaterial color="#22D3EE" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

// ── Industrial Machines ───────────────────────────────────────────────────────

function TurbineFigure({ liveParams }: { liveParams?: LiveParams }) {
  const fanRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (fanRef.current) {
      const speed = liveParams?.loadPercent !== undefined ? Math.max(0.1, liveParams.loadPercent / 25) : 2;
      fanRef.current.rotation.z += delta * speed;
    }
  });
  return (
    <group>
      {/* Central shaft */}
      <mesh>
        <cylinderGeometry args={[0.12, 0.12, 2.2, 12]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Rotating fan blades */}
      <group ref={fanRef}>
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <mesh key={i} rotation={[0, 0, (deg * Math.PI) / 180]}>
            <boxGeometry args={[0.9, 0.08, 0.04]} />
            <meshStandardMaterial color="#6366F1" metalness={0.8} roughness={0.15} />
          </mesh>
        ))}
        <mesh>
          <torusGeometry args={[0.9, 0.04, 8, 32]} />
          <meshStandardMaterial color="#6366F1" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>
      {/* Housing rings */}
      {[-0.8, 0, 0.8].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.05, 8, 32]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Accent ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.015, 8, 64]} />
        <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function CNCMachineFigure() {
  const spindleRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (spindleRef.current) spindleRef.current.rotation.y += delta * 6;
  });
  return (
    <group>
      {/* Base */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[1.8, 0.3, 1.4]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Column */}
      <mesh position={[0, 0.1, -0.5]}>
        <boxGeometry args={[0.4, 1.8, 0.4]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Spindle head */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Tool */}
      <mesh ref={spindleRef} position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.04, 0.07, 0.5, 8]} />
        <meshStandardMaterial color="#6366F1" metalness={0.9} roughness={0.1} emissive="#6366F1" emissiveIntensity={0.3} />
      </mesh>
      {/* Table */}
      <mesh position={[0, -0.55, 0.1]}>
        <boxGeometry args={[1.4, 0.1, 0.9]} />
        <meshStandardMaterial color="#64748B" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function RobotArmFigure() {
  const arm1Ref = useRef<THREE.Group>(null);
  const arm2Ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (arm1Ref.current) arm1Ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.4;
    if (arm2Ref.current) arm2Ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8 + 1) * 0.5;
  });
  const jointColor = '#6366F1';
  const armColor = '#334155';
  return (
    <group>
      {/* Base */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.35, 0.45, 0.3, 16]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.4, 12]} />
        <meshStandardMaterial color={armColor} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Joint 1 */}
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color={jointColor} metalness={0.8} roughness={0.1} emissive={jointColor} emissiveIntensity={0.3} />
      </mesh>
      {/* Arm 1 */}
      <group ref={arm1Ref} position={[0, -0.55, 0]}>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color={armColor} metalness={0.7} roughness={0.25} />
        </mesh>
        {/* Joint 2 */}
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color={jointColor} metalness={0.8} roughness={0.1} emissive={jointColor} emissiveIntensity={0.3} />
        </mesh>
        {/* Arm 2 */}
        <group ref={arm2Ref} position={[0, 0.85, 0]}>
          <mesh position={[0.3, 0.3, 0]} rotation={[0, 0, -0.5]}>
            <boxGeometry args={[0.12, 0.7, 0.12]} />
            <meshStandardMaterial color={armColor} metalness={0.7} roughness={0.25} />
          </mesh>
          {/* End effector */}
          <mesh position={[0.65, 0.5, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function ConveyorFigure() {
  const beltRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (beltRef.current && beltRef.current.material instanceof THREE.MeshStandardMaterial) {
      // Simulate belt movement via UV offset — not easily done in R3F, so rotate rollers instead
    }
  });
  const rollerRefs = useRef<THREE.Mesh[]>([]);
  useFrame((_, delta) => {
    rollerRefs.current.forEach((r) => { if (r) r.rotation.z -= delta * 2; });
  });

  return (
    <group rotation={[0, -0.4, 0]}>
      {/* Frame sides */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <boxGeometry args={[0.06, 0.15, 2.4]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      {/* Belt surface */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[1.0, 0.04, 2.2]} />
        <meshStandardMaterial color="#1E293B" metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Rollers */}
      {[-0.9, -0.45, 0, 0.45, 0.9].map((z, i) => (
        <mesh
          key={i}
          position={[0, 0, z]}
          rotation={[Math.PI / 2, 0, 0]}
          ref={(el) => { if (el) rollerRefs.current[i] = el; }}
        >
          <cylinderGeometry args={[0.1, 0.1, 1.05, 10]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
      {/* Motor */}
      <mesh position={[0, -0.1, -1.1]}>
        <boxGeometry args={[0.4, 0.25, 0.4]} />
        <meshStandardMaterial color="#6366F1" metalness={0.7} roughness={0.3} emissive="#6366F1" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function HydraulicPressFigure() {
  const ramRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ramRef.current) {
      ramRef.current.position.y = -0.1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.25;
    }
  });
  return (
    <group>
      {/* Upper platen */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[1.4, 0.15, 0.9]} />
        <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Columns */}
      {[-0.55, 0.55].map((x, i) =>
        [-0.3, 0.3].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, 0, z]}>
            <cylinderGeometry args={[0.06, 0.06, 2.2, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.15} />
          </mesh>
        ))
      )}
      {/* Hydraulic ram */}
      <mesh ref={ramRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.7, 12]} />
        <meshStandardMaterial color="#6366F1" metalness={0.85} roughness={0.1} emissive="#6366F1" emissiveIntensity={0.2} />
      </mesh>
      {/* Lower bed */}
      <mesh position={[0, -0.9, 0]}>
        <boxGeometry args={[1.4, 0.2, 0.9]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function PumpFigure({ liveParams }: { liveParams?: LiveParams }) {
  const impellerRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (impellerRef.current) {
      const speed = liveParams?.loadPercent !== undefined ? Math.max(0.2, liveParams.loadPercent / 25) : 4;
      impellerRef.current.rotation.y += delta * speed;
    }
  });
  return (
    <group>
      {/* Casing */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 0.5, 24]} />
        <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.25} />
      </mesh>
      {/* Impeller disc */}
      <mesh ref={impellerRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.1, 0.35, 8]} />
        <meshStandardMaterial color="#6366F1" metalness={0.9} roughness={0.1} emissive="#6366F1" emissiveIntensity={0.4} />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.8, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Motor block */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Inlet / outlet pipes */}
      <mesh position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 0.5, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.5, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Accent ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.015, 8, 32]} />
        <meshStandardMaterial color="#22D3EE" emissive="#22D3EE" emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

function OffshorePumpFigure() {
  const shaftRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (shaftRef.current) shaftRef.current.rotation.y += delta * 2;
  });
  return (
    <group>
      <PumpFigure />
      {/* Offshore corrosion indicator rings */}
      {[-0.3, 0.3].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.012, 6, 32]} />
          <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.6} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ── Fallback ──────────────────────────────────────────────────────────────────

function FallbackShape() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => { if (ref.current) ref.current.rotation.y += delta * 0.5; });
  return (
    <mesh ref={ref}>
      <octahedronGeometry args={[0.8, 0]} />
      <meshStandardMaterial color="#6366F1" metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function GeometryForType({ type, liveParams }: { type: GeometryType; liveParams?: LiveParams }) {
  switch (type) {
    case 'human-default': return <HumanDefaultFigure liveParams={liveParams} />;
    case 'human-cardiac': return <HumanCardiacFigure liveParams={liveParams} />;
    case 'human-athletic': return <HumanAthleticFigure />;
    case 'human-child': return <HumanChildFigure />;
    case 'human-surgical': return <HumanSurgicalFigure />;
    case 'turbine': return <TurbineFigure liveParams={liveParams} />;
    case 'cnc-machine': return <CNCMachineFigure />;
    case 'robot-arm': return <RobotArmFigure />;
    case 'conveyor': return <ConveyorFigure />;
    case 'hydraulic-press': return <HydraulicPressFigure />;
    case 'pump': return <PumpFigure liveParams={liveParams} />;
    case 'offshore-pump': return <OffshorePumpFigure />;
    default: return <FallbackShape />;
  }
}

// ── Public component ──────────────────────────────────────────────────────────

interface ModelPreview3DProps {
  geometryType: GeometryType;
  interactive?: boolean;
  height?: string;
  liveParams?: LiveParams;
}

export default function ModelPreview3D({ geometryType, interactive = false, height = '180px', liveParams }: ModelPreview3DProps) {
  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden bg-bg-base">
      <ErrorBoundary
        fallback={
          <div className="flex items-center justify-center h-full bg-bg-base rounded-lg border border-border">
            <p className="text-xs text-txt-muted">3D preview unavailable</p>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0.5, 3.5], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true }}
        >
          <color attach="background" args={['#080B0F']} />
          <ambientLight intensity={0.3} />
          <pointLight position={[3, 4, 3]} intensity={1.5} color="#6366F1" />
          <pointLight position={[-3, -2, -3]} intensity={0.6} color="#22D3EE" />
          <directionalLight position={[0, 5, 2]} intensity={0.8} />
          <Suspense fallback={null}>
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2} enabled={!interactive}>
              <GeometryForType type={geometryType} liveParams={liveParams} />
            </Float>
            <Environment preset="city" />
          </Suspense>
          {interactive && <OrbitControls enablePan={false} minDistance={2} maxDistance={8} />}
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}
