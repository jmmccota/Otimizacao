import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts: no router generator / PWA plugin in tests, but the same
// React + React Compiler transform as production so component tests exercise what ships.
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  test: { include: ['tests/**/*.test.{ts,tsx}'], environment: 'node' },
})
