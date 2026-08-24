import {
  KEY_ADD_TIME_DELAY_FOR_SCHEDULER,
  KEY_CAN_COMMENT_WALK_THIS_TAB,
  KEY_GET_ALL_METADATA_COMMENT_WALK,
  KEY_GET_KEY_SAVED,
  KEY_GET_PARSE_FILE,
  KEY_SET_KEY_SAVED,
  URL_SEARCH_PAGE,
} from "../../contants/constant-extention.js";
import { KEY_LANGUAGE, KEY_LAST_TIME_POST } from "../../contants/contants.js";
import { logError } from "../../utils/utils.js";
import { addLogEntry } from "../elements/panel-log-content.js";
import { sendMessage, sendMessageWithResponse } from "./request.js";

function getIsMatchUrl(url) {
  if (!url) return false;
  return location.href === url;
}

/**
 * Get value from storage
 * @param {string} key
 * @param {*} defaultValue
 * @returns {Promise<*>}
 */
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
    logErrorContent("Error CL_getValue: ", error);
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
    logErrorContent("Error CL_setValue: ", error);
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
    logErrorContent("Error CL_getTextWithLang: ", error);
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
    logErrorContent("Error CL_setTimeDelayCommentForScheduler: ", error);
    return false;
  }
}

/**
 * Update last time post
 * @param {number} time
 */
async function updateLastTimePost(time) {
  try {
    await sendMessage(KEY_LAST_TIME_POST, {
      time,
    });
    return true;
  } catch (error) {
    logErrorContent("Error at updateLastTimePost: ", error);
    return false;
  }
}

/**
 * @typedef {import('../../types/types.js').Base64Object} Base64Object
 */

/**
 *
 * @param {Array<string|Base64Object>} files
 * @returns {Promise<Array<Base64Object>>}
 */
async function CL_getParseFileRequest(files) {
  try {
    const res = await sendMessageWithResponse(KEY_GET_PARSE_FILE, {
      files: files,
    });

    return res?.data;
  } catch (error) {
    logErrorContent("Error CL_getFileRequest: ", error);
    throw error;
  }
}

async function CL_getCanCommentWalkThisTab() {
  try {
    const res = await sendMessageWithResponse(KEY_CAN_COMMENT_WALK_THIS_TAB);
    return res.data;
  } catch (error) {
    logErrorContent("error CL_getCanCommentWalk", error);
    return false;
  }
}

function convertArgsToString(item) {
  if (item instanceof Error) {
    return `${item.name}: ${item.message}`;
  }
  if (
    typeof item === "string" ||
    typeof item === "number" ||
    typeof item === "boolean"
  ) {
    return String(item);
  } else {
    if (Array.isArray(item)) {
      let str = "";
      for (const subItem of item) {
        str += subItem + " ";
      }
      return str;
    }
    if (typeof item === "object" && Object.keys(item).length) {
      let str = "";
      for (const sub in item) {
        str += `${sub}: ${convertArgsToString(item[sub])}, `;
      }
      return str;
    }
  }

  return JSON.stringify(item);
}

function logContent(...args) {
  // console.log("[LOG_CONTENT]: ", ...args);
  let str = "";
  for (const item of args) {
    str += convertArgsToString(item);
  }
  addLogEntry(str, "info");
}

function logErrorContent(...args) {
  console.log("[LOG_ERROR_CONTENT]: ", ...args);
  let str = "";
  for (const item of args) {
    str += convertArgsToString(item);
  }
  addLogEntry(str, "error");
}

export {
  getIsMatchUrl,
  CL_getValue,
  CL_setValue,
  CL_getTextWithLang,
  CL_setTimeDelayForScheduler,
  updateLastTimePost,
  CL_getParseFileRequest,
  CL_getCanCommentWalkThisTab,
  logContent,
  logErrorContent,
};
