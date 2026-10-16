import type { MetadataRoute } from 'next';

// Lets the app be added to a phone's home screen and open full screen
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hanabi Digital',
    short_name: 'Hanabi',
    description: 'A digital companion for playing Hanabi',
    start_url: '/',
    display: 'standalone',
    background_color: '#131113',
    theme_color: '#131113',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
