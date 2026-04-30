import accountButtonMock from "~/mock/frame/account-button.json";

export type AccountBtnData = {
  name: string;
  role: string;
  imageUrl: string;
  abbr_label: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
};

export function getAccountBtnData(): AccountBtnData {
  return accountButtonMock;
}
