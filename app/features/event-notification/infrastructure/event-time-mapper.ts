import { EventNotificationError } from "../application/event-notification-error";

const displayTimePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const apiTimePattern = /^([01]\d|2[0-3])[0-5]\d$/;

export function toApiTime(value: string) {
  if (!displayTimePattern.test(value)) {
    throw new EventNotificationError("invalid_request");
  }
  return value.replace(":", "");
}

export function toDisplayTime(value: string) {
  if (!apiTimePattern.test(value)) {
    throw new EventNotificationError("unexpected");
  }
  return `${value.slice(0, 2)}:${value.slice(2)}`;
}
