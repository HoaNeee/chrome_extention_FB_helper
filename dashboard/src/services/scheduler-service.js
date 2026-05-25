import { KEY_SCHEDULER_ALARMS } from "../../../contants/constant-extention.js";
import {
  KEY_IS_RANDOM_TIME_POST,
  KEY_IS_SPAMMED,
  KEY_IS_SPECIAL_FRAME_HOURS,
  KEY_SCHEDULER,
  KEY_SPECIAL_FRAME_HOURS,
} from "../../../contants/contants.js";
import { now, logActions, logError, random } from "../../../utils/utils.js";
import { addLog } from "../draw_element/panel-log.js";
import {
  createSchedulerDailyHours,
  getNextTimePost,
  getNextTimePostWhenSpammed,
} from "../helpers/scheduler.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";

async function createSchedulerAuto(forceTime = 0) {
  try {
    const scheduler = await getSchedulerService();
    const isScheduler = scheduler?.isScheduler || false;
    const isRandomTimePost =
      (await DB_getValue(KEY_IS_RANDOM_TIME_POST)) || false;
    const randomMinutes = isRandomTimePost ? random(-2, 2) * 1000 * 60 : 0;
    if (isScheduler) {
      let nextTime = 0;
      if (forceTime) {
        nextTime = forceTime;
      } else {
        const isSpammed = await DB_getValue(KEY_IS_SPAMMED);
        if (isSpammed) {
          nextTime = await getNextTimePostWhenSpammed();
        } else {
          nextTime = await getNextTimePost();
        }
      }
      nextTime = nextTime + randomMinutes;
      chrome.alarms.create(KEY_SCHEDULER_ALARMS, {
        when: nextTime,
      });
      logActions(
        "created scheduler auto, next time: " +
          new Date(nextTime).toLocaleString(),
      );
    }
  } catch (error) {
    logError("Error createSchedulerAuto:", error);
    addLog({
      vi: "Lỗi khi tạo bộ lập lịch tự động",
      en: "Error create scheduler auto",
    });
  }
}

async function clearSchedulerAuto() {
  try {
    logActions("clear scheduler auto");
    chrome.alarms.clear(KEY_SCHEDULER_ALARMS);
  } catch (error) {
    logError("Error clearSchedulerAuto:", error);
  }
}

/**
 * Get alarm scheduler
 * @returns {Promise<Object | null>}
 */
async function getAlarmScheduler() {
  try {
    const alarms = await chrome.alarms.get(KEY_SCHEDULER_ALARMS);
    return alarms || null;
  } catch (error) {
    logError("Error getAlarms:", error);
    return null;
  }
}

const initScheduler = {
  type: "daily-hours", //custom-every-hours, custom-every-minutes, frame-hours
  frameHours: [],
  schedulerMinutes: [],
  schedulerHours: [],
  dailyHours: createSchedulerDailyHours(),
  isScheduler: false,
  valueMinutes: 5,
  valueHours: 1,
  time: now(),
};

/**
 *
 * @param {typeof initScheduler} scheduler
 */
async function setSchedulerService(scheduler = initScheduler) {
  const {
    dailyHours,
    frameHours,
    schedulerMinutes,
    schedulerHours,
    type,
    isScheduler,
    valueMinutes,
    valueHours,
    time,
  } = scheduler;

  await DB_setValue(KEY_SCHEDULER, {
    frameHours,
    schedulerMinutes,
    schedulerHours,
    dailyHours,
    type,
    isScheduler,
    valueMinutes,
    valueHours,
    time,
  });
}

/**
 *
 * @returns {Promise<typeof initScheduler>}
 */
async function getSchedulerService() {
  const scheduler = await DB_getValue(KEY_SCHEDULER);
  if (!scheduler) {
    setSchedulerService(initScheduler);
    return initScheduler;
  }
  return scheduler;
}

let timeoutId = null;

/**
 *  @description This function clear scheduler auto and create scheduler auto again,
 * must user is not spammed and not in progress
 * if user is spammed, set next time post when spammed
 * else set next time post
 */
async function clearAndCreateSchedulerAlarm() {
  try {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // const isProgress = (await getProgress()) || false;
    // if (isProgress) {
    //   logActions("is progress, skip create scheduler auto");
    //   addLog({
    //     vi: "Tiện ích đang trong quá trình xử lý, bỏ qua tạo bộ lập lịch tự động",
    //     en: "Tool is processing, skip create scheduler auto",
    //   });
    //   return;
    // }

    clearSchedulerAuto();
    const isSpammed = await DB_getValue(KEY_IS_SPAMMED);
    const timeSpammed = await getNextTimePostWhenSpammed();
    const time = await getNextTimePost();

    timeoutId = setTimeout(() => {
      createSchedulerAuto(isSpammed ? timeSpammed : time);
    }, 2000);
  } catch (error) {
    logError("Error clearAndCreateSchedulerAlarm:", error);
  }
}

/**
 * Get is scheduler
 * @returns {Promise<boolean>}
 */
async function getIsScheduler() {
  const scheduler = await getSchedulerService();
  return scheduler.isScheduler || false;
}

/**
 *
 * @param {Array<{fromTime: number, toTime: number, maxGroup: number, checked: boolean, id: string}>} data
 */
async function setSpecialFrameHoursService(data) {
  try {
    DB_setValue(KEY_SPECIAL_FRAME_HOURS, data);
  } catch (error) {
    logError("Error setSpecialFrameHoursService:", error);
  }
}

