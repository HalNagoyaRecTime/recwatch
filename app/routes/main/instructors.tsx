import { useLoaderData } from "react-router";
import { TeacherApi } from "~/features/instructors/api";
import { toTeacherRow } from "~/features/instructors/model/teacher";
import { InstructorsPage } from "~/features/instructors/pages/InstructorsPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "教官管理 | recwatch" }];
}

export async function clientLoader() {
  const page = await TeacherApi.getTeachers();
  return { teachers: page.items.map(toTeacherRow) };
}

export default function InstructorsRoute() {
  const { teachers } = useLoaderData<typeof clientLoader>();
  return (
    <PageLayout>
      <PagePadding>
        <InstructorsPage teachers={teachers} />
      </PagePadding>
    </PageLayout>
  );
}
