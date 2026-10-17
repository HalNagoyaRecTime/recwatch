import { ClassRoomApi } from "~/features/classRoom/api";
import type { ClassRoomManagementApi } from "~/features/classRoom/api";
import type { ClassRoom } from "~/features/classRoom/model/classRoom";

const CLASS_ROOM_OPTION_LIMIT = 100;

type ClassRoomListGateway = Pick<ClassRoomManagementApi, "getClassRoomList">;

/** 教官・学生フォームで使うClassRoom候補を全件取得します。 */
export async function getClassRoomData(
  gateway: ClassRoomListGateway = ClassRoomApi
): Promise<ClassRoom[]> {
  const classRooms: ClassRoom[] = [];
  let offset = 0;

  while (true) {
    const page = await gateway.getClassRoomList({
      limit: CLASS_ROOM_OPTION_LIMIT,
      offset,
      sortBy: "classRoomId",
      sortOrder: "asc",
    });
    classRooms.push(...page.items);

    if (page.items.length === 0 || classRooms.length >= page.total) {
      return classRooms;
    }

    offset += page.items.length;
  }
}
