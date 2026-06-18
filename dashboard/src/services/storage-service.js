import {
  KEY_IS_IN_PROGRESS,
  KEY_INDEX_GROUP_POST,
  KEY_STOP_TASK,
  initialTimeDelay,
  KEY_TIME_DELAY,
  KEY_IS_FIX_STEAL_FOCUS,
  KEY_QUEUE,
  KEY_TITLE_STRICTLY_MATCH_GROUP,
  KEY_LANGUAGE,
  KEY_IS_FIX_STEAL_ALL_FOCUS,
  KEY_IS_DEVELOPER_MODE,
  KEY_HISTORY_LOGS,
  KEY_IS_SHUFFLE_GROUPS_NEED_POST,
  KEY_IS_PREMIUM,
  KEY_IS_DARK_THEME,
  KEY_CHANGE_GROUPS_CHECKED_FLAG,
  KEY_INDEXS_GROUP_CHECKED,
  KEY_IS_TEST,
  KEY_MAX_GROUP_PER_TIME,
  KEY_COUNT_RESET_GROUPS,
  KEY_POST,
  KEY_IS_RANDOM_BATCH_POST,
  KEY_IS_RANDOM_TIME_POST,
  KEY_IS_SPAMMED,
  KEY_LAST_TIME_POST,
  KEY_IS_SHUFFLE_SCHEDULER_TIME,
  MAX_GROUP_PER_TIME_INITIAL,
  KEY_CURRENT_COUNT_POSTED,
  KEY_COUNT_BATCH_POST,
  KEY_IS_INTERACT_BEFORE_POST,
  KEY_DECIDED_INTERACT_BEFORE_POST,
} from "../../../contants/contants.js";
import {
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
} from "./groupService.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import Queue from "../utils/queue.js";
import { logActions, logError, now, random } from "../../../utils/utils.js";

async function setProgress(b) {
  await DB_setValue(KEY_IS_IN_PROGRESS, b);
}

async function getProgress() {
  return (await DB_getValue(KEY_IS_IN_PROGRESS)) || false;
}

/**
 * Get the current id of the group being posted
 * @returns {Promise<string|null>} The current id (index) or null if not set
 */
async function getCurrentIndexGroupPost() {
  const index = await DB_getValue(KEY_INDEX_GROUP_POST);
  return index;
}

/**
 *
 * @param {string|null} index  The id of the group to set as currently being posted, or null to unset
 */
async function setCurrentIndexGroupPost(index) {
  await DB_setValue(KEY_INDEX_GROUP_POST, index);
}

/**
 * @returns {Promise<string|null>} random ID of group or NULL if all groups are posted and reset to pending
 */
async function getRandomIndexGroupChecked() {
  try {
    const objectList = await getListGroupsNeedPostInStorage();
    const listGroups = objectList?.groups || [];
    if (!listGroups.length) {
      return null;
    }

    const isShuffleGroup = await getIsShuffleGroupNeedPost();
    let index = 0;
    let id = listGroups[index].id;

    if (isShuffleGroup) {
      index = random(0, listGroups.length - 1);
      id = listGroups[index].id;
    }

    let need = listGroups[index];

    let groups = need?.groups || [];

    const posteds = await getAllGroupPostedsInStorage();
    const set = new Set(posteds);

    groups = groups.filter((gr) => !set.has(gr.id_href));

    const isAllNotPending = groups.every((gr) => gr.status !== "pending");

    if (isAllNotPending) {
      let isPostedAll = true;
      for (const gr of listGroups) {
        if (gr.id === id) continue;

        const groupsTemp = gr?.groups || [];
        const isExistPending = groupsTemp.some(
          (gr) => gr.status === "pending" && !set.has(gr.id_href),
        );
        if (isExistPending) {
          id = gr.id;
          isPostedAll = false;
          break;
        }
      }

      if (isPostedAll) {
        //reset all -> return null
        logActions("Reset all groups need post to pending");
        return null;
      }

      return id;
    }

    return id;
  } catch (error) {
    throw new Error("Error getRandomIndexGroupChecked: " + error);
  }
}

async function getIsStopTaskInStorage() {
  return (await DB_getValue(KEY_STOP_TASK)) || false;
}

/**
 *
 * @param {boolean} b
 */
async function setIsStopTaskInStorage(b = false) {
  DB_setValue(KEY_STOP_TASK, b);
}

/**
 *
 * @param {typeof initialTimeDelay} timeDelay
 */
