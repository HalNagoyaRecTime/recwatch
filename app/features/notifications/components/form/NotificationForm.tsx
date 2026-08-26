import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
} from "react";
import {
  CalendarClock,
  Check,
  Search,
  Send,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

import { Button } from "~/components/ui/button/Button";
import { ButtonLink } from "~/components/ui/button/ButtonLink";
import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import { LayeredPanel } from "~/components/ui/panel/LayeredPanel";

import type {
  NotificationAudienceScope,
  NotificationTargetOption,
} from "~/features/notifications/model/notification-audience";
import type {
  NotificationDeliveryTiming,
  NotificationDraft,
  NotificationImportance,
} from "~/features/notifications/model/notification-draft";
import type { NotificationDraftErrors } from "~/features/notifications/model/notification-draft-validation";

type NotificationFormProps = {
  draft: NotificationDraft;
  errors: NotificationDraftErrors;
  targetOptions?: NotificationTargetOption[];
  isSubmissionDisabled?: boolean;
  isSubmitting: boolean;
  isAudienceDisabled?: boolean;
  showSubmitIcon?: boolean;
  submitLabel?: string;
  cancelTo?: string;
  onChange: (draft: NotificationDraft) => void;
  onSubmit: () => void | Promise<void>;
};

const deliveryTimingOptions = [
  { label: "即時配信", value: "now" },
  { label: "予約配信", value: "scheduled" },
] as const;

const importanceOptions: readonly {
  label: string;
  value: NotificationImportance;
}[] = [
  { label: "低", value: "low" },
  { label: "通常", value: "normal" },
  { label: "高", value: "high" },
];

const importanceDescriptions: Record<NotificationImportance, string> = {
  low: "低：急ぎではないお知らせとして配信します。",
  normal: "通常：通常の通知として配信します。",
  high: "高：すぐに確認してほしい重要な通知として配信します。",
};

const targetTypeLabels = {
  person: "個人",
  class: "クラス",
  team: "チーム",
} as const;

const targetTypeIcons = {
  person: UserRound,
  class: UsersRound,
  team: UsersRound,
} as const;

const audienceScopeOptions = [
  { label: "全員", value: "all" },
  { label: "対象を指定", value: "specified" },
] as const;

export function NotificationForm({
  draft,
  errors,
  isSubmissionDisabled = false,
  isSubmitting,
  isAudienceDisabled = false,
  showSubmitIcon = true,
  targetOptions = [],
  submitLabel,
  cancelTo = "/notifications",
  onChange,
  onSubmit,
}: NotificationFormProps) {
  const deliveryTiming: NotificationDeliveryTiming =
    draft.deliveryTiming ?? "now";
  const importance = draft.importance ?? "normal";
  const audienceScope =
    draft.audienceScope ?? (draft.audienceType === "all" ? "all" : "specified");
  const targetSelections = draft.targetSelections ?? [];
  const pushTitle = draft.pushTitle ?? draft.title;
  const pushBody = draft.pushBody ?? draft.body;
  const isDesignDraft =
    draft.pushTitle !== undefined ||
    draft.pushBody !== undefined ||
    draft.markdownDescription !== undefined;
  const canSubmit =
    (isDesignDraft
      ? pushTitle.trim().length > 0 &&
        pushBody.trim().length > 0 &&
        draft.title.trim().length > 0 &&
        Boolean(draft.markdownDescription?.trim())
      : draft.title.trim().length > 0 && draft.body.trim().length > 0) &&
    (audienceScope === "all" || targetSelections.length > 0) &&
    (deliveryTiming === "now" || Boolean(draft.scheduledAt));
  const minimumScheduledAt = getMinimumScheduledAt();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      noValidate
    >
      <LayeredPanel
        header={<h2 className="text-text-base font-semibold">通知内容</h2>}
      >
        <div className="space-y-5">
          <label className="block">
            <span className="text-text-base mb-2 block text-sm font-medium">
              プッシュ通知タイトル{" "}
              <span className="text-tone-danger-text">*</span>
            </span>
            <AutoGrowTextarea
              aria-label="プッシュ通知タイトル*"
              aria-describedby="notification-push-title-error"
              aria-invalid={Boolean(errors.pushTitle)}
              className={textareaClassName}
              name="pushTitle"
              onChange={(event) =>
                onChange({ ...draft, pushTitle: event.currentTarget.value })
              }
              placeholder="例：競技開始時間の変更"
              required
              value={pushTitle}
            />
            <FieldMeta
              error={errors.pushTitle}
              errorId="notification-push-title-error"
              limit={50}
              value={pushTitle}
            />
          </label>

          <label className="block">
            <span className="text-text-base mb-2 block text-sm font-medium">
              プッシュ通知本文 <span className="text-tone-danger-text">*</span>
            </span>
            <AutoGrowTextarea
              aria-label="プッシュ通知本文*"
              aria-describedby="notification-push-body-error"
              aria-invalid={Boolean(errors.pushBody)}
              className={textareaClassName}
              name="pushBody"
              onChange={(event) =>
                onChange({
                  ...draft,
                  body: event.currentTarget.value,
                  pushBody: event.currentTarget.value,
                })
              }
              placeholder="通知本文を入力してください"
              required
              value={pushBody}
            />
            <FieldMeta
              error={errors.pushBody}
              errorId="notification-push-body-error"
              limit={200}
              value={pushBody}
            />
          </label>

          <label className="block">
            <span className="text-text-base mb-2 block text-sm font-medium">
              タイトル <span className="text-tone-danger-text">*</span>
            </span>
            <AutoGrowTextarea
              aria-label="タイトル*"
              aria-describedby="notification-title-error"
              aria-invalid={Boolean(errors.title)}
              className={textareaClassName}
              name="title"
              onChange={(event) =>
                onChange({ ...draft, title: event.currentTarget.value })
              }
              placeholder="通知詳細のタイトルを入力してください"
              required
              value={draft.title}
            />
            <FieldMeta
              error={errors.title}
              errorId="notification-title-error"
              limit={50}
              value={draft.title}
            />
          </label>

          <label className="block">
            <span className="text-text-base mb-2 block text-sm font-medium">
              Markdown説明 <span className="text-tone-danger-text">*</span>
            </span>
            <MarkdownEditor
              hasError={Boolean(errors.markdownDescription)}
              onChange={(value) =>
                onChange({ ...draft, markdownDescription: value })
              }
              value={draft.markdownDescription ?? ""}
            />
            <FieldMeta
              error={errors.markdownDescription}
              errorId="notification-markdown-description-error"
              limit={2000}
              value={draft.markdownDescription ?? ""}
            />
          </label>

          <div>
            <p className="text-text-base mb-2 text-sm font-medium">
              通知の重要度 <span className="text-tone-danger-text">*</span>
            </p>
            <SegmentedControl
              ariaLabel="通知の重要度"
              behavior="selection"
              onValueChange={(value) =>
                onChange({ ...draft, importance: value })
              }
              options={importanceOptions}
              value={importance}
            />
            <p aria-live="polite" className="text-text-muted mt-2 text-xs">
              {importanceDescriptions[importance]}
            </p>
            {errors.importance ? (
              <p className="text-tone-danger-text mt-1.5 text-xs">
                {errors.importance}
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-text-base mb-2 text-sm font-medium">
              通知対象 <span className="text-tone-danger-text">*</span>
            </p>
            <NotificationTargetPicker
              disabled={isAudienceDisabled}
              error={errors.audienceId}
              options={targetOptions}
              scope={audienceScope}
              selections={targetSelections}
              onScopeChange={(scope) =>
                onChange({
                  ...draft,
                  audienceScope: scope,
                  audienceType: scope === "all" ? "all" : "class_room",
                  audienceId: "",
                  targetSelections: scope === "all" ? [] : targetSelections,
                })
              }
              onSelectionsChange={(selections) =>
                onChange({
                  ...draft,
                  audienceScope: "specified",
                  targetSelections: selections,
                })
              }
            />
          </div>

          <div>
            <p className="text-text-base mb-2 text-sm font-medium">
              配信タイミング <span className="text-tone-danger-text">*</span>
            </p>
            <SegmentedControl
              ariaLabel="配信タイミング"
              behavior="selection"
              onValueChange={(value) =>
                onChange({ ...draft, deliveryTiming: value })
              }
              options={deliveryTimingOptions}
              value={deliveryTiming}
            />
            {deliveryTiming === "scheduled" ? (
              <label className="mt-3 block">
                <span className="text-text-muted mb-1.5 block text-xs">
                  予約配信日時
                </span>
                <input
                  aria-describedby={
                    errors.scheduledAt
                      ? "notification-scheduled-at-error"
                      : undefined
                  }
                  aria-invalid={Boolean(errors.scheduledAt)}
                  aria-label="予約配信日時"
                  className={inputClassName}
                  onChange={(event) =>
                    onChange({
                      ...draft,
                      scheduledAt: event.currentTarget.value,
                    })
                  }
                  min={minimumScheduledAt}
                  required
                  type="datetime-local"
                  value={draft.scheduledAt ?? ""}
                />
                {errors.scheduledAt ? (
                  <span
                    id="notification-scheduled-at-error"
                    className="text-tone-danger-text mt-1 block text-xs"
                  >
                    {errors.scheduledAt}
                  </span>
                ) : null}
              </label>
            ) : (
              <p className="text-text-subtle mt-2 text-xs">
                作成後、対象ユーザーへすぐにプッシュ通知を送信します。
              </p>
            )}
          </div>
        </div>
      </LayeredPanel>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <ButtonLink to={cancelTo} variant="secondary" size="lg">
          キャンセル
        </ButtonLink>
        <Button
          disabled={!canSubmit || isSubmissionDisabled || isSubmitting}
          icon={
            showSubmitIcon
              ? deliveryTiming === "now"
                ? Send
                : CalendarClock
              : undefined
          }
          size="lg"
          type="submit"
          variant="primary"
        >
          {isSubmitting
            ? "確認中..."
            : (submitLabel ??
              (deliveryTiming === "now" ? "通知を配信" : "配信を予約"))}
        </Button>
      </div>
    </form>
  );
}

const inputClassName =
  "border-border-base bg-surface-base text-text-base placeholder:text-text-subtle focus:border-border-strong h-9 w-full rounded-md border px-3 text-sm outline-none transition-colors";

const textareaClassName = `${inputClassName} min-h-9 resize-none overflow-hidden py-2`;

function NotificationTargetPicker({
  disabled,
  error,
  onScopeChange,
  onSelectionsChange,
  options,
  scope,
  selections,
}: {
  disabled: boolean;
  error?: string;
  onScopeChange: (scope: NotificationAudienceScope) => void;
  onSelectionsChange: (selections: NotificationTargetOption[]) => void;
  options: NotificationTargetOption[];
  scope: NotificationAudienceScope;
  selections: NotificationTargetOption[];
}) {
  const [query, setQuery] = useState("");
  const selectedIds = new Set(selections.map((selection) => selection.id));
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedQuery) return true;

    return (option.name + " " + option.detail)
      .toLocaleLowerCase()
      .includes(normalizedQuery);
  });
  const recipientCount = calculateRecipientCount(selections);

  function toggleSelection(option: NotificationTargetOption) {
    if (selectedIds.has(option.id)) {
      onSelectionsChange(
        selections.filter((selection) => selection.id !== option.id)
      );
      return;
    }

    onSelectionsChange([...selections, option]);
  }

  return (
    <div>
      <SegmentedControl
        ariaLabel="通知対象"
        behavior="selection"
        onValueChange={onScopeChange}
        options={audienceScopeOptions}
        value={scope}
      />

      {scope === "specified" ? (
        <div className="mt-3 space-y-3">
          <label className="relative block">
            <Search
              aria-hidden="true"
              className="text-text-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <input
              aria-label="名前・クラス・チームを検索"
              className={inputClassName + " pl-9"}
              disabled={disabled}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="名前・クラス・チームを検索"
              type="search"
              value={query}
            />
          </label>

          <div>
            <p className="text-text-muted mb-1.5 text-xs font-medium">
              検索結果
            </p>
            <div className="border-border-base divide-border-base divide-y overflow-hidden rounded-md border">
              {(["person", "class", "team"] as const).map((type) => {
                const groupOptions = filteredOptions.filter(
                  (option) => option.type === type
                );

                if (groupOptions.length === 0) return null;

                const Icon = targetTypeIcons[type];

                return (
                  <div key={type}>
                    <p className="bg-surface-muted text-text-muted px-3 py-1.5 text-xs font-medium">
                      {targetTypeLabels[type]}
                    </p>
                    {groupOptions.map((option) => {
                      const isSelected = selectedIds.has(option.id);

                      return (
                        <button
                          aria-label={option.name + " " + option.detail}
                          aria-pressed={isSelected}
                          className="hover:bg-surface-hover flex w-full items-center gap-2 px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={disabled}
                          key={option.id}
                          onClick={() => toggleSelection(option)}
                          type="button"
                        >
                          <Icon
                            aria-hidden="true"
                            className="text-text-muted size-4 shrink-0"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="text-text-base block truncate text-sm">
                              {option.name}
                            </span>
                            <span className="text-text-subtle block truncate text-xs">
                              {option.detail}
                            </span>
                          </span>
                          {isSelected ? (
                            <Check
                              aria-hidden="true"
                              className="text-brand-primary size-4 shrink-0"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              {filteredOptions.length === 0 ? (
                <p className="text-text-subtle px-3 py-4 text-center text-xs">
                  条件に一致する対象がありません。
                </p>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-text-muted mb-1.5 text-xs font-medium">選択中</p>
            <div className="flex min-h-8 flex-wrap gap-1.5">
              {selections.length > 0 ? (
                selections.map((selection) => (
                  <button
                    aria-label={selection.name + "を選択から外す"}
                    className="bg-surface-muted text-text-base inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs"
                    disabled={disabled}
                    key={selection.id}
                    onClick={() => toggleSelection(selection)}
                    type="button"
                  >
                    {selection.name}
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                ))
              ) : (
                <span className="text-text-subtle py-1 text-xs">
                  対象を選択してください
                </span>
              )}
            </div>
            <p className="text-text-base mt-2 text-sm font-medium">
              配信対象：{recipientCount}人
            </p>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="text-tone-danger-text mt-1.5 text-xs">{error}</p>
      ) : null}
    </div>
  );
}

function calculateRecipientCount(selections: NotificationTargetOption[]) {
  const selectedGroupIds = new Set(
    selections
      .filter((selection) => selection.type !== "person")
      .map((selection) => selection.id)
  );

  return selections.reduce((total, selection) => {
    if (
      selection.type === "person" &&
      selection.coveredByIds?.some((id) => selectedGroupIds.has(id))
    ) {
      return total;
    }

    return total + selection.recipientCount;
  }, 0);
}

function MarkdownEditor({
  hasError,
  onChange,
  value,
}: {
  hasError: boolean;
  onChange: (value: string) => void;
  value: string;
}) {
  const colorMode = useMarkdownEditorColorMode();

  return (
    <div className="notification-markdown-editor" data-color-mode={colorMode}>
      <MDEditor
        className={hasError ? "notification-markdown-editor-error" : undefined}
        data-color-mode={colorMode}
        height={200}
        preview="edit"
        textareaProps={{
          "aria-describedby": "notification-markdown-description-error",
          "aria-invalid": hasError,
          "aria-label": "Markdown説明*",
          name: "markdownDescription",
          placeholder: "Markdownで通知詳細を入力してください",
          required: true,
        }}
        value={value}
        visibleDragbar={false}
        onChange={(nextValue) => onChange(nextValue ?? "")}
      />
    </div>
  );
}

function useMarkdownEditorColorMode(): "dark" | "light" {
  const [colorMode, setColorMode] = useState<"dark" | "light">(() =>
    getDocumentColorMode()
  );

  useEffect(() => {
    const root = document.documentElement;
    const updateColorMode = () => setColorMode(getDocumentColorMode());
    const observer = new MutationObserver(updateColorMode);

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    updateColorMode();

    return () => observer.disconnect();
  }, []);

  return colorMode;
}

function getDocumentColorMode(): "dark" | "light" {
  return typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

type AutoGrowTextareaProps = Omit<
  ComponentPropsWithoutRef<"textarea">,
  "value"
> & {
  value: string;
};

function AutoGrowTextarea({ value, style, ...props }: AutoGrowTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      style={{ ...style, overflowY: "hidden" }}
      value={value}
    />
  );
}

function FieldMeta({
  error,
  errorId,
  limit,
  value,
}: {
  error?: string;
  errorId: string;
  limit: number;
  value: string;
}) {
  const isOverLimit = value.length > limit;

  return (
    <div className="mt-1.5 flex items-start gap-3 text-xs">
      <div
        id={errorId}
        aria-live="polite"
        className="text-tone-danger-text min-h-5 min-w-0 flex-1 break-words whitespace-pre-wrap"
      >
        {error}
      </div>
      <span
        className={
          isOverLimit
            ? "text-tone-danger-text shrink-0 font-semibold whitespace-nowrap"
            : "text-text-subtle shrink-0 whitespace-nowrap"
        }
      >
        {value.length} / {limit}
      </span>
    </div>
  );
}

function getMinimumScheduledAt() {
  const minimum = new Date();
  minimum.setSeconds(0, 0);
  minimum.setMinutes(minimum.getMinutes() + 1);

  const localMinimum = new Date(
    minimum.getTime() - minimum.getTimezoneOffset() * 60_000
  );
  return localMinimum.toISOString().slice(0, 16);
}
