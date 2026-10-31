import {
  KEY_ADD_LOG,
  KEY_CLOSE_THIS_TAB,
  STATUS_RESPONSE,
} from "../../contants/constant-extention";
import { logError } from "../../utils/utils";
import { getTextLanguageContent } from "./global";
import { logContent, logErrorContent } from "./utils";

async function sendMessage(type, data) {
  try {
    await chrome.runtime.sendMessage({
      type,
      data,
    });
  } catch (error) {
    logError("Error send message", error);
    throw error;
  }
}

/**
 *
 * @param {string} type
 * @param {any} data
 * @returns {Promise<{status: string, data: any, message: string}>}
 */
async function sendMessageWithResponse(type, data) {
  try {
    const res = await chrome.runtime.sendMessage({
      type,
      data,
    });
    if (res?.status === STATUS_RESPONSE.FAIL) {
      throw new Error(
        res?.msg || res?.message || "Error at sendMessageWithResponse",
      );
    }
    return res;
  } catch (error) {
    logError("Error at sendMessageWithResponse", error);
    throw error;
  }
}

/**
 * Add log to background
 * @param {{vi: string, en: string, type: "info" | "error" | "success" | "warning"}} message
 */
async function CL_addLogRequest({ vi, en, type = "info" }) {
  try {
    const languageContent = getTextLanguageContent({ vi, en });
    if (type === "error") {
      logErrorContent(languageContent);
    } else {
      logContent(languageContent);
    }

    await sendMessage(KEY_ADD_LOG, { vi, en, type });
  } catch (error) {
    logErrorContent("Error at CL_addLogRequest: " + error);
  }
}

async function CL_closeThisTab() {
  try {
    await sendMessage(KEY_CLOSE_THIS_TAB);
  } catch (error) {
    logErrorContent("Error at CL_closeThisTab: " + error);
  }
}

export {
  sendMessage,
  sendMessageWithResponse,
  CL_addLogRequest,
  CL_closeThisTab,
};
