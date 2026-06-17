import { Suspense } from "react";
import { SearchResults } from "./_components/search-results";

export const metadata = { title: "Kết quả tìm kiếm — QS Technology" };

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
