import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

// Glowing digital pen/stylus
function GlowingPen({ isDrawing, time }) {
  const penRef = useRef()
  const glowRef = useRef()
  const trailRef = useRef()

  useFrame(() => {
    if (!penRef.current) return

    if (isDrawing) {
      // Drawing motion - simulate stylus strokes
      const strokeX = Math.sin(time.current * 2.5) * 0.12
      const strokeZ = Math.cos(time.current * 2) * 0.08
      const strokeY = Math.sin(time.current * 4) * 0.02

      penRef.current.position.x = 0.25 + strokeX
      penRef.current.position.z = 0.6 + strokeZ
      penRef.current.position.y = -0.6 + strokeY

      // Pulse glow intensity
      if (glowRef.current) {
        glowRef.current.intensity = 3 + Math.sin(time.current * 10) * 1
      }
    } else {
      // Idle - pen resting position
      penRef.current.position.x = THREE.MathUtils.lerp(penRef.current.position.x, 0.25, 0.03)
      penRef.current.position.z = THREE.MathUtils.lerp(penRef.current.position.z, 0.6, 0.03)
      penRef.current.position.y = THREE.MathUtils.lerp(penRef.current.position.y, -0.6, 0.03)

      if (glowRef.current) {
        glowRef.current.intensity = THREE.MathUtils.lerp(glowRef.current.intensity, 1, 0.05)
      }
    }
  })

  return (
    <group ref={penRef} position={[0.25, -0.6, 0.6]}>
      {/* Main pen glow light */}
      <pointLight
        ref={glowRef}
        color="#00d4ff"
        intensity={isDrawing ? 3 : 1}
        distance={2}
        decay={2}
      />

      {/* Pen tip - inner bright core */}
      <mesh>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#00d4ff"
          emissiveIntensity={isDrawing ? 3 : 1}
          toneMapped={false}
        />
      </mesh>

      {/* Pen tip - outer glow */}
      <mesh scale={isDrawing ? 2 : 1.2}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#8b5cf6"
          emissiveIntensity={isDrawing ? 1.5 : 0.3}
          transparent
          opacity={isDrawing ? 0.6 : 0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Drawing trail effect when active */}
      {isDrawing && (
        <mesh ref={trailRef} scale={[0.5, 0.5, 0.5]}>
          <ringGeometry args={[0.08, 0.12, 32]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

// Holographic drawing surface
function DrawingSurface({ isDrawing }) {
  const surfaceRef = useRef()
  const gridRef = useRef()

  useFrame((state) => {
    if (!surfaceRef.current) return

    // Pulsing effect when drawing
    const pulse = isDrawing
      ? 0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.05
      : 0.1

    surfaceRef.current.material.opacity = pulse

    // Grid line animation
    if (gridRef.current) {
      gridRef.current.material.opacity = isDrawing ? 0.3 : 0.15
    }
  })

  return (
    <group position={[0, -1.15, 0.4]} rotation={[-Math.PI / 2.5, 0, 0]}>
      {/* Main surface */}
      <mesh ref={surfaceRef}>
        <planeGeometry args={[1.2, 0.9]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#8b5cf6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Surface border glow */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[0.7, 0.72, 4]} />
        <meshStandardMaterial
          color="#8b5cf6"
          emissive="#8b5cf6"
          emissiveIntensity={0.5}
          transparent
          opacity={isDrawing ? 0.6 : 0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// Ambient particles around KAYA
function KayaParticles({ isDrawing }) {
  return (
    <>
      {/* Main particles - cyan */}
      <Sparkles
        count={isDrawing ? 60 : 25}
        scale={4}
        size={isDrawing ? 2.5 : 1.5}
        speed={isDrawing ? 0.8 : 0.2}
        opacity={0.6}
        color="#00d4ff"
      />

      {/* Accent particles - violet */}
      <Sparkles
        count={isDrawing ? 30 : 10}
        scale={3}
        size={isDrawing ? 2 : 1}
        speed={isDrawing ? 0.6 : 0.15}
        opacity={0.4}
        color="#8b5cf6"
      />
    </>
  )
}

export default function Kaya({ isDrawing }) {
  const groupRef = useRef()
  const kayaRef = useRef()
  const { scene } = useGLTF('/models/ai-agent.gltf')
  const time = useRef(0)

  // Clone scene to avoid mutations
  const clonedScene = useMemo(() => scene.clone(), [scene])

  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true

          // Apply futuristic material adjustments
          if (child.material) {
            child.material = child.material.clone()
            child.material.envMapIntensity = 1

            // Add subtle blue/violet tint for cyber aesthetic
            if (child.material.color) {
              child.material.color.lerp(new THREE.Color('#e8f4ff'), 0.08)
            }
          }
        }
      })
    }
  }, [clonedScene])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    time.current += delta

    // KAYA's subtle idle animation - breathing and micro-movements
    // Designed for crouching/drawing pose
    const breathe = Math.sin(time.current * 1.2) * 0.006
    const microShift = Math.sin(time.current * 0.6) * 0.002

    if (kayaRef.current) {
      // Subtle breathing motion
      kayaRef.current.position.y = -1 + breathe

      // Very slight head/body micro-movement
      kayaRef.current.rotation.y = microShift
    }

    // Drawing animation state
    if (isDrawing) {
      // Focused lean when drawing
      const focusLean = Math.sin(time.current * 1.5) * 0.015
      groupRef.current.rotation.x = focusLean * 0.3

      // Subtle follow motion as if tracking pen
      const followStroke = Math.sin(time.current * 2.5) * 0.01
      groupRef.current.rotation.z = followStroke

      // Energy pulse effect
      const energyPulse = 1 + Math.sin(time.current * 4) * 0.008
      groupRef.current.scale.setScalar(energyPulse)
    } else {
      // Smooth return to neutral
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.03)
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.03)

      const currentScale = groupRef.current.scale.x
      const targetScale = THREE.MathUtils.lerp(currentScale, 1, 0.03)
      groupRef.current.scale.setScalar(targetScale)
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* KAYA 3D Model - fixed position, looking at drawing surface */}
      <primitive
        ref={kayaRef}
        object={clonedScene}
        scale={1.8}
        position={[0, -1, 0]}
        rotation={[0, -0.1, 0]} // Slight angle toward drawing area
      />

      {/* Glowing digital stylus */}
      <GlowingPen isDrawing={isDrawing} time={time} />

      {/* Holographic drawing surface */}
      <DrawingSurface isDrawing={isDrawing} />

      {/* Ambient particles */}
      <KayaParticles isDrawing={isDrawing} />

      {/* === LIGHTING SETUP === */}

      {/* Soft fill from left - blue tint */}
      <pointLight
        position={[-2, 0.5, 1]}
        intensity={0.4}
        color="#00d4ff"
        distance={5}
      />

      {/* Accent from behind - violet */}
      <pointLight
        position={[0, 1.5, -2]}
        intensity={0.5}
        color="#8b5cf6"
        distance={4}
      />

      {/* Ground bounce - soft blue */}
      <pointLight
        position={[0, -2, 0.5]}
        intensity={0.25}
        color="#3b82f6"
        distance={3}
      />

      {/* Drawing area spotlight - activates when drawing */}
      {isDrawing && (
        <>
          <spotLight
            position={[0.5, 0.5, 1.5]}
            angle={0.6}
            penumbra={0.8}
            intensity={2}
            color="#00d4ff"
            distance={4}
            target-position={[0.25, -0.6, 0.6]}
          />

          {/* Extra glow on drawing surface */}
          <pointLight
            position={[0, -0.8, 0.5]}
            intensity={1.2}
            color="#00d4ff"
            distance={2}
          />

          {/* Violet accent during creation */}
          <pointLight
            position={[0.5, 0, 0]}
            intensity={0.8}
            color="#8b5cf6"
            distance={2}
          />
        </>
      )}
    </group>
  )
}

useGLTF.preload('/models/ai-agent.gltf')
