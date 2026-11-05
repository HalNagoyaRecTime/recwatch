import { useId } from "react";
import { Link } from "react-router";

import type { MasterImportExcludedRow } from "~/features/master-import/model/master-import-session";
import {
  MASTER_IMPORT_EXCLUSION_REASON_LABEL,
  MASTER_IMPORT_LIST_PATH,
} from "~/features/master-import/constants";

type ImportExcludedRowsProps = {
  rows: readonly MasterImportExcludedRow[];
};

export function ImportExcludedRows({ rows }: ImportExcludedRowsProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="space-y-2">
      <h3 className="text-text-base text-sm font-semibold" id={headingId}>
        除外する行（{rows.length.toLocaleString()}件）
      </h3>
      <ul className="max-h-48 space-y-2 overflow-y-auto text-sm">
        {rows.map((row) => (
          <li key={row.rowIndex}>
            {row.rowIndex + 1}行目：{row.studentIdNumber} {row.displayName}
            <span className="text-text-muted block text-xs">
              {MASTER_IMPORT_EXCLUSION_REASON_LABEL[row.reason] ?? row.reason}
              {row.reason === "student_already_registered_inactive" ? (
                <>
                  {" "}
                  <Link
                    aria-label={`${row.studentIdNumber}を学生一覧で探す`}
                    className="decoration-text-muted hover:text-text-base underline underline-offset-4"
                    to={inactiveStudentListPath(row.studentIdNumber)}
                  >
                    学生一覧で探す
                  </Link>
                </>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function inactiveStudentListPath(studentIdNumber: string) {
  const params = new URLSearchParams({
    search: studentIdNumber,
    isLiveActive: "false",
  });
  return `${MASTER_IMPORT_LIST_PATH.students}?${params.toString()}`;
}
