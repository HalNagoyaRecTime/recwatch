import type { Homeroom } from "~/features/homeroom/model/homeroom";
import { HomeRoomTable } from "~/features/homeroom/components/HomeroomTable";

export function HomeRoomPage({ homerooms }: { homerooms: Homeroom[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Homerooms</h1>
      <HomeRoomTable homerooms={homerooms} />
    </div>
  );
}
