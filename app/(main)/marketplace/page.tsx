import { createClient } from "@supabase/supabase-js";
import MarketplaceGrid from "./MarketplaceGrid";

// (Make sure the import path matches where you put the file!)

export const revalidate = 0; // Always fetch fresh data

export default async function MarketplacePage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Fetch items with seller information
  const { data: items, error } = await supabase
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
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching items:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Failed to load items
          </h2>
          <p className="text-slate-400">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/5 backdrop-blur-xl bg-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                Marketplace
              </h1>
              <p className="text-slate-400">
                {items?.length || 0} items available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items && items.length > 0 ? (
          /* TYPE FIX APPLIED HERE */
          <MarketplaceGrid items={items as any} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

// 1. Add the Link import at the VERY top of the file if it's not there
import Link from "next/link";

// ... existing MarketplacePage code ...

// 2. Update the EmptyState Component at the bottom
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-6">
        <svg
          className="w-10 h-10 text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">No items yet</h3>
      <p className="text-slate-400 mb-6 text-center max-w-sm">
        Be the first to list something! Start selling your items to fellow
        students.
      </p>

      {/* WRAP THE BUTTON IN A LINK COMPONENT */}
      <Link href="/sell">
        <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-emerald-600 hover:from-indigo-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/25">
          List Your First Item
        </button>
      </Link>
    </div>
  );
}
