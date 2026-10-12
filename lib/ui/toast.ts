import toast from "react-hot-toast";

const defaultOptions = {
  duration: 3000,
};

export const appToast = {
  success(message: string) {
    return toast.success(message, defaultOptions);
  },
  error(message: string) {
    return toast.error(message, defaultOptions);
  },
  warning(message: string) {
    return toast(message, {
      ...defaultOptions,
      icon: "⚠️",
      style: {
        border: "1px solid #f59e0b",
      },
    });
  },
  info(message: string) {
    return toast(message, defaultOptions);
  },
};
