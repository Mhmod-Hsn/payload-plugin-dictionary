import path from 'path'
import { loadEnv } from 'payload/node'
import { fileURLToPath } from 'url'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default defineConfig(() => {
  loadEnv(path.resolve(dirname, './dev'))

  return {
    plugins: [
      tsconfigPaths({
        ignoreConfigErrors: true,
      }),
    ],
    resolve: {
      alias: {
        '@payload-config': path.resolve(dirname, './dev/payload.config.ts'),
        'payload-plugin-dictionary/client': path.resolve(dirname, './src/client/index.tsx'),
        'payload-plugin-dictionary/cache': path.resolve(dirname, './src/cache/getDictionary.ts'),
        'payload-plugin-dictionary': path.resolve(dirname, './src/index.ts'),
      },
    },
    test: {
      environment: 'node',
      hookTimeout: 300_000,
      testTimeout: 60_000,
      include: ['dev/int.spec.ts'],
    },
  }
})
