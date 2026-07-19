import type { HomeroomData } from "~/features/homeroom/model/homeroom";
import { HomeroomTable } from "~/features/homeroom/components/HomeroomTable";

export function HomeroomPage({ homerooms }: { homerooms: HomeroomData[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Homerooms</h1>
      <HomeroomTable homerooms={homerooms} />
    </div>
  );
}
