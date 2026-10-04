import {
  useLoaderData,
  useLocation,
  useNavigate,
  useRevalidator,
  useRouteError,
} from "react-router";

import { ClassRoomApi } from "~/features/classRoom/api";
import type { ClassRoomTeacherOption } from "~/features/classRoom/components/ClassRoomForm";
import { ClassRoomEditPage } from "~/features/classRoom/pages/ClassRoomEditPage";
import { StudentApi } from "~/features/students/api";
import { StudentClassRoomMembershipPanel } from "~/features/students/components/StudentClassRoomMembershipPanel";
import { createPageTitle } from "~/lib/page-title";
import { parsePositiveIntegerRouteParam } from "~/lib/parse-positive-integer-route-param";
import { ManagementModalRouteError } from "~/routes/main/management-modal-route-error";
import {
  useManagementModalReturn,
  useManagementRouteOptions,
} from "~/routes/main/useManagementModalNavigation";

export function meta() {
  return [{ title: createPageTitle("クラス情報の編集") }];
}

export async function clientLoader({
  params,
  request,
}: {
  params: { classRoomId?: string };
  request?: Request;
}) {
  const classRoomId = parsePositiveIntegerRouteParam(params.classRoomId);
  if (classRoomId === null) {
    throw new Response("クラスが見つかりません。", { status: 404 });
  }

  const searchParams = new URL(
    request?.url ?? `https://example.test/classrooms/${classRoomId}/edit`
  ).searchParams;
  const memberPage = parsePage(searchParams.get("memberPage"));
  const studentSearch = searchParams.get("studentSearch")?.trim() ?? "";
  const limit = 10;
  const [classRoom, members, searchResults] = await Promise.all([
    ClassRoomApi.getClassRoomById(classRoomId),
    StudentApi.getStudents({
      classRoomId,
      limit,
      offset: (memberPage - 1) * limit,
      sortBy: "attendanceNumber",
      sortOrder: "asc",
    }),
    studentSearch
      ? StudentApi.getStudents({
          limit,
          offset: 0,
          search: studentSearch,
          sortBy: "displayName",
          sortOrder: "asc",
        })
      : Promise.resolve(null),
  ]);

  return {
    classRoom,
    memberPage: members,
    search: studentSearch,
    searchResults,
  };
}

export function ErrorBoundary() {
  const closeModal = useManagementModalReturn();
  return (
    <ManagementModalRouteError
      error={useRouteError()}
      onClose={closeModal}
      title="クラス情報を読み込めません"
    />
  );
}

export default function ClassRoomEditRoute() {
  const { classRoom, memberPage, search, searchResults } =
    useLoaderData<typeof clientLoader>();
  const teacherOptions = useManagementRouteOptions<ClassRoomTeacherOption>();
  const closeModal = useManagementModalReturn();
  const location = useLocation();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  function updateMemberQuery(updates: {
    memberPage?: number;
    studentSearch?: string;
  }) {
    const searchParams = new URLSearchParams(location.search);
    if (updates.memberPage !== undefined) {
      if (updates.memberPage === 1) searchParams.delete("memberPage");
      else searchParams.set("memberPage", String(updates.memberPage));
    }
    if (updates.studentSearch !== undefined) {
      const value = updates.studentSearch.trim();
      if (value) searchParams.set("studentSearch", value);
      else searchParams.delete("studentSearch");
    }
    void navigate({ search: searchParams.toString() }, { replace: true });
  }

  return (
    <ClassRoomEditPage
      api={ClassRoomApi}
      classRoom={classRoom}
      onClose={() => closeModal()}
      onSaved={() => closeModal(true)}
      teacherOptionState={teacherOptions}
      teacherOptions={teacherOptions.items}
    >
      <StudentClassRoomMembershipPanel
        api={StudentApi}
        classRoom={{
          classRoomId: classRoom.classRoomId,
          classCode: classRoom.classCode,
          className: classRoom.className,
        }}
        classRoomId={classRoom.classRoomId}
        memberPage={memberPage}
        onMemberPageChange={(page) => updateMemberQuery({ memberPage: page })}
        onRevalidate={() => revalidator.revalidate()}
        onSearchChange={(value) => updateMemberQuery({ studentSearch: value })}
        search={search}
        searchPage={searchResults}
      />
    </ClassRoomEditPage>
  );
}

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
