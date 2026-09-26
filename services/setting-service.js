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
      return deviceSetting.post_config.is_spammed;
    }

    const setting = await getDeviceSetting();
    return setting.post_config.is_spammed;
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
      await updatePostConfigSetting("is_spammed", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.post_config.is_spammed = b;
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
    console.log(deviceSetting);
    if (deviceSetting && deviceSetting?.post_config) {
      return deviceSetting?.post_config?.max_group_per_batch;
    }

    const setting = await getDeviceSetting();
    return setting.post_config.max_group_per_batch;
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
      await updatePostConfigSetting("max_group_per_batch", maxGroupPerTime);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.post_config.max_group_per_batch = Number(maxGroupPerTime);
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
      return deviceSetting.post_config.last_time_post;
    }

    const setting = await getDeviceSetting();
    return setting.post_config.last_time_post;
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
      await updatePostConfigSetting("last_time_post", lastTimePost);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.post_config.last_time_post = lastTimePost;
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
      return deviceSetting.post_config.is_shuffle_group_need_post;
    }

    const setting = await getDeviceSetting();
    return setting.post_config.is_shuffle_group_need_post;
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
      await updatePostConfigSetting("is_shuffle_group_need_post", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.post_config.is_shuffle_group_need_post = b;
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
    const strictly_match_title_group = await getStrictlyMatchTitleGroupData();
    const is_comment_when_post = await getIsCommentWhenPostSuccessData();
    const is_interact_batch = await getIsInteractBeforePostData();
    const is_special_frame_hours = await getIsSpecialFrameHoursData();

    const priority_task = await getPriorityTaskData();

    const commentWalkConfig = await getCommentWalkConfig();
    const postConfig = await getPostConfig();

    const device_id = await getDeviceId();

    return {
      is_fix_steal_focus,
      is_fix_steal_all_focus,
      is_random_break_batch,
      is_random_time_post,
      is_scheduler,
      strictly_match_title_group,
      is_comment_when_post,
      is_interact_batch,
      is_special_frame_hours,
      device_id,
      post_config: postConfig,
      comment_walk_config: commentWalkConfig,
      priority_task,
    };
  } catch (error) {
    throw error;
  }
}

/**
 *
 * @returns {Promise<CommentWalkConfig>}
 */
async function getCommentWalkConfig() {
  const isCommentWalk = await getIsCommentWalkData();
  const isCommentWalkPerBatch = await getMaxCommentWalkPerBatchData();
  const timeDelay = await getTimeDelayCommentWalk();
  const is_ai_help_comment_walk = await getIsAIHelpCommentWalkData();
  const is_combine_strictly_title_group =
    await getStrictlyMatchTitleGroupData();
  const is_skip_post_not_in_group = await getIsSkipPostNotInGroupData();
  const comment_walk_area = await getCommentWalkAreaData();
  const comment_walk_speed = await getCommentWalkSpeedData();

  const last_time_comment_walk = await getLastTimeCommentWalkData();
  const match_rate_value_content_query_includes_common_comment_walk =
    await getMatchRateValueContentQueryIncludesCommonData();

  return {
    is_comment_walk: isCommentWalk,
    max_comment_walk_per_batch: isCommentWalkPerBatch,
    is_ai_help_comment_walk,
    is_combine_strictly_title_group,
    is_skip_post_not_in_group,
    comment_walk_area,
    comment_walk_speed,
    last_time_comment_walk,
    match_rate_value_content_query_includes_common_comment_walk,
    is_spammed_comment_walk: false,
    content_query_includes_common_comment_walk:
      await getContentQueryIncludesCommonData(),
    content_query_excludes_common_comment_walk:
      await getContentQueryExcludesCommonData(),
    keywords_certain_choice_comment_walk:
      await getKeywordsCertainChoiceCommentWalkData(),
    ...timeDelay,
  };
}

/**
 * @returns {Promise<PostConfig>}
 */
