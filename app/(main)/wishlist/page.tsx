"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import MarketplaceGrid from "../marketplace/MarketplaceGrid"; // Reusing your amazing grid!
import Link from "next/link";

// Define the exact same Item type
type Item = {
  id: string;
  title: string;
  description: string;
  price: number;
  created_at: string;
  seller: {
    id: string;
    name: string;
    whatsapp_number: string;
  };
  image_url?: string;
  category?: string;
};

export default function WishlistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // 1. Get the current logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // 2. Find all the item IDs they liked
      const { data: favData } = await supabase
        .from("favorites")
        .select("item_id")
        .eq("user_id", user.id);

      if (favData && favData.length > 0) {
        const itemIds = favData.map((f) => f.item_id);

        // 3. Fetch the actual item details for those IDs
        const { data: itemsData } = await supabase
          .from("items")
          .select("*, seller:users(id, name, whatsapp_number)")
          .in("id", itemIds);

        if (itemsData) {
          setItems(itemsData as unknown as Item[]);
        }
      }
      setLoading(false);
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8 mt-4">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">❤️</span>
          <h1 className="text-3xl font-bold text-white">Your Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="text-5xl mb-4">💔</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-slate-400 mb-6">
              You haven't saved any items yet.
            </p>
            <Link
              href="/marketplace"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-emerald-600 hover:from-indigo-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <MarketplaceGrid items={items} />
        )}
      </div>
    </div>
  );
}
