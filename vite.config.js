import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin to exclude large files from build
const excludeLargeFiles = () => {
  let glbBackup = []

  return {
    name: 'exclude-large-files',
    buildStart() {
      // Before build: temporarily rename GLB files so Vite doesn't copy them
      const publicDir = path.resolve(process.cwd(), 'public')
      const modelsDir = path.join(publicDir, 'models')

      if (fs.existsSync(modelsDir)) {
        const files = fs.readdirSync(modelsDir)
        files.forEach(file => {
          if (file.endsWith('.glb')) {
            const filePath = path.join(modelsDir, file)
            const backupPath = filePath + '.backup'
            if (fs.existsSync(filePath)) {
              fs.renameSync(filePath, backupPath)
              glbBackup.push({ original: filePath, backup: backupPath })
              console.log(`Excluded from build: ${file}`)
            }
          }
        })
      }
    },
    closeBundle() {
      // After build: restore original GLB files
      glbBackup.forEach(({ original, backup }) => {
        if (fs.existsSync(backup)) {
          fs.renameSync(backup, original)
          console.log(`Restored: ${path.basename(original)}`)
        }
      })
      glbBackup = []
    }
  }
}

export default defineConfig({
  plugins: [react(), excludeLargeFiles()],
  assetsInclude: ['**/*.glb', '**/*.gltf']
})
