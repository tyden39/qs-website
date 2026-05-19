export function ComingSoon({ entity }: { entity: string }) {
  return (
    <div className="border border-line bg-white p-10 max-w-2xl">
      <div className="font-mono text-[10px] tracking-[.16em] uppercase text-gold-1">[ Stub ]</div>
      <h1 className="font-display font-bold text-2xl mt-2 mb-3 tracking-[-.01em]">{entity}</h1>
      <p className="text-sm text-muted m-0">
        Module này sẽ được hoàn thiện trong các stream CRUD chuyên biệt. Trang stub được giữ ở
        đây để liên kết sidebar không 404 trong khi các phase CRUD đang triển khai.
      </p>
    </div>
  );
}
