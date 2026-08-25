import { useLoaderData } from "react-router";
import { createPageTitle } from "~/config/app";
import {
  loadTeacherAssignment,
  parseTeacherId,
} from "~/features/teachers/application/teacher-loaders";
import { TeacherClassAssignmentPage } from "~/features/teachers/pages/TeacherClassAssignmentPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: createPageTitle("クラス割り当て") }];
}

export async function clientLoader({
  params,
}: {
  params: { teacherId: string };
}) {
  return loadTeacherAssignment(parseTeacherId(params.teacherId));
}

export default function InstructorClassAssignmentRoute() {
  const { teachers, classRooms, selectedTeacherId } =
    useLoaderData<typeof clientLoader>();

  return (
    <PageLayout>
      <PagePadding>
        <TeacherClassAssignmentPage
          teachers={teachers}
          classRooms={classRooms}
          selectedTeacherId={selectedTeacherId}
        />
      </PagePadding>
    </PageLayout>
  );
}
