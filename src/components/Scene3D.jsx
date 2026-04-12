import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/noahnew.glb'

const CAMERA_INDEX_MAP = {
  '/': 0,
  '/gallery': 1,
  '/about': 2,
  '/community': 2
}

function Model({ activeCamera }) {
  const gltf = useLoader(GLTFLoader, GLB_URL)
  const { set, size } = useThree()
  const mixerRef = useRef()
  const prevIndex = useRef(-1)

  useEffect(() => {
    // Remove GLB lights and fix materials
    const lightsToRemove = []
    gltf.scene.traverse((child) => {
      if (child.isLight) lightsToRemove.push(child)
      if (child.isMesh && child.material) {
        const mat = child.material
        if (mat.emissive) mat.emissive.setRGB(0, 0, 0)
        if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0
        if (mat.toneMapped !== undefined) mat.toneMapped = true
      }
    })
    lightsToRemove.forEach((light) => light.parent?.remove(light))

    // Set initial camera
    if (gltf.cameras && gltf.cameras.length > 0) {
      const idx = CAMERA_INDEX_MAP[activeCamera] ?? 0
      const cam = gltf.cameras[idx] || gltf.cameras[0]
      if (cam) {
        cam.aspect = size.width / size.height
        cam.updateProjectionMatrix()
        set({ camera: cam })
        prevIndex.current = idx
      }
    }

    // Animations
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene)
      mixerRef.current = mixer
      gltf.animations.forEach((clip) => mixer.clipAction(clip).play())
    }
  }, [gltf, set, size])

  // Switch camera on route change
  useEffect(() => {
    const idx = CAMERA_INDEX_MAP[activeCamera] ?? 0
    const cameras = gltf.cameras
    if (!cameras || cameras.length === 0 || idx === prevIndex.current) return
    const cam = cameras[idx]
    if (!cam) return
    cam.aspect = size.width / size.height
    cam.updateProjectionMatrix()
    set({ camera: cam })
    prevIndex.current = idx
  }, [activeCamera, gltf.cameras, set, size])

  useFrame((_, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta)
  })

  return <primitive object={gltf.scene} />
}

export default function Scene3D({ activeCamera = '/' }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    setFading(true)
    const t = setTimeout(() => setFading(false), 400)
    return () => clearTimeout(t)
  }, [activeCamera])

  return (
    <div style={{
      width: '100%', height: '100%',
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
        <Suspense fallback={null}>
          <Model activeCamera={activeCamera} />
        </Suspense>
      </Canvas>
    </div>
  )
}
