/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing image rules stay exactly the same
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  // NEW: The Proxy Tunnel
  async rewrites() {
    return [
      {
        source: "/supabase/:path*",
        // CRITICAL: Replace the URL below with your actual Supabase Project URL!
        destination: "https://foauzjwnluooojshbdnp.supabase.co/:path*",
      },
    ];
  },
};
export default nextConfig;
module.exports = nextConfig;
