import {
  notificationAudienceLabels,
  notificationUserCategoryLabels,
} from "~/features/notifications/components/notification-display";
import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button/Button";
import {
  SearchCombobox,
  type SearchOption,
} from "~/components/ui/form/SearchCombobox";
import { SegmentedControl } from "~/components/ui/form/SegmentedControl";
import type {
  NotificationAudienceOption,
  NotificationAudienceScopeType,
  NotificationAudienceType,
} from "~/features/notifications/model/notification-audience";
import type {
  NotificationAudienceDraftItem,
  NotificationAudienceScopeItem,
} from "~/features/notifications/model/notification-draft";
import { searchNotificationAudienceOptions } from "~/features/notifications/model/notification-audience";
import type { NotificationDisplayedErrors } from "~/features/notifications/components/notification-display";

const audienceSearchLimit = 30;

const audienceSelectionOptions: {
  label: string;
  value: NotificationAudienceType;
}[] = [
  { label: "全員", value: "all" },
  { label: "ユーザー", value: "user" },
  { label: "クラス", value: "class_room" },
  { label: "集合", value: "gathering" },
  { label: "イベント", value: "event" },
];

type NotificationAudienceItem = NotificationAudienceDraftItem;

type NotificationAudienceEditorProps = {
  audiences: NotificationAudienceItem[];
  errors: NotificationDisplayedErrors;
  audienceOptions: NotificationAudienceOption[];
  isAudienceLoading?: boolean;
  audienceError?: string | null;
  recipientCount?: number | null;
  recipientCountError?: string | null;
  isRecipientCountLoading?: boolean;
  isAudienceDisabled?: boolean;
  onAudiencesChange: (audiences: NotificationAudienceItem[]) => void;
  onAudienceReload?: () => void;
};

