import { Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

const classes = [
  "クラスA",
  "クラスB",
  "クラスC",
  "クラスD",
  "クラスE",
] as const;

const students = [
  ["0001", "IA00A000", "01", "山田 花子"],
  ["0002", "IA00A001", "02", "鈴木 一郎"],
  ["0003", "IA00A002", "03", "田中 次郎"],
  ["0004", "IA00A003", "04", "青木 五郎"],
  ["0005", "IA00A004", "05", "木村 六子"],
  ["0006", "IA00A005", "06", "渡辺 明子"],
  ["0007", "IA00A006", "07", "加藤 直哉"],
] as const;

export function CompetitionAssignmentPage() {
  const [selectedClass, setSelectedClass] =
    useState<(typeof classes)[number]>("クラスA");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([
    "0001",
    "0002",
    "0003",
    "0004",
    "0005",
  ]);

  const assignedStudents = students.filter(([number]) =>
    selectedStudents.includes(number)
  );

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">競技割り当て 追加</h1>

      <div className="mt-5 grid items-start gap-6 xl:grid-cols-[480px_minmax(560px,1fr)]">
        <div className="space-y-4">
          <fieldset>
            <legend className="text-sm font-bold">
              クラス <span className="text-red-500">*</span>
            </legend>
            <div className="mt-1 flex flex-wrap gap-2">
              {classes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSelectedClass(item)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    selectedClass === item
                      ? "border-[#0070bb] bg-[#0070bb]/10 font-bold text-[#0070bb]"
                      : "border-[#d2d2d2] bg-white text-black/50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-bold">
            競技 <span className="text-red-500">*</span>
            <select className="mt-1 h-[38px] w-full rounded-[10px] border border-[#0070bb] bg-white px-3 font-normal">
              <option>走れ！〇人〇脚！</option>
              <option>ガチンコ綱引き</option>
              <option>四天王ドッチボール</option>
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["実施場所", "コートA"],
              ["集合時間", "08:55"],
              ["開始時間", "09:10"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-[10px] border border-[#d2d2d2] bg-white px-3 py-2"
              >
                <p className="text-[10px] text-black/35">{label}</p>
                <p className="mt-0.5 text-xs text-black/45">{value}</p>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-sm font-bold">
              割り当てメンバー <span className="text-red-500">*</span>
            </h2>
            <p className="mt-1 text-xs text-black/40">
              学生一覧。チェックで出場メンバーに追加されます。
            </p>
            <div className="mt-2 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f9fafb] text-[11px] text-black/50">
                  <tr>
                    <th className="w-10 border-b border-[#d2d2d2] px-3 py-2" />
                    {["通し番号", "学籍番号", "出席番号", "氏名"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="border-b border-[#d2d2d2] px-3 py-2"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const checked = selectedStudents.includes(student[0]);
                    return (
                      <tr
                        key={student[0]}
                        className={`border-b border-[#d2d2d2] last:border-b-0 ${
                          checked ? "bg-[#eff6ff]" : ""
                        }`}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={checked}
                            aria-label={`${student[3]}を割り当てる`}
                            onChange={() =>
                              setSelectedStudents((current) =>
                                checked
                                  ? current.filter((id) => id !== student[0])
                                  : [...current, student[0]]
                              )
                            }
                            className="size-4 accent-[#0070bb]"
                          />
                        </td>
                        {student.map((cell) => (
                          <td key={cell} className="px-3 py-2.5">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <Link
              to="/participants"
              className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-2 text-sm"
            >
              キャンセル
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm text-white"
            >
              <Check className="size-4" />
              割り当てを登録する
            </button>
          </div>
        </div>

        <aside className="min-w-0">
          <p className="text-xs text-black/40">割り当て内容プレビュー</p>
          <dl className="mt-2 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
            {[
              ["クラス", selectedClass],
              ["競技", "走れ！〇人〇脚！"],
              ["実施場所", "コートA"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center gap-4 border-b border-[#d2d2d2] px-4 py-2.5 last:border-b-0"
              >
                <dt className="w-20 text-xs text-black/40">{label}</dt>
                <dd className="text-sm">{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-3 text-xs text-black/40">割り当てメンバー</p>
          <div className="mt-2 overflow-hidden rounded-[14px] border border-[#d2d2d2] bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f9fafb] text-[11px] text-black/50">
                <tr>
                  {["通し番号", "学籍番号", "氏名"].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-[#d2d2d2] px-4 py-2"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignedStudents.map(([number, studentId, , name]) => (
                  <tr
                    key={number}
                    className="border-b border-[#d2d2d2] last:border-b-0"
                  >
                    <td className="px-4 py-2.5">{number}</td>
                    <td className="px-4 py-2.5">{studentId}</td>
                    <td className="px-4 py-2.5">{name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  );
}
