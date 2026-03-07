"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

type Startup = {
  id: string;
  name: string;
  tagline: string;
  logo_url: string;
  ad_image_url: string; // NEW: Added the promo image URL
  action_link: string;
};

export default function FeaturedStartupAd() {
  const [featured, setFeatured] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);

  // NEW: State to control the Popup Modal
  const [activePromo, setActivePromo] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // Fetch the ONE featured startup
      const { data, error } = await supabase
        .from("startups")
        .select("*")
        .eq("is_featured", true)
        .limit(1)
        .single();

      if (data) {
        setFeatured(data);
      }
      setLoading(false);
    };

    fetchFeatured();
  }, []);

  if (loading || !featured) return null;

  return (
    <>
      {/* --- NEW: THE PROMO POPUP MODAL --- */}
      {activePromo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={() => setActivePromo(null)} // Close when clicking outside
        >
          <div
            className="relative max-w-md w-full bg-slate-900 rounded-2xl border border-yellow-500/30 p-2 shadow-[0_0_50px_rgba(253,224,71,0.15)] animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
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

      {/* --- THE PREMIUM GOLDEN AD CARD --- */}
      <div className="w-full relative rounded-2xl bg-gradient-to-r from-yellow-600 via-yellow-300 to-amber-600 p-[2px] mb-8 shadow-[0_0_30px_rgba(253,224,71,0.15)] transition-all hover:shadow-[0_0_40px_rgba(253,224,71,0.25)] group">
        {/* The Dark Inner Background */}
        <div className="relative bg-slate-950 rounded-[14px] p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-5 overflow-hidden">
          {/* Subtle Golden Glow inside the card */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent pointer-events-none"></div>

          {/* Ad Content */}
          <div className="flex items-center gap-4 w-full md:w-auto z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-slate-900 border border-yellow-500/30 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
              {featured.logo_url ? (
                <Image
                  src={featured.logo_url}
                  alt={featured.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover bg-white"
                  unoptimized
                />
              ) : (
                <span className="text-3xl">🚀</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-900 bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-0.5 rounded-full shadow-sm">
                  Sponsored Partner
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {featured.name}
              </h3>
              <p className="text-sm text-slate-300 mt-1">{featured.tagline}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto z-10">
            {/* Show 'View Promo' button ONLY if they uploaded an ad_image_url */}
            {featured.ad_image_url && (
              <button
                onClick={() => setActivePromo(featured.ad_image_url)}
                className="flex-1 md:flex-none px-5 py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-sm font-bold rounded-xl transition-all whitespace-nowrap text-center flex items-center justify-center gap-2"
              >
                <span>View Offers</span>
                <span>🎁</span>
              </button>
            )}

            <a
              href={featured.action_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 text-sm font-extrabold rounded-xl transition-all whitespace-nowrap text-center shadow-lg shadow-yellow-500/20"
            >
              Connect Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