/**
 *
 * @returns {Promise<Array<{fromTime: number, toTime: number, maxGroup: number, checked: boolean, id: string, dates: Array<number>}>>}
 */
async function getSpecialFrameHoursService() {
  try {
    const framesHours = (await DB_getValue(KEY_SPECIAL_FRAME_HOURS)) || [];
    return framesHours;
  } catch (error) {
    logError("Error getSpecialFrameHoursService:", error);
    return [];
  }
}

/**
 *
 * @param {Object} data
 * @param {string} data.fromTime - time of day
 * @param {string} data.toTime - time of day
 * @param {string} data.maxGroup - max group to post
 * @param {Array<number>} data.dates - array of day of week (0-6, 0 is sunday, 6 is saturday)
 * @param {string} data.id - id of frame
 */
async function addSpecialFrameHoursService(data) {
  try {
    const { fromTime, toTime, maxGroup, dates, id } = data;

    if (!fromTime.trim() || !toTime.trim() || !maxGroup.trim()) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }

    const toTimeNum = Number(toTime);
    const fromTimeNum = Number(fromTime);
    const maxGroupNum = Number(maxGroup);

    if (
      fromTime > 23 ||
      toTime > 23 ||
      fromTime < 0 ||
      toTime < 0 ||
      maxGroup < 0
    ) {
      throw new Error("Không hợp lệ");
    }

    if (toTimeNum < fromTimeNum) {
      throw new Error(
        "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu",
      );
    }

    const payload = {
      fromTime: fromTimeNum,
      toTime: toTimeNum,
      maxGroup: maxGroupNum,
      id,
      dates,
    };

    const framesHours = await getSpecialFrameHoursService();

    framesHours.push({
      ...payload,
      checked: true,
    });
    await setSpecialFrameHoursService(framesHours);
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} data
 * @param {string|number} data.fromTime - time of day
 * @param {string|number} data.toTime - time of day
 * @param {string|number} data.maxGroup - max group to post
 * @param {boolean} data.checked - is checked
 * @param {Array<number>} data.dates - array of day of week (0-6, 0 is sunday, 6 is saturday)
 * @param {string} data.id - id of frame
 */
async function updateSpecialFrameHoursService(data) {
  try {
    const { fromTime, toTime, maxGroup, checked, id, dates } = data;

    if (
      typeof fromTime === "string" &&
      typeof toTime === "string" &&
      typeof maxGroup === "string"
    ) {
      if (!fromTime.trim() || !toTime.trim() || !maxGroup.trim()) {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }
    }

    const toTimeNum = Number(toTime);
    const fromTimeNum = Number(fromTime);
    const maxGroupNum = Number(maxGroup);

    if (
      fromTime > 23 ||
      toTime > 23 ||
      fromTime < 0 ||
      toTime < 0 ||
      maxGroup < 0
    ) {
      throw new Error("Không hợp lệ");
    }

    if (toTimeNum < fromTimeNum) {
      throw new Error(
        "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu",
      );
    }

    const payload = {
      fromTime: fromTimeNum,
      toTime: toTimeNum,
      maxGroup: maxGroupNum,
      checked,
      id,
      dates,
    };

    const framesHours = await getSpecialFrameHoursService();

    const idx = framesHours.findIndex((fr) => fr.id === id);
    if (idx === -1) {
      throw new Error("Không tìm thấy khung thời gian");
    }
    framesHours[idx] = payload;
    await setSpecialFrameHoursService(framesHours);
  } catch (error) {
    throw error;
  }
}

/**
 * @param {string} id
 */
async function deleteSpecialFrameHoursService(id) {
  try {
    const framesHours = await getSpecialFrameHoursService();
    const newFramesHours = framesHours.filter((fr) => fr.id !== id);
    await setSpecialFrameHoursService(newFramesHours);
  } catch (error) {
    throw error;
  }
}

/**
 * Get is in special frame hours
 */
async function getObjectIsInSpecialFrameHours() {
  let framesHours = await getSpecialFrameHoursService();
  const date = new Date();
  const currentHour = date.getHours();
  const day = date.getDay();

  framesHours.sort((a, b) => b.maxGroup - a.maxGroup);

  const found = framesHours.find((fr) => {
    return (
      fr.checked &&
      fr.fromTime <= currentHour &&
      fr.toTime >= currentHour &&
      fr.dates.includes(day)
    );
  });

  if (found) {
    return found;
  }
  return null;
}

/**
 * Get is special frame hours from store
 * @returns {Promise<boolean>}
 */
async function getIsSpecialFrameHoursInStore() {
  try {
    const isSpecialFrameHours = await DB_getValue(KEY_IS_SPECIAL_FRAME_HOURS);
    return isSpecialFrameHours;
  } catch (error) {
    logError(`Error getIsSpecialFrameHours`, error);
    return false;
  }
}

export {
  createSchedulerAuto,
  clearSchedulerAuto,
  setSchedulerService,
  getSchedulerService,
  getAlarmScheduler,
  clearAndCreateSchedulerAlarm,
  getIsScheduler,
  addSpecialFrameHoursService,
  getSpecialFrameHoursService,
  setSpecialFrameHoursService,
  updateSpecialFrameHoursService,
  deleteSpecialFrameHoursService,
  getObjectIsInSpecialFrameHours,
  getIsSpecialFrameHoursInStore,
};
