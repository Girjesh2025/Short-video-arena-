/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      {
        source: '/musics/:path*',
        destination: 'http://localhost:8080/musics/:path*',
      },
      {
        source: '/video_materials/:path*',
        destination: 'http://localhost:8080/video_materials/:path*',
      },
      {
        source: '/stream/:path*',
        destination: 'http://localhost:8080/stream/:path*',
      },
      {
        source: '/download/:path*',
        destination: 'http://localhost:8080/download/:path*',
      },
      {
        source: '/tasks/:path*',
        destination: 'http://localhost:8080/tasks/:path*',
      },
    ];
  },
};

export default nextConfig;
