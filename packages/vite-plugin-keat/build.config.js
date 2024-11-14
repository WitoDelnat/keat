import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'vite-plugin-keat',
            fileName: 'index',
        },
        rollupOptions: {
            external: ['path', 'fs'],
        },
    },
})
