import { DEFAULT_DEVICE_ID } from "../contants/constant-extention.js";
import {
  KEY_CURRENT_TASK,
  KEY_DEVICE,
  KEY_PRIORITY_TASK,
  KEY_TASK_NAME,
  KEY_USED_TO_LOGINED_THIS_DEVICE,
} from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { post } from "../utils/request.js";
import {
  genID,
  getTextWithLanguage,
  logError,
  random,
  randomNumberValue,
  randomRateBoolean,
} from "../utils/utils.js";
import { getIsSpammedData, getPriorityTaskData } from "./setting-service.js";

/**
 * @typedef {Object} Device
 * @property {string} id
 * @property {string} device_name
 * @property {string} device_type
 */

async function getDeviceId() {
  const device = await getDeviceFromStorage();
  if (device) {
    return device.id;
  }
  const newDevice = createNewDevice();
  await createNewDeviceAndForceSave(newDevice);
  return newDevice.id;
}

async function getUsedToLoginedThisDevice() {
  return (await DB_getValue(KEY_USED_TO_LOGINED_THIS_DEVICE)) || false;
}

async function setUsedToLoginedThisDevice(b) {
  await DB_setValue(KEY_USED_TO_LOGINED_THIS_DEVICE, b);
}

/**
 * Get device from storage
 * @returns {Promise<Device>}
 */
async function getDeviceFromStorage() {
  try {
    const device = await DB_getValue(KEY_DEVICE);
    return device || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Set device to storage
 * @param {Device} device
 */
async function setDeviceInStorage(device) {
  try {
    const existed = await getDeviceFromStorage();
    if (existed === undefined || existed === null) {
      await DB_setValue(KEY_DEVICE, device);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Create new device
 * @returns {Device}
 */
function createNewDevice() {
  return {
    id: genID(8),
    device_name: "New Device " + random(100, 999),
    device_type: getDeviceTypeByBrowser(),
  };
}

async function createNewDeviceAndForceSave() {
  const device = createNewDevice();
  await DB_setValue(KEY_DEVICE, device);
  return device;
}

async function createNewDeviceRequest(device) {
  try {
    const res = await post("/devices", device);
    return res?.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get device type by browser
 * @returns {string}
 */
function getDeviceTypeByBrowser() {
  if (typeof window !== "undefined") {
    const browser = window?.browser;
    if (browser?.coccoc) {
      return "Coc Coc";
    }
    if (browser?.chrome) {
      return "Chrome";
    } else if (browser?.firefox) {
      return "Firefox";
    } else if (browser?.safari) {
      return "Safari";
    } else if (browser?.edge) {
      return "Edge";
    }
  }
  return "Chrome";
}

/**
 *
 * @returns {Promise<Array<{name: string, priority: number}>>}
 */
async function getListTask() {
  const priorityTask = await getPriorityTaskData();
  const data = [];

  for (const k in priorityTask) {
    const name = getTaskName(k);
    data.push({
      name,
      priority: priorityTask[k],
    });
  }

  return data.sort((a, b) => a.priority - b.priority);
}

async function getListTaskActive() {
  const list = await getListTask();

  const listActive = await Promise.all(
    list.map(async (i) => {
      const active = await checkTaskActive(i.name);
      return {
        name: i.name,
        priority: i.priority,
        active,
      };
    }),
  ).then((list) => {
    return list.filter((i) => i.active);
  });

  return listActive;
}

async function getListTaskNameInactive() {
  const listActive = await getListTaskActive();
  const list = await getListTask();

  const listActiveName = listActive.map((i) => i.name);

  return list
    .filter((i) => !listActiveName.includes(i.name))
    .map((i) => i.name);
}

function getTaskName(key) {
  for (const k in KEY_TASK_NAME) {
    if (key.includes(KEY_TASK_NAME[k])) return KEY_TASK_NAME[k];
  }
  return KEY_TASK_NAME.UNKNOWN;
}

function getTaskLabelWithName(name) {
  switch (name) {
    case KEY_TASK_NAME.POST:
      return getTextWithLanguage({
        vi: "Đăng bài",
        en: "Post",
      });
    case KEY_TASK_NAME.COMMENT_WALK:
      return getTextWithLanguage({
        vi: "Bình luận dạo",
        en: "Comment walk",
      });
    default:
      return getTextWithLanguage({
        vi: "Không xác định",
        en: "Unknown",
      });
  }
}

async function getRandomTaskNameWithPriority() {
  try {
    const listActive = await getListTaskActive();

    const listPriority = listActive.map((i) => i.priority);
    const total = listPriority.reduce((acc, val) => acc + val, 0);
    const listReverseValue = listPriority.map((i) => total - i);

    async function deepGet(ignoreKeys = []) {
      let priority = -1;
      for await (const item of listActive) {
        if (ignoreKeys.includes(item.name)) continue;
        const rate = randomRateBoolean(total - item.priority, total);
        if (rate) {
          priority = item.priority;
          break;
        }
      }

      if (priority === -1) {
        const randomReverseValue = randomNumberValue(listReverseValue);
        priority = total - randomReverseValue;
      }

      const listSame = listActive.filter((i) => {
        return i.priority === priority && !ignoreKeys.includes(i.name);
      });

      if (listSame.length) {
        const randomIndex = random(0, listSame.length - 1);
        const taskName = listSame[randomIndex].name;
        const isActive = await checkTaskActive(taskName);
        if (isActive) return taskName;
        return await deepGet([...ignoreKeys, taskName]);
      }

      return KEY_TASK_NAME.UNKNOWN;
    }

    return await deepGet();
  } catch (err) {
    logError("getRandomTaskNameWithPriority error: ", err);
    return KEY_TASK_NAME.UNKNOWN;
  }
}

async function checkTaskActive(taskName) {
  switch (taskName) {
    case KEY_TASK_NAME.POST:
      return !(await getIsSpammedData());
    case KEY_TASK_NAME.COMMENT_WALK:
      return true;
    default:
      return false;
  }
}

async function getCurrentTaskName() {
  return await DB_getValue(KEY_CURRENT_TASK, KEY_TASK_NAME.UNKNOWN);
}

async function setCurrentTaskName(taskName) {
  await DB_setValue(KEY_CURRENT_TASK, taskName);
}

export {
  getDeviceId,
  getUsedToLoginedThisDevice,
  setUsedToLoginedThisDevice,
  getDeviceFromStorage,
  setDeviceInStorage,
  createNewDevice,
  createNewDeviceAndForceSave,
  getDeviceTypeByBrowser,
  createNewDeviceRequest,
  getListTask,
  getRandomTaskNameWithPriority,
  getListTaskNameInactive,
  getTaskLabelWithName,
  checkTaskActive,
  getCurrentTaskName,
  setCurrentTaskName,
};
