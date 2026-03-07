"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

export default function RegisterStartup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // NEW: State to check if we are still verifying their login status
  const [authChecking, setAuthChecking] = useState(true);

  const [message, setMessage] = useState("");

  // Form States
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("EdTech");
  const [actionLink, setActionLink] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [adFile, setAdFile] = useState<File | null>(null);

  // NEW: The "Bouncer" - Checks their ID at the door before letting them see the form
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // If they don't have a profile, kick them to the login page!
        router.push(
          "/login?message=Please create a profile to launch your startup.",
        );
      } else {
        // If they are logged in, let them in!
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fallback just in case
    if (!user) {
      setMessage("❌ You must be logged in to register a startup!");
      setLoading(false);
      return;
    }

    try {
      let logoUrl = "";
      let adImageUrl = "";

      // 1. Upload Logo
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const fileName = `logo_${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("startup-logos")
          .upload(fileName, logoFile, { contentType: logoFile.type });

        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("startup-logos").getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      // 2. Upload Promo/Ad Image
      if (adFile) {
        const fileExt = adFile.name.split(".").pop();
        const fileName = `promo_${Math.random()}.${fileExt}`;
        const { error: adUploadError } = await supabase.storage
          .from("startup-logos")
          .upload(fileName, adFile, { contentType: adFile.type });

        if (adUploadError) throw adUploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("startup-logos").getPublicUrl(fileName);
        adImageUrl = publicUrl;
      }

      // 3. Save to database
      const { error: insertError } = await supabase.from("startups").insert({
        name: name,
        tagline: tagline,
        description: description,
        category: category,
        action_link: actionLink,
        logo_url: logoUrl,
        ad_image_url: adImageUrl,
        owner_id: user.id,
      });

      if (insertError) throw insertError;

      setMessage("✅ Startup & Promo Registered Successfully!");
      setTimeout(() => {
        router.push("/startups");
      }, 2000);
    } catch (error: any) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Show a loading spinner while the Bouncer checks their ID
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex justify-center items-center">
      <div className="max-w-xl w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Launch Your Startup 🚀
          </h1>
          <p className="text-slate-400">
            Get your business listed on the CampusTrade Hub.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm font-semibold text-center ${message.includes("✅") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Startup Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Catchy Tagline
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="EdTech">EdTech & Courses</option>
              <option value="Food">Food & Delivery</option>
              <option value="Services">Campus Services</option>
              <option value="Tech">Tech & Repair</option>
              <option value="Clothing">Clothing & Merch</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Full Description
            </label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none resize-none focus:border-indigo-500 transition-colors"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              WhatsApp / Contact Link
            </label>
            <input
              type="url"
              required
              value={actionLink}
              onChange={(e) => setActionLink(e.target.value)}
              placeholder="https://wa.me/91..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Uploads Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Upload Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full px-2 py-2 bg-black/40 border border-white/10 rounded-xl text-slate-400 text-sm file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-indigo-500/10 file:text-indigo-400 file:cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-300 mb-1">
                Promo Flyer (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAdFile(e.target.files?.[0] || null)}
                className="w-full px-2 py-2 bg-black/40 border border-purple-500/30 rounded-xl text-slate-400 text-sm file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-purple-500/10 file:text-purple-400 file:cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-indigo-500 to-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
          >
            {loading ? "Uploading Data..." : "Launch Startup 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
