/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // Keeps your Supabase access
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // <-- NEW: Allows your Cloudinary images!
      },
    ],
  },
};

module.exports = nextConfig;
// Note: If your file is named next.config.mjs, use 'export default nextConfig;' at the bottom instead!
