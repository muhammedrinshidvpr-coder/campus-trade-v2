"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";

type Startup = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  logo_url: string;
  ad_image_url: string; // NEW!
  action_link: string;
  is_featured: boolean;
  owner_id: string;
};

export default function StartupsDirectory() {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // NEW: State to control the Popup Modal
  const [activePromo, setActivePromo] = useState<string | null>(null);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data } = await supabase
        .from("startups")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (data) setStartups(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleShare = async (startup: Startup) => {
    // ... (Keep your existing share logic here) ...
    try {
      if (navigator.share) {
        await navigator.share({
          title: startup.name,
          url: startup.action_link,
        });
      } else {
        await navigator.clipboard.writeText(startup.action_link);
        alert("Link copied!");
      }
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    // ... (Keep your existing delete logic here) ...
    if (window.confirm("Delete startup?")) {
      await supabase.from("startups").delete().eq("id", id);
      setStartups(startups.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto relative">
      {/* --- NEW: THE PROMO POPUP MODAL --- */}
      {activePromo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setActivePromo(null)} // Close when clicking outside
        >
          <div
            className="relative max-w-md w-full bg-slate-900 rounded-2xl border border-white/10 p-2 shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()} // Prevent click from closing modal if clicking image
          >
            {/* Close Button */}
            <button
              onClick={() => setActivePromo(null)}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black p-2 rounded-full text-white backdrop-blur-sm transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            {/* The Full Ad Image */}
            <Image
              src={activePromo}
              alt="Promotional Offer"
              width={800}
              height={800}
              className="w-full h-auto rounded-xl object-contain max-h-[80vh]"
              unoptimized
            />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mb-4">
          Campus Startups Hub
        </h1>
        <div className="flex justify-center mt-8">
          <Link
            href="/register-startup"
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 border border-indigo-500/30 hover:border-indigo-400 rounded-full text-white font-bold transition-all overflow-hidden"
          >
            <span className="relative">Add Your Business</span>
            <span className="relative text-xl">🚀</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {startups.map((startup) => (
            <div
              key={startup.id}
              className="group relative bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col"
            >
              <div className="h-24 w-full bg-gradient-to-r from-indigo-600/80 to-purple-600/80 relative">
                {startup.is_featured && (
                  <div className="absolute top-3 right-3 bg-yellow-500/90 text-yellow-950 text-xs font-bold px-3 py-1 rounded-full">
                    Featured 🔥
                  </div>
                )}
              </div>

              <div className="absolute top-12 left-6">
                <div className="w-20 h-20 rounded-xl bg-slate-800 border-4 border-slate-900 overflow-hidden flex items-center justify-center">
                  {startup.logo_url ? (
                    <Image
                      src={startup.logo_url}
                      alt="logo"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span>🏢</span>
                  )}
                </div>
              </div>

              <div className="pt-12 px-6 pb-6 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-white mb-2">
                  {startup.name}
                </h2>
                <span className="inline-block text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">
                  {startup.category}
                </span>
                <p className="text-slate-200 font-medium text-sm mb-2">
                  {startup.tagline}
                </p>
                <p className="text-slate-400 text-sm line-clamp-3 mb-6">
                  {startup.description}
                </p>

                <div className="mt-auto flex flex-col gap-3">
                  {/* NEW: Promo Button (Only shows if they uploaded an ad) */}
                  {startup.ad_image_url && (
                    <button
                      onClick={() => setActivePromo(startup.ad_image_url)}
                      className="w-full py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 border border-purple-500/30 rounded-xl text-purple-300 font-bold transition-all flex justify-center items-center gap-2"
                    >
                      <span>View Offers</span>
                      <span>🎁</span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <a
                      href={startup.action_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-grow py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold transition-all flex justify-center items-center gap-2"
                    >
                      Connect
                    </a>

                    <button
                      onClick={() => handleShare(startup)}
                      className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 transition-all"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>

                    {currentUserId === startup.owner_id && (
                      <button
                        onClick={() => handleDelete(startup.id)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 transition-all"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
