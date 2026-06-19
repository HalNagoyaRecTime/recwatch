import type { Student } from "~/features/members/model/student";
import { MembersTable } from "~/features/members/components/MembersTable";

export function MembersPage({ students }: { students: Student[] }) {
  return (
    <div className="p-6">
      <MembersTable students={students} />
    </div>
  );
}
