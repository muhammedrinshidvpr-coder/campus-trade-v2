import Link from "next/link";
import FeaturedStartupAd from "@/app/components/FeaturedStartupAd";

export default function LandingPage() {
  return (
    // FIX: Added w-full and overflow-x-hidden to completely stop mobile side-scrolling
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-950 flex flex-col selection:bg-indigo-500/30 relative">
      {/* --- PREMIUM BACKGROUND ELEMENTS --- */}
      {/* 1. Tech Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>

      {/* 2. Floating Background Glows */}
      {/* FIX: Made the glowing orbs smaller on mobile screens so they don't force the screen to stretch */}
      <div className="absolute top-1/4 left-0 md:left-1/4 w-[250px] md:w-96 h-[250px] md:h-96 bg-indigo-600/20 rounded-full blur-[100px] md:blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-0 md:right-1/4 w-[200px] md:w-96 h-[200px] md:h-96 bg-emerald-600/10 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>

      {/* FIX: Ensured the main wrapper doesn't exceed 100% width */}
      <main className="flex-grow flex items-center justify-center relative z-10 w-full px-4 overflow-hidden">
        <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-10 py-16">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs md:text-sm font-medium text-slate-300 mb-4 shadow-2xl">
            <span className="flex w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            TKM College's Official Marketplace
          </div>

          {/* Headline */}
          {/* FIX: Scaled down text size for mobile (text-5xl) to prevent word breaking */}
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[1.1] md:leading-[0.9]">
            Trade your campus gear <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-indigo-400 bg-[length:200%_auto] animate-text-shimmer">
              in seconds.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium px-2">
            Buy textbooks, sell your old electronics, and support student brands
            built right here at TKM.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <Link
              href="/marketplace"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-emerald-600 hover:scale-105 active:scale-95 text-white font-bold rounded-2xl text-base md:text-lg transition-all shadow-[0_0_40px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 group"
            >
              <span>Explore Marketplace</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl border border-white/10 text-base md:text-lg transition-all backdrop-blur-xl flex items-center justify-center hover:border-white/20"
            >
              Make a Profile
            </Link>
          </div>

          {/* --- THE PREMIUM FEATURED AD SLOT --- */}
          <div className="w-full max-w-2xl mx-auto mt-16 md:mt-20 px-2 md:px-0">
            <FeaturedStartupAd />
          </div>

          {/* --- THE NEW KTU UPDATES BOARD --- */}
          <div className="w-full mx-auto mt-12 md:mt-16 px-2 sm:px-4 text-left"></div>
        </div>
      </main>
    </div>
  );
}
