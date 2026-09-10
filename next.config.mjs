/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    // Covers server actions; route handlers on Node read FormData without the 1MB default.
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  // Enable compression
  compress: true,
  
  // Configure external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
    ],
  },
  
  // Cache headers for static assets including videos
  async headers() {
    return [
      {
        source: '/:all*(mp4|webm|ogg)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(jpg|jpeg|png|gif|ico|svg|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // SEO: www → non-www 301 (backup if nginx misses a host; primary fix is nginx)
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vyntechsolutions.ca" }],
        destination: "https://vyntechsolutions.ca/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
