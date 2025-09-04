import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import nodePolyfills from 'rollup-plugin-node-polyfills';
import inject from '@rollup/plugin-inject'; // <-- ADD THIS

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Polyfill Buffer & process manually
      buffer: 'buffer', // <--- this helps with resolution
      process: 'process/browser', // optional if process is also needed
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.ANCHOR_BROWSER': JSON.stringify(true),
  },
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills(),
        inject({
          Buffer: ['buffer', 'Buffer'], // <--- this makes Buffer available globally
        }),
      ],
    },
  },
  optimizeDeps: {
    include: ['buffer'], // <--- preload buffer for dev
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
}));
