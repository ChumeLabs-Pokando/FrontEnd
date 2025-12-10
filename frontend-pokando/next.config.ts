/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // Permite fotos do Google
      },
    ],
  },
};

export default nextConfig;