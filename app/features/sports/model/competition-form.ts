export type CompetitionFormValue = {
  endTime: string;
  name: string;
  rules: string;
  startTime: string;
  venue: string;
};

export type CompetitionWriteInput = {
  endTime: string;
  name: string;
  rules: string | null;
  startTime: string;
  venue: string;
};

export const emptyCompetitionForm: CompetitionFormValue = {
  endTime: "",
  name: "",
  rules: "",
  startTime: "",
  venue: "",
};

export function validateCompetitionForm(
  value: CompetitionFormValue
): { error: string } | { input: CompetitionWriteInput } {
  if (!value.name.trim() || !value.venue.trim()) {
    return { error: "イベント名および実施場所を入力してください。" };
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
      venue: value.venue.trim(),
    },
  };
}
