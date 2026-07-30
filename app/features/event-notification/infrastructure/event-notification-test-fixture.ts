export function createPatchEventResponse(
  overrides: Record<string, unknown> = {}
) {
  return {
    event: {
      event_id: 10,
      event_name: "走れ！〇人〇脚！",
      rule_text: null,
      venue: "コートA",
      start_time: "0910",
      end_time: "1010",
      created_at: "2026-11-07T08:00:00+09:00",
      updated_at: "2026-11-07T08:30:00+09:00",
    },
    notification_enabled: true,
    notification_schedules: [
      {
        notification_schedule_id: 100,
        send_status: "draft",
        send_at: "2026-11-07T08:55:00+09:00",
      },
    ],
    ...overrides,
  };
}

export function createNotificationSummaryResponse(
  overrides: Record<string, unknown> = {}
) {
  return {
    event_id: 10,
    scheduled_at: "2026-11-07T08:55:00+09:00",
    total: 30,
    draft: 30,
    sending: 0,
    sent: 0,
    failed: 0,
    ...overrides,
  };
}
