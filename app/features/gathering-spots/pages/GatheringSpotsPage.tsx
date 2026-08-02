import { Check, Pencil, Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { apiClient } from "~/lib/api-client";

type GatheringSpot = {
  gathering_spot_id: number;
  gathering_spot_name: string;
  created_at: string;
  updated_at: string;
};

export function GatheringSpotsPage() {
  const [spots, setSpots] = useState<GatheringSpot[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form State for Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<GatheringSpot | null>(null);
  const [spotNameInput, setSpotNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function load() {
      try {
        const spotList = await apiClient.get<GatheringSpot[]>(
          "/api/v1/gathering-spots"
        );
        if (!isCurrent) return;

        setSpots(spotList);
      } catch (error) {
        if (isCurrent) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "集合場所の取得に失敗しました。"
          );
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    void load();
    return () => {
      isCurrent = false;
    };
  }, []);

  const filteredSpots = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return spots;
    }
    return spots.filter((spot) =>
      spot.gathering_spot_name.toLowerCase().includes(normalizedQuery)
    );
  }, [query, spots]);

  function handleOpenCreate() {
    setEditingSpot(null);
    setSpotNameInput("");
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(spot: GatheringSpot) {
    setEditingSpot(spot);
    setSpotNameInput(spot.gathering_spot_name);
    setSubmitError(null);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingSpot(null);
    setSpotNameInput("");
    setSubmitError(null);
  }

  async function handleSubmitForm() {
    const name = spotNameInput.trim();
    if (!name) {
      setSubmitError("集合場所名を入力してください。");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (editingSpot) {
        const updated = await apiClient.put<GatheringSpot>(
          `/api/v1/gathering-spots/${editingSpot.gathering_spot_id}`,
          { gatheringSpotName: name }
        );

        setSpots((current) =>
          current.map((spot) =>
            spot.gathering_spot_id === updated.gathering_spot_id
              ? updated
              : spot
          )
        );
      } else {
        const created = await apiClient.post<GatheringSpot>(
          "/api/v1/gathering-spots",
          { gatheringSpotName: name }
        );

        setSpots((current) => [...current, created]);
      }

      handleCloseForm();
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "集合場所の保存に失敗しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">集合場所管理</h1>
      <p className="mt-1 text-xs text-black/40">
        競技や集合イベントで使用する集合場所の管理を行います
      </p>

      {loadError ? (
        <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {loadError}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-[38px] w-[240px] items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-3 text-sm">
            <Search className="size-4 text-black/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-w-0 flex-1 outline-none"
              placeholder="集合場所名で検索..."
            />
          </label>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1 rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm text-white"
          >
            <Plus className="size-4" />
            新規登録
          </button>
        </div>

        {isFormOpen ? (
          <div className="rounded-[14px] border border-[#0070bb]/30 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {editingSpot ? "集合場所の編集" : "新規集合場所の追加"}
              </h2>
              <button type="button" onClick={handleCloseForm}>
                <X className="size-4 text-black/40" />
              </button>
            </div>

            <div className="mt-3 max-w-md space-y-3">
              <label className="block text-sm font-bold">
                集合場所名 <span className="text-red-500">*</span>
                <input
                  disabled={isSubmitting}
                  value={spotNameInput}
                  onChange={(e) => setSpotNameInput(e.target.value)}
                  placeholder="例：体育館前、コートA"
                  className="mt-1 h-8 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none disabled:opacity-50"
                />
              </label>

              {submitError ? (
                <p className="text-xs text-red-600">{submitError}</p>
              ) : null}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-1.5 text-xs"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmitForm()}
                  className="flex items-center gap-1 rounded-[10px] bg-[#0070bb] px-4 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  <Check className="size-3.5" />
                  {isSubmitting ? "保存中..." : "保存する"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto rounded-[14px] border border-[#d2d2d2] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f9fafb] text-[11px] text-black/50">
              <tr>
                <th className="w-20 border-b border-[#d2d2d2] px-4 py-2">ID</th>
                <th className="border-b border-[#d2d2d2] px-4 py-2">
                  集合場所名
                </th>
                <th className="w-48 border-b border-[#d2d2d2] px-4 py-2">
                  登録日時
                </th>
                <th className="w-24 border-b border-[#d2d2d2] px-4 py-2">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-black/40">
                    読み込み中...
                  </td>
                </tr>
              ) : filteredSpots.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-black/40">
                    集合場所が見つかりません
                  </td>
                </tr>
              ) : (
                filteredSpots.map((spot) => (
                  <tr
                    key={spot.gathering_spot_id}
                    className="border-b border-[#d2d2d2] last:border-b-0"
                  >
                    <td className="px-4 py-3">{spot.gathering_spot_id}</td>
                    <td className="px-4 py-3 font-bold">
                      {spot.gathering_spot_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-black/50">
                      {spot.created_at || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-black/45">
                        <button
                          type="button"
                          aria-label={`${spot.gathering_spot_name}を編集`}
                          onClick={() => handleOpenEdit(spot)}
                        >
                          <Pencil className="size-4 hover:text-[#0070bb]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
