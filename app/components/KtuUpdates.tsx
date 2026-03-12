import React from "react";

export default function KtuUpdates() {
  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div>
          <h2 className="text-2xl font-bold text-white">KTU Live Updates</h2>
          <p className="text-sm text-gray-400">Official announcements board</p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold text-green-400 bg-green-400/10 rounded-full border border-green-400/20">
          🟢 Live Connection
        </span>
      </div>

      {/* The Magic Window (Iframe) */}
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-gray-800 shadow-2xl bg-white">
        <iframe
          src="https://ktu.edu.in/menu/announcements"
          className="w-full h-full border-none"
          title="KTU Announcements"
          loading="lazy"
        />

        {/* Mobile Swipe Hint */}
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none md:hidden">
          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
            Scroll inside to read
          </span>
        </div>
      </div>
    </div>
  );
}
