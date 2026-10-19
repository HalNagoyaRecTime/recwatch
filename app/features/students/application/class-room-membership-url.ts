export type ClassRoomMembershipUrlState = {
  memberPage: number;
  studentSearch: string;
  studentSearchPage: number;
};

const DEFAULT_PAGE = 1;

export function parseClassRoomMembershipUrl(
  input: string | URLSearchParams
): ClassRoomMembershipUrlState {
  const params = typeof input === "string" ? new URLSearchParams(input) : input;

  return {
    memberPage: parsePage(params.get("memberPage")),
    studentSearch: params.get("studentSearch")?.trim() ?? "",
    studentSearchPage: parsePage(params.get("studentSearchPage")),
  };
}

export function updateClassRoomMembershipUrl(
  input: string | URLSearchParams,
  updates: Partial<ClassRoomMembershipUrlState>
): string {
  const params = new URLSearchParams(input);

  if (updates.memberPage !== undefined) {
    setPage(params, "memberPage", updates.memberPage);
  }
  if (updates.studentSearch !== undefined) {
    const search = updates.studentSearch.trim();
    if (search) params.set("studentSearch", search);
    else params.delete("studentSearch");
  }
  if (updates.studentSearchPage !== undefined) {
    setPage(params, "studentSearchPage", updates.studentSearchPage);
  }

  return params.toString();
}

export function clearClassRoomMembershipUrl(
  input: string | URLSearchParams
): string {
  const params = new URLSearchParams(input);
  params.delete("memberPage");
  params.delete("studentSearch");
  params.delete("studentSearchPage");
  return params.toString();
}

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : DEFAULT_PAGE;
}

function setPage(params: URLSearchParams, key: string, page: number) {
  if (page <= DEFAULT_PAGE) params.delete(key);
  else params.set(key, String(page));
}
