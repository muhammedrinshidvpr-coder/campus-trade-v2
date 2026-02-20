"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import DeleteButton from "../../components/DeleteButton";

// Define types (unchanged)
type Seller = {
  id: string;
  name: string;
  whatsapp_number: string;
};

type Item = {
  id: string;
  title: string;
  description: string;
  price: number;
  created_at: string;
  seller: Seller;
  image_url?: string;
  category?: string;
};

export default function MarketplaceGrid({ items }: { items: Item[] }) {
  // NOTE: We need state to track which item is currently opened in the modal
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // --- Search & Filter State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    fetchUser();
  }, []);

  // Helper function to close modal and prevent scrolling body
  const closeModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = "auto";
  };

  // Helper function to open modal and stop body scrolling background
  const openModal = (item: Item) => {
    setSelectedItem(item);
    document.body.style.overflow = "hidden";
  };

  const handleContactSeller = (item: Item) => {
    const cleanNumber = item.seller.whatsapp_number
      .replace(/^\+91/, "")
      .replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hi ${item.seller.name}! I'm interested in buying your "${item.title}" listed on CampusTrade for ₹${item.price}. Is it still available?`,
    );
    const whatsappUrl = `https://wa.me/91${cleanNumber}?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  const filteredItems = items.filter((item) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    const matchesCategory =
      activeCategory === "All" ||
      (item.category && item.category === activeCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* --- SEARCH & FILTER BAR (Made more compact for mobile) --- */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 backdrop-blur-xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xl">
        {/* Search Input */}
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/50 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500 text-sm"
          />
        </div>

        {/* Category Chips (Smaller on mobile) */}
        <div
          className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0"
          style={{ scrollbarWidth: "none" }}
        >
          {["All", "Textbooks", "Electronics", "Hostel Gear", "Other"].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                px-4 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all duration-300
                ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                }
              `}
              >
                {cat}
              </button>
            ),
          )}
        </div>
      </div>

      {/* --- EMPTY STATE --- */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">No items found</h3>
          <button
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("All");
            }}
            className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* --- THE NEW MOBILE-FIRST GRID --- */}
      {/* NOTE: Changed grid-cols-1 to grid-cols-2 for mobile. Reduced gap. */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {filteredItems.map((item) => (
          // NOTE: The entire card is now a button that opens the modal
          <button
            key={item.id}
            onClick={() => openModal(item)}
            className="group relative flex flex-col h-full text-left w-full"
          >
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl transition-all duration-300 h-full flex flex-col hover:shadow-lg hover:border-blue-500/30 hover:scale-[1.02]">
              {/* Item Image - NOTE: Changed to aspect-square for uniform grid */}
              <div className="relative w-full aspect-square bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
                {/* Time Badge - Smaller on mobile */}
                <div className="absolute top-2 right-2 z-20 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] md:text-xs text-white font-medium border border-white/10">
                  {formatTimeAgo(item.created_at)}
                </div>
              </div>

              {/* Compact Content for Grid View */}
              <div className="p-3 md:p-4 flex flex-col flex-grow">
                {item.category && (
                  <span className="inline-block text-slate-400 text-[10px] md:text-xs mb-1.5 w-max">
                    {item.category}
                  </span>
                )}

                {/* Title - Smaller font, clamps to 2 lines */}
                <h3 className="text-sm md:text-base font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>

                {/* NOTE: Description is HIDDEN in grid view to save space */}

                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-lg md:text-xl font-extrabold text-white">
                    ₹{item.price.toLocaleString("en-IN")}
                  </span>
                  {/* Seller Avatar - Small on mobile grid */}
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                    {item.seller?.name
                      ? item.seller.name.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* --- THE ZOOM MODAL (Detailed View) --- */}
      {selectedItem && (
        // Modal Overlay Background
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeModal} // Close when clicking outside
        >
          {/* Modal Content Card */}
          <div
            className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside closing modal
          >
            {/* Close Button ('X') */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Big Image in Modal */}
            <div className="relative w-full h-72 md:h-96 bg-zinc-800 flex items-center justify-center overflow-hidden">
              {selectedItem.image_url ? (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-6xl">📦</span>
              )}
            </div>

            {/* Full Details in Modal */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                {selectedItem.category && (
                  <span className="inline-block px-3 py-1 bg-white/10 text-slate-300 text-xs rounded-full mb-3">
                    {selectedItem.category}
                  </span>
                )}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {selectedItem.title}
                </h2>
                <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  ₹{selectedItem.price.toLocaleString("en-IN")}
                </div>
              </div>

              {/* Full Description */}
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">
                  Description
                </h4>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                  {selectedItem.description}
                </p>
              </div>

              {/* Seller Info Bar */}
              <div className="flex items-center p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {selectedItem.seller?.name
                    ? selectedItem.seller.name.charAt(0).toUpperCase()
                    : "?"}
                </div>
                <div className="ml-4">
                  <p className="text-white font-semibold">
                    {selectedItem.seller?.name || "Unknown Seller"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Posted {formatTimeAgo(selectedItem.created_at)}
                  </p>
                </div>
              </div>

              {/* Action Buttons (Moved inside modal) */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex gap-3 w-full">
                  {/* Contact Button */}
                  <button
                    onClick={() => handleContactSeller(selectedItem)}
                    className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>Contact</span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent clicking the modal background
                      const itemUrl = `${window.location.origin}/marketplace`;
                      const text = `Hey! I found "${selectedItem.title}" for ₹${selectedItem.price} on CampusTrade 🚀\n\nCheck it out here: ${itemUrl}`;
                      window.open(
                        `https://wa.me/?text=${encodeURIComponent(text)}`,
                        "_blank",
                      );
                    }}
                    className="px-4 py-3.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-xl border border-[#25D366]/20 transition-all flex items-center justify-center shrink-0"
                  >
                    <svg
                      className="w-6 h-6"
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
                </div>

                {currentUserId === selectedItem.seller?.id && (
                  <DeleteButton itemId={selectedItem.id} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
