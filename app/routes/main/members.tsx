import { Outlet, useLoaderData } from "react-router";

import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";
import { loadStudentListPage } from "~/features/members/application/student-loaders";
import { parseStudentListUrl } from "~/features/members/application/student-list-url";
import { MembersPage } from "~/features/members/pages/MembersPage";
import { createPageTitle } from "~/lib/page-title";

export function meta() {
  return [{ title: createPageTitle("学生管理") }];
}

export async function clientLoader({ request }: { request: Request }) {
  const searchParams = new URL(request.url).searchParams;
  const limit = 50;
  const { page, search, sortBy, sortOrder, isStaff, isLiveActive } =
    parseStudentListUrl(searchParams);

  return loadStudentListPage({
    limit,
    offset: (page - 1) * limit,
    search: search || undefined,
    sortBy: sortBy ?? undefined,
    sortOrder: sortOrder ?? undefined,
    isStaff,
    isLiveActive,
  });
}

export default function MembersRoute() {
  const page = useLoaderData<typeof clientLoader>();

  return (
    <>
      <PageLayout>
        <PagePadding>
          <MembersPage {...page} />
        </PagePadding>
      </PageLayout>
      <Outlet />
    </>
  );
}
