import {
  KEY_NEXT_TIME_POST_WHEN_SPAMMED,
  SCHEDULER_TYPE,
} from "../contants/contants.js";
import {
  logActions,
  logError,
  random,
  randomRateBoolean,
} from "../utils/utils.js";
import { addLog } from "../dashboard/src/draw_element/panel-log.js";
import {
  getSchedulerDetail,
  getSchedulerService,
} from "../services/scheduler-service.js";
import {
  getIsTestInStorage,
  getTimeDelayForScheduler,
} from "../services/storage-service.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import {
  getIsSchedulerData,
  getIsSpammedData,
} from "../services/setting-service.js";

async function createSchedulerMinutes(val) {
  // Implementation for creating scheduler minutes
  val = Number(val);
  if (val < 0) {
    val = 1;
  }
  const newScheduler = [];
  const now = new Date();
  const oneMinute = 60 * 1000;
  let nextTime = new Date(now.setHours(0, 0, 0, 0));
  let day = nextTime.getDate();
  const nextDay = day + 1;

  let i = 0;

  while (day < nextDay && i < 1000) {
    nextTime = new Date(nextTime.getTime() + (val + random(0, 3)) * oneMinute);
    day = nextTime.getDate();
    if (day < nextDay) {
      const h = nextTime.getHours();
      const m = nextTime.getMinutes();
      newScheduler.push({ h, m });
    }

    ++i;
  }

  newScheduler.sort((a, b) => {
    if (a.h === b.h) return a.m - b.m;
    return a.h - b.h;
  });

  return newScheduler;
}

function createSchedulerHours(val) {
  // Implementation for creating scheduler hours
  val = Number(val);
  if (val < 1) val = 1;
  if (val > 23) val = 23;
  const newScheduler = [];
  const now = new Date();
  const oneHours = 60 * 60 * 1000;
  let nextTime = new Date(now.setHours(0, 0, 0, 0));
  let day = nextTime.getDate();
  const nextDay = day + 1;

  let i = 0;

  while (day < nextDay && i < 1000) {
    nextTime = new Date(
      nextTime.getTime() + val * oneHours + random(-7, 7) * 1000 * 60,
    );
    day = nextTime.getDate();
    if (day < nextDay) {
      const h = nextTime.getHours();
      const m = nextTime.getMinutes();
      newScheduler.push({ h, m });
    }

    ++i;
  }

  newScheduler.sort((a, b) => {
    if (a.h === b.h) {
      return a.m - b.m;
    }
    return a.h - b.h;
  });

  return newScheduler;
}

function createSchedulerDailyHours() {
  const newScheduler = [];
  for (let i = 0; i < 24; i++) {
    newScheduler.push({ h: i, m: 0 });
  }
  return newScheduler;
}

async function getSchedulerWithType(type) {
  if (!type) {
    const object = await getSchedulerService();
    type = object.scheduler_type;
  }
  const scheduler = await getSchedulerDetail(type);
  return scheduler?.scheduler_time_list || [];
}