async function getPostConfig() {
  const timeDelay = await getTimeDelayData();
  return {
    max_group_per_batch: await getMaxGroupPerTimeData(),
    is_shuffle_group_need_post: await getIsShuffleGroupNeedPostData(),
    is_spammed: await getIsSpammedData(),
    last_time_post: await getLastTimePostData(),
    ...timeDelay,
  };
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

async function updatePostConfigSetting(key, value) {
  try {
    const deviceId = await getDeviceId();
    await patch("/devices/settings/post-config", {
      device_id: deviceId,
      [key]: value,
    });

    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.post_config[key] = value;
      await setDeviceSettingTemp(deviceSetting);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function updateCommentWalkSetting(key, value) {
  try {
    const deviceId = await getDeviceId();
    await patch("/devices/settings/comment-walk-config", {
      device_id: deviceId,
      [key]: value,
    });

    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.comment_walk_config[key] = value;
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
async function getDeviceSetting() {
  try {
    let deviceSetting = await getDeviceSettingTemp();

    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      deviceSetting = await getSettingByDeviceInStorage();
    } else {
      deviceSetting = await getSettingByDeviceRequest();
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
      await updateCommentWalkSetting("is_comment_walk", b);
    }
    const deviceSetting = await getDeviceSettingTemp();
    if (deviceSetting) {
      deviceSetting.comment_walk_config.is_comment_walk = b;
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
      return deviceSetting.comment_walk_config.is_comment_walk;
    }

    const setting = await getDeviceSetting();
    return setting.comment_walk_config.is_comment_walk;
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
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WALK.COMMENT_WALK_SETTING_TIME_DELAY,
        timeDelay,
      );
    } else {
      const deviceSetting = await getDeviceSettingTemp();
      await Promise.all(
        Object.entries(timeDelay).map(async ([key, value]) => {
          if (
            timeDelay[key] !== undefined &&
            timeDelay[key] !== deviceSetting.comment_walk_config[key]
          ) {
            await updateCommentWalkSetting(key, value);
          }
        }),
      );
    }
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
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
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
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return {
        time_delay_fill_content_comment_walk_max:
          deviceSettingTemp.comment_walk_config
            .time_delay_fill_content_comment_walk_max,
        time_delay_fill_content_comment_walk_min:
          deviceSettingTemp.comment_walk_config
            .time_delay_fill_content_comment_walk_min,
        time_delay_fill_file_comment_walk:
          deviceSettingTemp.comment_walk_config
            .time_delay_fill_file_comment_walk,
        time_delay_submit_comment_walk:
          deviceSettingTemp.comment_walk_config.time_delay_submit_comment_walk,
      };
    }

    const deviceSetting = await getDeviceSetting();
    return {
      time_delay_fill_content_comment_walk_max:
        deviceSetting.comment_walk_config
          .time_delay_fill_content_comment_walk_max,
      time_delay_fill_content_comment_walk_min:
        deviceSetting.comment_walk_config
          .time_delay_fill_content_comment_walk_min,
      time_delay_fill_file_comment_walk:
        deviceSetting.comment_walk_config.time_delay_fill_file_comment_walk,
      time_delay_submit_comment_walk:
        deviceSetting.comment_walk_config.time_delay_submit_comment_walk,
    };
  } catch (error) {
    throw error;
  }
}

async function getMaxCommentWalkPerBatchData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();

    if (isUseLocalStorage) {
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
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.comment_walk_config.max_comment_walk_per_batch;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.comment_walk_config.max_comment_walk_per_batch;
  } catch (error) {
    throw error;
  }
}

async function setMaxCommentWalkPerBatchData(max_comment_walk_per_batch) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WALK.COMMENT_WALK_SETTING_MAX_COMMENT_PER_BATCH,
        max_comment_walk_per_batch,
      );
    } else {
      await updateCommentWalkSetting(
        "max_comment_walk_per_batch",
        max_comment_walk_per_batch,
      );
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.comment_walk_config.max_comment_walk_per_batch =
        max_comment_walk_per_batch;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
  } catch (error) {
    throw error;
  }
}

async function getTimeBreakWhenSpammedData() {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    return await DB_getValue(KEY_TIME_BREAK_WHEN_SPAMMED, 0);
  }
  const deviceSettingTemp = await getDeviceSettingTemp();
  if (deviceSettingTemp) {
    return deviceSettingTemp.time_break_when_spammed;
  }

  const deviceSetting = await getDeviceSetting();
  return deviceSetting.time_break_when_spammed;
}

