# QS Technology — Next.js 14

Convert hoàn chỉnh từ HTML site sang **Next.js 14 App Router + TypeScript + Tailwind**.

## Stack

- Next.js 14.2 (App Router) · React 18 · TypeScript 5
- Tailwind CSS 3.4 với design tokens custom (paper / ink / gold / rust / line / muted)
- Google Fonts: Inter Tight (display) · Inter (sans) · JetBrains Mono
- Static-friendly — có thể `next build && next export`

## Cấu trúc

```
nextjs/
├─ app/
│  ├─ layout.tsx              # Header + Footer + SearchPanel + fonts
│  ├─ globals.css             # Tailwind + utilities (qs-wrap, qs-btn, qs-eyebrow…)
│  ├─ page.tsx                # Trang chủ
│  ├─ products/page.tsx       # Catalog
│  ├─ products/[slug]/        # Detail (static params)
│  ├─ applications/…
│  ├─ service/page.tsx
│  ├─ downloads/page.tsx
│  ├─ about/page.tsx
│  ├─ news/                   # List + detail
│  └─ contact/page.tsx
├─ components/
│  ├─ Header.tsx              # Sticky nav, active route, search trigger
│  ├─ Footer.tsx              # 4 cột + bottom bar
│  └─ SearchPanel.tsx         # Fullwidth dropdown search
├─ data/
│  ├─ products.ts             # 6 model controller
│  └─ news.ts                 # 6 bài tin
├─ public/
│  └─ logo-st.png             # Logo gốc (ST monogram)
├─ tailwind.config.ts         # Design tokens
├─ tsconfig.json
├─ next.config.mjs
└─ package.json
```

## Chạy

```bash
cd nextjs
npm install
npm run dev          # http://localhost:3000
```

Build & export tĩnh:

```bash
npm run build
npx next start       # hoặc deploy lên Vercel
```

## Design tokens (Tailwind)

| Token             | Value                                    | Dùng cho                       |
|-------------------|------------------------------------------|--------------------------------|
| `paper`           | `#fafaf7`                                | Nền chính                      |
| `paper-2`         | `#f3efe6`                                | Nền card / placeholder         |
| `ink`             | `#0e0e0c`                                | Text + button đen              |
| `ink-2`           | `#1a1815`                                | Footer / hero tối              |
| `gold-grad`       | `linear-gradient(135deg, …)`             | Heading accent + button vàng   |
| `line`            | `#dedacc`                                | Border / divider               |
| `muted`           | `#8a8680`                                | Text phụ + mono labels         |

## Component utilities (globals.css)

- `.qs-wrap` — container max 1280px
- `.qs-eyebrow` — uppercase mono label với gạch vàng đầu
- `.qs-h1` / `.qs-h2` — heading display (Inter Tight bold)
- `.qs-btn` / `.qs-btn-gold` / `.qs-btn-ghost` / `.qs-btn-sm`
- `.qs-grid-bg` — nền lưới kỹ thuật

## Cần làm thêm (nếu muốn)

- [ ] SEO metadata chi tiết cho từng page (`generateMetadata`)
- [ ] Sitemap.xml + robots.txt (`app/sitemap.ts`)
- [ ] Form contact gắn API (Resend / email backend)
- [ ] Images thật cho product/news (hiện dùng placeholder paper-2)
- [ ] i18n vi/en bằng `next-intl`
- [ ] MDX cho news content
- [ ] Tweaks panel (nếu cần như HTML version)

## Khác biệt so với HTML version

- **Routing**: Next.js App Router thay vì file `.html`
- **Styling**: Tailwind utility classes thay cho `qs.css` global
- **Components**: React Server Components mặc định; chỉ Header + SearchPanel là client (`"use client"`)
- **Data**: Tách ra `/data/*.ts` — thay vì hardcode trong markup
- **Logo**: Dùng `next/image` với priority cho logo header
