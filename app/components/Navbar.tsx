"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Marketplace", path: "/marketplace" },
    { name: "Wishlist", path: "/wishlist" }, // <-- NEW WISHLIST LINK
    { name: "Sell Item", path: "/sell" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/marketplace"
            className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            CampusTrade
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-2 sm:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  pathname === link.path
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
