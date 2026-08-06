/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    qualities: [55, 60, 65, 70, 75, 80],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/panel",
        permanent: true,
      },
      {
        source: "/admin/:path*",
        destination: "/panel/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
