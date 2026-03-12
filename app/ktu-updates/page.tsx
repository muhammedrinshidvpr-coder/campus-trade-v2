import React from "react";
import KtuUpdates from "@/app/components/KtuUpdates";

export default function KtuUpdatesPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-28 px-4 pb-12 w-full">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            KTU{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              Notice Board
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Stay updated with the latest university announcements and exam
            schedules.
          </p>
        </div>

        {/* The Updates Window */}
        <KtuUpdates />
      </div>
    </div>
  );
}
