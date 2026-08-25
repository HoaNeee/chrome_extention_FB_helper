import {
  ERROR_CODE,
  KEY_IMPORT_EXPORT_TYPE,
} from "../contants/constant-extention.js";
import { KEY_COMMENT_WALK } from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { DataCommentWalkDB } from "../utils/data-comment-walk-db.js";
import { CustomError } from "../utils/exception.js";
import {
  genID,
  getTextWithLanguage,
  logError,
  random,
} from "../utils/utils.js";
import {
  getContentQueryExcludesCommonData,
  getContentQueryIncludesCommonData,
  getMatchRateValueContentQueryIncludesCommonData,
  getMaxCommentWalkPerBatchData,
  getTimeDelayCommentWalk,
} from "./setting-service.js";

/**
 * @typedef {import('../types/types.js').Base64Object} Base64Object
 */

/**
 * @typedef {Object} CommentWalkSetting
 * @property {number} max_comment_walk_per_batch
 * @property {number} time_delay_fill_content_comment_walk_min
 * @property {number} time_delay_fill_content_comment_walk_max
 * @property {number} time_delay_fill_file_comment_walk
 * @property {number} time_delay_submit_comment_walk
 * @property {number} match_rate_value_content_query_includes_common_comment_walk
 * @property {Array<string>} content_query_includes_common_comment_walk
 * @property {Array<string>} content_query_excludes_common_comment_walk
 * @property {number} match_rate_value_content_query_includes_common_comment_walk
 */

/**
 * @typedef {Object} CommentWalkType
 * @property {string} id
 * @property {string} title_query_search
 * @property {string} name
 * @property {string} contents
 * @property {string|Base64Object} files
 * @property {Array<string>} keyword_query_includes
 * @property {Array<string>} keyword_query_excludes
 * @property {number} match_rate_value_content_query_includes
 *
 */

