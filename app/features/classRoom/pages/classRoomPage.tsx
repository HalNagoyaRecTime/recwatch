import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { ClassRoomTable } from "~/features/classRoom/components/classRoomTable";
import { filterClassRooms } from "~/features/classRoom/model/classRoom-search";
import type { ClassRoomData } from "~/features/classRoom/model/classRoom";
import { ImportUploadTrigger } from "~/features/master-import/components/ImportUploadTrigger";

export function ClassRoomPage({ classRooms }: { classRooms: ClassRoomData[] }) {
  const [query, setQuery] = useState("");
  const filteredClassRooms = useMemo(
    () => filterClassRooms(classRooms, query),
    [classRooms, query]
  );

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">ユーザー管理（クラス）</h1>
      <p className="mt-1 text-xs text-black/40">
        学生・クラス・教官の基本情報を管理します
      </p>
      <div className="mt-5">
        <ImportUploadTrigger
          type="classrooms"
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
        <span className="rounded-[10px] border border-[#0070bb] bg-[#0070bb] px-4 py-2 text-sm font-bold text-white">
          クラス
        </span>
        <Link
          to="/teachers"
          className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm font-bold"
        >
          教官
        </Link>
      </div>
      <label className="mt-4 flex h-[38px] w-full max-w-[240px] items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-3 text-sm">
        <Search className="size-4 text-black/35" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="クラスを検索"
          className="min-w-0 flex-1 outline-none"
          placeholder="クラス名・担任で検索..."
        />
      </label>
      <ClassRoomTable classRooms={filteredClassRooms} />
    </div>
  );
}
