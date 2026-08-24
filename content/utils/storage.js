import {
  KEY_ADD_URL_COMMENTED,
  KEY_CAN_COMMENT_WALK_THIS_POST,
  KEY_COMMENT_WALK_REQUEST,
  KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST,
  KEY_COMPLETED_COMMENT_WALK_THIS_BATCH,
  KEY_GET_ALL_METADATA_COMMENT_WALK,
  KEY_GET_KEY_SAVED,
  KEY_INTERACT_BEFORE_POST_REQUEST,
  KEY_SET_KEY_SAVED,
  KEY_SET_PROCESSING_COMMENT_WALK,
  KEY_STOP_TASK_REQUEST,
} from "../../contants/constant-extention";
import {
  initialTimeDelay,
  KEY_ALL_GROUPS,
  KEY_CAN_POST_THIS_TAB,
  KEY_COMMENT_WALK,
  KEY_INTERACT_BEFORE_POST,
  KEY_IS_DEVELOPER_MODE,
  KEY_IS_IN_PROGRESS,
  KEY_IS_SCROLL_DETECT_LIST_GROUP,
  KEY_IS_TEST,
  KEY_TIME_DELAY,
} from "../../contants/contants";
import {
  CL_addLogRequest,
  sendMessage,
  sendMessageWithResponse,
} from "./request";
import { CL_getValue, CL_setValue, logErrorContent } from "./utils";

async function CL_getIsTest() {
  try {
    const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_IS_TEST,
    });

    return response.data || false;
  } catch (error) {
    logErrorContent("Error at CL_getIsTest: ", error);
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
async function CL_getTimeDelayData() {
  try {
    const response = await sendMessageWithResponse(KEY_TIME_DELAY);

    return response.data || initialTimeDelay;
  } catch (error) {
    logErrorContent("Error at CL_getTimeDelayData: ", error);
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
    const response = await sendMessageWithResponse(
      KEY_STOP_TASK_REQUEST.GET_IS_STOP_TASK,
    );
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
    logErrorContent("Error at CL_getAllDataGroupsOfUser: ", error);
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
    logErrorContent("Error at CL_getIsScrollDetectListGroup: ", error);
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
 * contents: string[],
 * is_active: boolean,
 * max_comment_per_post: number
 * }>>}
 */
async function CL_getMetadataComments() {
  try {
    const response = await sendMessageWithResponse(
      KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST.GET_ALL_METADATA,
    );

    if (response?.data) {
      return response.data;
    }
    return {
      contents: [],
      max_comment_per_post: 0,
      is_active: false,
    };
  } catch (error) {
    logErrorContent("Error at CL_getMetadataComments: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy dữ liệu bình luận",
      en: error || "Error getting comment data",
    });
    return {
      contents: [],
      is_active: false,
      max_comment_per_post: 0,
    };
  }
}

/**
 * @returns {Promise<{
 * max_post_interact_per_batch: number,
 * can_interact: boolean
 * }>}
 */
async function CL_getMetadataInteractBeforePost() {
  try {
    const response = await sendMessageWithResponse(
      KEY_INTERACT_BEFORE_POST_REQUEST.GET_ALL_METADATA,
    );
    return response.data || null;
  } catch (error) {
    logErrorContent("Error at CL_getMetadataInteractBeforePost: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái interact before post",
      en: error || "Error when getting interact before post status",
    });
    return null;
  }
}

async function CL_setDecidedInteractBeforePost(value) {
  try {
    await sendMessageWithResponse(KEY_SET_KEY_SAVED, {
      key: KEY_INTERACT_BEFORE_POST.DECIDED_INTERACT,
      value,
    });
  } catch (error) {
    logErrorContent("Error at CL_setDecidedInteractBeforePost: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi set trạng thái interact before post",
      en: error || "Error when setting interact before post status",
    });
  }
}

/**
 * @typedef {import('../../services/comment-walk-service').CommentWalkSetting} CommentWalkSetting
 */

/**
 *
 * @returns {Promise<CommentWalkSetting>}
 */
async function CL_getAllMetadataCommentWalk() {
  try {
    const res = await sendMessageWithResponse(
      KEY_GET_ALL_METADATA_COMMENT_WALK,
    );
    return res.data;
  } catch (error) {
    logErrorContent("Error at CL_getAllMetadataCommentWalk: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy dữ liệu bình luận",
      en: error || "Error getting comment data",
    });
    return null;
  }
}

