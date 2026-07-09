import type { HomeroomData } from "~/features/homeroom/model/homeroom";
import { HomeroomTable } from "~/features/homeroom/components/HomeroomTable";

export function HomeroomPage({ homerooms }: { homerooms: HomeroomData[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Homerooms</h1>
      <input
        className="rounded-md border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        type="text"
        placeholder="Filter by name"
      />
      <HomeroomTable homerooms={homerooms} />
    </div>
  );
}
