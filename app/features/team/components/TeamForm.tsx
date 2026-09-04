import { useMemo, useState } from "react";

import { Button } from "~/components/ui/button/Button";
import type { TeamClassOption } from "~/features/team/mock/team-class-data";
import type { Team } from "~/features/team/model/team";

export type TeamFormInput = {
  name: string;
  registeredClasses: readonly string[];
};

export function TeamForm({
  availableClasses,
  initialTeam,
  isSubmitting,
  onCancel,
  onSubmit,
  submitError,
}: {
  availableClasses: readonly TeamClassOption[];
  initialTeam?: Team;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (input: TeamFormInput) => void | Promise<void>;
  submitError: string | null;
}) {
  const [name, setName] = useState(initialTeam?.name ?? "");
  const [registeredClasses, setRegisteredClasses] = useState<string[]>(
    () => initialTeam?.registeredClasses.slice() ?? []
  );
  const [classQuery, setClassQuery] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const classSearchResults = useMemo(() => {
    const normalizedQuery = classQuery.trim().toLocaleLowerCase();
    return availableClasses.filter(
      (classOption) =>
        !registeredClasses.includes(classOption.code) &&
        (!normalizedQuery ||
          classOption.code.toLocaleLowerCase().includes(normalizedQuery) ||
          classOption.name.toLocaleLowerCase().includes(normalizedQuery))
    );
  }, [availableClasses, classQuery, registeredClasses]);

  function addRegisteredClass(classCode: string) {
    setRegisteredClasses((current) =>
      current.includes(classCode) ? current : [...current, classCode]
    );
    setClassQuery("");
  }

  function removeRegisteredClass(classCode: string) {
    setRegisteredClasses((current) =>
      current.filter((currentCode) => currentCode !== classCode)
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    if (!normalizedName) {
      setValidationError("チーム名を入力してください。");
      return;
    }

    setValidationError(null);
    void onSubmit({ name: normalizedName, registeredClasses });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block text-sm font-semibold" htmlFor="team-name">
        チーム名
        <input
          autoFocus
          className="border-border-base bg-surface-base text-text-base mt-1 h-10 w-full rounded-md border px-3 outline-none"
          id="team-name"
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
      </label>

      <fieldset>
        <legend className="text-sm font-semibold">登録クラス</legend>
        <div className="border-border-base bg-surface-base mt-1 rounded-md border p-3">
          <div
            aria-label="登録済みクラス"
            className="mb-2 flex min-h-8 flex-wrap gap-2"
          >
            {registeredClasses.map((classCode) => (
              <span
                className="bg-surface-subtle text-text-base inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                key={classCode}
              >
                {classCode}
                <button
                  aria-label={`${classCode}を削除`}
                  className="text-text-muted hover:text-text-base ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-sm leading-none"
                  onClick={() => removeRegisteredClass(classCode)}
                  type="button"
                >
                  ×
                </button>
              </span>
            ))}
            {registeredClasses.length === 0 ? (
              <span className="text-text-muted py-1 text-xs">
                クラスを検索して追加してください
              </span>
            ) : null}
          </div>
          <input
            aria-label="登録クラスを検索"
            className="border-border-base bg-surface-base text-text-base h-9 w-full rounded-md border px-3 text-sm outline-none"
            id="team-classes"
            onChange={(event) => setClassQuery(event.target.value)}
            placeholder="クラスコード・クラス名で検索..."
            value={classQuery}
          />
          <div
            aria-label="クラス検索結果"
            className="border-border-base mt-2 max-h-40 overflow-y-auto rounded-md border"
            role="listbox"
          >
            {classSearchResults.map((classOption) => (
              <button
                className="hover:bg-surface-hover flex w-full items-center justify-between px-3 py-2 text-left text-sm"
                key={classOption.id}
                onClick={() => addRegisteredClass(classOption.code)}
                type="button"
              >
                <span className="text-text-base font-medium">
                  {classOption.code}
                </span>
                <span className="text-text-muted text-xs">
                  {classOption.name}
                </span>
              </button>
            ))}
            {classSearchResults.length === 0 ? (
              <p className="text-text-muted px-3 py-2 text-xs">
                該当するクラスがありません。
              </p>
            ) : null}
          </div>
        </div>
      </fieldset>

      {validationError || submitError ? (
        <p className="text-tone-danger-text text-sm" role="alert">
          {validationError ?? submitError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="secondary">
          キャンセル
        </Button>
        <Button disabled={isSubmitting} type="submit" variant="primary">
          {isSubmitting ? "保存中..." : "保存する"}
        </Button>
      </div>
    </form>
  );
}
