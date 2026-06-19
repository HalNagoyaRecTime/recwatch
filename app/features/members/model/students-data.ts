import type { Student } from "~/features/members/model/student";
import { toStudent } from "~/features/members/model/student";
import membersJson from "~/mock/members.json";
import { membersApi } from "~/features/members/api";

const USE_MOCK = false;

export async function getStudentsData(): Promise<Student[]> {
  if (USE_MOCK) {
    return membersJson as Student[];
  }
  const dtos = await membersApi.getStudents();
  return dtos.map(toStudent);
}
