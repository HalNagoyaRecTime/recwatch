import { useLoaderData } from "react-router";
import { MembersPage } from "~/features/members/pages/MembersPage";
import { getStudentsData } from "~/features/members/model/students-data";

export async function clientLoader() {
  return getStudentsData();
}
export function meta() {
  return [{ title: "Member List | recwatch" }];
}

export function ErrorBoundary() {
  return (
    <div className="p-6 text-red-500">
      学生データの取得に失敗しました。バックエンドが起動しているか確認してください。
    </div>
  );
}
export default function MembersRoute() {
  const students = useLoaderData<typeof clientLoader>();
  return <MembersPage students={students} />;
}
