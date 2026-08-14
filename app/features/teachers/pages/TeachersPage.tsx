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
      <PageHeader description="教官の基本情報を管理します" title="教官管理" />
      <div>
        <ImportUploadTrigger
          type="teachers"
          helperText="取り込み前にプレビューで内容・データ種別を確認できます"
        />
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
