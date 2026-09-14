import { KEY_SAVED_TEMP } from "../contants/constant-extention.js";
import {
  DEFAULT_COMMENT_WALK_SETTING,
  initialTimeDelay,
  KEY_COMMENT_WALK,
  KEY_COMMENT_WHEN_POST_SUCCESS,
  KEY_DEFAULT_VALUE,
  KEY_INTERACT_BEFORE_POST,
  KEY_IS_EXECUTE_PRIORITY_TASK,
  KEY_IS_FIX_STEAL_ALL_FOCUS,
  KEY_IS_FIX_STEAL_FOCUS,
  KEY_IS_RANDOM_BATCH_POST,
  KEY_IS_RANDOM_TIME_POST,
  KEY_IS_SHUFFLE_GROUPS_NEED_POST,
  KEY_IS_SPAMMED,
  KEY_IS_SPECIAL_FRAME_HOURS,
  KEY_LAST_TIME_POST,
  KEY_MAX_GROUP_PER_TIME,
  KEY_PRIORITY_TASK,
  KEY_STOP_TASK,
  KEY_TIME_BREAK_WHEN_SPAMMED,
  KEY_TIME_DELAY,
  KEY_TITLE_STRICTLY_MATCH_GROUP,
  MAX_GROUP_PER_TIME_INITIAL,
} from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { get, patch } from "../utils/request.js";
import { logError } from "../utils/utils.js";
import { getDeviceId } from "./device-service.js";
import {
  getSchedulerService,
  setSchedulerInStorage,
} from "./scheduler-service.js";
import { getIsUseLocalStorage } from "./storage-global-service.js";

/**
 * @typedef {import('../types/types.js').PostConfig} PostConfig
 */

/**
 * @typedef {import('../types/types.js').CommentWalkConfig} CommentWalkConfig
 */

/**
 * @typedef {import('../types/types.js').DeviceSetting} DeviceSetting
 */

/**
 * @typedef {import('../types/types.js').TimeDelayCommentWalk} TimeDelayCommentWalk
 */

/**
 * Set device setting temp
 * @param {DeviceSetting|null} deviceSetting
 */
async function setDeviceSettingTemp(deviceSetting = null) {
  try {
    await DB_setValue(KEY_SAVED_TEMP.SETTING, deviceSetting);
  } catch (error) {
    throw error;
  }
}

/**
 * Get device setting temp
 * @returns {Promise<DeviceSetting|null>}
 */
async function getDeviceSettingTemp() {
  try {
    return (await DB_getValue(KEY_SAVED_TEMP.SETTING)) || null;
  } catch (error) {
    throw error;
  }
}

async function getIsSchedulerData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const scheduler = await getSchedulerService();
      return scheduler.is_scheduler;
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.is_scheduler;
    }

    const setting = await getDeviceSetting();
    return setting.is_scheduler;
  } catch (error) {
    throw error;
  }
}

async function setIsSchedulerData(isScheduler = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const scheduler = await getSchedulerService();
      scheduler.is_scheduler = isScheduler;
      await setSchedulerInStorage(scheduler);
    } else {
      await updateDeviceSettingRequest("is_scheduler", isScheduler);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_scheduler = isScheduler;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {typeof initialTimeDelay} timeDelay
 */
async function setTimeDelayData(timeDelay = initialTimeDelay) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_TIME_DELAY, timeDelay);
    } else {
      await Promise.all(
        Object.entries(timeDelay).map(async ([key, value]) => {
          if (
            timeDelay[key] !== undefined &&
            timeDelay[key] !== deviceSetting[key]
          ) {
            await updateDeviceSettingRequest(key, value);
          }
        }),
      );
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      Object.entries(timeDelay).forEach(([key, value]) => {
        if (timeDelay[key] !== undefined) {
          deviceSetting[key] = value;
        }
      });
      await setDeviceSettingTemp(deviceSetting);
    }
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<typeof initialTimeDelay>} The time delay settings from storage, or the initial default if not set
 */
