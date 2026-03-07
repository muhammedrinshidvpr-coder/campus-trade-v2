import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Your existing image rules
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // The Proxy Tunnel for Supabase
  async rewrites() {
    return [
      {
        source: "/supabase/:path*",
        destination: "https://foauzjwnluooojshbdnp.supabase.co/:path*",
      },
    ];
  },
};

export default nextConfig;
