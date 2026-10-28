import toast from "react-hot-toast";
import { AppToast, type AppToastVariant } from "@/components/common/AppToast";

const TOAST_DURATION_MS = 3000;

function showAppToast(message: string, variant: AppToastVariant) {
  return toast.custom(
    (t) => (
      <AppToast id={t.id} message={message} variant={variant} visible={t.visible} />
    ),
    { duration: TOAST_DURATION_MS },
  );
}

export const appToast = {
  success(message: string) {
    return showAppToast(message, "success");
  },
  error(message: string) {
    return showAppToast(message, "error");
  },
  warning(message: string) {
    return showAppToast(message, "warning");
  },
  info(message: string) {
    return showAppToast(message, "info");
  },
};
