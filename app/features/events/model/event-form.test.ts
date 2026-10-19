import { describe, expect, it } from "vitest";

import {
  emptyEventForm,
  validateEventForm,
} from "~/features/events/model/event-form";
import { maxVenueSelection } from "~/features/events/model/event-venue";

const filledForm = {
  ...emptyEventForm,
  name: "大縄跳び",
  startTime: "09:30",
  endTime: "10:00",
};

function venueIds(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

describe("validateEventForm", () => {
  it("実施場所が未選択なら入力を促す", () => {
    expect(validateEventForm(filledForm)).toEqual({
      error: "イベント名を入力し、実施場所を選択してください。",
    });
  });

  it("実施場所は上限までなら送信内容へそのまま渡す", () => {
    const result = validateEventForm({
      ...filledForm,
      venueIds: venueIds(maxVenueSelection),
    });

    expect(result).toEqual({
      input: {
        endTime: "10:00",
        name: "大縄跳び",
        rules: null,
        startTime: "09:30",
        venueIds: venueIds(maxVenueSelection),
      },
    });
  });

  it("実施場所が上限を超えるとエラーにする", () => {
    expect(
      validateEventForm({
        ...filledForm,
        venueIds: venueIds(maxVenueSelection + 1),
      })
    ).toEqual({ error: "実施場所は20件まで選択できます。" });
  });
});