const commentWalkService = {
  async getListCommentWalk() {
    try {
      const db = new DataCommentWalkDB();
      return db.getAllDataCommentWalk();
    } catch (error) {
      logError("getListCommentWalk", error);
      return [];
    }
  },

  /** */
  async addNewCommentWalk(data) {
    try {
      const db = new DataCommentWalkDB();
      return db.addDataCommentWalk(data);
    } catch (error) {
      logError("addNewCommentWalk", error);
      return false;
    }
  },

  async updateDataCommentWalk(id, data) {
    try {
      const db = new DataCommentWalkDB();
      return db.updateDataCommentWalk(id, data);
    } catch (error) {
      logError("updateDataCommentWalk", error);
      return false;
    }
  },

  async deleteDataCommentWalk(id) {
    try {
      const db = new DataCommentWalkDB();
      await db.deleteDataCommentWalk(id);
      await this.updateStatusCommentWalk(id, false);
      return true;
    } catch (error) {
      logError("deleteDataCommentWalk", error);
      return false;
    }
  },

  async getCommentWalkById(id) {
    try {
      const db = new DataCommentWalkDB();
      return db.getDataCommentWalkById(id);
    } catch (error) {
      logError("getCommentWalkById", error);
      return null;
    }
  },

  /**
   * @returns {Promise<void>}
   */
  async clearAllDataCommentWalk() {
    try {
      const db = new DataCommentWalkDB();
      await db.clearDataCommentWalk();
      await this.setListIdCommentWalkActive([]);
      return true;
    } catch (error) {
      logError("clearAllDataCommentWalk", error);
      return false;
    }
  },

  async updateStatusCommentWalk(id, isActive) {
    const listCommentWalkActive = await this.getListIdCommentWalkActive();
    if (isActive) {
      if (listCommentWalkActive.includes(id)) return;
      listCommentWalkActive.push(id);
    } else {
      const index = listCommentWalkActive.indexOf(id);
      if (index > -1) {
        listCommentWalkActive.splice(index, 1);
      }
    }
    await this.setListIdCommentWalkActive(listCommentWalkActive);
  },

  /**
   *
   * @returns {Promise<string[]>}
   */
  async getListIdCommentWalkActive() {
    return await DB_getValue(KEY_COMMENT_WALK.LIST_ID_COMMENT_WALK_ACTIVE, []);
  },

  async setListIdCommentWalkActive(ids) {
    await DB_setValue(KEY_COMMENT_WALK.LIST_ID_COMMENT_WALK_ACTIVE, ids);
  },

  async getIsCommentWalkProcessing() {
    return (
      (await DB_getValue(KEY_COMMENT_WALK.IS_COMMENT_WALK_PROCESSING)) || false
    );
  },

  async setIsCommentWalkProcessing(isCommentWalkProcessing) {
    await DB_setValue(
      KEY_COMMENT_WALK.IS_COMMENT_WALK_PROCESSING,
      isCommentWalkProcessing,
    );
  },

  /**
   * @returns {Promise<string | null>}
   */
  async getRandomIdCommentWalkActive() {
    try {
      const listIdsCommentWalkActive = await this.getListIdCommentWalkActive();
      if (listIdsCommentWalkActive.length === 0) return null;
      const randomIndex = random(0, listIdsCommentWalkActive.length - 1);
      return listIdsCommentWalkActive[randomIndex];
    } catch (error) {
      logError("Error at getRandomIdCommentWalkActive", error);
      return null;
    }
  },

  async getCurrentIdCommentWalkActive() {
    try {
      return (
        (await DB_getValue(KEY_COMMENT_WALK.CURRENT_ID_COMMENT_WALK)) || null
      );
    } catch (error) {
      logError("getCurrentIdCommentWalkActive", error);
      return null;
    }
  },

  async setCurrentIdCommentWalkActive(id) {
    try {
      await DB_setValue(KEY_COMMENT_WALK.CURRENT_ID_COMMENT_WALK, id);
    } catch (error) {
      logError("setCurrentIdCommentWalkActive", error);
    }
  },

  async setTabIdCommentWalk(tabId) {
    await DB_setValue(KEY_COMMENT_WALK.TAB_ID_COMMENT_WALK, tabId);
  },

  async getTabIdCommentWalk() {
    return await DB_getValue(KEY_COMMENT_WALK.TAB_ID_COMMENT_WALK);
  },

  /**
   *
   * @returns {Promise<CommentWalkSetting>} - Metadata comment walk
   */
  async getAllMetadataCommentWalk() {
    try {
      const timeDelay = await getTimeDelayCommentWalk();
      const maxComment = await getMaxCommentWalkPerBatchData();

      const content_query_includes_common =
        await getContentQueryIncludesCommonData();
      const content_query_excludes_common =
        await getContentQueryExcludesCommonData();

      const match_rate_value_content_query_includes =
        await getMatchRateValueContentQueryIncludesCommonData();

      const data = {};

      Object.keys(timeDelay).forEach((key) => {
        data[key] = timeDelay[key];
      });

      data.max_comment_walk_per_batch = Number(maxComment);
      data.content_query_includes_common_comment_walk =
        content_query_includes_common;
      data.content_query_excludes_common_comment_walk =
        content_query_excludes_common;
      data.match_rate_value_content_query_includes_common_comment_walk =
        match_rate_value_content_query_includes;

      return data;
    } catch (error) {
      logError("Error at getAllMetadataCommentWalk: ", error);
      return null;
    }
  },

  async getCountCommentWalkPostedPerBatch() {
    return await DB_getValue(
      KEY_COMMENT_WALK.COUNT_COMMENT_WALK_POSTED_PER_BATCH,
      0,
    );
  },

  async setCountCommentWalkPostedPerBatch(count) {
    await DB_setValue(
      KEY_COMMENT_WALK.COUNT_COMMENT_WALK_POSTED_PER_BATCH,
      count,
    );
  },

  /**
   * @returns {Promise<{id: string, urls: string[]}[]>}
   */
  async getListUrlCommented() {
    return await DB_getValue(
      KEY_COMMENT_WALK.LIST_URL_COMMENT_WALK_COMMENTED,
      [],
    );
  },

  async setListUrlCommented(list = []) {
    await DB_setValue(KEY_COMMENT_WALK.LIST_URL_COMMENT_WALK_COMMENTED, list);
  },

  async addUrlCommented(url) {
    const listUrlCommented = await this.getListUrlCommented();
    const id = await this.getCurrentIdCommentWalkActive();
    const matchIndex = listUrlCommented.findIndex((i) => i.id === id);
    if (matchIndex !== -1) {
      listUrlCommented[matchIndex].urls.push(url);
    } else {
      listUrlCommented.push({
        id: id,
        urls: [url],
      });
    }
    await this.setListUrlCommented(listUrlCommented);
  },

  async checkUrlCommented(url) {
    const id = await this.getCurrentIdCommentWalkActive();
    const listUrlCommented = await this.getListUrlCommented();
    const match = listUrlCommented.find((i) => i.id === id);
    if (match) {
      return match.urls.includes(url);
    }
    return false;
  },

  async getTimeDelay() {
    return await getTimeDelayCommentWalk();
  },

  async getMaxCommentWalkPerBatch() {
    return await getMaxCommentWalkPerBatchData();
  },

  /**
   * Import data comment walk
   * @param {CommentWalk|CommentWalk[]} data
   * @returns {Promise<CommentWalk[]>}
   */
  async importDataCommentWalk(data) {
    if (Array.isArray(data)) {
      if (
        data.some(
          (item) =>
            item[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE] !==
            KEY_IMPORT_EXPORT_TYPE.COMMENT_WALK,
        )
      ) {
        throw new CustomError(
          ERROR_CODE.SELF,
          getTextWithLanguage({
            vi: "Định dạng dữ liệu không hợp lệ",
            en: "Invalid data format",
          }),
        );
      }
      data = data.map((item) => ({
        ...item,
        id: genID(),
      }));
      const db = new DataCommentWalkDB();

      return await db.addListCommentWalk(data);
    } else {
      if (
        data[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE] !==
        KEY_IMPORT_EXPORT_TYPE.COMMENT_WALK
      ) {
        throw new CustomError(
          ERROR_CODE.SELF,
          getTextWithLanguage({
            vi: "Định dạng dữ liệu không hợp lệ",
            en: "Invalid data format",
          }),
        );
      }
      data.id = genID();
      const newData = await this.addNewCommentWalk(data);
      return [newData];
    }
  },

  async getLastTimeCommentWalkSuccess() {
    return await DB_getValue(KEY_COMMENT_WALK.LAST_TIME_COMMENT_WALK, 0);
  },

  async setLastTimeCommentWalkSuccess(time) {
    await DB_setValue(KEY_COMMENT_WALK.LAST_TIME_COMMENT_WALK, time);
  },
};

export { commentWalkService };
