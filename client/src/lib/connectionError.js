import { Toast } from "./sweetalert";

export const connectionError = (err) => {
  if (err) {
    Toast.fire({
      icon: "error",
      title: "Connection Error. Reload to restore Connection",
    });
  }
};
