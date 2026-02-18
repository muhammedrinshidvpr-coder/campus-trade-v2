"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    const checkUserAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }
      const { data: profile } = await supabase
        .from("users")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!profile) {
        router.push("/");
      }
    };
    checkUserAndProfile();
  }, [supabase, router]);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Textbooks"); // <-- NEW CATEGORY STATE
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      setError("Please enter a title first");
      return;
    }
    setIsGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDescription(data.description);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!imageFile) {
      setError("Please upload a photo of the item");
      return;
    }
    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error("You must be logged in to post an item.");

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error(
          "Your profile is incomplete. Please log out and log back in to finish setup.",
        );
      }

      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("item_images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("item_images").getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("items").insert({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category, // <-- NEW: SAVING THE CATEGORY
        image_url: publicUrl,
        seller_id: userProfile.id,
      });

      if (insertError) {
        throw new Error(`DB Error: ${insertError.message}`);
      }

      setSuccess(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      window.location.href = "/marketplace";
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to create listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 pb-20">
      <div className="max-w-2xl mx-auto space-y-8 mt-8">
        <h1 className="text-3xl font-bold text-white">List Your Item</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* IMAGE UPLOAD SECTION */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-4">
              Item Photo
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-blue-500/50 transition cursor-pointer relative overflow-hidden h-64 bg-zinc-900">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-slate-400 text-sm">
                    Click to upload photo
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Title Field */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What are you selling?"
              required
            />
          </div>

          {/* NEW: Category Dropdown */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="Textbooks">Textbooks & Study Material</option>
              <option value="Electronics">Electronics & Gadgets</option>
              <option value="Hostel Gear">Hostel Gear & Essentials</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Description Field */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between mb-3">
              <label className="text-sm font-semibold text-white">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                className="text-xs font-bold text-purple-400 hover:text-purple-300"
              >
                ✨ Magic AI
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white h-32 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Price Field */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Price (₹)
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 p-4 rounded-xl border border-red-400/20">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-400 text-sm bg-green-400/10 p-4 rounded-xl border border-green-400/20">
              Listing published! Redirecting...
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isSubmitting ? "Uploading..." : "Publish Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
