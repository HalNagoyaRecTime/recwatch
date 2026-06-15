import { useLoaderData } from "react-router";
import { MembersPage } from "~/features/members/pages/MembersPage";
import { getStudentsData } from "~/features/members/model/students-data";

export async function loader() {
  return getStudentsData();
}
export function meta() {
  return [{ title: "Member List | recwatch" }];
}

export default function MembersRoute() {
  const students = useLoaderData<typeof loader>();
  return <MembersPage students={students} />;
}
