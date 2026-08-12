import {
  KEY_SAVED_TEMP,
  KEY_SCHEDULER_ALARMS,
} from "../contants/constant-extention.js";
import { KEY_SCHEDULER, SCHEDULER_TYPE } from "../contants/contants.js";
import { addLog } from "../dashboard/src/draw_element/panel-log.js";
import {
  createSchedulerDailyHours,
  getCorrectNextTime,
  getNextTimePost,
  getNextTimePostWhenSpammed,
} from "../helpers/scheduler.js";
import { logActions, logError, random } from "../utils/utils.js";

import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { get, patch } from "../utils/request.js";
import { getDeviceId } from "./device-service.js";
import {
  getIsRandomTimePostData,
  getIsSchedulerData,
  getIsSpammedData,
  setIsSpammedData,
} from "./setting-service.js";
import { getIsUseLocalStorage } from "./storage-global-service.js";
import {
  getTimeDelayForScheduler,
  setTimeDelayForScheduler,
} from "./storage-service.js";

/**
 *
 * @typedef {Object} ScheduleTime
 * @property {number} h - hour
 * @property {number} m - minute
 */

/**
 * @typedef {Object} Scheduler
 * @property {string} scheduler_type - type of scheduler
 * @property {boolean} is_scheduler - is scheduler
 * @property {ScheduleDetail} scheduler_detail - just use for local storage or temp
 */

/**
 * @typedef {Object} ScheduleDetail
 * @property {number} scheduler_time_value
 * @property {Array<ScheduleTime>} scheduler_time_list
 */

let schedulerSetting = null;

