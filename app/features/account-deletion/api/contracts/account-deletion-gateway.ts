export type AccountDeletionErrorReason =
  "reauth" | "already-deleted" | "generic";

export type StartDeletionAuthResult =
  { ok: true; authUrl: string } | { ok: false; message: string };

export type ConfirmDeletionResult =
  | { status: "done" }
  | { status: "accepted" }
  | { status: "pending" }
  | {
      status: "error";
      code?: string;
      message: string;
      reason?: AccountDeletionErrorReason;
    };

export type AccountDeletionGateway = {
  startAuth: () => Promise<StartDeletionAuthResult>;
  confirm: (
    deletionConfirmationToken: string
  ) => Promise<ConfirmDeletionResult>;
};