async function setTimeBreakWhenSpammedData(time) {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    await DB_setValue(KEY_TIME_BREAK_WHEN_SPAMMED, time);
  } else {
    await updateDeviceSettingRequest("time_break_when_spammed", time);
  }

  const deviceSettingTemp = await getDeviceSettingTemp();
  if (deviceSettingTemp) {
    deviceSettingTemp.time_break_when_spammed = time;
    await setDeviceSettingTemp(deviceSettingTemp);
  }
}

/**
 * @returns {Promise<Array<string>>}
 */
async function getContentQueryIncludesCommonData() {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    const res = await DB_getValue(
      KEY_COMMENT_WALK.CONTENT_QUERY_INCLUDES_COMMON,
    );
    if (res === null || res === undefined) {
      await setContentQueryIncludesCommonData(
        KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_INCLUDES_COMMON,
      );
      return KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_INCLUDES_COMMON;
    }
    return res;
  }
  const deviceSettingTemp = await getDeviceSettingTemp();
  if (deviceSettingTemp) {
    return deviceSettingTemp.comment_walk_config
      .content_query_includes_common_comment_walk;
  }

  const deviceSetting = await getDeviceSetting();
  return deviceSetting.comment_walk_config
    .content_query_includes_common_comment_walk;
}

/**
 * @param {Array<string>} contentQueryIncludesCommon
 */
async function setContentQueryIncludesCommonData(contentQueryIncludesCommon) {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    await DB_setValue(
      KEY_COMMENT_WALK.CONTENT_QUERY_INCLUDES_COMMON,
      contentQueryIncludesCommon,
    );
  } else {
    await updateCommentWalkSetting(
      "content_query_includes_common_comment_walk",
      contentQueryIncludesCommon,
    );
  }

  const deviceSettingTemp = await getDeviceSettingTemp();
  if (deviceSettingTemp) {
    deviceSettingTemp.comment_walk_config.content_query_includes_common_comment_walk =
      contentQueryIncludesCommon;
    await setDeviceSettingTemp(deviceSettingTemp);
  }
}

/**
 * @returns {Promise<Array<string>>}
 */
async function getContentQueryExcludesCommonData() {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    const res = await DB_getValue(
      KEY_COMMENT_WALK.CONTENT_QUERY_EXCLUDES_COMMON,
    );
    if (res === null || res === undefined) {
      await setContentQueryExcludesCommonData(
        KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_EXCLUDES_COMMON,
      );
      return KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_EXCLUDES_COMMON;
    }
    return res;
  }

  const deviceSettingTemp = await getDeviceSettingTemp();
  if (deviceSettingTemp) {
    return deviceSettingTemp.comment_walk_config
      .content_query_excludes_common_comment_walk;
  }

  const deviceSetting = await getDeviceSetting();
  return deviceSetting.comment_walk_config
    .content_query_excludes_common_comment_walk;
}

/**
 * @param {Array<string>} contentQueryExcludesCommon
 */
async function setContentQueryExcludesCommonData(contentQueryExcludesCommon) {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    await DB_setValue(
      KEY_COMMENT_WALK.CONTENT_QUERY_EXCLUDES_COMMON,
      contentQueryExcludesCommon,
    );
  } else {
    await updateCommentWalkSetting(
      "content_query_excludes_common_comment_walk",
      contentQueryExcludesCommon,
    );
  }

  const deviceSettingTemp = await getDeviceSettingTemp();
  if (deviceSettingTemp) {
    deviceSettingTemp.comment_walk_config.content_query_excludes_common_comment_walk =
      contentQueryExcludesCommon;
    await setDeviceSettingTemp(deviceSettingTemp);
  }
}

/**
 *
 * @returns {Promise<number>}
 */
async function getMatchRateValueContentQueryIncludesCommonData() {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    return await DB_getValue(
      KEY_COMMENT_WALK.MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON,
      KEY_DEFAULT_VALUE.DEFAULT_MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON,
    );
  }

  const deviceSettingTemp = await getDeviceSettingTemp();
  if (deviceSettingTemp) {
    return deviceSettingTemp.comment_walk_config
      .match_rate_value_content_query_includes_common_comment_walk;
  }

  const deviceSetting = await getDeviceSetting();
  return deviceSetting.comment_walk_config
    .match_rate_value_content_query_includes_common_comment_walk;
}

