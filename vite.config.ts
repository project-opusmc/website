import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const apiPort=Number(process.env.OPUS_API_PORT||8787);
const vitePort=Number(process.env.OPUS_VITE_PORT||5173);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: vitePort,
    strictPort: true,
    proxy: {
      '/api': 'http://127.0.0.1:'+apiPort,
    },
  },
});
