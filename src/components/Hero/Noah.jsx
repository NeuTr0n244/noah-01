import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'

// Create paper - white plane, slightly bent
function createPaper() {
  const geometry = new THREE.PlaneGeometry(0.15, 0.18, 10, 10)

  // Bend paper slightly
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = Math.sin(x * 5) * 0.01 + Math.cos(y * 4) * 0.008
    position.setZ(i, z)
  }
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    side: THREE.DoubleSide,
    roughness: 0.95,
    metalness: 0,
  })

  const paper = new THREE.Mesh(geometry, material)
  paper.name = 'paper'
  paper.castShadow = true
  paper.receiveShadow = true

  return paper
}

// Create pencil - cylinder with tip
function createPencil() {
  const group = new THREE.Group()
  group.name = 'pencil'

  // Pencil body - yellow
  const bodyGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.1, 8)
  const bodyMat = new THREE.MeshStandardMaterial({
    color: '#f4d03f',
    roughness: 0.5,
  })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.position.y = 0.05
  group.add(body)

  // Wood tip
  const tipGeo = new THREE.ConeGeometry(0.006, 0.02, 8)
  const tipMat = new THREE.MeshStandardMaterial({
    color: '#c9a66b',
    roughness: 0.6,
  })
  const tip = new THREE.Mesh(tipGeo, tipMat)
  tip.position.y = -0.01
  tip.rotation.x = Math.PI
  group.add(tip)

  // Lead point
  const leadGeo = new THREE.ConeGeometry(0.002, 0.008, 8)
  const leadMat = new THREE.MeshStandardMaterial({
    color: '#2d2d2d',
    roughness: 0.3,
  })
  const lead = new THREE.Mesh(leadGeo, leadMat)
  lead.position.y = -0.024
  lead.rotation.x = Math.PI
  group.add(lead)

  // Eraser
  const eraserGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.012, 8)
  const eraserMat = new THREE.MeshStandardMaterial({
    color: '#ffb5b5',
    roughness: 0.7,
  })
  const eraser = new THREE.Mesh(eraserGeo, eraserMat)
  eraser.position.y = 0.106
  group.add(eraser)

  // Metal band
  const bandGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.006, 8)
  const bandMat = new THREE.MeshStandardMaterial({
    color: '#888888',
    roughness: 0.2,
    metalness: 0.8,
  })
  const band = new THREE.Mesh(bandGeo, bandMat)
  band.position.y = 0.097
  group.add(band)

  return group
}

