import mockUser from "~/mock/frame/account-button.json";

export type AppRole = "admin" | "manager" | "member";

export const currentUser = {
  name: mockUser.name,
  role: mockUser.role.toLowerCase() as AppRole,
};
