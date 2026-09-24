import { maxVenueSelection } from "~/features/sports/model/competition-venue";

export type CompetitionFormValue = {
  endTime: string;
  name: string;
  rules: string;
  startTime: string;
  venueIds: number[];
};

export type CompetitionWriteInput = {
  endTime: string;
  name: string;
  rules: string | null;
  startTime: string;
  venueIds: number[];
};

export const emptyCompetitionForm: CompetitionFormValue = {
  endTime: "",
  name: "",
  rules: "",
  startTime: "",
  venueIds: [],
};

export function validateCompetitionForm(
  value: CompetitionFormValue
): { error: string } | { input: CompetitionWriteInput } {
  if (!value.name.trim() || value.venueIds.length === 0) {
    return { error: "イベント名を入力し、実施場所を選択してください。" };
  }
  if (value.venueIds.length > maxVenueSelection) {
    return {
      error: `実施場所は${maxVenueSelection}件まで選択できます。`,
    };
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.startTime)) {
    return { error: "開始時間を正しく入力してください。" };
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value.endTime)) {
    return { error: "終了時間を正しく入力してください。" };
  }
  if (value.startTime >= value.endTime) {
    return { error: "終了時間は開始時間より後の時刻を指定してください。" };
  }

  return {
    input: {
      endTime: value.endTime,
      name: value.name.trim(),
      rules: value.rules.trim() || null,
      startTime: value.startTime,
      venueIds: value.venueIds,
    },
  };
}
