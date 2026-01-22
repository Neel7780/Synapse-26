import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ==========================================================================
  // Output Configuration
  // ==========================================================================
  // Standalone mode for Docker deployment - creates minimal server bundle
  output: "standalone",

  // ==========================================================================
  // Image Optimization - Mobile First
  // ==========================================================================
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/**",
      },
    ],
    // Optimize image formats - prioritize modern formats for mobile
    formats: ["image/avif", "image/webp"],
    // Mobile-first device sizes (smaller sizes first for mobile priority)
    deviceSizes: [320, 375, 414, 640, 750, 828, 1080, 1200, 1920, 2048],
    // Smaller image sizes for mobile icons and thumbnails
    imageSizes: [16, 32, 48, 64, 96, 128, 192, 256, 384],
    // Aggressive caching for mobile bandwidth optimization
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Limit concurrent image optimizations for memory efficiency
    dangerouslyAllowSVG: false,
    contentDispositionType: "inline",
  },

  // ==========================================================================
  // Performance Optimizations
  // ==========================================================================
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Generate ETags for caching
  generateEtags: true,

  // Power by header (disable for security)
  poweredByHeader: false,

  // ==========================================================================
  // Build Optimizations
  // ==========================================================================
  // Experimental features for performance
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      "lucide-react",
      "@tabler/icons-react",
      "framer-motion",
      "recharts",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },

  // ==========================================================================
  // Headers for Security, Caching & Mobile Optimization
  // ==========================================================================
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Security headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Mobile optimization headers
          {
            key: "Vary",
            value: "Accept-Encoding, User-Agent",
          },
          // Enable preconnect hints for faster mobile loading
          {
            key: "Link",
            value: "<https://fonts.googleapis.com>; rel=preconnect, <https://fonts.gstatic.com>; rel=preconnect; crossorigin",
          },
        ],
      },
      {
        // Cache static assets aggressively - critical for mobile data savings
        source: "/(.*)\\.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Vary",
            value: "Accept-Encoding",
          },
        ],
      },
      {
        // Cache JS/CSS with revalidation
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Service worker and manifest for PWA/mobile
        source: "/(sw.js|manifest.json|manifest.webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },

  // ==========================================================================
  // Redirects & Rewrites
  // ==========================================================================
  async redirects() {
    return [
      // Add any redirects here if needed
    ];
  },

  // ==========================================================================
  // Turbopack Configuration (Next.js 16+)
  // ==========================================================================
  turbopack: {
    // Turbopack root directory (fixes multiple lockfile warning)
    root: __dirname,
  },
};

export default nextConfig;