function convertFrameHours(val) {
  if (!val || typeof val !== "string") {
    throw new Error("Invalid value for frame hours");
  }
  if (!val.includes(":")) {
    throw new Error(
      "Invalid format for frame hours, expected format: '1:00,2:00,...'",
    );
  }

  const time = val.split(":");

  const h = Number(time[0].trim());
  const m = Number(time[1].trim());

  if (
    Number.isNaN(h) ||
    Number.isNaN(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    throw new Error(
      "Invalid format for frame hours, hours and minutes should be numbers",
    );
  }

  return { h: Number(time[0].trim()), m: Number(time[1].trim()) };
}

async function shuffleTimes() {
  function shuffle(times = [], diff = 0) {
    const set = new Set();
    try {
      const newTimes = [];
      times.forEach((item) => {
        let m = item.m + diff;
        let h = item.h;
        if (m < 0) {
          h--;
          if (h < 0) {
            h = 23;
          }
          m = 60 + m;
        }
        if (m > 59) {
          h++;
          if (h > 23) {
            h = 0;
          }
          m = m - 60;
        }

        if (!set.has(`${h}:${m}`)) {
          set.add(`${h}:${m}`);
          newTimes.push({
            h,
            m,
          });
        }
      });

      newTimes.sort((a, b) => {
        if (a.h === b.h) return a.m - b.m;
        return a.h - b.h;
      });
      return newTimes;
    } catch (error) {
      logError("Error at shuffle times: ", error);
      return [];
    }
  }

  const scheduler = await getSchedulerService();
  const type = scheduler.type;
  const diff = random(-2, 2);
  if (randomRateBoolean(7, 10)) {
    if (
      type === SCHEDULER_TYPE.EVERY_MINUTES ||
      type === SCHEDULER_TYPE.EVERY_HOURS
    ) {
      logActions("Shuffle scheduler times");
      const times =
        type === SCHEDULER_TYPE.EVERY_MINUTES
          ? [...scheduler.schedulerMinutes]
          : [...scheduler.schedulerHours];

      const newTimes = shuffle(times, diff);

      if (type === SCHEDULER_TYPE.EVERY_MINUTES) {
        scheduler.schedulerMinutes = newTimes;
      } else {
        scheduler.schedulerHours = newTimes;
      }
      // setSchedulerService(scheduler);
    }
  }
}

async function getNextTimePost() {
  try {
    const object = await getSchedulerService();
    const type = object.scheduler_type;

    const tomorrow = Date.now() + 1000 * 60 * 60 * 24;

    const now = Date.now();

    if (
      type === SCHEDULER_TYPE.EVERY_HOURS ||
      type === SCHEDULER_TYPE.EVERY_MINUTES
    ) {
      const details = await getSchedulerDetail(type);
      if (!details) {
        return tomorrow;
      }
      const timeValue = details.scheduler_time_value;
      if (type === SCHEDULER_TYPE.EVERY_MINUTES) {
        return now + 1000 * 60 * timeValue;
      }
      if (type === SCHEDULER_TYPE.EVERY_HOURS) {
        return now + 1000 * 60 * 60 * timeValue;
      }
      return tomorrow;
    }

    const schedulers = await getSchedulerWithType(type);
    if (!schedulers || !schedulers.length) {
      return tomorrow;
    }

    let ans = null;
    const oneMinute = 1000 * 60;
    const isTest = await getIsTestInStorage();
    let diff = oneMinute;
    if (!isTest) {
      diff = oneMinute * 4;
    }
    for (const time of schedulers) {
      const t = new Date(new Date().setHours(time.h, time.m, 0, 0)).getTime();
      if (t > now + diff) {
        ans = t;
        break;
      }
    }
    if (!ans) {
      ans = new Date(new Date().setDate(new Date().getDate() + 1)).setHours(
        schedulers[0].h,
        schedulers[0].m,
        0,
        0,
      );
    }
    if (!ans) {
      ans = new Date().getTime() + oneMinute * 60;
    }
    return ans;
  } catch (error) {
    logError("Error at getNextTimePost: ", error);
    return null;
  }
}

async function getNextTimePostWhenSpammed() {
  let nextTime = await DB_getValue(KEY_NEXT_TIME_POST_WHEN_SPAMMED);
  if (!nextTime) {
    nextTime = new Date().getTime() + 1000 * 60 * 60 * 24 * 2;
    await DB_setValue(KEY_NEXT_TIME_POST_WHEN_SPAMMED, nextTime);
  }
  return nextTime;
}

async function getCorrectNextTime() {
  try {
    const isSpammed = await getIsSpammedData();
    let nextTime = 0;
    if (isSpammed) {
      nextTime = await getNextTimePostWhenSpammed();
    } else {
      const timeDelay = await getTimeDelayForScheduler();
      nextTime = (await getNextTimePost()) + timeDelay;
    }

    return nextTime;
  } catch (error) {
    logError("Error at getCorrectNextTime method: ", error);
    return null;
  }
}

async function logSchedulerHelper() {
  try {
    const isScheduler = await getIsSchedulerData();
    if (!isScheduler) return;

    const nextTime = await getCorrectNextTime();
    const date = new Date(nextTime);
    let text_vi = "Đăng bài tự động theo lịch trình đang được bật";
    let text_en = "Auto posting schedule is enabled";

    text_vi += `, thời gian đăng bài tiếp theo trong bộ lịch: ${date.toLocaleString()}`;
    text_en += `, the next posting time in schedule: ${date.toLocaleString()}`;

    addLog({
      vi: text_vi,
      en: text_en,
    });
  } catch (error) {
    logError("Error at logSchedulerHelper method: ", error);
  }
}

export {
  createSchedulerMinutes,
  createSchedulerHours,
  createSchedulerDailyHours,
  getSchedulerWithType,
  convertFrameHours,
  getNextTimePost,
  shuffleTimes,
  getNextTimePostWhenSpammed,
  getCorrectNextTime,
  logSchedulerHelper,
};
