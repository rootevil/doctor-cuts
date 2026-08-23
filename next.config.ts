import type { NextConfig } from "next";

const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Don't leak the framework in a header. Small win but free.
  poweredByHeader: false,

  // Enable compression at the framework layer (gzip). CDNs usually add
  // Brotli on top; setting this here means self-hosted deployments still
  // benefit.
  compress: true,

  reactStrictMode: true,

  images: {
    // Modern formats first. Next serves the best supported by the client.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
