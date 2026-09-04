export type TeacherNavigationTarget = {
  pathname: string;
  search: string;
};

export function teacherListTarget(search: string): TeacherNavigationTarget {
  return { pathname: "/teachers", search };
}

export function teacherCreateTarget(search: string): TeacherNavigationTarget {
  return { pathname: "/teachers/new", search };
}

export function teacherEditTarget(
  teacherId: number,
  search: string
): TeacherNavigationTarget {
  return { pathname: `/teachers/${teacherId}/edit`, search };
}