function setTimeDelayInStorage(timeDelay = initialTimeDelay) {
  DB_setValue(KEY_TIME_DELAY, timeDelay);
}

/**
 *
 * @returns {Promise<typeof initialTimeDelay>} The time delay settings from storage, or the initial default if not set
 */
async function getTimeDelayInStorage() {
  const timeDelay = await DB_getValue(KEY_TIME_DELAY);
  if (!timeDelay) {
    setTimeDelayInStorage();
    return initialTimeDelay;
  }
  return timeDelay;
}

/**
 *
 * This setting determines whether the script will attempt to open new tabs in the background to avoid stealing focus from the user
 * when posting tasks. If true, new tabs will be opened as inactive; if false, they will be opened as active.
 * This is a workaround for the issue where opening new tabs for posting tasks can steal focus away from the user, which can be disruptive.
 *
 * @returns {Promise<boolean>} The setting for whether to fix the steal focus issue, defaulting to false if not set
 */
async function getIsStealFocusInStorage() {
  return (await DB_getValue(KEY_IS_FIX_STEAL_FOCUS)) || false;
}

/**
 *
 * @returns {Promise<boolean>} The setting for whether to fix the steal all focus issue, defaulting to false if not set
 */
async function getIsFixStealAllFocusInStorage() {
  return (await DB_getValue(KEY_IS_FIX_STEAL_ALL_FOCUS)) || false;
}

/**
 *
 * @returns {Promise<boolean>} The setting for whether to fix the steal all focus issue, defaulting to false if not set
 */
async function getIsSpammedInStorage() {
  return (await DB_getValue(KEY_IS_SPAMMED)) || false;
}

/**
 *
 * @param {boolean} b
 */
async function setIsSpammedInStorage(b = false) {
  DB_setValue(KEY_IS_SPAMMED, b);
}

async function getMaxGroupPerTimeInStorage() {
  return (
    (await DB_getValue(KEY_MAX_GROUP_PER_TIME)) || MAX_GROUP_PER_TIME_INITIAL
  );
}

async function setMaxGroupPerTimeInStorage(maxGroupPerTime) {
  DB_setValue(KEY_MAX_GROUP_PER_TIME, maxGroupPerTime);
}

/**
 *
 * @param {{queue: Array<{name: string, data: any}>, time: number}} queue
 */
function setQueueInStorage(queue) {
  DB_setValue(KEY_QUEUE, queue);
}

/**
 *
 * @returns {Promise<{queue: Queue, time: number}>} The queue of tasks or actions stored in storage, defaulting to an empty array if not set
 */
async function getQueueInStorage() {
  const queueObject = await DB_getValue(KEY_QUEUE);
  const queue = new Queue(queueObject?.queue || []);

  return { queue, time: queueObject?.time || now() - 10000 };
}

/**
 *
 * @param {string} strictlyMatchTitleGroup string of keywords to strictly match title group (split by ',')
 */
function setStrictlyMatchTitleGroupInStorage(strictlyMatchTitleGroup = "") {
  DB_setValue(KEY_TITLE_STRICTLY_MATCH_GROUP, strictlyMatchTitleGroup);
}

/**
 *
 * @returns {Promise<string>} array of string keywords to strictly match title group
 */
async function getStrictlyMatchTitleGroupInStorage() {
  const data = await DB_getValue(KEY_TITLE_STRICTLY_MATCH_GROUP);
  if (data && Array.isArray(data)) {
    const strData = data.join(", ");
    setStrictlyMatchTitleGroupInStorage(strData);
    return strData.trim();
  }
  if (data === undefined || data === null) {
    const initData = `Cho thuê trọ, Tìm phòng trọ, Cho thuê phòng trọ, CCMN, Phòng trọ, Tìm phòng trọ giá rẻ`;
    setStrictlyMatchTitleGroupInStorage(initData);
    return initData.trim();
  }
  return data.trim();
}

async function getLanguageInStorage() {
  const lang = await DB_getValue(KEY_LANGUAGE);
  if (lang === undefined || lang === null) {
    DB_setValue(KEY_LANGUAGE, "en");
    return "en";
  }
  return lang;
}

async function getIsDeveloperModeInStorage() {
  return (await DB_getValue(KEY_IS_DEVELOPER_MODE)) || false;
}

/**
 * @returns {Promise<Array<{msgObject: {vi: string, en: string}|string, time: number}>>}  The history logs stored in storage, defaulting to an empty array if not set
 */
async function getHistoryLogsInStorage() {
  return (await DB_getValue(KEY_HISTORY_LOGS)) || [];
}

