import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/noahnew.glb'

// Map page routes to camera index in the GLB
const CAMERA_INDEX_MAP = {
  '/': 0,
  '/gallery': 1,
  '/about': 2,
  '/community': 2
}

function Model({ activeCamera, drawingTexture, onCamerasReady }) {
  const gltf = useLoader(GLTFLoader, GLB_URL)
  const { set, size } = useThree()
  const mixerRef = useRef()
  const prevIndex = useRef(-1)

  // Extract cameras and setup scene on load
  useEffect(() => {
    // Remove all lights embedded in the GLB and fix materials
    const lightsToRemove = []
    gltf.scene.traverse((child) => {
      if (child.isLight) {
        lightsToRemove.push(child)
      }
      if (child.isMesh && child.material) {
        const mat = child.material
        if (mat.emissive) mat.emissive.setRGB(0, 0, 0)
        if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0
        if (mat.toneMapped !== undefined) mat.toneMapped = true
      }
    })
    lightsToRemove.forEach((light) => {
      console.log('Removing GLB light:', light.type, light.name)
      light.parent?.remove(light)
    })

    // Log available cameras
    if (gltf.cameras && gltf.cameras.length > 0) {
      console.log('GLB Cameras found:', gltf.cameras.map((c, i) => `[${i}] ${c.name}`))
      onCamerasReady?.(gltf.cameras)

      // Set initial camera
      const initialIndex = CAMERA_INDEX_MAP[activeCamera] ?? 0
      const cam = gltf.cameras[initialIndex] || gltf.cameras[0]
      if (cam) {
        cam.aspect = size.width / size.height
        cam.updateProjectionMatrix()
        set({ camera: cam })
        prevIndex.current = initialIndex
      }
    }

    // Setup animations
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene)
      mixerRef.current = mixer
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play()
      })
    }
  }, [gltf, set, size])

  // Switch camera directly when route changes
  useEffect(() => {
    const targetIndex = CAMERA_INDEX_MAP[activeCamera] ?? 0
    const cameras = gltf.cameras

    if (!cameras || cameras.length === 0 || targetIndex === prevIndex.current) return

    const cam = cameras[targetIndex]
    if (!cam) return

    cam.aspect = size.width / size.height
    cam.updateProjectionMatrix()
    set({ camera: cam })
    prevIndex.current = targetIndex
    console.log('Switched to camera:', cam.name, `[${targetIndex}]`)
  }, [activeCamera, gltf.cameras, set, size])

  // Apply drawing texture to paper mesh
  useEffect(() => {
    if (!drawingTexture || !gltf.scene) return

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase()
        if (
          name.includes('paper') || name.includes('canvas') ||
          name.includes('quadro') || name.includes('tela') ||
          name.includes('desenho') || name.includes('drawing') ||
          name.includes('screen')
        ) {
          if (child.material) {
            child.material.map = drawingTexture
            child.material.needsUpdate = true
          }
        }
      }
    })
  }, [drawingTexture, gltf.scene])

  useFrame((state, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  return <primitive object={gltf.scene} />
}

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#F5C842" wireframe />
    </mesh>
  )
}

export default function Scene3D({ activeCamera = '/', drawingTexture = null }) {
  const [fading, setFading] = useState(false)

  // Brief fade on camera switch
  useEffect(() => {
    setFading(true)
    const t = setTimeout(() => setFading(false), 400)
    return () => clearTimeout(t)
  }, [activeCamera])

  return (
    <div style={{
      width: '100%',
      height: '100%',
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.4s ease'
    }}>
      <Canvas
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={0.5} />
        <directionalLight position={[-3, 4, -3]} intensity={0.2} />
        <Suspense fallback={<Loader />}>
          <Model
            activeCamera={activeCamera}
            drawingTexture={drawingTexture}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
