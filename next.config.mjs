/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add headers to allow cross-origin embedding
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none'
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade'
          },

          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors * 'self' data: blob:; object-src 'none';"
          }
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Handle platform-specific Remotion packages
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        // Darwin (macOS)
        "@remotion/compositor-darwin-x64": false,
        "@remotion/compositor-darwin-arm64": false,

        // Linux
        "@remotion/compositor-linux-x64": false,
        "@remotion/compositor-linux-arm64": false,
        "@remotion/compositor-linux-x64-musl": false,
        "@remotion/compositor-linux-arm64-musl": false,
        "@remotion/compositor-linux-x64-gnu": false,
        "@remotion/compositor-linux-arm64-gnu": false,

        // Windows
        "@remotion/compositor-win32-x64": false,
        "@remotion/compositor-windows-x64": false,

        // Handle esbuild
        esbuild: false,
      },
    };

    // Add esbuild to external modules
    if (isServer) {
      config.externals = [...config.externals, "esbuild"];
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@remotion/bundler",
      "@remotion/renderer",
      "esbuild",
    ],
  },
};

export default nextConfig;
