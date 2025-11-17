import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Anton Quiz - Interactive Learning Platform',
    short_name: 'Anton Quiz',
    description: 'Practice questions and interactive learning with progress tracking and leaderboards',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF5E6',
    theme_color: '#4CAF50',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.ico',
        sizes: '32x32',
        type: 'image/x-icon',
      },
    ],
  }
}
