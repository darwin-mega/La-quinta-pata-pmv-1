import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'La Quinta Pata',
    short_name: 'Quinta Pata',
    description: 'Juego presencial de debate, argumentación y detección de falacias',
    start_url: '/',
    display: 'standalone',
    background_color: '#121319',
    theme_color: '#121319',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ],
  }
}
