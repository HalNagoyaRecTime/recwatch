import { useLoaderData } from "react-router";
import { parseTeacherListUrl } from "~/features/teachers/application/teacher-list-url";
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
  const { page, search, sortBy, sortOrder } = parseTeacherListUrl(searchParams);

  return loadTeacherListPage({
    limit,
    offset: (page - 1) * limit,
    search: search || undefined,
    sortBy: sortBy ?? undefined,
    sortOrder: sortOrder ?? undefined,
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
