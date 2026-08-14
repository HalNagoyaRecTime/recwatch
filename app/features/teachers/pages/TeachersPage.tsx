import { Link } from "react-router";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { useTeacherSearch } from "~/features/teachers/application/useTeacherSearch";
import { TeacherTable } from "~/features/teachers/components/TeacherTable";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";

export function TeachersPage({ teachers }: { teachers: TeacherRow[] }) {
  const { filteredTeachers, query, setQuery } = useTeacherSearch(teachers);

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        description="学生・クラス・教官の基本情報を管理します"
        title="教官管理"
      />
      <div>
        <ImportUploadTrigger
          type="teachers"
          helperText="取り込み前にプレビューで内容・データ種別を確認できます"
        />
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          to="/members"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm font-bold"
        >
          学生
        </Link>
        <Link
          to="/classroom"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm font-bold"
        >
          クラス
        </Link>
        <span className="rounded-[10px] border border-[#0070bb] bg-[#0070bb] px-4 py-2 text-sm font-bold text-white">
          教官
        </span>
      </div>
      <SearchField
        ariaLabel="教官を検索"
        onValueChange={setQuery}
        placeholder="氏名・クラス名で検索..."
        value={query}
      />
      <TeacherTable items={filteredTeachers} />
    </div>
  );
}
