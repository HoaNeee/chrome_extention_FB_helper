import { KEY_SPECIAL_FRAME_HOURS } from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { del, get, patch, post } from "../utils/request.js";
import { genID, genIDNumber, logError } from "../utils/utils.js";
import { getDeviceId } from "./device-service.js";
import { getIsUseLocalStorage } from "./storage-global-service.js";

/**
 * @typedef {Object} SpecialFrameHour
 * @property {number} id - id of frame
 * @property {number} start_time - time of day
 * @property {number} end_time - time of day
 * @property {number} max_group - max group to post
 * @property {boolean} is_active - is checked
 * @property {Array<number>} apply_dates - array of day of week (0-6, 0 is sunday, 6 is saturday)
 */

/**
 *
 * @param {Array<SpecialFrameHour>} data
 */
async function setSpecialFrameHoursInStorage(data) {
  try {
    await DB_setValue(KEY_SPECIAL_FRAME_HOURS, data);
  } catch (error) {
    logError("Error setSpecialFrameHoursService:", error);
  }
}

/**
 *
 * @returns {Promise<Array<SpecialFrameHour>>}
 */
async function getSpecialFrameHoursService() {
  try {
    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const framesHours = (await DB_getValue(KEY_SPECIAL_FRAME_HOURS)) || [];
      return framesHours;
    }

    const deviceId = await getDeviceId();

    const res = await get("/special-frame-hours/" + deviceId);
    return res?.data || [];
  } catch (error) {
    logError("Error getSpecialFrameHoursService:", error);
    return [];
  }
}

/**
 *
 * @param {SpecialFrameHour} data
 * @returns {Promise<SpecialFrameHour>}
 */
async function addSpecialFrameHoursService(data) {
  try {
    if (!data) return;

    const { start_time, end_time, max_group, apply_dates } = data;

    if (!start_time || !end_time || !max_group) {
      throw new Error("Vui lòng nhập đầy đủ thông tin");
    }

    const endTimeNum = Number(end_time);
    const startTimeNum = Number(start_time);
    const maxGroupNum = Number(max_group);

    if (
      startTimeNum > 23 ||
      endTimeNum > 23 ||
      startTimeNum < 0 ||
      endTimeNum < 0 ||
      maxGroupNum < 0
    ) {
      throw new Error("Không hợp lệ");
    }

    if (endTimeNum < startTimeNum) {
      throw new Error(
        "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu",
      );
    }

    const payload = {
      start_time: startTimeNum,
      end_time: endTimeNum,
      max_group: maxGroupNum,
      apply_dates,
    };

    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      if (!data.id) {
        data.id = genIDNumber();
      }
      const framesHours = await getSpecialFrameHoursService();

      framesHours.push({
        ...payload,
        is_active: true,
      });

      await setSpecialFrameHoursInStorage(framesHours);
      return payload;
    }

    const deviceId = await getDeviceId();

    delete payload.id;
    payload.device_id = deviceId;

    const res = await post("/special-frame-hours", payload);
    return {
      ...res?.data,
      is_active: true,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * @param {SpecialFrameHour} data
 */
async function updateSpecialFrameHoursService(data) {
  try {
    if (!data) return;

    const { start_time, end_time, max_group, is_active, id, apply_dates } =
      data;

    if (
      typeof start_time === "string" &&
      typeof end_time === "string" &&
      typeof max_group === "string"
    ) {
      if (!start_time.trim() || !end_time.trim() || !max_group.trim()) {
        throw new Error("Vui lòng nhập đầy đủ thông tin");
      }
    }

    const endTimeNum = Number(end_time);
    const startTimeNum = Number(start_time);
    const maxGroupNum = Number(max_group);

    if (
      startTimeNum > 23 ||
      endTimeNum > 23 ||
      startTimeNum < 0 ||
      endTimeNum < 0 ||
      maxGroupNum < 0
    ) {
      throw new Error("Không hợp lệ");
    }

    if (endTimeNum < startTimeNum) {
      throw new Error(
        "Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu",
      );
    }

    const payload = {
      id,
      start_time: startTimeNum,
      end_time: endTimeNum,
      max_group: maxGroupNum,
      apply_dates,
      is_active,
    };

    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const framesHours = await getSpecialFrameHoursService();

      const idx = framesHours.findIndex((fr) => fr.id === id);
      if (idx === -1) {
        throw new Error("Không tìm thấy khung thời gian");
      }
      framesHours[idx] = payload;
      await setSpecialFrameHoursInStorage(framesHours);
      return payload;
    }

    const res = await patch("/special-frame-hours/" + payload.id, payload);
    return res?.data;
  } catch (error) {
    throw error;
  }
}

async function changeStatus(id, status) {
  try {
    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const framesHours = await getSpecialFrameHoursService();
      const idx = framesHours.findIndex((fr) => fr.id === id);
      if (idx === -1) {
        throw new Error("Không tìm thấy khung thời gian");
      }
      framesHours[idx].is_active = status;
      await setSpecialFrameHoursInStorage(framesHours);
      return true;
    } else {
      const deviceId = await getDeviceId();
      await patch("/special-frame-hours/update-status/" + id, {
        is_active: status,
        device_id: deviceId,
      });
      return true;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * @param {number} id
 */
async function deleteSpecialFrameHoursService(id) {
  try {
    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const framesHours = await getSpecialFrameHoursService();
      const newFramesHours = framesHours.filter((fr) => fr.id !== id);
      await setSpecialFrameHoursInStorage(newFramesHours);
      return true;
    }

    await del("/special-frame-hours/" + id);
    return true;
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

  framesHours.sort((a, b) => b.max_group - a.max_group);

  const found = framesHours.find((fr) => {
    return (
      fr.is_active &&
      fr.start_time <= currentHour &&
      fr.end_time >= currentHour &&
      fr.apply_dates.includes(day)
    );
  });

  if (found) {
    return found;
  }
  return null;
}

async function clearAllSpecialFrameHours() {
  try {
    const isUseLocalStorage = getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await setSpecialFrameHoursInStorage([]);
      return true;
    }

    await del("/special-frame-hours/delete-all");
    return true;
  } catch (error) {
    throw error;
  }
}

export {
  getSpecialFrameHoursService,
  addSpecialFrameHoursService,
  updateSpecialFrameHoursService,
  changeStatus,
  deleteSpecialFrameHoursService,
  clearAllSpecialFrameHours,
  getObjectIsInSpecialFrameHours,
};