// Apply drawing pose - arms down and forward, hands together
function applyDrawingPose(object) {
  object.traverse((child) => {
    if (child.isBone || child.type === 'Bone') {
      const name = child.name.toLowerCase()

      // === LEFT ARM - holding paper ===
      // Shoulder
      if (name.includes('leftshoulder') || name.includes('left_shoulder') || name.includes('l_shoulder') || name.includes('shoulder.l')) {
        child.rotation.set(0.2, 0, 0.4)
      }
      // Upper arm - rotate down and forward
      if (name.includes('leftarm') || name.includes('left_arm') || name.includes('l_arm') ||
          name.includes('leftupperarm') || name.includes('l_upperarm') || name.includes('upperarm.l') ||
          name.includes('arm.l')) {
        child.rotation.set(0.8, 0.3, 1.4) // Down, forward, inward
      }
      // Forearm - bend toward center
      if (name.includes('leftforearm') || name.includes('left_forearm') || name.includes('l_forearm') ||
          name.includes('leftlowerarm') || name.includes('l_lowerarm') || name.includes('forearm.l') ||
          name.includes('lowerarm.l')) {
        child.rotation.set(0.3, 0.5, 0.4) // Bend inward
      }
      // Hand
      if (name.includes('lefthand') || name.includes('left_hand') || name.includes('l_hand') || name.includes('hand.l')) {
        child.rotation.set(-0.3, 0, 0.1)
      }

      // === RIGHT ARM - holding pencil ===
      // Shoulder
      if (name.includes('rightshoulder') || name.includes('right_shoulder') || name.includes('r_shoulder') || name.includes('shoulder.r')) {
        child.rotation.set(0.2, 0, -0.4)
      }
      // Upper arm - rotate down and forward
      if (name.includes('rightarm') || name.includes('right_arm') || name.includes('r_arm') ||
          name.includes('rightupperarm') || name.includes('r_upperarm') || name.includes('upperarm.r') ||
          name.includes('arm.r')) {
        child.rotation.set(0.8, -0.3, -1.4) // Down, forward, inward
      }
      // Forearm - bend toward center
      if (name.includes('rightforearm') || name.includes('right_forearm') || name.includes('r_forearm') ||
          name.includes('rightlowerarm') || name.includes('r_lowerarm') || name.includes('forearm.r') ||
          name.includes('lowerarm.r')) {
        child.rotation.set(0.3, -0.5, -0.4) // Bend inward
      }
      // Hand
      if (name.includes('righthand') || name.includes('right_hand') || name.includes('r_hand') || name.includes('hand.r')) {
        child.rotation.set(-0.3, 0, -0.1)
      }

      // === MIXAMO NAMING ===
      if (name === 'mixamorigleftshoulder') {
        child.rotation.set(0.2, 0, 0.4)
      }
      if (name === 'mixamorigleftarm') {
        child.rotation.set(0.8, 0.3, 1.4)
      }
      if (name === 'mixamorigleftforearm') {
        child.rotation.set(0.3, 0.5, 0.4)
      }
      if (name === 'mixamoriglefthand') {
        child.rotation.set(-0.3, 0, 0.1)
      }
      if (name === 'mixamorigrightshoulder') {
        child.rotation.set(0.2, 0, -0.4)
      }
      if (name === 'mixamorigrightarm') {
        child.rotation.set(0.8, -0.3, -1.4)
      }
      if (name === 'mixamorigrightforearm') {
        child.rotation.set(0.3, -0.5, -0.4)
      }
      if (name === 'mixamorigrighthand') {
        child.rotation.set(-0.3, 0, -0.1)
      }

      // Slight head tilt - looking down at hands
      if (name.includes('head') || name.includes('neck')) {
        child.rotation.x = 0.15
      }
    }
  })
}

// Find hand bones
function findHandBones(object) {
  let leftHand = null
  let rightHand = null

  object.traverse((child) => {
    if (child.isBone || child.type === 'Bone') {
      const name = child.name.toLowerCase()

      if (!leftHand && (
        name.includes('lefthand') || name.includes('left_hand') || name.includes('l_hand') ||
        name.includes('hand.l') || name.includes('hand_l') || name === 'mixamoriglefthand' ||
        name.includes('wrist.l') || name.includes('leftwrist')
      )) {
        leftHand = child
        console.log('Left hand bone:', child.name)
      }

      if (!rightHand && (
        name.includes('righthand') || name.includes('right_hand') || name.includes('r_hand') ||
        name.includes('hand.r') || name.includes('hand_r') || name === 'mixamorigrighthand' ||
        name.includes('wrist.r') || name.includes('rightwrist')
      )) {
        rightHand = child
        console.log('Right hand bone:', child.name)
      }
    }
  })

  return { leftHand, rightHand }
}

// Debug cube
function DebugCube() {
  const meshRef = useRef()
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffb5b5" />
    </mesh>
  )
}

