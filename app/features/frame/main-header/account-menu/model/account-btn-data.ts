import accountButtonMock from "~/mock/frame/account-button.json";

export type AccountUser = {
  id: string;
  email: string;
  display_name: string;
  is_internal: boolean;
  avatar_url?: string | null;
  avatar_updated_at?: string | null;
};

export type AccountBtnData = {
  name: string;
  role: string;
  abbr_label: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
};

function isProbablyMojibake(value: string) {
  return /[\u0080-\u009f\u00c0-\u00ff]|縺|繧|螟|驛|�/.test(value);
}

function repairMojibake(value: string) {
  if (!isProbablyMojibake(value)) {
    return value;
  }

  const bytes: number[] = [];
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code > 255) {
      return value;
    }
    bytes.push(code);
  }

  const decoded = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
  return decoded.includes("�") ? value : decoded;
}

function getDisplayName(user?: AccountUser | null) {
  const rawName = user?.display_name?.trim();
  const repairedName = rawName ? repairMojibake(rawName).trim() : "";

  if (repairedName && !isProbablyMojibake(repairedName)) {
    return repairedName;
  }

  const emailName = user?.email?.split("@")[0]?.trim();
  return emailName || accountButtonMock.name;
}

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "AD";
  }

  return Array.from(trimmed).slice(0, 2).join("").toUpperCase();
}

export function getAccountBtnData(user?: AccountUser | null): AccountBtnData {
  const name = getDisplayName(user);

  return {
    ...accountButtonMock,
    name,
    role: "Admin",
    abbr_label: getInitials(name),
  };
}
