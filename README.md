# CampusTrade

**A buy-and-sell marketplace for TKM College of Engineering students — list an item in seconds, close the deal on WhatsApp.**

🔗 **Live:** [campustrade-cosmiq.vercel.app](https://campustrade-cosmiq.vercel.app)

---

## The problem

Students constantly buy and sell textbooks, lab coats, calculators and hostel gear, but it happens in noisy WhatsApp groups where listings get buried within minutes and there's no way to search.

## The solution

A dedicated campus marketplace that keeps the part students already like (talking on WhatsApp) and fixes the rest (discovery, search, trust).

**Features**
- **One-tap WhatsApp contact** — deep links open a chat with the seller, pre-filled with the item details
- **Client-side image compression** — photos are compressed in a Web Worker to ~100 KB (max 1024px) before upload, so listing works on slow campus Wi-Fi and storage costs stay tiny
- **AI-written descriptions** — Gemini generates a short, honest listing description from the item title
- **Wishlist and profile** pages for managing your own listings
- **KTU updates** feed and a **student startups** directory
- **Secure by default** — Supabase Auth + Row Level Security; server actions validate every listing

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| Backend | Supabase (Postgres, Auth, RLS) |
| Images | browser-image-compression → Cloudinary |
| AI | Google Gemini (`gemini-2.5-flash`) |
| Hosting | Vercel |

## Run locally

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
GEMINI_API_KEY=
```

```bash
npm run dev   # http://localhost:3000
```

## Author

Built by [Muhammed Rinshid V P](https://github.com/muhammedrinshidvpr-coder) · [CosmIQ](https://github.com/muhammedrinshidvpr-coder)

## License

[MIT](./LICENSE)