// NOAH model component
function NoahModel({ isDrawing }) {
  const groupRef = useRef()
  const modelRef = useRef()
  const { camera } = useThree()
  const time = useRef(0)
  const zoomDirection = useRef(1)
  const currentZoom = useRef(3.5)

  const { scene } = useGLTF('/models/scene.gltf')

  // Prepare scene with pose and props
  const clonedScene = useMemo(() => {
    if (!scene) return null
    const clone = scene.clone()

    // Log bones for debugging
    console.log('=== BONES IN MODEL ===')
    clone.traverse((child) => {
      if (child.isBone || child.type === 'Bone') {
        console.log('Bone:', child.name)
      }
    })

    // Apply drawing pose - arms forward and down
    applyDrawingPose(clone)

    // Find hands and attach props
    const { leftHand, rightHand } = findHandBones(clone)

    // Attach paper to left hand
    if (leftHand) {
      const paper = createPaper()
      // Position paper in front of hand, angled like being held
      paper.position.set(0.02, -0.08, 0.05)
      paper.rotation.set(-0.5, 0.3, 0.2)
      leftHand.add(paper)
      console.log('Paper attached to left hand')
    }

    // Attach pencil to right hand
    if (rightHand) {
      const pencil = createPencil()
      // Position pencil angled down toward paper
      pencil.position.set(0, -0.06, 0.03)
      pencil.rotation.set(-1.2, 0.3, 0.5) // Angled down toward paper
      rightHand.add(pencil)
      console.log('Pencil attached to right hand')
    }

    return clone
  }, [scene])

  // Calculate scale
  const modelScale = useMemo(() => {
    if (!scene) return 2
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const targetSize = 2.5
    const maxDim = Math.max(size.x, size.y, size.z)
    return maxDim > 0 ? targetSize / maxDim : 2
  }, [scene])

  // Warm tint materials
  useEffect(() => {
    if (clonedScene) {
      clonedScene.traverse((child) => {
        if (child.isMesh && child.name !== 'paper' && !child.parent?.name?.includes('pencil')) {
          child.castShadow = true
          child.receiveShadow = true
          if (child.material && !child.material._tinted) {
            child.material = child.material.clone()
            child.material._tinted = true
            if (child.material.color) {
              child.material.color.lerp(new THREE.Color('#fff5e6'), 0.08)
            }
          }
        }
      })
    }
  }, [clonedScene])

  // Camera setup - focus on torso/hands
  useEffect(() => {
    // Position camera to focus on torso and hands area
    camera.position.set(0, -0.3, 3.5) // Slightly below center, close
    camera.lookAt(0, -0.3, 0) // Look at chest/hand area
  }, [camera])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    time.current += delta

    // Gentle breathing
    const breathe = Math.sin(time.current * 0.5) * 0.015
    const breatheScale = 1 + Math.sin(time.current * 0.5) * 0.005

    if (modelRef.current) {
      modelRef.current.position.y = breathe
      modelRef.current.scale.setScalar(modelScale * breatheScale)
    }

    // Very slow zoom - staying close to hands
    const zoomSpeed = 0.04
    const minZoom = 3.0
    const maxZoom = 4.0

    currentZoom.current += zoomDirection.current * zoomSpeed * delta
    if (currentZoom.current >= maxZoom) {
      currentZoom.current = maxZoom
      zoomDirection.current = -1
    } else if (currentZoom.current <= minZoom) {
      currentZoom.current = minZoom
      zoomDirection.current = 1
    }

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, currentZoom.current, 0.01)
    camera.lookAt(0, -0.3, 0)
  })

  if (!clonedScene) return <DebugCube />

  return (
    <group ref={groupRef}>
      <Center>
        <primitive
          ref={modelRef}
          object={clonedScene}
          scale={modelScale}
          position={[0, 0, 0]}
        />
      </Center>
    </group>
  )
}

export default function Noah({ isDrawing }) {
  return (
    <>
      {/* Soft warm lighting */}
      <ambientLight intensity={0.8} />

      {/* Main light from above-front */}
      <directionalLight
        position={[2, 4, 5]}
        intensity={1}
        color="#fff8f0"
      />

      {/* Fill from left - pink tint */}
      <pointLight
        position={[-3, 0, 3]}
        intensity={0.5}
        color="#ffdddd"
        distance={10}
      />

      {/* Fill from right - blue tint */}
      <pointLight
        position={[3, 0, 3]}
        intensity={0.5}
        color="#ddeeff"
        distance={10}
      />

      {/* Light on hands area */}
      <pointLight
        position={[0, -1, 2]}
        intensity={0.6}
        color="#fffaf0"
        distance={5}
      />

      <NoahModel isDrawing={isDrawing} />
    </>
  )
}

useGLTF.preload('/models/scene.gltf')
