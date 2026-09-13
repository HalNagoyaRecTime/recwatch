import { toClassRoomData } from "~/features/classRoom/model/classRoom";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { ClassRoomApi } from "~/features/classRoom/api";

function validatePage(page: unknown): asserts page is {
  items: Parameters<typeof toClassRoomData>[0][];
  total: number;
} {
  if (
    !page ||
    typeof page !== "object" ||
    !("items" in page) ||
    !Array.isArray(page.items) ||
    !("total" in page) ||
    typeof page.total !== "number" ||
    !Number.isInteger(page.total) ||
    page.total < 0
  ) {
    throw new Error(`予期しない形式のレスポンス:${JSON.stringify(page)}`);
  }
}

export async function getClassRoomData(): Promise<ClassRoomData[]> {
  const classRooms: ClassRoomData[] = [];
  let offset = 0;

  while (true) {
    const page = await ClassRoomApi.getClassRooms(offset);
    validatePage(page);

    classRooms.push(...page.items.map(toClassRoomData));
    offset += page.items.length;

    if (offset >= page.total || page.items.length === 0) {
      return classRooms;
    }
  }
}
