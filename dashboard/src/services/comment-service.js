import { KEY_COMMENT_WHEN_POST_SUCCESS } from "../../../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";

/**
 * get is comment when post success
 * @returns {Promise<boolean>}
 */
async function getIsCommentWhenPostSuccessService() {
  return (await DB_getValue(KEY_COMMENT_WHEN_POST_SUCCESS.IS_ACTIVE)) || false;
}

/**
 * get list comment when post success
 * @returns {Promise<string[]>}
 */
async function getListCommentWhenPostSuccessService() {
  const contents = await DB_getValue(
    KEY_COMMENT_WHEN_POST_SUCCESS.LIST_CONTENT,
  );
  if (!contents) return [];

  return contents;
}

async function setIsCommentWhenPostSuccessService(b = false) {
  DB_setValue(KEY_COMMENT_WHEN_POST_SUCCESS.IS_ACTIVE, b);
}

async function setListCommentWhenPostSuccessService(content) {
  let listContent = [];
  if (typeof content === "string") {
    listContent = content.split("\n").map((item) => item.trim());
  } else if (Array.isArray(content)) {
    listContent = content;
  }

  DB_setValue(KEY_COMMENT_WHEN_POST_SUCCESS.LIST_CONTENT, listContent);
}

/**
 * Get all metadata comments
 * @returns {Promise<{listContent: string[], isActive: boolean}>}
 */
async function getAllMetadataComments() {
  const listContent = await getListCommentWhenPostSuccessService();
  const isActive = await getIsCommentWhenPostSuccessService();

  return { listContent, isActive };
}

export {
  getIsCommentWhenPostSuccessService,
  getListCommentWhenPostSuccessService,
  setIsCommentWhenPostSuccessService,
  setListCommentWhenPostSuccessService,
  getAllMetadataComments,
};
