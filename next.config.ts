import type { NextConfig } from "next";

function stripTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

const apiProxyTarget = process.env.API_PROXY_TARGET
  ? stripTrailingSlash(process.env.API_PROXY_TARGET)
  : "";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!apiProxyTarget) return [];

    return [
      {
        source: "/backend/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
