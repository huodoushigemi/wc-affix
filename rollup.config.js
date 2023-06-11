import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import typescript from '@rollup/plugin-typescript'
import pkg from './package.json' assert { type: 'json' }

const formats = {
  esm: 'mjs',
  cjs: 'cjs',
  iife: 'iife.js'
}

export default defineConfig({
  input: 'src/index.ts',
  output: Object.entries(formats).map(([format, ext]) => ({
    format,
    file: `./dist/index.${ext}`
  })),
  external: Object.keys(pkg.dependencies ?? []),
  // prettier-ignore
  plugins: [
    esbuild({ minify: true }),
    typescript({ declaration: true, emitDeclarationOnly: true, outDir: './dist' }),
  ]
})