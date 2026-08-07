import { Check, Pencil, Plus, Search, X } from "lucide-react";

import type { GatheringSpotGateway } from "~/features/gathering-spots/api/contracts/gathering-spot-gateway";
import { useGatheringSpotsPage } from "~/features/gathering-spots/hooks/useGatheringSpotsPage";

type GatheringSpotsPageProps = {
  gateway: GatheringSpotGateway;
};

export function GatheringSpotsPage({ gateway }: GatheringSpotsPageProps) {
  const state = useGatheringSpotsPage({ gateway });

  return (
    <div className="min-h-full bg-[#f7faff] p-1 text-[#0a0a0a]">
      <h1 className="text-[17px] font-bold">集合場所管理</h1>
      <p className="mt-1 text-xs text-black/40">
        競技や集合イベントで使用する集合場所の管理を行います
      </p>

      {state.loadError ? (
        <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.loadError}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-[38px] w-[240px] items-center gap-2 rounded-[10px] border border-[#d2d2d2] bg-white px-3 text-sm">
            <Search className="size-4 text-black/35" />
            <input
              value={state.query}
              onChange={(event) =>
                state.handleQueryChange(event.currentTarget.value)
              }
              className="min-w-0 flex-1 outline-none"
              placeholder="集合場所名で検索..."
            />
          </label>

          <button
            type="button"
            onClick={state.openCreateForm}
            className="flex items-center gap-1 rounded-[10px] bg-[#0070bb] px-4 py-2 text-sm text-white"
          >
            <Plus className="size-4" />
            新規登録
          </button>
        </div>

        {state.isFormOpen ? (
          <div className="rounded-[14px] border border-[#0070bb]/30 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">
                {state.editingSpot ? "集合場所の編集" : "新規集合場所の追加"}
              </h2>
              <button type="button" onClick={state.closeForm}>
                <X className="size-4 text-black/40" />
              </button>
            </div>

            <div className="mt-3 max-w-md space-y-3">
              <label className="block text-sm font-bold">
                集合場所名 <span className="text-red-500">*</span>
                <input
                  disabled={state.isSubmitting}
                  value={state.spotNameInput}
                  onChange={(event) =>
                    state.handleSpotNameChange(event.currentTarget.value)
                  }
                  placeholder="例：体育館前、コートA"
                  className="mt-1 h-8 w-full rounded-[10px] border border-[#d2d2d2] bg-white px-3 font-normal outline-none disabled:opacity-50"
                />
              </label>

              {state.submitError ? (
                <p className="text-xs text-red-600">{state.submitError}</p>
              ) : null}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={state.closeForm}
                  className="rounded-[10px] border border-[#d2d2d2] bg-white px-4 py-1.5 text-xs"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  disabled={state.isSubmitting}
                  onClick={() => void state.submitForm()}
                  className="flex items-center gap-1 rounded-[10px] bg-[#0070bb] px-4 py-1.5 text-xs text-white disabled:opacity-50"
                >
                  <Check className="size-3.5" />
                  {state.isSubmitting ? "保存中..." : "保存する"}
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
              {state.isLoading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-black/40">
                    読み込み中...
                  </td>
                </tr>
              ) : state.filteredSpots.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-black/40">
                    集合場所が見つかりません
                  </td>
                </tr>
              ) : (
                state.filteredSpots.map((spot) => (
                  <tr
                    key={spot.id}
                    className="border-b border-[#d2d2d2] last:border-b-0"
                  >
                    <td className="px-4 py-3">{spot.id}</td>
                    <td className="px-4 py-3 font-bold">{spot.name}</td>
                    <td className="px-4 py-3 text-xs text-black/50">
                      {spot.createdAt || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-black/45">
                        <button
                          type="button"
                          aria-label={`${spot.name}を編集`}
                          onClick={() => state.openEditForm(spot)}
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
