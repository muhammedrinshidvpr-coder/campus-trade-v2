"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function DeleteButton({ itemId }: { itemId: string | number }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // 1. Ask the user to confirm before accidentally deleting
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?",
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      // 2. Send the delete command to Supabase
      const { error } = await supabase.from("items").delete().eq("id", itemId);

      if (error) throw error;

      // 3. Refresh the page so the item disappears from the grid
      router.refresh();
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Could not delete item. Make sure you own this listing!");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="mt-4 w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-semibold rounded-lg border border-red-500/20 transition disabled:opacity-50"
    >
      {isDeleting ? "Deleting..." : "🗑️ Delete Listing"}
    </button>
  );
}
