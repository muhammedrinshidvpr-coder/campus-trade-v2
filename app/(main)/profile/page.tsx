"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import MarketplaceGrid from "../marketplace/MarketplaceGrid";

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

export default function ProfilePage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [profile, setProfile] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Supabase exactly once
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const fetchProfileAndItems = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("id, name, whatsapp_number")
        .eq("id", user.id)
        .single();

      if (userData) {
        setProfile(userData);
      }

      const { data: userItems } = await supabase
        .from("items")
        .select(
          `
          id,
          title,
          description,
          price,
          created_at,
          category,
          image_url,
          seller:users!seller_id (
            id,
            name,
            whatsapp_number
          )
        `,
        )
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });

      if (userItems) {
        setItems(userItems as unknown as Item[]);
      }

      setLoading(false);
    };

    fetchProfileAndItems();
  }, [router, supabase]);

  // --- NEW: LOGOUT FUNCTION ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8 pb-20 p-4 sm:p-0">
      {/* --- PROFILE HEADER CARD --- */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-8 md:p-12 shadow-2xl mt-8">
        {/* Abstract Background Glow */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* --- NEW: LOGOUT BUTTON --- */}
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 z-20 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg border border-red-500/20 transition-all flex items-center gap-2 group"
        >
          <span>Logout</span>
          <svg
            className="w-4 h-4 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 mt-4 md:mt-0">
          {/* Big Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl shadow-blue-500/25 border-4 border-white/10 shrink-0">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : "?"}
          </div>

          {/* User Info */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold text-white mb-2">
              {profile?.name || "Student"}
            </h1>
            <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-400">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>{profile?.whatsapp_number || "No number attached"}</span>
            </div>
            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium border border-white/5">
              Selling {items.length} {items.length === 1 ? "item" : "items"}
            </div>
          </div>
        </div>
      </div>

      {/* --- USER'S ITEMS GRID --- */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-blue-500">
          Your Storefront
        </h2>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Your storefront is empty
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-6">
              You haven't listed any items for sale yet.
            </p>
            <button
              onClick={() => router.push("/sell")}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
            >
              List Your First Item
            </button>
          </div>
        ) : (
          <MarketplaceGrid items={items} />
        )}
      </div>
    </div>
  );
}
