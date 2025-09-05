import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import nodePolyfills from 'rollup-plugin-node-polyfills'; // <-- Add this import

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
     nodePolyfills(),
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add this section to resolve browser compatibility issues
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.ANCHOR_BROWSER': JSON.stringify(true),
  },
  build: {
    rollupOptions: {
      external: ['buffer'],
      plugins: [
        nodePolyfills() // <-- Use the imported polyfills here
      ],
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        {
          name: 'buffer-and-process-shim',
          setup(build) {
            // Note: This part might also need refactoring to use fs.promises
            // if it's running in an ESM context and fs is not available.
          }
        }
      ]
    }
  }
}));
