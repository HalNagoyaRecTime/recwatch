import { TeacherApi, type TeacherQueryApi } from "~/features/teachers/api";

export type TeacherOption = {
  displayName: string;
  teacherId: number;
};

type ActiveTeacherGateway = Pick<TeacherQueryApi, "getActiveTeachers">;

export async function getActiveTeacherOptions(
  gateway: ActiveTeacherGateway = TeacherApi
): Promise<readonly TeacherOption[]> {
  const page = await gateway.getActiveTeachers();
  return page.items.map(({ displayName, teacherId }) => ({
    displayName,
    teacherId,
  }));
}