async function getTimeDelayData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const timeDelay = await DB_getValue(KEY_TIME_DELAY);
      if (!timeDelay) {
        await setTimeDelayData(initialTimeDelay);
        return initialTimeDelay;
      }
      return timeDelay;
    }

    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return {
        time_delay_post: deviceSetting.time_delay_post,
        time_delay_fill_file: deviceSetting.time_delay_fill_file,
        time_delay_fill_content: deviceSetting.time_delay_fill_content,
        time_delay_click_to_post: deviceSetting.time_delay_click_to_post,
        time_delay_open_new_tab: deviceSetting.time_delay_open_new_tab,
      };
    }

    const setting = await getDeviceSetting();

    return {
      time_delay_post: setting.time_delay_post,
      time_delay_fill_file: setting.time_delay_fill_file,
      time_delay_fill_content: setting.time_delay_fill_content,
      time_delay_click_to_post: setting.time_delay_click_to_post,
      time_delay_open_new_tab: setting.time_delay_open_new_tab,
    };
  } catch (error) {
    throw error;
  }
}

/**
 *
 * This setting determines whether the script will attempt to open new tabs in the background to avoid stealing focus from the user
 * when posting tasks. If true, new tabs will be opened as inactive; if false, they will be opened as active.
 * This is a workaround for the issue where opening new tabs for posting tasks can steal focus away from the user, which can be disruptive.
 *
 * @returns {Promise<boolean>} The setting for whether to fix the steal focus issue, defaulting to false if not set
 */
async function getIsFixStealFocusData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (await DB_getValue(KEY_IS_FIX_STEAL_FOCUS)) || false;
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_fix_steal_focus;
    }

    const setting = await getDeviceSetting();
    return setting.is_fix_steal_focus;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {boolean} b The setting for whether to fix the steal focus issue
 */
async function setIsFixStealFocusData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_FIX_STEAL_FOCUS, b);
    } else {
      await updateDeviceSettingRequest("is_fix_steal_focus", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_fix_steal_focus = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<boolean>} The setting for whether to fix the steal all focus issue, defaulting to false if not set
 */
async function getIsFixStealAllFocusData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (await DB_getValue(KEY_IS_FIX_STEAL_ALL_FOCUS)) || false;
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_fix_steal_all_focus;
    }

    const setting = await getDeviceSetting();
    return setting.is_fix_steal_all_focus;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {boolean} b The setting for whether to fix the steal all focus issue
 */
async function setIsFixStealAllFocusData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_FIX_STEAL_ALL_FOCUS, b);
    } else {
      await updateDeviceSettingRequest("is_fix_steal_all_focus", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_fix_steal_all_focus = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<boolean>} The setting for whether to fix the steal all focus issue, defaulting to false if not set
 */
async function getIsSpammedData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (await DB_getValue(KEY_IS_SPAMMED)) || false;
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_spammed;
    }

    const setting = await getDeviceSetting();
    return setting.is_spammed;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {boolean} b
 */
async function setIsSpammedData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_SPAMMED, b);
    } else {
      await updateDeviceSettingRequest("is_spammed", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_spammed = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getMaxGroupPerTimeData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const max = await DB_getValue(KEY_MAX_GROUP_PER_TIME);
      if (max === undefined || max === null) {
        await setMaxGroupPerTimeData(MAX_GROUP_PER_TIME_INITIAL);
        return MAX_GROUP_PER_TIME_INITIAL;
      }
      return max;
    }

    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.max_group_per_batch;
    }

    const setting = await getDeviceSetting();
    return setting.max_group_per_batch;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {number} maxGroupPerTime
 */
