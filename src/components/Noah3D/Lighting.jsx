/**
 * ============================================================================
 * LIGHTING SETUP - Child-friendly warm tones
 * ============================================================================
 *
 * Professional 3-point lighting:
 * - Key Light: Main illumination (top-front-right)
 * - Fill Light: Softens shadows (front-left)
 * - Rim Light: Edge separation (back)
 *
 * ============================================================================
 */
export default function Lighting() {
  return (
    <>
      {/* =============================================
          AMBIENT - Base illumination
          Prevents pure black shadows
          ============================================= */}
      <ambientLight
        intensity={0.5}
        color="#fff5e6"
      />

      {/* =============================================
          HEMISPHERE - Natural sky/ground gradient
          ============================================= */}
      <hemisphereLight
        color="#ffeedd"
        groundColor="#ddccbb"
        intensity={0.4}
      />

      {/* =============================================
          KEY LIGHT - Main light source
          Top-front-right position
          Casts primary shadows
          ============================================= */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.4}
        color="#fffaf5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0001}
        shadow-radius={3}
      />

      {/* =============================================
          FILL LIGHT - Softens shadows
          Front-left, cooler tone for contrast
          ============================================= */}
      <directionalLight
        position={[-3, 2, 3]}
        intensity={0.5}
        color="#e8f4ff"
      />

      {/* =============================================
          RIM LIGHT - Edge highlight
          Back position for depth separation
          ============================================= */}
      <directionalLight
        position={[0, 3, -4]}
        intensity={0.35}
        color="#fff0f5"
      />

      {/* =============================================
          ACCENT LIGHTS - Playful colored highlights
          ============================================= */}

      {/* Left - warm pink */}
      <pointLight
        position={[-2, 1, 1]}
        intensity={0.25}
        color="#ffdddd"
        distance={6}
        decay={2}
      />

      {/* Right - cool blue */}
      <pointLight
        position={[2, 1, 1]}
        intensity={0.25}
        color="#ddeeff"
        distance={6}
        decay={2}
      />

      {/* =============================================
          BOUNCE LIGHT - Ground reflection
          Illuminates underside subtly
          ============================================= */}
      <pointLight
        position={[0, -0.3, 1.5]}
        intensity={0.15}
        color="#ffeedd"
        distance={4}
        decay={2}
      />
    </>
  )
}
