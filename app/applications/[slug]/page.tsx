export default function ApplicationDetail({ params }: { params: { slug: string } }) {
  const slug = params.slug.replace(/-/g, " ");
  return (
    <section className="py-20">
      <div className="qs-wrap max-w-4xl">
        <div className="qs-eyebrow">[ Ứng dụng ]</div>
        <h1 className="qs-h2 mt-2 capitalize">{slug}</h1>
        <p className="text-lg text-[#3a3a3a] mt-5 leading-relaxed">Trang chi tiết ứng dụng — QS controller được tinh chỉnh firmware riêng cho từng loại máy. Liên hệ để được tư vấn cấu hình phù hợp.</p>
        <div className="mt-8 flex gap-3">
          <a className="qs-btn qs-btn-gold" href="/contact">Tư vấn cấu hình →</a>
          <a className="qs-btn qs-btn-ghost" href="/applications">← Tất cả ứng dụng</a>
        </div>
      </div>
    </section>
  );
}
