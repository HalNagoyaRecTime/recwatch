import { useLoaderData } from "react-router";
import { loadTeacherListPage } from "~/features/teachers/application/teacher-loaders";
import { TeachersPage } from "~/features/teachers/pages/TeachersPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "教官管理 | recwatch" }];
}

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const limit = 50;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  return loadTeacherListPage({
    limit,
    offset: (page - 1) * limit,
    search: searchParams.get("search") || undefined,
    sortBy:
      (searchParams.get("sortBy") as "teacherId" | "displayName" | null) ??
      undefined,
    sortOrder:
      (searchParams.get("sortOrder") as "asc" | "desc" | null) ?? undefined,
  });
}

export default function TeachersRoute() {
  const { limit, offset, teachers, total } =
    useLoaderData<typeof clientLoader>();
  return (
    <PageLayout>
      <PagePadding>
        <TeachersPage
          limit={limit}
          offset={offset}
          teachers={teachers}
          total={total}
        />
      </PagePadding>
    </PageLayout>
  );
}
