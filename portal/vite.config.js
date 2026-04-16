import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Permet d'éviter l'erreur WebSocket 504 quand on utilise Ngrok
    hmr: true,
    allowedHosts: true, // Pour Vite >= 5.x
    cors: true,
    proxy: {
      '/api/utilisateurs': {
        target: 'https://doorstep-bobsled-nutrient.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api/equipes': {
        target: 'https://doorstep-bobsled-nutrient.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api/equipements': {
        target: 'https://shemika-flutiest-absolutistically.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api/categories': {
        target: 'https://shemika-flutiest-absolutistically.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api/notifications': {
        target: 'https://knapsack-cesspool-gangly.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api/affectations': {
        target: 'http://localhost:8082',
        changeOrigin: true,
        secure: false
      },
      '/api/incidents': {
        target: 'https://flakily-rotunda-skid.ngrok-free.dev',
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
