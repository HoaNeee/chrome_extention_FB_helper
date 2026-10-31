import { logError } from "../../../utils/utils.js";

function showNotify({ message, type = "success", duration = 3000 }) {
  try {
    let bgr = "";
    let color = "";

    switch (type) {
      case "success":
        bgr = "#28a745";
        color = "#fff";
        break;
      case "error":
        bgr = "#ef214a";
        color = "#fff";
        break;
      case "warning":
        bgr = "#e8f54c";
        color = "#000";
        break;
      case "info":
        bgr = "#007ACC";
        color = "#fff";
        break;
      default:
        bgr = "#28a745";
        color = "#fff";
        break;
    }

    if (typeof Toastify === "undefined") return;

    const toastifyEl = Toastify({
      text: message,
      duration: duration,
      close: true,
      gravity: "bottom",
      position: "right",
      stopOnFocus: true,
      offset: {
        y: 50,
      },
      style: {
        background: bgr,
        color: color,
      },
    });
    if (toastifyEl) {
      toastifyEl.showToast();
    }
  } catch (error) {
    logError("Error at showNotify: ", error);
  }
}

export { showNotify };