export function NotificationAudienceEditor({
  audiences,
  errors,
  audienceOptions,
  isAudienceLoading = false,
  audienceError = null,
  recipientCount = null,
  recipientCountError = null,
  isRecipientCountLoading = false,
  isAudienceDisabled = false,
  onAudiencesChange,
  onAudienceReload,
}: NotificationAudienceEditorProps) {
  const selectedAudiences = audiences.filter(
    (audience): audience is NotificationAudienceScopeItem =>
      audience.type !== "all"
  );
  const hasAllAudience = audiences.some((item) => item.type === "all");
  const [audienceQuery, setAudienceQuery] = useState("");
  const [audienceScope, setAudienceScope] =
    useState<NotificationAudienceScopeType>(
      () => selectedAudiences[0]?.type ?? "user"
    );
  const selectedAudienceKeys = new Set(
    selectedAudiences.map((audience) => `${audience.type}:${audience.targetId}`)
  );
  const audienceSearchOptions: SearchOption[] =
    searchNotificationAudienceOptions({
      options: audienceOptions,
      scope: audienceScope,
      query: audienceQuery,
      selectedKeys: selectedAudienceKeys,
      limit: audienceSearchLimit,
    }).map((option) => ({
      id: `${option.type}:${option.id}`,
      label: option.name,
      badge:
        option.type === "user" && option.userCategory
          ? notificationUserCategoryLabels[option.userCategory]
          : notificationAudienceLabels[option.type],
      description: `ID: ${option.id}`,
    }));

  return (
    <fieldset disabled={isAudienceDisabled}>
      <div className="mb-3 space-y-2">
        <p className="text-text-base text-sm font-medium">
          通知対象 <span className="text-tone-danger-text">*</span>
        </p>
        <SegmentedControl
          ariaLabel="通知対象"
          behavior="selection"
          onValueChange={(type) => {
            setAudienceQuery("");
            if (type === "all") {
              onAudiencesChange([
                { key: "audience-all", type: "all", targetId: "" },
              ]);
              return;
            }

            setAudienceScope(type);
            onAudiencesChange(hasAllAudience ? [] : selectedAudiences);
          }}
          options={audienceSelectionOptions}
          value={hasAllAudience ? "all" : audienceScope}
        />
      </div>
      {!hasAllAudience ? (
        <div className="space-y-3">
          <SearchCombobox
            ariaLabel={`${notificationAudienceLabels[audienceScope]}を検索して追加`}
            disabled={
              isAudienceDisabled || isAudienceLoading || Boolean(audienceError)
            }
            emptyMessage={
              audienceQuery.trim()
                ? "一致する通知対象がありません"
                : "名前またはIDを入力して検索できます"
            }
            onOptionSelect={(selectedOption) => {
              const option = audienceOptions.find(
                (item) => `${item.type}:${item.id}` === selectedOption.id
              );
              if (!option) return;

              onAudiencesChange([
                ...selectedAudiences,
                {
                  key: `audience-${option.type}-${option.id}`,
                  type: option.type,
                  targetId: option.id,
                },
              ]);
              setAudienceQuery("");
            }}
            onQueryChange={setAudienceQuery}
            options={audienceSearchOptions}
            placeholder={`${notificationAudienceLabels[audienceScope]}を名前・IDで検索して追加`}
            query={audienceQuery}
          />
          {selectedAudiences.length > 0 ? (
            <div className="space-y-2">
              {selectedAudiences.map((audience) => {
                const option = audienceOptions.find(
                  (item) =>
                    item.type === audience.type && item.id === audience.targetId
                );
                const label = notificationAudienceLabels[audience.type];
                const userCategory =
                  audience.type === "user" ? option?.userCategory : undefined;
                // errorsのkeyはdraft.audiencesのindexで振られるため、絞り込み後の
                // 表示順ではなく元の配列位置を参照する。
                const draftIndex = audiences.indexOf(audience);

                return (
                  <div
                    key={audience.key}
                    className="border-border-base flex items-center gap-3 rounded-md border px-3 py-2.5"
                  >
                    <span className="bg-surface-muted text-text-muted app-rounded shrink-0 px-2 py-1 text-xs font-medium">
                      {userCategory
                        ? notificationUserCategoryLabels[userCategory]
                        : label}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-text-base block truncate text-sm font-medium">
                        {option?.name ?? `${label} #${audience.targetId}`}
                      </span>
                      <span className="text-text-subtle block text-xs">
                        ID: {audience.targetId}
                      </span>
                    </span>
                    <Button
                      aria-label={`${label} ${option?.name ?? audience.targetId}を削除`}
                      icon={Trash2}
                      iconOnly
                      onClick={() =>
                        onAudiencesChange(
                          selectedAudiences.filter(
                            (item) => item.key !== audience.key
                          )
                        )
                      }
                      size="sm"
                      type="button"
                      variant="ghost"
                    />
                    {errors[`audiences.${draftIndex}`] ? (
                      <span className="text-tone-danger-text text-xs">
                        {errors[`audiences.${draftIndex}`]}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-text-subtle text-xs">
              上の検索欄から通知対象を追加してください。
            </p>
          )}
        </div>
      ) : null}
      {errors.audiences ? (
        <p className="text-tone-danger-text mt-1.5 text-xs">
          {errors.audiences}
        </p>
      ) : null}
      {isAudienceLoading ? (
        <p className="text-text-subtle mt-1.5 text-xs">
          通知対象を読み込み中...
        </p>
      ) : audienceError ? (
        <div className="mt-1.5 flex items-center gap-3">
          <p className="text-tone-danger-text text-xs">{audienceError}</p>
          {onAudienceReload ? (
            <button
              type="button"
              className="text-brand-primary text-xs font-semibold underline underline-offset-2"
              onClick={onAudienceReload}
            >
              再試行
            </button>
          ) : null}
        </div>
      ) : null}
      <p className="text-text-subtle mt-2 text-xs" aria-live="polite">
        {isRecipientCountLoading
          ? "対象人数を確認中..."
          : recipientCountError
            ? `対象人数を取得できませんでした: ${recipientCountError}`
            : recipientCount === null
              ? null
              : `通知予定 ${recipientCount.toLocaleString("ja-JP")}人`}
      </p>
    </fieldset>
  );
}
