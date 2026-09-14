import { KEY_FIRST_TIME_USE } from "../contants/constant-extention.js";
import {
  initialTimeDelay,
  KEY_CHANGE_GROUPS_CHECKED_FLAG,
  KEY_COUNT_BATCH_POST,
  KEY_COUNT_RESET_GROUPS,
  KEY_CURRENT_COUNT_POSTED,
  KEY_HISTORY_LOGS,
  KEY_INTERACT_BEFORE_POST,
  KEY_IS_DEVELOPER_MODE,
  KEY_IS_IN_PROGRESS,
  KEY_IS_SCROLL_DETECT_LIST_GROUP,
  KEY_IS_SHUFFLE_SCHEDULER_TIME,
  KEY_IS_TEST,
  KEY_LANGUAGE,
  KEY_NEXT_TIME_POST_WHEN_SPAMMED,
  KEY_POST,
  KEY_QUEUE,
  KEY_TIME_DELAY,
  KEY_TIME_DELAY_FOR_SCHEDULER,
} from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import Queue from "../utils/queue.js";
import { logError, now } from "../utils/utils.js";

async function setProgress(b) {
  try {
    await DB_setValue(KEY_IS_IN_PROGRESS, b);
  } catch (error) {
    logError("Error at setProgress in storage-service: " + error);
  }
}

async function getProgress() {
  return (await DB_getValue(KEY_IS_IN_PROGRESS)) || false;
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

async function getLanguageInStorage() {
  const lang = await DB_getValue(KEY_LANGUAGE);
  if (lang === undefined || lang === null) {
    DB_setValue(KEY_LANGUAGE, "en");
    return "en";
  }
  return lang;
}

async function getIsDeveloperModeInStorage() {
  return await DB_getValue(KEY_IS_DEVELOPER_MODE, false);
}

/**
 *
 * @param {boolean} b
 */
async function setIsDeveloperModeInStorage(b = false) {
  await DB_setValue(KEY_IS_DEVELOPER_MODE, b);
}

/**
 * @returns {Promise<Array<{msgObject: {vi: string, en: string}|string, time: number}>>}  The history logs stored in storage, defaulting to an empty array if not set
 */
async function getHistoryLogsInStorage() {
  return (await DB_getValue(KEY_HISTORY_LOGS)) || [];
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
  await DB_setValue(KEY_CHANGE_GROUPS_CHECKED_FLAG, b);
}

/**
 *
 * @param {boolean} b
 */
async function setIsTestInStorage(b = false) {
  await DB_setValue(KEY_IS_TEST, b);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in test mode, defaulting to false if not set
 */
async function getIsTestInStorage() {
  return (await DB_getValue(KEY_IS_TEST)) || false;
}

/**
 *
 * @param {{vi: string, en: string, type?: "info" | "success" | "error" | "warning"}} msg log to add to history
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
  await DB_setValue(KEY_COUNT_RESET_GROUPS, count);
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
  await DB_setValue(KEY_CURRENT_COUNT_POSTED, count);
}

/**
 * @param {number} count The current count of post
 */
async function setCountBatchPost(count) {
  await DB_setValue(KEY_COUNT_BATCH_POST, count);
}

/**
 * @returns {Promise<number>} The current count of post, defaulting to 1 if not set
 */
async function getCountBatchPost() {
  try {
    const count = await DB_getValue(KEY_COUNT_BATCH_POST);
    return Number(count || 0);
  } catch (err) {
    logError("Error getCountBatchPost", err);
    return 0;
  }
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
  await DB_setValue(KEY_POST, objectTask);
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
  await DB_setValue(KEY_IS_SHUFFLE_SCHEDULER_TIME, b);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random scheduler time mode, defaulting to false if not set
 */
async function getIsFirstTimeUseToolInStorage() {
  return await DB_getValue(KEY_FIRST_TIME_USE);
}

/**
 * @param {boolean} isDecided The setting for whether the extension is in random scheduler time mode
 */
async function setIsFirstTimeUseToolInStorage(isDecided) {
  await DB_setValue(KEY_FIRST_TIME_USE, isDecided);
}

/**
 * @param {boolean} isDecided The setting for whether the extension is in random scheduler time mode
 */
async function setDecidedInteractBeforePostInStorage(isDecided) {
  await DB_setValue(KEY_INTERACT_BEFORE_POST.DECIDED_INTERACT, isDecided);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random scheduler time mode, defaulting to false if not set
 */
async function getDecidedInteractBeforePostInStorage() {
  return (
    (await DB_getValue(KEY_INTERACT_BEFORE_POST.DECIDED_INTERACT)) || false
  );
}

/**
 * @returns {Promise<number>} The time delay for scheduler
 */
async function getTimeDelayForScheduler() {
  return await DB_getValue(KEY_TIME_DELAY_FOR_SCHEDULER, 0);
}

/**
 * @param {number} timeDelay The time delay for scheduler
 */
async function setTimeDelayForScheduler(timeDelay) {
  await DB_setValue(KEY_TIME_DELAY_FOR_SCHEDULER, timeDelay);
}

/**
 * @param {boolean} b The setting for whether the extension is in scroll detect list group mode
 */
async function setIsScrollDetectListGroupInStorage(b) {
  await DB_setValue(KEY_IS_SCROLL_DETECT_LIST_GROUP, b);
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in scroll detect list group mode, defaulting to false if not set
 */
async function getIsScrollDetectListGroupInStorage() {
  return (await DB_getValue(KEY_IS_SCROLL_DETECT_LIST_GROUP)) || false;
}

async function getNextTimePostWhenSpammed() {
  let nextTime = await DB_getValue(KEY_NEXT_TIME_POST_WHEN_SPAMMED);
  if (!nextTime) {
    nextTime = new Date().getTime() + 1000 * 60 * 60 * 24 * 2;
    await setNextTimePostWhenSpammed(nextTime);
  }
  return nextTime;
}

async function setNextTimePostWhenSpammed(time) {
  await DB_setValue(KEY_NEXT_TIME_POST_WHEN_SPAMMED, time);
}

export {
  addHistoryLog,
  clearHistoryLogs,
  getChangeGroupsCheckedFlag,
  getCountBatchPost,
  getCountResetGroupInStorage,
  getCurrentCountPostLength,
  getDecidedInteractBeforePostInStorage,
  getHistoryLogsInStorage,
  getIsDeveloperModeInStorage,
  getIsFirstTimeUseToolInStorage,
  getIsScrollDetectListGroupInStorage,
  getIsShuffleSchedulerTimeInStorage,
  getIsTestInStorage,
  getLanguageInStorage,
  getNextTimePostWhenSpammed,
  getObjectTaskInStorage,
  getProgress,
  getQueueInStorage,
  getTimeDelayForScheduler,
  getTimeDelayInStorage,
  setChangeGroupsCheckedFlag,
  setCountBatchPost,
  setCountResetGroupInStorage,
  setCurrentCountPostLength,
  setDecidedInteractBeforePostInStorage,
  setIsDeveloperModeInStorage,
  setIsFirstTimeUseToolInStorage,
  setIsScrollDetectListGroupInStorage,
  setIsShuffleSchedulerTimeInStorage,
  setIsTestInStorage,
  setNextTimePostWhenSpammed,
  setObjectTaskInStorage,
  setProgress,
  setQueueInStorage,
  setTimeDelayForScheduler,
  setTimeDelayInStorage,
};
