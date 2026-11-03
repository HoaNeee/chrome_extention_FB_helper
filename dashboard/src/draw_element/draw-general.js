import { getIsUseLocalStorage } from "../../../services/storage-global-service.js";
import { logError } from "../../../utils/utils.js";

async function updateStatusToolUI(isChecked) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) return;

    const inputHeader = document.querySelector(
      "#tm_switch-status-tool-at-header",
    );

    const input = document.querySelector("#tm_switch-status-tool");

    if (inputHeader) {
      inputHeader.checked = !!isChecked;
    }

    if (input) {
      input.checked = !!isChecked;
    }
  } catch (error) {
    logError("Error at UpdateStatusToolUI", error);
  }
}

export { updateStatusToolUI };
