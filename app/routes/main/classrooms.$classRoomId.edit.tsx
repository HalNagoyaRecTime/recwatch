import { useLoaderData, useRouteError } from "react-router";

import { ClassRoomApi } from "~/features/classRoom/api";
import type { ClassRoomTeacherOption } from "~/features/classRoom/components/ClassRoomForm";
import { ClassRoomEditPage } from "~/features/classRoom/pages/ClassRoomEditPage";
import { StudentApi } from "~/features/students/api";
import { parseClassRoomMembershipUrl } from "~/features/students/application/class-room-membership-url";
import { StudentClassRoomMembershipPanel } from "~/features/students/components/StudentClassRoomMembershipPanel";
import { useClassRoomMembershipUrl } from "~/features/students/hooks/useClassRoomMembershipUrl";
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
  const { memberPage, studentSearch, studentSearchPage } =
    parseClassRoomMembershipUrl(searchParams);
  const limit = 10;
  const [classRoom, members, searchResults] = await Promise.all([
    ClassRoomApi.getClassRoomById(classRoomId),
    StudentApi.getStudents({
      classRoomId,
      isLiveActive: "all",
      limit,
      offset: (memberPage - 1) * limit,
      sortBy: "attendanceNumber",
      sortOrder: "asc",
    }),
    studentSearch
      ? StudentApi.getStudents({
          limit,
          offset: (studentSearchPage - 1) * limit,
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
  const {
    changeMemberPage,
    changeStudentSearchPage,
    searchInput,
    setSearchInput,
  } = useClassRoomMembershipUrl();

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
        classRoomId={classRoom.classRoomId}
        memberPage={memberPage}
        onMemberPageChange={changeMemberPage}
        onSearchChange={setSearchInput}
        onSearchPageChange={changeStudentSearchPage}
        search={search}
        searchInput={searchInput}
        searchPage={searchResults}
      />
    </ClassRoomEditPage>
  );
}
