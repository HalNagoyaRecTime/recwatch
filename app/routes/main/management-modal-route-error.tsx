import { Button } from "~/components/ui/button/Button";
import { FormModal } from "~/components/ui/modal/FormModal";
import { getManagementRouteErrorMessage } from "~/routes/main/management-route-error";

type ManagementModalRouteErrorProps = {
  error: unknown;
  onClose: () => void | Promise<void>;
  title: string;
};

export function ManagementModalRouteError({
  error,
  onClose,
  title,
}: ManagementModalRouteErrorProps) {
  return (
    <FormModal
      description="一覧を閉じずにエラー内容を確認できます"
      onClose={onClose}
      title={title}
    >
      <div className="space-y-4">
        <p className="text-tone-danger-text text-sm" role="alert">
          {getManagementRouteErrorMessage(error)}
        </p>
        <div className="flex justify-end">
          <Button onClick={onClose} type="button" variant="secondary">
            閉じる
          </Button>
        </div>
      </div>
    </FormModal>
  );
}