async function CL_setProcessingCommentWalk(isProcessing) {
  try {
    await sendMessage(KEY_SET_PROCESSING_COMMENT_WALK, {
      isProcessing: isProcessing,
    });
  } catch (error) {
    logErrorContent("Error at CL_setProcessingCommentWalk: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi set trạng thái comment walk",
      en: error || "Error when setting comment walk status",
    });
  }
}

async function CL_getCountCommentWalkPostedPerBatch() {
  try {
    const countComment = await CL_getValue(
      KEY_COMMENT_WALK.COUNT_COMMENT_WALK_POSTED_PER_BATCH,
      0,
    );
    return countComment;
  } catch (error) {
    logErrorContent("Error at CL_getCountCommentWalkPostedPerBatch: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy số lượng bình luận đã đăng",
      en: error || "Error when getting number of comments posted",
    });
    return 0;
  }
}

async function CL_setCountCommentWalkPostedPerBatch(countComment) {
  try {
    await CL_setValue(
      KEY_COMMENT_WALK.COUNT_COMMENT_WALK_POSTED_PER_BATCH,
      countComment,
    );
  } catch (error) {
    logErrorContent("Error at CL_setCountCommentWalkPostedPerBatch: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi set số lượng bình luận đã đăng",
      en: error || "Error when setting number of comments posted",
    });
  }
}

async function CL_getCanCommentThisPost(url) {
  try {
    const response = await sendMessageWithResponse(
      KEY_CAN_COMMENT_WALK_THIS_POST,
      { url },
    );
    return response.data.can_comment_walk || false;
  } catch (error) {
    logErrorContent("Error at CL_getCanCommentThisPost: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái comment walk",
      en: error || "Error when setting comment walk status",
    });
    return false;
  }
}

async function CL_addUrlCommented(url) {
  try {
    await sendMessageWithResponse(KEY_ADD_URL_COMMENTED, { url });
  } catch (error) {
    logErrorContent("Error at CL_addUrlCommented: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi thêm url bình luận",
      en: error || "Error when adding url commented",
    });
  }
}

async function CL_compeleteCommentWalkThisBatch() {
  try {
    await sendMessage(KEY_COMPLETED_COMMENT_WALK_THIS_BATCH);
  } catch (error) {
    logErrorContent("Error at CL_compeleteCommentWalkThisBatch: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi hoàn thành bình luận",
      en: error || "Error when completing comment",
    });
  }
}

async function CL_getIsDevMode() {
  try {
    const res = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
      key: KEY_IS_DEVELOPER_MODE,
    });
    return res.data || false;
  } catch (error) {
    logErrorContent("Error at CL_getIsDevMode: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái dev mode",
      en: error || "Error when getting dev mode status",
    });
    return false;
  }
}

/**
 * Lấy trạng thái tab hiện tại
 * @returns {Promise<{can_post: boolean, data: {id_href: string, status: string}}}
 */
async function CL_getObjectCanPostThisTab() {
  try {
    const response = await sendMessageWithResponse(KEY_CAN_POST_THIS_TAB);
    return response.data;
  } catch (error) {
    logErrorContent("Error at CL_getObjectCanPostThisTab: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi lấy trạng thái đăng bài",
      en: error || "Error when getting post status",
      type: "error",
    });
    return null;
  }
}

async function CL_updateLastTimeCommentWalk(time) {
  try {
    await sendMessageWithResponse(
      KEY_COMMENT_WALK_REQUEST.UPDATE_LAST_TIME_COMMENT,
      {
        time,
      },
    );
  } catch (error) {
    logErrorContent("Error at CL_updateLastTimeCommentWalk: ", error);
    CL_addLogRequest({
      vi: error || "Lỗi khi cập nhật thời gian bình luận",
      en: error || "Error when updating comment time",
      type: "error",
    });
  }
}

export {
  CL_getIsTest,
  CL_getTimeDelayData,
  CL_getProgressTool,
  CL_getStopTool,
  CL_getAllDataGroupsOfUser,
  CL_getIsScrollDetectListGroup,
  CL_getMetadataComments,
  CL_getMetadataInteractBeforePost,
  CL_setDecidedInteractBeforePost,
  CL_getAllMetadataCommentWalk,
  CL_setProcessingCommentWalk,
  CL_getCountCommentWalkPostedPerBatch,
  CL_setCountCommentWalkPostedPerBatch,
  CL_getCanCommentThisPost,
  CL_addUrlCommented,
  CL_compeleteCommentWalkThisBatch,
  CL_getIsDevMode,
  CL_getObjectCanPostThisTab,
  CL_updateLastTimeCommentWalk,
};