async function setMaxGroupPerTimeData(maxGroupPerTime) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_MAX_GROUP_PER_TIME, maxGroupPerTime);
    } else {
      await updateDeviceSettingRequest("max_group_per_batch", maxGroupPerTime);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.max_group_per_batch = Number(maxGroupPerTime);
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {string[]} strictlyMatchTitleGroup array of keywords to strictly match title group
 */
async function setStrictlyMatchTitleGroupData(strictlyMatchTitleGroup = []) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_TITLE_STRICTLY_MATCH_GROUP,
        strictlyMatchTitleGroup,
      );
    } else {
      await updateDeviceSettingRequest(
        "strictly_title_match_groups",
        strictlyMatchTitleGroup,
      );
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.strictly_title_match_groups = strictlyMatchTitleGroup;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<Array<string>>} array of string keywords to strictly match title group
 */
async function getStrictlyMatchTitleGroupData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      let data = await DB_getValue(KEY_TITLE_STRICTLY_MATCH_GROUP);
      if (data === undefined || data === null || typeof data === "string") {
        data = KEY_DEFAULT_VALUE.DEFAULT_VALUE_STRICTLY_TITLE_MATCH_GROUP;
        await setStrictlyMatchTitleGroupData(data);
      }
      return data;
    }

    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.strictly_title_match_groups;
    }

    const setting = await getDeviceSetting();
    return setting.strictly_title_match_groups;
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random batch post mode, defaulting to false if not set
 */
async function getIsRandomBreakBatchData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (await DB_getValue(KEY_IS_RANDOM_BATCH_POST)) || false;
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_random_break_batch;
    }

    const setting = await getDeviceSetting();
    return setting.is_random_break_batch;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {boolean} b
 */
async function setIsRandomBreakBatchData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_RANDOM_BATCH_POST, b);
    } else {
      await updateDeviceSettingRequest("is_random_break_batch", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_random_break_batch = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random time post mode, defaulting to false if not set
 */
async function getIsRandomTimePostData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (await DB_getValue(KEY_IS_RANDOM_TIME_POST)) || false;
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_random_time_post;
    }

    const setting = await getDeviceSetting();
    return setting.is_random_time_post;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {boolean} b
 */
async function setIsRandomTimePostData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_RANDOM_TIME_POST, b);
    } else {
      await updateDeviceSettingRequest("is_random_time_post", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_random_time_post = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<number>} The last time post, defaulting to 0 if not set
 */
async function getLastTimePostData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (await DB_getValue(KEY_LAST_TIME_POST)) || 0;
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.last_time_post;
    }

    const setting = await getDeviceSetting();
    return setting.last_time_post;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {number} lastTimePost The last time post
 */
async function setLastTimePostData(lastTimePost) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_LAST_TIME_POST, lastTimePost);
    } else {
      await updateDeviceSettingRequest("last_time_post", lastTimePost);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.last_time_post = lastTimePost;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {boolean} b The setting for whether the extension is in random scheduler time mode
 */
async function setIsInteractBeforePostData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_INTERACT_BEFORE_POST.IS_ACTIVE, b);
    } else {
      await updateDeviceSettingRequest("is_interact_batch", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_interact_batch = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in random scheduler time mode, defaulting to false if not set
 */
async function getIsInteractBeforePostData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (await DB_getValue(KEY_INTERACT_BEFORE_POST.IS_ACTIVE)) || false;
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_interact_batch;
    }

    const setting = await getDeviceSetting();
    return setting.is_interact_batch;
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<boolean>} The setting for whether to shuffle groups need post, defaulting to false if not set
 */
async function getIsShuffleGroupNeedPostData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (await DB_getValue(KEY_IS_SHUFFLE_GROUPS_NEED_POST)) || false;
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_shuffle_group_need_post;
    }

    const setting = await getDeviceSetting();
    return setting.is_shuffle_group_need_post;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {boolean} b The setting for whether to shuffle groups need post
 */
