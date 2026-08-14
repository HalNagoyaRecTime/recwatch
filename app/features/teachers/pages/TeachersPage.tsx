import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "~/components/ui/button/Button";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { SearchField } from "~/components/ui/form/SearchField";
import { useTeacherSearch } from "~/features/teachers/application/useTeacherSearch";
import { TeacherTable } from "~/features/teachers/components/TeacherTable";
import type { TeacherRow } from "~/features/teachers/model/teacher";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";
import { teacherCreateTarget } from "~/features/teachers/application/teacher-navigation";

export function TeachersPage({ teachers }: { teachers: TeacherRow[] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { filteredTeachers, query, setQuery } = useTeacherSearch(teachers);

  return (
    <div className="min-h-full space-y-5">
      <PageHeader
        actions={
          <Button
            icon={Plus}
            onClick={() => navigate(teacherCreateTarget(location.search))}
            size="lg"
            variant="primary"
          >
            新規登録
          </Button>
        }
        description="教官の基本情報を管理します"
        title="教官管理"
      />
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
