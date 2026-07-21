# SEO — hạng mục còn tồn (21/07/2026)

Ghi lại sau đợt optimize SEO toàn site. Phần đã sửa nằm ở cuối để tham chiếu.

## Còn tồn — cần xử lý

### 1. Catalog products không có JSON-LD (18 trang)

**Mức độ:** cao — gap lớn nhất còn lại.

`app/[locale]/products/[slug]/page.tsx` có early return cho nhánh catalog:

```ts
const catalogProduct = getCatalogProductBySlug(slug, locale);
if (catalogProduct) {
  return <CatalogDetail product={catalogProduct} locale={locale} />;
}
```

Return này xảy ra **trước** đoạn dựng `buildProduct` + `buildTrail`, nên 9 slug catalog
(`micro-dnc-2d`, `micro-dnc-3a`, `io-link-32`, `io-link-rltr`, `pid-v1-10722`,
`dac-12fcv1-1222`, +3) × 2 locale = **18 trang** chỉ còn `Organization` + `WebSite`
kế thừa từ layout. Không `Product`, không `BreadcrumbList`.

Đã xác minh trên HTML build ra, không phải suy đoán từ source.

Metadata thường (canonical / hreflang / OG / description) **vẫn đủ** — nhánh catalog
trong `generateMetadata` xử lý riêng và đúng. Chỉ thiếu structured data.

**Hướng sửa:** `CatalogView` có shape khác `ProductView`, nên hoặc thêm
`buildCatalogProduct()` trong `lib/seo/jsonld.tsx`, hoặc map `CatalogView` → tham số
chung rồi tái dùng `buildProduct`. Kèm `buildTrail` cho breadcrumb. Nhớ giữ nguyên
nguyên tắc **không phát `offers`** (site không công bố giá).

### 2. `dateModified` == `datePublished`

**Mức độ:** thấp.

`buildArticle` gán cả hai bằng `publishedAt` vì data không theo dõi lần sửa. Hiện chấp
nhận được. Nhưng khi sửa nội dung một bài cũ, `dateModified` sẽ không phản ánh đúng —
Google dùng tín hiệu này cho freshness.

**Hướng sửa:** thêm field `updatedAt` tùy chọn vào `data/news.json`, cho
`parsePublishedAt` xử lý, fallback về `publishedAt` khi vắng.

### 3. `changeFrequency` đã bị bỏ khỏi sitemap — cần chốt

**Mức độ:** thấp, chỉ là quyết định.

Tôi đã gỡ `changeFrequency: "weekly"` trong đợt sửa `lastmod`. Lý do: khai bài viết từ
2022 "thay đổi hàng tuần" là tuyên bố sai, cùng loại lỗi với `lastmod` bịa. Google đã bỏ
qua `changefreq` từ lâu.

**Việc này nằm ngoài yêu cầu ban đầu.** Nếu muốn giữ lại thì khôi phục trong
`buildEntries()` ở `app/sitemap.ts`.

### 4. Xác minh handle Twitter

`app/[locale]/layout.tsx` khai `twitter.site: "@qstechnology"`. Chưa kiểm chứng tài khoản
này có tồn tại / thuộc về QS không. Handle sai thì thẻ Twitter card ghi nhận sai chủ thể.

### 5. `products/[slug]/page.tsx` — có tiến trình khác ghi vào file

Trong phiên làm việc, `tsc` một lần báo `Cannot find name 'featureText'` ở file này; chạy
lại thì sạch. File đang bị editor/linter sửa đồng thời, tsc đọc trúng lúc dở dang.
Không liên quan thay đổi SEO (chỉ đụng dòng import + breadcrumb), nhưng nên xác nhận file
đang ở trạng thái mong muốn.

---

## Đã sửa trong đợt này (tham chiếu)

Đã kiểm chứng bằng HTML build ra, không phải đọc source.

**P0**
- `about` / `contact` / `downloads`: trước chỉ có `title` — thiếu canonical, hreflang,
  description, OG. Đã bổ sung đủ + copy song ngữ mới trong `messages/{vi,en}/seo.json`.
- **Breadcrumb JSON-LD sai URL trên cả 4 trang list.** Code cũ dựng
  `${APP_URL}${locale === "en" ? "/en" : ""}/products` → bản VI ra
  `qstcnc.com/products`, thiếu cả `/vi` lẫn `/` cuối, trong khi canonical là
  `qstcnc.com/vi/products/`. Cả 8 URL trỏ tới trang không tồn tại. Đã thay bằng
  `localeUrl()` + `buildTrail()` trong `lib/seo/` — call site chỉ truyền path, không tự
  ghép URL, nên lỗi không tái diễn được.
- `Product` JSON-LD phát Offer không hợp lệ (`priceCurrency` không kèm `price`). Google
  loại cả node Product chứ không chỉ bỏ Offer → mọi trang sản phẩm mất structured data.
  Đã gỡ `offers`.
- `noindex` cho `/search`, `403`, `404`. `/search` cũng gỡ khỏi sitemap. Dùng
  `noindex, follow` chứ không `Disallow` — chặn crawl sẽ khiến Google không đọc được thẻ
  noindex.

**P1**
- `Organization.sameAs` → kênh YouTube.
- Trang CNC: thêm `Product` + breadcrumb (trước đó không có structured data nào).
- `BreadcrumbList` cho 4 loại trang chi tiết.

**Sitemap `lastmod` + phát hiện kèm theo**
- `publishedAt` trong `lib/data/news.ts` bị hardcode `null`; ngày thật nằm ở `date` dạng
  chuỗi `"DD · MM · YYYY"`. Hệ quả: `Article.datePublished`, `dateModified` và OG
  `article:published_time` **vắng mặt trên mọi bài viết**, không riêng sitemap.
- Sửa tại gốc: `parsePublishedAt()` parse chuỗi → `Date`, neo 12:00 UTC để lệch múi giờ
  không đẩy sang ngày khác; trả `null` khi sai định dạng (Invalid Date sẽ throw ở
  `.toISOString()`). Một chỗ sửa, ba nơi hưởng lợi.
- Sitemap chỉ phát `lastmod` khi có ngày thật: 30/108 URL. 78 URL còn lại **bỏ trống thay
  vì đoán** — `lastmod` bịa khiến Google coi trường này không đáng tin và loại bỏ trên
  toàn site, hỏng luôn 30 ngày chính xác.

**Kiểm chứng:** `tsc` sạch, `i18n:check` pass, build OK. Script đối chiếu toàn bộ 108 URL
sitemap (tồn tại / indexable / canonical khớp tuyệt đối) → 0 vấn đề.

## Câu hỏi chưa chốt

- Giữ hay bỏ `changeFrequency`? (mục 3)
- Handle `@qstechnology` có đúng của QS không? (mục 4)
