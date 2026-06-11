/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  rewrites: async () => {
    const minio = process.env.MINIO_INTERNAL_URL ?? "http://localhost:9000";
    const bucket = process.env.S3_BUCKET ?? "lootopia-public";
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:8000"}/:path*`,
      },
      {
        source: "/assets/:path*",
        destination: `${minio}/${bucket}/:path*`,
      },
    ];
  },
};

export default nextConfig;
