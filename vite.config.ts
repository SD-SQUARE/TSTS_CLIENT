import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd(), ''); 

    return defineConfig({
        plugins: [react()],
        // Always use absolute paths in production so assets resolve correctly
        // regardless of which route the user refreshes on.
        // For Electron builds, use relative paths so file:// protocol works.
        base: env.VITE_ELECTRON === 'true' ? './' : (env.VITE_APP_BASE_PATH || '/'),
        define: {
            'process.env': env // optional
        },
        server: {
            host: true,
            proxy: {
                '/api': {
                    target: `${env.VITE_API_PROTOCOL}://${env.VITE_API_HOST}:${env.VITE_API_PORT}` ,
                    changeOrigin: true,
                },
                '/socket.io': {
                    target: `${env.VITE_API_PROTOCOL}://${env.VITE_API_HOST}:${env.VITE_API_PORT}`,
                    ws: true,
                    changeOrigin: true,
                },
            },
            port: (env.VITE_APP_PORT as unknown as number) ?? 3000
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
    });
};
