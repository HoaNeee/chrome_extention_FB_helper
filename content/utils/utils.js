import {
  KEY_ADD_TIME_DELAY_FOR_SCHEDULER,
  KEY_GET_KEY_SAVED,
  KEY_SET_KEY_SAVED,
} from "../../contants/constant-extention.js";
import { KEY_LANGUAGE } from "../../contants/contants.js";
import { logError } from "../../utils/utils.js";
import { sendMessage, sendMessageWithResponse } from "./request.js";

function getIsMatchUrl(url) {
  if (!url) return false;
  return location.href === url;
}

async function CL_getValue(key, defaultValue = null) {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: key,
    });
    const value = response?.data;
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return value;
  } catch (error) {
    logError("Error CL_getValue: ", error);
    return defaultValue;
  }
}

async function CL_setValue(key, value) {
  try {
    await sendMessageWithResponse(KEY_SET_KEY_SAVED, {
      key: key,
      value: value,
    });
    return true;
  } catch (error) {
    logError("Error CL_setValue: ", error);
    return false;
  }
}

/**
 * Get text with language
 * @param {{viText: string, enText: string}} param0
 * @returns {Promise<string>}
 */
async function CL_getTextWithLang({ viText, enText } = {}) {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_LANGUAGE,
    });
    const lang = response?.data || "vi";

    return lang === "vi" ? viText : enText;
  } catch (error) {
    logError("Error CL_getTextWithLang: ", error);
    return viText;
  }
}

/**
 * Set delay comment time for scheduler
 * @param {number} timeDelay
 */
async function CL_setTimeDelayForScheduler(timeDelay) {
  try {
    await sendMessage(KEY_ADD_TIME_DELAY_FOR_SCHEDULER, {
      timeDelay: timeDelay,
    });
    return true;
  } catch (error) {
    logError("Error CL_setTimeDelayCommentForScheduler: ", error);
    return false;
  }
}

export {
  getIsMatchUrl,
  CL_getValue,
  CL_setValue,
  CL_getTextWithLang,
  CL_setTimeDelayForScheduler,
};
