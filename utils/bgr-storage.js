import {
  KEY_IS_IN_PROGRESS,
  KEY_POST,
  STATUS_TASK,
} from "../contants/contants.js";
import {
  getAllGroupPostedsInStorage,
  setAllGroupPostedsInStorage,
} from "../services/groupService.js";
import {
  getCurrentCountPostLength,
  setCurrentCountPostLength,
} from "../services/storage-service.js";
import { DB_getValue, DB_setValue } from "./api-helper.js";
import { logActions, logError } from "./utils.js";

async function BG_setValue(key, value) {
  await chrome.storage.local.set({ [key]: value });
}

async function BG_getValue(key) {
  const res = await chrome.storage.local.get(key);
  if (res[key] !== undefined && res[key] !== null) {
    return res[key];
  }
  return null;
}

async function BG_deleteValue(key) {
  await chrome.storage.local.remove(key);
}

async function setProgressTool(b) {
  await DB_setValue(KEY_IS_IN_PROGRESS, b);
}

async function getProgressTool() {
  return (await DB_getValue(KEY_IS_IN_PROGRESS)) || false;
}

async function BG_sendMessage(type, data) {
  try {
    await chrome.runtime.sendMessage({ type, data });
  } catch (error) {
    logError("Error at BG_sendMessage: ", error);
    throw error;
  }
}

/**
 *
 * @param {{task: {id_href: string, status: string}, time: number}} task
 */
async function saveTask(task) {
  await DB_setValue(KEY_POST, task);
}

/**
 * Set status for task
 * @param {'pending' | 'selecting' | 'posting' | 'done' | 'error'} status - Status of task can be 'posting', 'done', 'pending', 'selecting'
 */
async function setStatusTask(status) {
  try {
    const isProgress = await getProgressTool();
    if (!isProgress) {
      return;
    }
    logActions("Update status task: ", status);
    const taskObject = await getTask();

    if (!taskObject) {
      return;
    }

    const id_href = taskObject?.task?.id_href;
    taskObject.task.status = status;
    await DB_setValue(KEY_POST, taskObject);
    if (status === STATUS_TASK.DONE || status === STATUS_TASK.ERROR) {
      if (status === STATUS_TASK.DONE) {
        const currentLengthPost = await getCurrentCountPostLength();
        await setCurrentCountPostLength(currentLengthPost + 1);
      }
      const posteds = await getAllGroupPostedsInStorage();
      if (id_href && !posteds.includes(id_href)) {
        posteds.push(id_href);
        await setAllGroupPostedsInStorage(posteds);
      }
    }
  } catch (error) {
    logError("Error at setStatusTask: ", error);
  }
}

/**
 *
 * @returns {Promise<{task: {id_href: string, status: string}, time: number}>}
 */
async function getTask() {
  return await DB_getValue(KEY_POST);
}

export {
  BG_setValue,
  BG_getValue,
  BG_deleteValue,
  setProgressTool,
  getProgressTool,
  setStatusTask,
  getTask,
  saveTask,
  BG_sendMessage,
};