async function createSchedulerAuto(forceTime = 0) {
  try {
    const isScheduler = await getIsSchedulerData();
    const isRandomTimePost = await getIsRandomTimePostData();
    const randomMinutes = isRandomTimePost ? random(-2, 2) * 1000 * 60 : 0;

    if (isScheduler) {
      let nextTime = 0;
      if (forceTime) {
        nextTime = forceTime;
      } else {
        nextTime = await getCorrectNextTime();
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

    const isScheduler = await getIsSchedulerData();
    if (!isScheduler) {
      clearSchedulerAuto();
      return;
    }

    clearSchedulerAuto();
    let isSpammed = await getIsSpammedData();
    const timeSpammed = await getNextTimePostWhenSpammed();
    const time = await getNextTimePost();

    const nowMs = Date.now();

    if (isSpammed && timeSpammed < nowMs) {
      await setIsSpammedData(false);
      isSpammed = false;
    }

    const timeDelay = await getTimeDelayForScheduler();

    timeoutId = setTimeout(async () => {
      await Promise.all([
        createSchedulerAuto(isSpammed ? timeSpammed : time + timeDelay),
        setTimeDelayForScheduler(0),
      ]);
    }, 2000);
  } catch (error) {
    logError("Error clearAndCreateSchedulerAlarm:", error);
    addLog({
      vi: `Lỗi khi tạo bộ lập lịch tự động, ${error}`,
      en: `Error create scheduler auto, ${error}`,
    });
  }
}

const initScheduler = {
  scheduler_type: SCHEDULER_TYPE.DAILY_HOURS,
  is_scheduler: false,
};

/**
 *
 * @returns {Promise<Scheduler>}
 */
async function getSchedulerTemp() {
  try {
    return await DB_getValue(KEY_SAVED_TEMP.SCHEDULER);
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {Scheduler} scheduler
 */
async function setSchedulerTemp(scheduler) {
  try {
    let data = await getSchedulerTemp();
    data = {
      ...scheduler,
    };
    await DB_setValue(KEY_SAVED_TEMP.SCHEDULER, data);
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Scheduler} schduler
 */
async function setSchedulerInStorage(schduler) {
  try {
    await DB_setValue(KEY_SCHEDULER, schduler);
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<Scheduler>}
 */
async function getSchedulerInStorage() {
  try {
    const scheduler = await DB_getValue(KEY_SCHEDULER);
    return scheduler;
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<Scheduler>}
 */
async function getSchedulerRequest() {
  try {
    const deviceId = await getDeviceId();

    const res = await get("/schedulers/" + deviceId);
    const data = res?.data;
    if (data) {
      return {
        scheduler_type: data.scheduler_type,
      };
    }
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<Scheduler>}
 */
async function getSchedulerService() {
  try {
    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const schduler = await getSchedulerInStorage();
      if (!schduler) {
        await setSchedulerInStorage(initScheduler);
        return initScheduler;
      }
      return schduler;
    }

    let schedulerSettingTemp = await getSchedulerTemp();

    if (schedulerSettingTemp) {
      return {
        scheduler_type: schedulerSettingTemp.scheduler_type,
        scheduler_detail: schedulerSettingTemp?.scheduler_detail,
      };
    }

    const deviceId = await getDeviceId();

    const res = await get("/schedulers/" + deviceId);
    const data = res?.data;
    if (data) {
      schedulerSettingTemp = {
        scheduler_type: data.scheduler_type,
      };
      await setSchedulerTemp(schedulerSettingTemp);
    }

    return schedulerSettingTemp;
  } catch (error) {
    throw error;
  }
}

/**
 * Set scheduler detail
 * @param {string} type - type of scheduler
 * @param {ScheduleDetail} detail
 */
async function setSchedulerDetail(type, detail) {
  try {
    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(type, detail);
      return;
    }

    const deviceId = await getDeviceId();

    const res = await patch("/schedulers/update/" + deviceId, {
      scheduler_type: type,
      scheduler_time_list: detail.scheduler_time_list,
      scheduler_time_value: detail.scheduler_time_value,
    });

    let schedulerSettingTemp = await getSchedulerTemp();
    if (schedulerSettingTemp) {
      schedulerSettingTemp.scheduler_detail = {
        scheduler_time_list: detail.scheduler_time_list,
        scheduler_time_value: detail.scheduler_time_value,
      };
    } else {
      schedulerSettingTemp = {
        scheduler_type: type,
        scheduler_detail: {
          scheduler_time_list: detail.scheduler_time_list,
          scheduler_time_value: detail.scheduler_time_value,
        },
      };
    }
    await setSchedulerTemp(schedulerSettingTemp);

    return res?.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get scheduler detail
 * @param {string} type - type of scheduler
 * @returns {Promise<ScheduleDetail | null>}
 */
async function getSchedulerDetail(type) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      let details = await DB_getValue(type);
      if (!details) {
        details = {
          scheduler_time_list: [],
          scheduler_time_value: 5,
        };
        if (type === SCHEDULER_TYPE.DAILY_HOURS) {
          details = {
            scheduler_time_list: createSchedulerDailyHours(),
            scheduler_time_value: null,
          };
        }

        await setSchedulerDetail(type, details);
        return details;
      }
      return details;
    }

    let schedulerSettingTemp = await getSchedulerTemp();
    if (schedulerSettingTemp && schedulerSettingTemp.scheduler_detail) {
      return schedulerSettingTemp.scheduler_detail;
    }

    const data = await getSchedulerDetailRequest(type);

    if (data && schedulerSettingTemp) {
      schedulerSettingTemp.scheduler_detail = {
        scheduler_time_list: data?.scheduler_time_list || [],
        scheduler_time_value: data?.scheduler_time_value || 5,
      };
      await setSchedulerTemp(schedulerSettingTemp);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get scheduler detail
 * @param {string} type - type of scheduler
 * @returns {Promise<ScheduleDetail | null>}
 */
async function getSchedulerDetailRequest(type) {
  try {
    const deviceId = await getDeviceId();
    const res = await get(`/schedulers/details/${type}/${deviceId}`);
    const data = res?.data;
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Remove scheduler time
 * @param {ScheduleTime} time - time of scheduler
 */
async function removeSchedulerTime(time) {
  try {
    const scheduler = await getSchedulerService();
    const type = scheduler?.scheduler_type;
    const details = await getSchedulerDetail(type);
    if (!details) {
      return false;
    }

    const timeList = details?.scheduler_time_list || [];
    const index = timeList.findIndex(
      (item) => item.h === time.h && item.m === time.m,
    );
    if (index !== -1) {
      timeList.splice(index, 1);
      details.scheduler_time_list = timeList;
      await setSchedulerDetail(type, details);

      const schedulerSettingTemp = await getSchedulerTemp();
      if (schedulerSettingTemp) {
        schedulerSettingTemp.scheduler_detail = details;
      }
      await setSchedulerTemp(schedulerSettingTemp);
    }

    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Change type scheduler
 * @param {string} type - type of scheduler
 * @returns {Promise<ScheduleDetail | null>}
 */
async function changeTypeScheduler(type) {
  try {
    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const scheduler = await getSchedulerService();
      scheduler.scheduler_type = type;
      await setSchedulerInStorage(scheduler);
      let details = await getSchedulerDetail(type);
      if (!details) {
        const initDetails = {
          scheduler_time_list: [],
          scheduler_time_value: 5,
        };
        await setSchedulerDetail(type, initDetails);
        details = initDetails;
      }
    }

    const deviceId = await getDeviceId();

    const res = await patch("/schedulers/change-type/" + deviceId, {
      scheduler_type: type,
    });

    const data = res?.data;

    const schedulerSettingTemp = await getSchedulerTemp();
    if (schedulerSettingTemp) {
      schedulerSettingTemp.scheduler_type = data.scheduler_type;
      if (data) {
        schedulerSettingTemp.scheduler_detail = {
          scheduler_time_list: data?.scheduler_time_list || [],
          scheduler_time_value: data?.scheduler_time_value || 5,
        };
      }
      await setSchedulerTemp(schedulerSettingTemp);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

async function initialSchedulerSetting() {
  try {
    const isUseLocalStorage = getIsUseLocalStorage();

    let scheduler = null;
    let detail = null;

    if (isUseLocalStorage) {
      scheduler = await getSchedulerInStorage();
      if (!scheduler) {
        scheduler = initScheduler;
        await setSchedulerInStorage(scheduler);
      }
      detail = await getSchedulerDetail(scheduler.scheduler_type);
    } else {
      scheduler = await getSchedulerRequest();
      detail = await getSchedulerDetailRequest(scheduler.scheduler_type);
    }

    if (!detail) {
      let initDetails = {
        scheduler_time_list: [],
        scheduler_time_value: 5,
      };
      if (scheduler.scheduler_type === SCHEDULER_TYPE.DAILY_HOURS) {
        initDetails = {
          scheduler_time_list: createSchedulerDailyHours(),
          scheduler_time_value: null,
        };
      }
      await setSchedulerDetail(scheduler.scheduler_type, initDetails);
      detail = initDetails;
    }

    let schedulerSettingTemp = await getSchedulerTemp();
    if (schedulerSettingTemp) {
      schedulerSettingTemp.scheduler_type = scheduler.scheduler_type;
      schedulerSettingTemp.scheduler_detail = detail;
    } else {
      schedulerSettingTemp = {
        scheduler_type: scheduler.scheduler_type,
        scheduler_detail: detail,
      };
    }
    await setSchedulerTemp(schedulerSettingTemp);
  } catch (error) {
    logError("Error at scheduler initial setting", error);
  }
}

export {
  changeTypeScheduler,
  clearAndCreateSchedulerAlarm,
  clearSchedulerAuto,
  createSchedulerAuto,
  getAlarmScheduler,
  getSchedulerDetail,
  getSchedulerService,
  initialSchedulerSetting,
  removeSchedulerTime,
  setSchedulerDetail,
  setSchedulerInStorage,
};
