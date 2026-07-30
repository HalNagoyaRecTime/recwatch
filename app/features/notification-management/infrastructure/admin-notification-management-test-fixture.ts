export function createAdminNotificationResponse(
  overrides: Record<string, unknown> = {}
) {
  return {
    notification_id: 10,
    notification_type: "manual",
    title: "集合場所変更",
    body: "集合場所は体育館です。",
    scheduled_at: "2026-11-07T09:00:00+09:00",
    related_event_id: null,
    related_event_name: null,
    created_user_id: 5,
    creator_name: "HAL 太郎",
    recipient_count: 30,
    audience: {
      type: "resolved_recipients",
      recipient_count: 30,
    },
    delivery_summary: {
      total: 30,
      draft: 30,
      sending: 0,
      sent: 0,
      failed: 0,
    },
    created_at: "2026-11-07T08:00:00+09:00",
    updated_at: "2026-11-07T08:00:00+09:00",
    ...overrides,
  };
}
