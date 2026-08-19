import { useLoaderData } from "react-router";
import { TeacherApi } from "~/features/teachers/api";
import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";
import { TeachersPage } from "~/features/teachers/pages/TeachersPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "教官管理 | recwatch" }];
}

export async function clientLoader() {
  const page = await TeacherApi.getTeachers();
  return { teachers: page.items.map(toTeacherRow) };
}

export default function TeachersRoute() {
  const { teachers } = useLoaderData<typeof clientLoader>();
  return (
    <PageLayout>
      <PagePadding>
        <TeachersPage teachers={teachers} />
      </PagePadding>
    </PageLayout>
  );
}