async function setMatchRateValueContentQueryIncludesCommonData(rate) {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    await DB_setValue(
      KEY_COMMENT_WALK.MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON,
      rate,
    );
  } else {
    await updateCommentWalkSetting(
      "match_rate_value_content_query_includes_common_comment_walk",
      rate,
    );
  }

  const deviceSettingTemp = await getDeviceSettingTemp();
  if (deviceSettingTemp) {
    deviceSettingTemp.comment_walk_config.match_rate_value_content_query_includes_common_comment_walk =
      rate;
    await setDeviceSettingTemp(deviceSettingTemp);
  }
}

async function getIsStopTaskData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(KEY_STOP_TASK, false);
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.is_stop_task;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.is_stop_task;
  } catch (error) {
    throw error;
  }
}

async function setIsStopTaskData(b = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_STOP_TASK, b);
    } else {
      const deviceId = await getDeviceId();
      await patch(`/devices/settings/${deviceId}/change-status-tool`, {
        is_stop_task: b,
      });
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.is_stop_task = b;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function setLastTimeCommentWalkData(lastTimeComment) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WALK.LAST_TIME_COMMENT_WALK,
        lastTimeComment,
      );
    } else {
      await updateCommentWalkSetting("last_time_comment_walk", lastTimeComment);
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.comment_walk_config.last_time_comment_walk =
        lastTimeComment;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
  } catch (error) {
    throw error;
  }
}

async function getLastTimeCommentWalkData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(KEY_COMMENT_WALK.LAST_TIME_COMMENT_WALK, 0);
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.comment_walk_config.last_time_comment_walk;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.comment_walk_config.last_time_comment_walk;
  } catch (error) {
    throw error;
  }
}

async function getPriorityTaskPostData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(KEY_PRIORITY_TASK.POST);
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.priority_task.priority_task_post;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.priority_task.priority_task_post;
  } catch (error) {
    throw error;
  }
}

async function setPriorityTaskPostData(priority = 1) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_PRIORITY_TASK.POST, priority);
    } else {
      const deviceId = await getDeviceId();
      await patch(`/devices/settings/${deviceId}/update-priority-task`, {
        priority_task_post: priority,
      });
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.priority_task.priority_task_post = priority;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
  } catch (error) {
    throw error;
  }
}

async function getPriorityTaskCommentWalkData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(KEY_PRIORITY_TASK.COMMENT_WALK);
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.priority_task.priority_task_comment_walk;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.priority_task.priority_task_comment_walk;
  } catch (error) {
    throw error;
  }
}

async function setPriorityTaskCommentWalkData(priority = 1) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_PRIORITY_TASK.COMMENT_WALK, priority);
    } else {
      const deviceId = await getDeviceId();
      await patch(`/devices/settings/${deviceId}/update-priority-task`, {
        priority_task_comment_walk: priority,
      });
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.priority_task.priority_task_comment_walk = priority;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
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
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(KEY_IS_EXECUTE_PRIORITY_TASK, false);
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.is_execute_priority_task;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.is_execute_priority_task;
  } catch (error) {
    throw error;
  }
}

async function setIsExecutePriorityTaskData(isExecutePriorityTask = false) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_EXECUTE_PRIORITY_TASK, isExecutePriorityTask);
    } else {
      await updateDeviceSettingRequest(
        "is_execute_priority_task",
        isExecutePriorityTask,
      );
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.is_execute_priority_task = isExecutePriorityTask;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getCommentWalkAreaData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(
        KEY_COMMENT_WALK.COMMENT_WALK_AREA,
        DEFAULT_COMMENT_WALK_SETTING.comment_walk_area,
      );
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.comment_walk_config.comment_walk_area;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.comment_walk_config.comment_walk_area;
  } catch (error) {
    throw error;
  }
}

async function setCommentWalkAreaData(commentWalkArea) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_COMMENT_WALK.COMMENT_WALK_AREA, commentWalkArea);
    } else {
      await updateCommentWalkSetting("comment_walk_area", commentWalkArea);
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.comment_walk_config.comment_walk_area = commentWalkArea;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getKeywordsCertainChoiceCommentWalkData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(
        KEY_COMMENT_WALK.KEYWORDS_CERTAIN_CHOICE_COMMENT_WALK,
        DEFAULT_COMMENT_WALK_SETTING.keywords_certain_choice_comment_walk,
      );
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.comment_walk_config
        .keywords_certain_choice_comment_walk;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.comment_walk_config
      .keywords_certain_choice_comment_walk;
  } catch (error) {
    throw error;
  }
}

