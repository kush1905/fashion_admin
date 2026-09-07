import type { NextConfig } from "next";
import path from "path";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

// Fail Vercel / production builds early instead of shipping a localhost fallback.
if (process.env.VERCEL && !configuredApiUrl) {
  throw new Error(
    "NEXT_PUBLIC_API_URL must be set for Vercel builds (e.g. https://your-api.onrender.com/api). Set it in Project Settings → Environment Variables, then redeploy.",
  );
}

const apiHost = (() => {
  try {
    const url = configuredApiUrl;
    if (!url) return null;
    return new URL(url.replace(/\/api\/?$/, "")).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  // Explicitly expose the public API URL so client bundles always receive the
  // value present at build time (Vercel Production env → inlined into browser JS).
  env: {
    NEXT_PUBLIC_API_URL:
      configuredApiUrl ||
      (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000/api"),
  },
  devIndicators: false,
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "http", hostname: "localhost", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/uploads/**" },
      ...(apiHost
        ? ([
            { protocol: "https", hostname: apiHost, pathname: "/uploads/**" },
            { protocol: "http", hostname: apiHost, pathname: "/uploads/**" },
          ] as const)
        : []),
    ],
  },
};

export default nextConfig;
