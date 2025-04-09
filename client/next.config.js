/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Enable `true` if possible
  pageExtensions: ["js", "jsx", "mdx"],

  async rewrites() {
    return [
      {
        source: "/flights",
        destination: "/flight/index",
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "header",
            key: "x-forwarded-proto",
            value: "http",
          },
        ],
        destination: "https://travelsqr.com/:path*",
        permanent: true,
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude specific directories from being watched
      config.watchOptions.ignored = ["**/node_modules", "**/.git", "/tmp"];
    }
    return config;
  },
};

module.exports = nextConfig;