async function setIsShuffleGroupNeedPostData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_SHUFFLE_GROUPS_NEED_POST, b);
    } else {
      await updateDeviceSettingRequest("is_shuffle_group_need_post", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_shuffle_group_need_post = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {boolean} b The setting for whether to comment when post success
 */
async function setIsCommentWhenPostSuccessData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_COMMENT_WHEN_POST_SUCCESS.IS_ACTIVE, b);
    } else {
      await updateDeviceSettingRequest("is_comment_when_post", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_comment_when_post = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * get is comment when post success
 * @returns {Promise<boolean>}
 */
async function getIsCommentWhenPostSuccessData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return (
        (await DB_getValue(KEY_COMMENT_WHEN_POST_SUCCESS.IS_ACTIVE)) || false
      );
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_comment_when_post;
    }

    const setting = await getDeviceSetting();
    return setting.is_comment_when_post;
  } catch (error) {
    throw error;
  }
}

/**
 * Get is special frame hours from store
 * @returns {Promise<boolean>}
 */
async function getIsSpecialFrameHoursData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(KEY_IS_SPECIAL_FRAME_HOURS);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_special_frame_hours;
    }

    const setting = await getDeviceSetting();
    return setting.is_special_frame_hours;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {boolean} b
 */
async function setIsSpecialFrameHoursData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_SPECIAL_FRAME_HOURS, b);
    } else {
      await updateDeviceSettingRequest("is_special_frame_hours", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_special_frame_hours = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<DeviceSetting>}
 */
async function getSettingByDeviceInStorage() {
  try {
    const is_fix_steal_focus = await getIsFixStealFocusData();
    const is_fix_steal_all_focus = await getIsFixStealAllFocusData();
    const is_random_break_batch = await getIsRandomBreakBatchData();
    const is_random_time_post = await getIsRandomTimePostData();
    const is_scheduler = await getIsSchedulerData();
    const max_group_per_batch = await getMaxGroupPerTimeData();
    const strictly_match_title_group = await getStrictlyMatchTitleGroupData();
    const is_spammed = await getIsSpammedData();
    const is_comment_when_post = await getIsCommentWhenPostSuccessData();
    const is_interact_batch = await getIsInteractBeforePostData();
    const is_special_frame_hours = await getIsSpecialFrameHoursData();

    const is_shuffle_group_need_post = await getIsShuffleGroupNeedPostData();
    const is_comment_walk = await getIsCommentWalkData();

    //time delay
    const timeDelay = await getTimeDelayData();
    const time_delay_click_to_post = timeDelay.time_delay_click_to_post;
    const time_delay_fill_content = timeDelay.time_delay_fill_content;
    const time_delay_fill_file = timeDelay.time_delay_fill_file;
    const time_delay_post = timeDelay.time_delay_post;
    const time_delay_open_new_tab = timeDelay.time_delay_open_new_tab;

    //TODO LATER
    // const commentWalk = await getCommentWalkData();
    // const time_delay_click_to_post_comment_walk = commentWalk.time_delay_click_to_post;
    // const time_delay_fill_content_comment_walk = commentWalk.time_delay_fill_content;
    // const time_delay_fill_file_comment_walk = commentWalk.time_delay_fill_file;
    // const time_delay_submit_comment_walk = commentWalk.time_delay_submit;
    // const time_break_when_spammed = commentWalk.time_break_when_spammed;
    // const content_query_includes_common_comment_walk = commentWalk.content_query_includes_common;
    // const content_query_excludes_common_comment_walk = commentWalk.content_query_excludes_common;

    //last time post
    const last_time_post = await getLastTimePostData();
    const device_id = await getDeviceId();

    return {
      is_fix_steal_focus,
      is_fix_steal_all_focus,
      is_random_break_batch,
      is_random_time_post,
      is_shuffle_group_need_post,
      is_scheduler,
      max_group_per_batch,
      strictly_match_title_group,
      is_spammed,
      is_comment_when_post,
      is_interact_batch,
      is_special_frame_hours,
      time_delay_click_to_post,
      time_delay_fill_content,
      time_delay_fill_file,
      time_delay_post,
      time_delay_open_new_tab,
      last_time_post,
      device_id,
      is_comment_walk,
    };
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<DeviceSetting>}
 */
async function getSettingByDeviceRequest() {
  try {
    const deviceId = await getDeviceId();
    const res = await get("/devices/settings/" + deviceId);
    return res?.data;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {string} key
 * @param {any} value
 * @returns {Promise<any>}
 */
async function updateDeviceSettingRequest(key, value) {
  try {
    const deviceId = await getDeviceId();

    const res = await patch("/devices/settings", {
      [key]: value,
      device_id: deviceId,
    });
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting[key] = value;
      await setDeviceSettingTemp(deviceSetting);
    }
    return res?.data;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<DeviceSetting>}
 */
async function getDeviceSetting() {
  try {
    let deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting === null || deviceSetting === undefined) {
      const isUseLocalStorage = await getIsUseLocalStorage();
      if (isUseLocalStorage) {
        deviceSetting = await getSettingByDeviceInStorage();
      } else {
        deviceSetting = await getSettingByDeviceRequest();
      }
    }
    return deviceSetting;
  } catch (error) {
    logError("Error at get device setting", error);
    throw error;
  }
}

async function initialDeviceSetting() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    let deviceSetting = null;
    if (isUseLocalStorage) {
      deviceSetting = await getSettingByDeviceInStorage();
    } else {
      deviceSetting = await getSettingByDeviceRequest();
    }
    await setDeviceSettingTemp(deviceSetting);
  } catch (error) {
    logError("Error at initialDeviceSetting: ", error);
  }
}

async function logSettingHelper() {
  const deviceSetting = await getDeviceSettingTemp();
  console.log("deviceSetting", deviceSetting);
}

async function setIsCommentWalkData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_COMMENT_WALK.IS_ACTIVE, b);
    } else {
      await updateDeviceSettingRequest("is_comment_walk", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.is_comment_walk = b;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getIsCommentWalkData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(KEY_COMMENT_WALK.IS_ACTIVE, false);
    }

    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      return deviceSetting.is_comment_walk;
    }

    const setting = await getDeviceSetting();
    return setting.is_comment_walk;
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @param {TimeDelayCommentWalk} timeDelay
 */
