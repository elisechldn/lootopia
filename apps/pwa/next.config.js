/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${process.env.INTERNAL_API_URL ?? 'http://localhost:8000'}/:path*`,
    },
  ],
};

export default nextConfig;
