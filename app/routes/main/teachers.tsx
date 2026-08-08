import { Outlet, useLoaderData } from "react-router";
import { TeacherApi, type TeacherApiSortOrder } from "~/features/teachers/api";
import { toTeacherRow } from "~/features/teachers/api/mappers/teacher-mappers";
import { TeachersPage } from "~/features/teachers/pages/TeachersPage";
import { PagePadding } from "~/features/frame/page-layout/PagePadding";
import { PageLayout } from "~/features/frame/page-layout/PageLayout";

export function meta() {
  return [{ title: "教官管理 | recwatch" }];
}

const PAGE_SIZE = 50;

export async function clientLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") ?? "";
  const sortBy = parseSortBy(url.searchParams.get("sortBy"));
  const sortOrder = parseSortOrder(url.searchParams.get("sortOrder"));
  const requestedPage = parsePage(url.searchParams.get("page"));
  const apiSortBy = sortBy === "classRoom" ? undefined : sortBy;
  const page = await TeacherApi.getTeachers({
    limit: PAGE_SIZE,
    offset: (requestedPage - 1) * PAGE_SIZE,
    search,
    sortBy: apiSortBy,
    sortOrder: apiSortBy ? sortOrder : undefined,
  });

  return {
    limit: page.limit,
    offset: page.offset,
    total: page.total,
    teachers: page.items.map(toTeacherRow),
  };
}

export default function TeachersRoute() {
  const { teachers, total, limit, offset } =
    useLoaderData<typeof clientLoader>();
  return (
    <>
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
      <Outlet />
    </>
  );
}

function parseSortBy(
  value: string | null
): "teacherId" | "displayName" | "classRoom" {
  if (value === "displayName" || value === "classRoom") return value;
  return "teacherId";
}

function parseSortOrder(value: string | null): TeacherApiSortOrder {
  return value === "desc" ? "desc" : "asc";
}

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