async function setTimeDelayCommentWalk(timeDelay) {
  try {
    await DB_setValue(
      KEY_COMMENT_WALK.COMMENT_WALK_SETTING_TIME_DELAY,
      timeDelay,
    );
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<TimeDelayCommentWalk>}
 */
async function getTimeDelayCommentWalk() {
  try {
    const res = await DB_getValue(
      KEY_COMMENT_WALK.COMMENT_WALK_SETTING_TIME_DELAY,
    );
    if (!res) {
      const data = {
        time_delay_fill_content_comment_walk_max:
          DEFAULT_COMMENT_WALK_SETTING.time_delay_fill_content_comment_walk_max,
        time_delay_fill_content_comment_walk_min:
          DEFAULT_COMMENT_WALK_SETTING.time_delay_fill_content_comment_walk_min,
        time_delay_fill_file_comment_walk:
          DEFAULT_COMMENT_WALK_SETTING.time_delay_fill_file_comment_walk,
        time_delay_submit_comment_walk:
          DEFAULT_COMMENT_WALK_SETTING.time_delay_submit_comment_walk,
      };
      await setTimeDelayCommentWalk(data);
      return data;
    }
    return res;
  } catch (error) {
    throw error;
  }
}

async function getMaxCommentWalkPerBatchData() {
  try {
    const res = await DB_getValue(
      KEY_COMMENT_WALK.COMMENT_WALK_SETTING_MAX_COMMENT_PER_BATCH,
    );
    if (!res) {
      await setMaxCommentWalkPerBatchData(
        DEFAULT_COMMENT_WALK_SETTING.max_comment_walk_per_batch,
      );
      return DEFAULT_COMMENT_WALK_SETTING.max_comment_walk_per_batch;
    }
    return res;
  } catch (error) {
    throw error;
  }
}

async function setMaxCommentWalkPerBatchData(max_comment_walk_per_batch) {
  try {
    await DB_setValue(
      KEY_COMMENT_WALK.COMMENT_WALK_SETTING_MAX_COMMENT_PER_BATCH,
      max_comment_walk_per_batch,
    );
  } catch (error) {
    throw error;
  }
}

async function getTimeBreakWhenSpammedData() {
  return await DB_getValue(KEY_TIME_BREAK_WHEN_SPAMMED, 0);
}

async function setTimeBreakWhenSpammedData(time) {
  await DB_setValue(KEY_TIME_BREAK_WHEN_SPAMMED, time);
}

/**
 * @returns {Promise<Array<string>>}
 */
async function getContentQueryIncludesCommonData() {
  const res = await DB_getValue(KEY_COMMENT_WALK.CONTENT_QUERY_INCLUDES_COMMON);
  if (res === null || res === undefined) {
    await setContentQueryIncludesCommonData(
      KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_INCLUDES_COMMON,
    );
    return KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_INCLUDES_COMMON;
  }
  return res;
}

/**
 * @param {Array<string>} contentQueryIncludesCommon
 */
async function setContentQueryIncludesCommonData(contentQueryIncludesCommon) {
  await DB_setValue(
    KEY_COMMENT_WALK.CONTENT_QUERY_INCLUDES_COMMON,
    contentQueryIncludesCommon,
  );
}

/**
 * @returns {Promise<Array<string>>}
 */
async function getContentQueryExcludesCommonData() {
  const res = await DB_getValue(KEY_COMMENT_WALK.CONTENT_QUERY_EXCLUDES_COMMON);
  if (res === null || res === undefined) {
    await setContentQueryExcludesCommonData(
      KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_EXCLUDES_COMMON,
    );
    return KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_EXCLUDES_COMMON;
  }
  return res;
}

/**
 * @param {Array<string>} contentQueryExcludesCommon
 */
async function setContentQueryExcludesCommonData(contentQueryExcludesCommon) {
  await DB_setValue(
    KEY_COMMENT_WALK.CONTENT_QUERY_EXCLUDES_COMMON,
    contentQueryExcludesCommon,
  );
}

/**
 *
 * @returns {Promise<number>}
 */
async function getMatchRateValueContentQueryIncludesCommonData() {
  return await DB_getValue(
    KEY_COMMENT_WALK.MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON,
    KEY_DEFAULT_VALUE.DEFAULT_MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON,
  );
}

async function setMatchRateValueContentQueryIncludesCommonData(rate) {
  await DB_setValue(
    KEY_COMMENT_WALK.MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON,
    rate,
  );
}

async function getIsStopTaskData() {
  try {
    return await DB_getValue(KEY_STOP_TASK, false);
  } catch (error) {
    throw error;
  }
}

async function setIsStopTaskData(b = false) {
  try {
    await DB_setValue(KEY_STOP_TASK, b);
    return true;
  } catch (error) {
    throw error;
  }
}

async function setLastTimeCommentWalkData(lastTimeComment) {
  try {
    await DB_setValue(KEY_COMMENT_WALK.LAST_TIME_COMMENT_WALK, lastTimeComment);
  } catch (error) {
    throw error;
  }
}

async function getLastTimeCommentWalkData() {
  try {
    return await DB_getValue(KEY_COMMENT_WALK.LAST_TIME_COMMENT_WALK, 0);
  } catch (error) {
    throw error;
  }
}

async function getPriorityTaskPostData() {
  try {
    return await DB_getValue(KEY_PRIORITY_TASK.POST);
  } catch (error) {
    throw error;
  }
}

async function setPriorityTaskPostData(priority = 1) {
  try {
    await DB_setValue(KEY_PRIORITY_TASK.POST, priority);
  } catch (error) {
    throw error;
  }
}

async function getPriorityTaskCommentWalkData() {
  try {
    return await DB_getValue(KEY_PRIORITY_TASK.COMMENT_WALK);
  } catch (error) {
    throw error;
  }
}

async function setPriorityTaskCommentWalkData(priority = 1) {
  try {
    await DB_setValue(KEY_PRIORITY_TASK.COMMENT_WALK, priority);
  } catch (error) {
    throw error;
  }
}

async function getPriorityTaskData() {
  try {
    let priorityTaskPost = await getPriorityTaskPostData();
    let priorityTaskCommentWalk = await getPriorityTaskCommentWalkData();

    if (priorityTaskPost === null || priorityTaskPost === undefined) {
      priorityTaskPost = KEY_DEFAULT_VALUE.DEFAULT_PRIORITY_TASK_POST;
      await setPriorityTaskPostData(priorityTaskPost);
    }
    if (
      priorityTaskCommentWalk === null ||
      priorityTaskCommentWalk === undefined
    ) {
      priorityTaskCommentWalk =
        KEY_DEFAULT_VALUE.DEFAULT_PRIORITY_TASK_COMMENT_WALK;
      await setPriorityTaskCommentWalkData(priorityTaskCommentWalk);
    }

    return {
      priority_task_post: priorityTaskPost,
      priority_task_comment_walk: priorityTaskCommentWalk,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} priority
 * @param {number} priority.priority_task_post
 * @param {number} priority.priority_task_comment_walk
 */
async function setPriorityTaskData(priority) {
  try {
    await Promise.all([
      setPriorityTaskPostData(priority.priority_task_post),
      setPriorityTaskCommentWalkData(priority.priority_task_comment_walk),
    ]);
  } catch (error) {
    throw error;
  }
}

async function getIsExecutePriorityTaskData() {
  try {
    return await DB_getValue(KEY_IS_EXECUTE_PRIORITY_TASK, false);
  } catch (error) {
    throw error;
  }
}

async function setIsExecutePriorityTaskData(isExecutePriorityTask = false) {
  try {
    await DB_setValue(KEY_IS_EXECUTE_PRIORITY_TASK, isExecutePriorityTask);
    return true;
  } catch (error) {
    throw error;
  }
}

async function getCommentWalkAreaData() {
  try {
    return await DB_getValue(
      KEY_COMMENT_WALK.COMMENT_WALK_AREA,
      DEFAULT_COMMENT_WALK_SETTING.comment_walk_area,
    );
  } catch (error) {
    throw error;
  }
}

async function setCommentWalkAreaData(commentWalkArea) {
  try {
    await DB_setValue(KEY_COMMENT_WALK.COMMENT_WALK_AREA, commentWalkArea);
  } catch (error) {
    throw error;
  }
}

async function getKeywordsCertainChoiceCommentWalkData() {
  try {
    return await DB_getValue(
      KEY_COMMENT_WALK.KEYWORDS_CERTAIN_CHOICE_COMMENT_WALK,
    );
  } catch (error) {
    throw error;
  }
}

async function setKeywordsCertainChoiceCommentWalkData(keywords) {
  try {
    await DB_setValue(
      KEY_COMMENT_WALK.KEYWORDS_CERTAIN_CHOICE_COMMENT_WALK,
      keywords,
    );
  } catch (error) {
    throw error;
  }
}

async function getIsSkipPostNotInGroupData() {
  try {
    return await DB_getValue(KEY_COMMENT_WALK.IS_SKIP_POST_NOT_IN_GROUP, false);
  } catch (error) {
    throw error;
  }
}

async function setIsSkipPostNotInGroupData(isSkipPostNotInGroup) {
  try {
    await DB_setValue(
      KEY_COMMENT_WALK.IS_SKIP_POST_NOT_IN_GROUP,
      isSkipPostNotInGroup,
    );
  } catch (error) {
    throw error;
  }
}

async function getIsCombineStrictlyTitleGroupData() {
  try {
    return await DB_getValue(
      KEY_COMMENT_WALK.IS_COMBINE_STRICTLY_TITLE_GROUP,
      false,
    );
  } catch (error) {
    throw error;
  }
}

async function setIsCombineStrictlyTitleGroupData(isCombineStrictlyTitleGroup) {
  try {
    await DB_setValue(
      KEY_COMMENT_WALK.IS_COMBINE_STRICTLY_TITLE_GROUP,
      isCombineStrictlyTitleGroup,
    );
  } catch (error) {
    throw error;
  }
}

async function getCommentWalkSpeedData() {
  try {
    return await DB_getValue(
      KEY_COMMENT_WALK.COMMENT_WALK_SPEED,
      DEFAULT_COMMENT_WALK_SETTING.comment_walk_speed,
    );
  } catch (error) {
    throw error;
  }
}

async function setCommentWalkSpeedData(commentWalkSpeed) {
  try {
    await DB_setValue(KEY_COMMENT_WALK.COMMENT_WALK_SPEED, commentWalkSpeed);
  } catch (error) {
    throw error;
  }
}

async function getIsAIHelpCommentWalkData() {
  return await DB_getValue(KEY_COMMENT_WALK.IS_AI_HELP_COMMENT_WALK, false);
}

async function setIsAIHelpCommentWalkData(isAIHelpCommentWalk) {
  await DB_setValue(
    KEY_COMMENT_WALK.IS_AI_HELP_COMMENT_WALK,
    isAIHelpCommentWalk,
  );
}

export {
  getCommentWalkAreaData,
  getCommentWalkSpeedData,
  getContentQueryExcludesCommonData,
  getContentQueryIncludesCommonData,
  getDeviceSetting,
  getIsCombineStrictlyTitleGroupData,
  getIsCommentWalkData,
  getIsCommentWhenPostSuccessData,
  getIsExecutePriorityTaskData,
  getIsFixStealAllFocusData,
  getIsFixStealFocusData,
  getIsInteractBeforePostData,
  getIsRandomBreakBatchData,
  getIsRandomTimePostData,
  getIsSchedulerData,
  getIsShuffleGroupNeedPostData,
  getIsSkipPostNotInGroupData,
  getIsSpammedData,
  getIsSpecialFrameHoursData,
  getIsStopTaskData,
  getKeywordsCertainChoiceCommentWalkData,
  getLastTimeCommentWalkData,
  getLastTimePostData,
  getMatchRateValueContentQueryIncludesCommonData,
  getMaxCommentWalkPerBatchData,
  getMaxGroupPerTimeData,
  getPriorityTaskCommentWalkData,
  getPriorityTaskData,
  getPriorityTaskPostData,
  getSettingByDeviceRequest,
  getStrictlyMatchTitleGroupData,
  getTimeBreakWhenSpammedData,
  getTimeDelayCommentWalk,
  getTimeDelayData,
  initialDeviceSetting,
  logSettingHelper,
  setCommentWalkAreaData,
  setCommentWalkSpeedData,
  setContentQueryExcludesCommonData,
  setContentQueryIncludesCommonData,
  setIsCombineStrictlyTitleGroupData,
  setIsCommentWalkData,
  setIsCommentWhenPostSuccessData,
  setIsExecutePriorityTaskData,
  setIsFixStealAllFocusData,
  setIsFixStealFocusData,
  setIsInteractBeforePostData,
  setIsRandomBreakBatchData,
  setIsRandomTimePostData,
  setIsSchedulerData,
  setIsShuffleGroupNeedPostData,
  setIsSkipPostNotInGroupData,
  setIsSpammedData,
  setIsSpecialFrameHoursData,
  setIsStopTaskData,
  setKeywordsCertainChoiceCommentWalkData,
  setLastTimeCommentWalkData,
  setLastTimePostData,
  setMatchRateValueContentQueryIncludesCommonData,
  setMaxCommentWalkPerBatchData,
  setMaxGroupPerTimeData,
  setPriorityTaskCommentWalkData,
  setPriorityTaskData,
  setPriorityTaskPostData,
  setStrictlyMatchTitleGroupData,
  setTimeBreakWhenSpammedData,
  setTimeDelayCommentWalk,
  setTimeDelayData,
  updateDeviceSettingRequest,
  getIsAIHelpCommentWalkData,
  setIsAIHelpCommentWalkData,
};
