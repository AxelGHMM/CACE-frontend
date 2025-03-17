import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Cargar las variables de entorno desde el `.env` dentro de `frontend`
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd() + '/frontend');

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_FRONTEND_PORT) || 3000,
    },
    define: {
      'import.meta.env': env, // Hacer accesibles las variables de entorno en el frontend
    },
    build: {
      outDir: 'dist', // Asegura que la build se genere en 'dist'
      emptyOutDir: true, // Limpia la carpeta antes de la build
      assetsDir: 'assets', // Carpeta donde se guardarán los assets dentro de 'dist'
    },
  };
});
