/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for smaller Docker images
  output: 'standalone',

  // Tell Turbopack that this frontend directory is the project root
  turbopack: {
    root: import.meta.dirname,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
    ],
  },

  async rewrites() {
    // Use BACKEND_URL env var in Docker (http://api:5000), fallback to localhost for local dev
    const backend = process.env.BACKEND_URL || 'http://localhost:5000';
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
