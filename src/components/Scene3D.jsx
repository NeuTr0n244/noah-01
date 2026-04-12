import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef } from 'react'
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

function Model({ activeCamera, drawingTexture }) {
  const gltf = useLoader(GLTFLoader, GLB_URL)
  const { set, size, camera } = useThree()
  const mixerRef = useRef()
  const camerasRef = useRef([])
  const lerpProgress = useRef(1)
  const fromPos = useRef(new THREE.Vector3())
  const fromQuat = useRef(new THREE.Quaternion())
  const toPos = useRef(new THREE.Vector3())
  const toQuat = useRef(new THREE.Quaternion())
  const prevIndex = useRef(-1)

  // Extract all cameras from GLB on load
  useEffect(() => {
    if (gltf.cameras && gltf.cameras.length > 0) {
      camerasRef.current = gltf.cameras
      console.log('GLB Cameras found:', gltf.cameras.map((c, i) => `[${i}] ${c.name}`))

      // Set initial camera by index
      const initialIndex = CAMERA_INDEX_MAP[activeCamera] ?? 0
      const initialCam = gltf.cameras[initialIndex] || gltf.cameras[0]
      if (initialCam) {
        initialCam.aspect = size.width / size.height
        initialCam.updateProjectionMatrix()
        set({ camera: initialCam })
        prevIndex.current = initialIndex
      }
    }

    // Setup animations
    if (gltf.animations && gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(gltf.scene)
      mixerRef.current = mixer
      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip)
        action.play()
      })
    }
  }, [gltf, set, size])

  // Handle camera transitions when activeCamera (route) changes
  useEffect(() => {
    const targetIndex = CAMERA_INDEX_MAP[activeCamera] ?? 0
    const cameras = camerasRef.current

    if (cameras.length === 0 || targetIndex === prevIndex.current) return

    const targetCam = cameras[targetIndex]
    if (!targetCam) return

    // Store current camera position/rotation as "from"
    fromPos.current.copy(camera.position)
    fromQuat.current.copy(camera.quaternion)

    // Get target camera world position/rotation
    targetCam.updateMatrixWorld(true)
    toPos.current.copy(targetCam.position)
    toQuat.current.copy(targetCam.quaternion)

    // Update aspect ratio
    targetCam.aspect = camera.aspect
    targetCam.updateProjectionMatrix()

    // Start lerp transition
    lerpProgress.current = 0
    prevIndex.current = targetIndex
  }, [activeCamera, camera])

  // Apply drawing texture to the paper mesh
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
    // Update animations
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }

    // Smooth camera transition
    if (lerpProgress.current < 1) {
      lerpProgress.current = Math.min(1, lerpProgress.current + delta * 1.2)
      const t = smoothstep(lerpProgress.current)

      camera.position.lerpVectors(fromPos.current, toPos.current, t)
      camera.quaternion.slerpQuaternions(fromQuat.current, toQuat.current, t)
      camera.updateProjectionMatrix()
    }
  })

  return <primitive object={gltf.scene} />
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
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
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.5,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={0.6} />
        <directionalLight position={[-3, 5, -5]} intensity={0.2} />
        <Suspense fallback={<Loader />}>
          <Model activeCamera={activeCamera} drawingTexture={drawingTexture} />
        </Suspense>
      </Canvas>
    </div>
  )
}
