import { KEY_COMMENT_WHEN_POST_SUCCESS } from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { get, patch } from "../utils/request.js";
import { logError } from "../utils/utils.js";
import { getIsCommentWhenPostSuccessData } from "./setting-service.js";
import { getIsUseLocalStorage } from "./storage-global-service.js";

/**
 * @typedef {Object} CommentPost
 * @property {number} id
 * @property {Array<string>} contents
 * @property {number} max_comment_per_post
 * @property {boolean} is_active // juts for local storage
 */

/**
 * get list comment when post success
 * @returns {Promise<string[]>}
 */
async function getListCommentWhenPostSuccessService() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const contents = await DB_getValue(
        KEY_COMMENT_WHEN_POST_SUCCESS.LIST_CONTENT,
      );
      return contents || [];
    }

    const res = await get("/comment-posts/list-content");
    return res?.data || [];
  } catch (error) {
    logError("Error at get list comment service", error);
    return [];
  }
}

async function setListCommentWhenPostSuccessService(content) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    let listContent = [];
    if (typeof content === "string") {
      listContent = content.split("\n").map((item) => item.trim());
    } else if (Array.isArray(content)) {
      listContent = content;
    }
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WHEN_POST_SUCCESS.LIST_CONTENT,
        listContent,
      );
      return true;
    }

    await patch("/comment-posts", {
      contents: listContent,
    });
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Get all metadata comments
 * @returns {Promise<CommentPost>}
 */
async function getAllMetadataComments() {
  try {
    let contents = [];
    let max_comment_per_post = 1;
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      contents = await getListCommentWhenPostSuccessService();
      max_comment_per_post = await getMaxCommentPerTimeService();
    } else {
      const res = await get("/comment-posts");
      const data = res?.data;
      if (data) {
        contents = data?.contents || [];
        max_comment_per_post = data?.max_comment_per_post || 1;
      }
    }

    let is_active = await getIsCommentWhenPostSuccessData();

    return {
      contents,
      max_comment_per_post,
      is_active,
    };
  } catch (error) {
    return null;
  }
}

async function getCommentPostRequest() {
  try {
    const res = await get("/comment-posts");
    return res?.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get max comment per time
 * @returns {Promise<number>}
 */
async function getMaxCommentPerTimeService() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const maxComment = await DB_getValue(
        KEY_COMMENT_WHEN_POST_SUCCESS.MAX_COMMENT_PER_TIME,
      );
      return maxComment || 1;
    }

    const res = await get("/comment-posts/max-comment-per-post");
    return res?.data || 1;
  } catch (error) {
    logError("Error at get max comment per time service", error);
    return 1;
  }
}

/**
 * Set max comment per time
 * @param {number} max
 */
async function setMaxCommentPerTimeService(max) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(
        KEY_COMMENT_WHEN_POST_SUCCESS.MAX_COMMENT_PER_TIME,
        max,
      );
      return true;
    }

    await patch("/comment-posts", {
      max_comment_per_post: max,
    });
  } catch (error) {
    throw error;
  }
}

export {
  getListCommentWhenPostSuccessService,
  setListCommentWhenPostSuccessService,
  getAllMetadataComments,
  getMaxCommentPerTimeService,
  setMaxCommentPerTimeService,
  getCommentPostRequest,
};
