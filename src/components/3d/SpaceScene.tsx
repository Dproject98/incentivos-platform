"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Stars, Float } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import * as THREE from "three"

/* ── Nebula background plane ── */
function NebulaMesh() {
  const meshRef = useRef<THREE.Mesh>(null)
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        float angle = atan(uv.y, uv.x) + time * 0.1;
        float wave = sin(dist * 8.0 - time * 0.5 + angle) * 0.5 + 0.5;
        vec3 purple = vec3(0.486, 0.227, 0.929);
        vec3 pink    = vec3(0.925, 0.282, 0.600);
        vec3 dark    = vec3(0.039, 0.055, 0.153);
        vec3 col = mix(dark, mix(purple, pink, wave * 0.5), smoothstep(0.6, 0.0, dist) * 0.35);
        float alpha = smoothstep(0.8, 0.0, dist) * 0.5;
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
  }), [])

  useFrame(({ clock }) => { mat.uniforms.time.value = clock.elapsedTime })

  return (
    <mesh ref={meshRef} position={[0, 0, -25]} renderOrder={-1}>
      <planeGeometry args={[80, 80]} />
      <primitive object={mat} attach="material" />
    </mesh>
  )
}

/* ── Floating particles ── */
function FloatingParticles({ count = 60 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 40
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = clock.elapsedTime * 0.02
    meshRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.01) * 0.1
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#7c3aed" transparent opacity={0.6} sizeAttenuation />
    </points>
  )
}

/* ── Incentive sphere (per tier) ── */
interface TierSphereProps {
  position: [number, number, number]
  color: string
  emissive: string
  metalness?: number
  roughness?: number
  label: string
  delay?: number
}

function TierSphere({ position, color, emissive, metalness = 0.8, roughness = 0.2, delay = 0 }: TierSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime + delay
    meshRef.current.rotation.x = t * 0.3
    meshRef.current.rotation.y = t * 0.5
    meshRef.current.position.y = position[1] + Math.sin(t * 0.8 + delay) * 0.4
  })

  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[0.8, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={0.4}
        metalness={metalness}
        roughness={roughness}
        envMapIntensity={1.2}
      />
    </mesh>
  )
}

/* ── Central orb ── */
function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = clock.elapsedTime * 0.15
    meshRef.current.rotation.y = clock.elapsedTime * 0.2
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.8, 6]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          metalness={0.9}
          roughness={0.1}
          wireframe={false}
        />
      </mesh>
      {/* Wireframe overlay */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.85, 2]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.08} />
      </mesh>
    </Float>
  )
}

/* ── Camera mouse parallax ── */
function CameraRig() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener("mousemove", handler)
    return () => window.removeEventListener("mousemove", handler)
  }, [])

  useFrame(() => {
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.03
    camera.position.y += (-mouse.current.y * 0.8 - camera.position.y) * 0.03
    camera.lookAt(0, 0, 0)
  })

  return null
}

/* ── Main exported scene ── */
export function SpaceScene({ minimal = false }: { minimal?: boolean }) {
  const tiers = [
    { position: [-5, 1.5, -3] as [number,number,number], color: "#8B6914", emissive: "#b8892a", metalness: 0.6, roughness: 0.4, label: "Bronze", delay: 0 },
    { position: [-2, -1.5, -2] as [number,number,number], color: "#C0C0C0", emissive: "#e0e0e0", metalness: 0.8, roughness: 0.2, label: "Silver", delay: 1.5 },
    { position: [2, 1.8, -3] as [number,number,number],  color: "#FFD700", emissive: "#FFD700", metalness: 0.9, roughness: 0.15, label: "Gold",   delay: 3 },
    { position: [5, -1, -2] as [number,number,number],   color: "#E5E4E2", emissive: "#a8d8ea", metalness: 0.95, roughness: 0.1, label: "Platinum", delay: 4.5 },
  ]

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 70 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
    >
      {/* Lights */}
      <ambientLight color="#7c3aed" intensity={0.6} />
      <directionalLight color="#ec4899" position={[5, 5, 3]} intensity={0.8} />
      <directionalLight color="#06b6d4" position={[-5, -3, 2]} intensity={0.5} />
      <pointLight color="#7c3aed" position={[0, 0, 5]} intensity={1.5} distance={20} />

      {/* Background */}
      <NebulaMesh />

      {/* Stars */}
      <Stars radius={80} depth={50} count={3000} factor={4} saturation={0.5} fade speed={0.5} />

      {/* Particles */}
      <FloatingParticles count={50} />

      {/* Tier spheres */}
      {!minimal && tiers.map((tier) => (
        <TierSphere key={tier.label} {...tier} />
      ))}

      {/* Central orb */}
      <CentralOrb />

      {/* Camera parallax */}
      <CameraRig />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
          intensity={1.2}
        />
      </EffectComposer>
    </Canvas>
  )
}