/**
 * @returns {Promise<boolean>} The setting for whether to shuffle groups need post, defaulting to false if not set
 */
async function getIsShuffleGroupNeedPost() {
  return (await DB_getValue(KEY_IS_SHUFFLE_GROUPS_NEED_POST)) || false;
}

/**
 *
 * @returns {Promise<boolean>} The setting for whether to change groups checked flag, defaulting to false if not set
 */
async function getChangeGroupsCheckedFlag() {
  return (await DB_getValue(KEY_CHANGE_GROUPS_CHECKED_FLAG)) || false;
}

/**
 *
 * @param {boolean} b The setting for whether to change groups checked flag
 */
async function setChangeGroupsCheckedFlag(b = false) {
  DB_setValue(KEY_CHANGE_GROUPS_CHECKED_FLAG, b);
}

/**
 * @returns {Promise<Array<string>>} The indexs of group checked stored in storage, defaulting to an empty array if not set
 */
async function getIndexsGroupChecked() {
  return (await DB_getValue(KEY_INDEXS_GROUP_CHECKED)) || [];
}

/**
 * @param {Array<string>} indexs The indexs of group checked
 */
async function setIndexsGroupChecked(indexs = []) {
  DB_setValue(KEY_INDEXS_GROUP_CHECKED, indexs);
}

/**
 *
 * @param {boolean} b
 */
