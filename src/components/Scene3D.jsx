import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

// 3D Model URL
const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/noahnew.glb'

const CAMERA_INDEX_MAP = {
  '/': 0,
  '/drawing': 1,
  '/gallery': 2,
  '/about': 2
}

function Model({ activeCamera, onLoaded }) {
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

    // Signal loaded
    onLoaded?.()
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

function LoadingScreen() {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      background: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      zIndex: 50
    }}>
      <div style={{
        fontFamily: "'Caveat', cursive",
        fontSize: '3rem',
        fontWeight: 700,
        color: '#F5C842',
      }}>
        Sam Universe
      </div>
      <div style={{
        fontFamily: "'Patrick Hand', cursive",
        fontSize: '1.1rem',
        color: 'rgba(255,255,255,0.5)',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        Sam is getting ready to draw...
      </div>
      <div style={{
        width: '120px',
        height: '3px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '8px'
      }}>
        <div style={{
          width: '40%',
          height: '100%',
          background: '#F5C842',
          borderRadius: '2px',
          animation: 'loadingBar 1.5s ease-in-out infinite'
        }} />
      </div>
      <style>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  )
}

export default function Scene3D({ activeCamera = '/' }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {!loaded && <LoadingScreen />}
      <Canvas
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.4,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <ambientLight intensity={1.0} />
        <directionalLight position={[5, 8, 5]} intensity={0.7} />
        <directionalLight position={[-3, 4, -3]} intensity={0.3} />
        <Suspense fallback={null}>
          <Model activeCamera={activeCamera} onLoaded={() => setLoaded(true)} />
        </Suspense>
      </Canvas>
    </div>
  )
}
