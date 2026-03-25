import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: projectRoot,
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    appType: 'spa',
    server: {
        // Bind one IPv4 address; avoid [::1] in public/hot (Windows issues)
        host: '127.0.0.1',
        port: 5173,
        strictPort: false,
        // Laravel page can be http://localhost:8000 OR http://127.0.0.1:8000 — different origin than :5173, so module scripts need CORS
        cors: {
            origin: [
                'http://127.0.0.1:8000',
                'http://localhost:8000',
                'http://[::1]:8000',
            ],
        },
        hmr: {
            host: '127.0.0.1',
            port: 5173,
            protocol: 'ws',
        },
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
            },
        },
    },
});