async function setIsTestInStorage(b = false) {
  DB_setValue(KEY_IS_TEST, b);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in test mode, defaulting to false if not set
 */
async function getIsTestInStorage() {
  return (await DB_getValue(KEY_IS_TEST)) || false;
}

/**
 *
 * @param {{vi: string, en: string}} msg log to add to history
 */
async function addHistoryLog(msg = {}) {
  if (!msg) {
    return null;
  }

  try {
    const historyLogs = await getHistoryLogsInStorage();
    const time = now();
    historyLogs.push({ msg, time });
    if (historyLogs.length > 150) {
      historyLogs.shift();
    }
    await DB_setValue(KEY_HISTORY_LOGS, historyLogs);
    return { msg, time };
  } catch (error) {
    logError(`Error addHistoryLog`, error);
  }
}

async function clearHistoryLogs() {
  try {
    await DB_setValue(KEY_HISTORY_LOGS, []);
  } catch (error) {
    logError(`Error clearHistoryLogs`, error);
  }
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in premium mode, defaulting to false if not set
 */
async function getPremiumInStorage() {
  try {
    const isPremium = await DB_getValue(KEY_IS_PREMIUM);
    return isPremium;
  } catch (error) {
    logError(`Error getPremiumInStorage`, error);
    return false;
  }
}

let theme = "light";

async function initialTheme() {
  try {
    const isDark = (await DB_getValue(KEY_IS_DARK_THEME)) || false;
    if (isDark) {
      theme = "dark";
    } else {
      theme = "light";
    }
  } catch (error) {
    logError("Error initialTheme: " + error);
  }
}

async function setTheme(isDark) {
  try {
    theme = isDark ? "dark" : "light";
    await DB_setValue(KEY_IS_DARK_THEME, isDark);
  } catch (error) {
    logError("Error setTheme: " + error);
  }
}

function getTheme() {
  return theme;
}

/**
 *
 * @returns {Promise<number>} The count of reset groups, defaulting to 0 if not set
 */
async function getCountResetGroupInStorage() {
  return (await DB_getValue(KEY_COUNT_RESET_GROUPS)) || 0;
}

/**
 *
 * @param {number} count The count of reset groups
 */
async function setCountResetGroupInStorage(count) {
  DB_setValue(KEY_COUNT_RESET_GROUPS, count);
}

/**
 * @returns {Promise<number>} The current count of post length, defaulting to 0 if not set
 */
async function getCurrentCountPostLength() {
  return (await DB_getValue(KEY_CURRENT_COUNT_POSTED)) || 0;
}

/**
 * @param {number} count The current count of post length
 */
async function setCurrentCountPostLength(count) {
  DB_setValue(KEY_CURRENT_COUNT_POSTED, count);
}

/**
 * @param {number} count The current count of post
 */
async function setCountBatchPost(count) {
  DB_setValue(KEY_COUNT_BATCH_POST, count);
}

/**
 * @returns {Promise<number>} The current count of post, defaulting to 1 if not set
 */
async function getCountBatchPost() {
  return (await DB_getValue(KEY_COUNT_BATCH_POST)) || 1;
}

/**
 * @returns {Promise<Object>} The object task, defaulting to an empty object if not set
 */
async function getObjectTaskInStorage() {
  return (await DB_getValue(KEY_POST)) || {};
}

/**
 * @param {Object} objectTask The object task
 */
async function setObjectTaskInStorage(objectTask) {
  DB_setValue(KEY_POST, objectTask);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random batch post mode, defaulting to false if not set
 */
async function getIsRandomBatchPost() {
  return (await DB_getValue(KEY_IS_RANDOM_BATCH_POST)) || false;
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random time post mode, defaulting to false if not set
 */
async function getIsRandomTimePost() {
  return (await DB_getValue(KEY_IS_RANDOM_TIME_POST)) || false;
}

/**
 * @returns {Promise<number>} The last time post, defaulting to 0 if not set
 */
async function getLastTimePostInStorage() {
  return (await DB_getValue(KEY_LAST_TIME_POST)) || 0;
}

/**
 * @param {number} lastTimePost The last time post
 */
async function setLastTimePostInStorage(lastTimePost) {
  DB_setValue(KEY_LAST_TIME_POST, lastTimePost);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random scheduler time mode, defaulting to false if not set
 */
async function getIsShuffleSchedulerTimeInStorage() {
  return (await DB_getValue(KEY_IS_SHUFFLE_SCHEDULER_TIME)) || false;
}

/**
 * @param {boolean} b The setting for whether the extension is in random scheduler time mode
 */
async function setIsShuffleSchedulerTimeInStorage(b = false) {
  DB_setValue(KEY_IS_SHUFFLE_SCHEDULER_TIME, b);
}

/**
 * @param {boolean} b The setting for whether the extension is in random scheduler time mode
 */
async function setIsInteractBeforePostInStorage(b = false) {
  DB_setValue(KEY_IS_INTERACT_BEFORE_POST, b);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random scheduler time mode, defaulting to false if not set
 */
async function getIsInteractBeforePostInStorage() {
  return (await DB_getValue(KEY_IS_INTERACT_BEFORE_POST)) || false;
}

/**
 * @param {boolean} isDecided The setting for whether the extension is in random scheduler time mode
 */
async function setDecidedInteractBeforePostInStorage(isDecided) {
  DB_setValue(KEY_DECIDED_INTERACT_BEFORE_POST, isDecided);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random scheduler time mode, defaulting to false if not set
 */
async function getDecidedInteractBeforePostInStorage() {
  return (await DB_getValue(KEY_DECIDED_INTERACT_BEFORE_POST)) || false;
}

export {
  setProgress,
  getProgress,
  getRandomIndexGroupChecked,
  getCurrentIndexGroupPost,
  setCurrentIndexGroupPost,
  getIsStopTaskInStorage,
  setTimeDelayInStorage,
  getTimeDelayInStorage,
  getIsStealFocusInStorage,
  setQueueInStorage,
  getQueueInStorage,
  setStrictlyMatchTitleGroupInStorage,
  getStrictlyMatchTitleGroupInStorage,
  getLanguageInStorage,
  getIsFixStealAllFocusInStorage,
  getIsDeveloperModeInStorage,
  addHistoryLog,
  getHistoryLogsInStorage,
  clearHistoryLogs,
  getIsShuffleGroupNeedPost,
  getPremiumInStorage,
  initialTheme,
  getTheme,
  setTheme,
  getChangeGroupsCheckedFlag,
  setChangeGroupsCheckedFlag,
  setIndexsGroupChecked,
  getIndexsGroupChecked,
  setIsTestInStorage,
  getIsTestInStorage,
  setIsStopTaskInStorage,
  getIsSpammedInStorage,
  setIsSpammedInStorage,
  getMaxGroupPerTimeInStorage,
  setMaxGroupPerTimeInStorage,
  getCountResetGroupInStorage,
  setCountResetGroupInStorage,
  getCurrentCountPostLength,
  setCurrentCountPostLength,
  getObjectTaskInStorage,
  setObjectTaskInStorage,
  getIsRandomBatchPost,
  getIsRandomTimePost,
  setCountBatchPost,
  getCountBatchPost,
  getLastTimePostInStorage,
  setLastTimePostInStorage,
  getIsShuffleSchedulerTimeInStorage,
  setIsShuffleSchedulerTimeInStorage,
  setIsInteractBeforePostInStorage,
  getIsInteractBeforePostInStorage,
  getDecidedInteractBeforePostInStorage,
  setDecidedInteractBeforePostInStorage,
};
