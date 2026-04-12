import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useMemo } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

const GLB_URL = 'https://pub-86fa2dc7ce2a48b0a619b665a49cf94a.r2.dev/noahnew.glb'

// Map page routes to GLB camera names
const CAMERA_MAP = {
  '/': 'Camera.001',
  '/gallery': 'Camera.002',
  '/about': 'Camera.003',
  '/community': 'Camera.003'
}

function Model({ activeCamera, drawingTexture }) {
  const gltf = useLoader(GLTFLoader, GLB_URL)
  const { set, size, camera } = useThree()
  const mixerRef = useRef()
  const camerasRef = useRef({})
  const lerpProgress = useRef(1)
  const fromPos = useRef(new THREE.Vector3())
  const fromQuat = useRef(new THREE.Quaternion())
  const toPos = useRef(new THREE.Vector3())
  const toQuat = useRef(new THREE.Quaternion())
  const prevCamera = useRef(null)

  // Extract all cameras from GLB on load
  useEffect(() => {
    if (gltf.cameras && gltf.cameras.length > 0) {
      const cams = {}
      gltf.cameras.forEach((cam) => {
        cams[cam.name] = cam
      })
      camerasRef.current = cams
      console.log('Cameras found:', Object.keys(cams))

      // Set initial camera
      const initialCamName = CAMERA_MAP[activeCamera] || 'Camera.001'
      const initialCam = cams[initialCamName] || gltf.cameras[0]
      if (initialCam) {
        initialCam.aspect = size.width / size.height
        initialCam.updateProjectionMatrix()
        set({ camera: initialCam })
        prevCamera.current = initialCamName
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

  // Handle camera transitions when activeCamera changes
  useEffect(() => {
    const targetCamName = CAMERA_MAP[activeCamera] || 'Camera.001'
    const targetCam = camerasRef.current[targetCamName]

    if (!targetCam || targetCamName === prevCamera.current) return

    // Store current camera position/rotation as "from"
    fromPos.current.copy(camera.position)
    fromQuat.current.copy(camera.quaternion)

    // Get target camera world position/rotation
    targetCam.updateMatrixWorld(true)
    toPos.current.copy(targetCam.position)
    toQuat.current.copy(targetCam.quaternion)

    // Start lerp
    lerpProgress.current = 0
    prevCamera.current = targetCamName
  }, [activeCamera, camera])

  // Apply drawing texture to the paper mesh
  useEffect(() => {
    if (!drawingTexture || !gltf.scene) return

    // Find the paper/canvas mesh in the scene
    gltf.scene.traverse((child) => {
      if (child.isMesh && (
        child.name.toLowerCase().includes('paper') ||
        child.name.toLowerCase().includes('canvas') ||
        child.name.toLowerCase().includes('quadro') ||
        child.name.toLowerCase().includes('tela') ||
        child.name.toLowerCase().includes('desenho') ||
        child.name.toLowerCase().includes('drawing') ||
        child.name.toLowerCase().includes('plane') ||
        child.name.toLowerCase().includes('screen')
      )) {
        if (child.material) {
          child.material.map = drawingTexture
          child.material.needsUpdate = true
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

// Smooth easing function
function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

// Loading component
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
          toneMappingExposure: 0.8,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        <directionalLight position={[-3, 5, -5]} intensity={0.3} />
        <Suspense fallback={<Loader />}>
          <Model activeCamera={activeCamera} drawingTexture={drawingTexture} />
        </Suspense>
      </Canvas>
    </div>
  )
}