async function setKeywordsCertainChoiceCommentWalkData(keywords) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WALK.KEYWORDS_CERTAIN_CHOICE_COMMENT_WALK,
        keywords,
      );
    } else {
      await updateCommentWalkSetting(
        "keywords_certain_choice_comment_walk",
        keywords,
      );
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.comment_walk_config.keywords_certain_choice_comment_walk =
        keywords;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getIsSkipPostNotInGroupData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(
        KEY_COMMENT_WALK.IS_SKIP_POST_NOT_IN_GROUP,
        false,
      );
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.comment_walk_config.is_skip_post_not_in_group;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.comment_walk_config.is_skip_post_not_in_group;
  } catch (error) {
    throw error;
  }
}

async function setIsSkipPostNotInGroupData(isSkipPostNotInGroup) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WALK.IS_SKIP_POST_NOT_IN_GROUP,
        isSkipPostNotInGroup,
      );
    } else {
      await updateCommentWalkSetting(
        "is_skip_post_not_in_group",
        isSkipPostNotInGroup,
      );
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.comment_walk_config.is_skip_post_not_in_group =
        isSkipPostNotInGroup;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getIsCombineStrictlyTitleGroupData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(
        KEY_COMMENT_WALK.IS_COMBINE_STRICTLY_TITLE_GROUP,
        false,
      );
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.comment_walk_config
        .is_combine_keywords_title_group;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.comment_walk_config.is_combine_keywords_title_group;
  } catch (error) {
    throw error;
  }
}

async function setIsCombineStrictlyTitleGroupData(isCombineStrictlyTitleGroup) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WALK.IS_COMBINE_STRICTLY_TITLE_GROUP,
        isCombineStrictlyTitleGroup,
      );
    } else {
      await updateCommentWalkSetting(
        "is_combine_keywords_title_group",
        isCombineStrictlyTitleGroup,
      );
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.comment_walk_config.is_combine_keywords_title_group =
        isCombineStrictlyTitleGroup;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getCommentWalkSpeedData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(
        KEY_COMMENT_WALK.COMMENT_WALK_SPEED,
        DEFAULT_COMMENT_WALK_SETTING.comment_walk_speed,
      );
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.comment_walk_config.comment_walk_speed;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.comment_walk_config.comment_walk_speed;
  } catch (error) {
    throw error;
  }
}

async function setCommentWalkSpeedData(commentWalkSpeed) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_COMMENT_WALK.COMMENT_WALK_SPEED, commentWalkSpeed);
    } else {
      await updateCommentWalkSetting("comment_walk_speed", commentWalkSpeed);
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.comment_walk_config.comment_walk_speed =
        commentWalkSpeed;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getIsAIHelpCommentWalkData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await DB_getValue(KEY_COMMENT_WALK.IS_AI_HELP_COMMENT_WALK, false);
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.comment_walk_config.is_ai_help_comment_walk;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.comment_walk_config.is_ai_help_comment_walk;
  } catch (error) {
    throw error;
  }
}

async function setIsAIHelpCommentWalkData(isAIHelpCommentWalk) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WALK.IS_AI_HELP_COMMENT_WALK,
        isAIHelpCommentWalk,
      );
    } else {
      await updateCommentWalkSetting(
        "is_ai_help_comment_walk",
        isAIHelpCommentWalk,
      );
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.comment_walk_config.is_ai_help_comment_walk =
        isAIHelpCommentWalk;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
}

async function getIsRemoteData() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return false;
    }
    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      return deviceSettingTemp.is_remote_control;
    }

    const deviceSetting = await getDeviceSetting();
    return deviceSetting.is_remote_control;
  } catch (error) {
    throw error;
  }
}

async function setIsRemoteData(isRemote) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return true;
    } else {
      await updateDeviceSettingRequest("is_remote_control", isRemote);
    }

    const deviceSettingTemp = await getDeviceSettingTemp();
    if (deviceSettingTemp) {
      deviceSettingTemp.is_remote_control = isRemote;
      await setDeviceSettingTemp(deviceSettingTemp);
    }
    return true;
  } catch (error) {
    throw error;
  }
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
  getIsRemoteData,
  setIsRemoteData,
};
