import type { NextConfig } from "next";
import path from "path";

const apiHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) return null;
    return new URL(url.replace(/\/api\/?$/, "")).hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
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
