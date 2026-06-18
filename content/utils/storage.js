import {
  KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST,
  KEY_GET_KEY_SAVED,
  KEY_SET_KEY_SAVED,
} from "../../contants/constant-extention";
import {
  initialTimeDelay,
  KEY_ALL_GROUPS,
  KEY_DECIDED_INTERACT_BEFORE_POST,
  KEY_IS_IN_PROGRESS,
  KEY_IS_SCROLL_DETECT_LIST_GROUP,
  KEY_IS_TEST,
  KEY_STOP_TASK,
  KEY_TIME_DELAY,
} from "../../contants/contants";
import { CL_addLogRequest, sendMessageWithResponse } from "./request";

async function CL_getIsTest() {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_IS_TEST,
    });

    return response.data || false;
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái test",
      en: error || "Error when getting test status",
    });
    return false;
  }
}

/**
 *
 * @returns {Promise<typeof initialTimeDelay>} The time delay settings from storage, or the initial default if not set
 */
async function CL_getTimeDelayInStorage() {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_TIME_DELAY,
    });

    return response.data || initialTimeDelay;
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy thời gian delay",
      en: error || "Error when getting delay time",
    });
    return initialTimeDelay;
  }
}

/**
 *
 * @returns {Promise<boolean>}
 */
async function CL_getProgressTool() {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_IS_IN_PROGRESS,
    });
    return response.data || false;
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái tool",
      en: error || "Error when getting tool status",
    });
    return false;
  }
}

async function CL_getStopTool() {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_STOP_TASK,
    });
    return response.data || false;
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái dừng tool",
      en: error || "Error when getting stop tool status",
    });
    return true;
  }
}

/**
 *
 * @returns {Promise<Array<object>>}
 */
async function CL_getAllDataGroupsOfUser() {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_ALL_GROUPS,
    });

    return response.data || [];
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy danh sách nhóm",
      en: error || "Error when getting list groups",
    });
    return [];
  }
}

async function CL_getIsScrollDetectListGroup() {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_IS_SCROLL_DETECT_LIST_GROUP,
    });
    return response.data || false;
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái scroll detect list group",
      en: error || "Error when getting scroll detect list group status",
    });
    return false;
  }
}

/**
 *
 * @returns {Promise<{
 * listContent: string[],
 * isActive: boolean,
 * }>>}
 */
async function CL_getMetadataComments() {
  try {
    const response = await sendMessageWithResponse(
      KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST.GET_ALL_METADATA,
    );
    return response.data || { listContent: [], isActive: false };
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy dữ liệu bình luận",
      en: error || "Error getting comment data",
    });
    return { listContent: [], isActive: false };
  }
}

/**
 * @returns {Promise<boolean>}
 */
async function CL_getDecidedInteractBeforePost() {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_DECIDED_INTERACT_BEFORE_POST,
    });
    return response.data || false;
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái interact before post",
      en: error || "Error when getting interact before post status",
    });
    return false;
  }
}

async function CL_setDecidedInteractBeforePost(value) {
  try {
    await sendMessageWithResponse(KEY_SET_KEY_SAVED, {
      key: KEY_DECIDED_INTERACT_BEFORE_POST,
      value,
    });
  } catch (error) {
    CL_addLogRequest({
      vi: error || "Lỗi khi set trạng thái interact before post",
      en: error || "Error when setting interact before post status",
    });
  }
}

export {
  CL_getIsTest,
  CL_getTimeDelayInStorage,
  CL_getProgressTool,
  CL_getStopTool,
  CL_getAllDataGroupsOfUser,
  CL_getIsScrollDetectListGroup,
  CL_getMetadataComments,
  CL_getDecidedInteractBeforePost,
  CL_setDecidedInteractBeforePost,
};
