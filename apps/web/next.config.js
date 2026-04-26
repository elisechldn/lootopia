/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  rewrites: async () => {
    const minio = process.env.MINIO_INTERNAL_URL;
    const bucket = process.env.S3_BUCKET ?? 'lootopia-public';
    return [
      {
        source: '/assets/:path*',
        destination: `${minio}/${bucket}/:path*`,
      },
    ];
  },
};

export default nextConfig;
