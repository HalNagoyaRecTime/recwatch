import type { classRoomData } from "~/features/classRoom/model/classRoom";
import { ClassRoomTable } from "~/features/classRoom/components/classRoomTable";

export function ClassRoomPage({ classRooms }: { classRooms: classRoomData[] }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Class Rooms</h1>
      <ClassRoomTable classRooms={classRooms} />
    </div>
  );
}
