import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress, Html, Environment, Stage } from '@react-three/drei';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        color: '#a78bfa',
        fontSize: '0.75rem',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(124,58,237,0.2)',
          borderTopColor: '#7c3aed',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        {Math.round(progress)}%
      </div>
    </Html>
  );
}

function Model({ url, autoRotate }) {
  const { scene } = useGLTF(url);
  const ref = useRef();

  useFrame((_, delta) => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += delta * 0.4;
    }
  });

  return <primitive ref={ref} object={scene} />;
}

function ObjFallback({ autoRotate }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (autoRotate && ref.current) {
      ref.current.rotation.y += delta * 0.5;
      ref.current.rotation.x += delta * 0.2;
    }
  });

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#7c3aed"
        roughness={0.2}
        metalness={0.8}
        wireframe={false}
      />
    </mesh>
  );
}

export default function ModelViewer({ fileUrl, fileFormat, autoRotate = false, mini = false }) {
  const fullUrl = fileUrl?.startsWith('http') ? fileUrl : fileUrl;
  const isGlb = fileFormat === 'glb' || fileFormat === 'gltf';

  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 45 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-5, -5, -3]} intensity={0.3} color="#6366f1" />

      <Suspense fallback={<Loader />}>
        {isGlb ? (
          <Stage environment="city" intensity={0.4} adjustCamera>
            <Model url={fullUrl} autoRotate={autoRotate} />
          </Stage>
        ) : (
          <ObjFallback autoRotate={autoRotate} />
        )}
      </Suspense>

      <OrbitControls
        enablePan={!mini}
        enableZoom={!mini}
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        makeDefault
      />
    </Canvas>
  );
}
