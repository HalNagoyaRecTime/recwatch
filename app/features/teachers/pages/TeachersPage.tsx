import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "~/components/ui/button/Button";
import { SearchField } from "~/components/ui/form/SearchField";
import { PageHeader } from "~/components/ui/layout/PageHeader";
import { TeacherTable } from "~/features/teachers/components/TeacherTable";
import type { TeacherRow } from "~/features/teachers/model/teacher";

export function TeachersPage({ teachers }: { teachers: TeacherRow[] }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja");
    if (!normalizedQuery) return teachers;

    return teachers.filter((teacher) => {
      const haystack = [
        teacher.displayName,
        ...teacher.classRooms.map((classRoom) => classRoom.className),
      ]
        .join(" ")
        .toLocaleLowerCase("ja");
      return haystack.includes(normalizedQuery);
    });
  }, [query, teachers]);

  return (
    <section className="flex min-h-full w-full flex-col gap-5">
      <PageHeader
        actions={
          <Button
            icon={Plus}
            onClick={() => navigate("/teachers/new")}
            size="lg"
            variant="primary"
          >
            新規登録
          </Button>
        }
        description="教官のIDと先生名を管理します"
        title="教官管理"
      />
      <SearchField
        ariaLabel="教官を検索"
        onValueChange={setQuery}
        placeholder="先生名・担当クラスで検索"
        value={query}
      />
      <TeacherTable items={filteredTeachers} />
    </section>
  );
}
