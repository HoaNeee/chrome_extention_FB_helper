import CommentWalk from "../class/CommentWalk.js";
import {
  ERROR_CODE,
  KEY_COMMENT_WALK_AREA,
  KEY_IMPORT_EXPORT_TYPE,
} from "../contants/constant-extention.js";
import {
  DEFAULT_COMMENT_WALK_SETTING,
  KEY_COMMENT_WALK,
} from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { DataCommentWalkDB } from "../utils/data-comment-walk-db.js";
import { CustomError } from "../utils/exception.js";
import { get } from "../utils/request.js";
import {
  genID,
  getTextWithLanguage,
  logError,
  random,
} from "../utils/utils.js";
import { getDeviceId } from "./device-service.js";
import {
  getCommentWalkAreaData,
  getCommentWalkSpeedData,
  getContentQueryExcludesCommonData,
  getContentQueryIncludesCommonData,
  getIsAIHelpCommentWalkData,
  getIsCombineStrictlyTitleGroupData,
  getIsSkipPostNotInGroupData,
  getKeywordsCertainChoiceCommentWalkData,
  getMatchRateValueContentQueryIncludesCommonData,
  getMaxCommentWalkPerBatchData,
  getStrictlyMatchTitleGroupData,
  getTimeDelayCommentWalk,
  setCommentWalkAreaData,
  setCommentWalkSpeedData,
  setIsAIHelpCommentWalkData,
  setIsCombineStrictlyTitleGroupData,
  setIsSkipPostNotInGroupData,
} from "./setting-service.js";
import { getIsUseLocalStorage } from "./storage-global-service.js";

/**
 * @typedef {import('../types/types.js').Base64Object} Base64Object
 */

/**
 * @typedef {import('../types/types.js').CommentWalkConfig} CommentWalkConfig
 */

const commentWalkService = {
  async getListCommentWalk() {
    try {
      const isUseLocalStorage = await getIsUseLocalStorage();
      if (isUseLocalStorage) {
        return await this.getListCommentWalkInStorage();
      }
      return [];
    } catch (error) {
      logError("getListCommentWalk", error);
      return [];
    }
  },

  async getListCommentWalkRequest() {
    try {
      const deviceId = await getDeviceId();
      const res = await get("/comment-walks/device/" + deviceId);
      return res?.data || [];
    } catch (error) {
      logError("getListCommentWalkRequest", error);
      return [];
    }
  },

  async getListCommentWalkInStorage() {
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
   * @returns {Promise<{
   * setting: CommentWalkConfig,
   * comment_walk: CommentWalk,
   * list_comment_walk: CommentWalk[],
   * }>} - Metadata comment walk
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

      const keywords_certain_choice_comment_walk =
        await getKeywordsCertainChoiceCommentWalkData();

      const isSkipPostNotInGroup = await getIsSkipPostNotInGroupData();
      const isCombineStrictlyTitleGroup =
        await getIsCombineStrictlyTitleGroupData();

      const commentWalkSpeed = await getCommentWalkSpeedData();

      const strictlyMatchTitleGroup = await getStrictlyMatchTitleGroupData();

      const isAIHelpCommentWalk = await getIsAIHelpCommentWalkData();

      const setting = {};

      Object.keys(timeDelay).forEach((key) => {
        setting[key] = timeDelay[key];
      });

      const area = await this.getCurrentCommentWalkArea();

      setting.max_comment_walk_per_batch = Number(maxComment);
      setting.content_query_includes_common_comment_walk =
        content_query_includes_common;
      setting.content_query_excludes_common_comment_walk =
        content_query_excludes_common;
      setting.match_rate_value_content_query_includes_common_comment_walk =
        match_rate_value_content_query_includes;
      setting.comment_walk_area = area;
      setting.keywords_certain_choice_comment_walk =
        keywords_certain_choice_comment_walk;
      setting.is_skip_posts_not_in_group = isSkipPostNotInGroup;
      setting.is_combine_strictly_title_group = isCombineStrictlyTitleGroup;
      setting.strictly_match_title_group = strictlyMatchTitleGroup;
      setting.comment_walk_speed = commentWalkSpeed;
      setting.is_ai_help_comment_walk = isAIHelpCommentWalk;

      const currentId =
        await commentWalkService.getCurrentIdCommentWalkActive();
      if (!currentId && area === KEY_COMMENT_WALK_AREA.SEARCH_PAGE) {
        throw new CustomError(ERROR_CODE.SELF, "Not found id comment walk");
      }

      const commentWalk = await this.getCommentWalkById(currentId);
      if (!commentWalk && area === KEY_COMMENT_WALK_AREA.SEARCH_PAGE) {
        throw new CustomError(ERROR_CODE.SELF, "Not found comment walk data");
      }

      const ids = await this.getListIdCommentWalkActive();

      const listCommentWalkActive = [];

      for (const id of ids) {
        const commentWalk = await this.getCommentWalkById(id);
        if (commentWalk) {
          listCommentWalkActive.push(commentWalk);
        }
      }

      const data = {
        setting,
        comment_walk: commentWalk,
        list_comment_walk: listCommentWalkActive,
      };

      return data;
    } catch (error) {
      throw error;
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

  async addUrlCommented(id, url) {
    const listUrlCommented = await this.getListUrlCommented();
    const matchIndex = listUrlCommented.findIndex((i) => i.id === id);

    const maxLength = 1000;
    const maxSub = 50;

    if (matchIndex !== -1) {
      if (listUrlCommented[matchIndex].urls.length >= maxLength) {
        listUrlCommented[matchIndex].urls =
          listUrlCommented[matchIndex].urls.slice(maxSub); // remove 50 url oldest
      }
      listUrlCommented[matchIndex].urls.push(url);
    } else {
      listUrlCommented.push({
        id: id,
        urls: [url],
      });
    }
    await this.setListUrlCommented(listUrlCommented);
  },

  async checkUrlCommented(id, url) {
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

  async getCommentWalkArea() {
    return await getCommentWalkAreaData();
  },

  async setCommentWalkArea(commentWalkArea) {
    return await setCommentWalkAreaData(commentWalkArea);
  },

  /**
   *
   * @param {string} area
   * @returns {Promise<void>}
   */
  async setCurrentCommentWalkArea(area) {
    await DB_setValue(KEY_COMMENT_WALK.CURRENT_COMMENT_WALK_AREA, area);
  },

  /**
   *
   * @returns {Promise<string>}
   */
  async getCurrentCommentWalkArea() {
    return await DB_getValue(
      KEY_COMMENT_WALK.CURRENT_COMMENT_WALK_AREA,
      KEY_COMMENT_WALK_AREA.HOME,
    );
  },

  /**
   *
   * @returns {typeof KEY_COMMENT_WALK_AREA}
   */
  getRandomCommentWalkArea() {
    const areas = [];
    for (const key in KEY_COMMENT_WALK_AREA) {
      if (KEY_COMMENT_WALK_AREA[key] !== KEY_COMMENT_WALK_AREA.RANDOM) {
        areas.push(KEY_COMMENT_WALK_AREA[key]);
      }
    }
    return areas[random(0, areas.length - 1)];
  },

  async getIsSkipPostNotInGroup() {
    return await getIsSkipPostNotInGroupData();
  },

  async setIsSkipPostNotInGroup(isSkipPostNotInGroup) {
    await setIsSkipPostNotInGroupData(isSkipPostNotInGroup);
  },

  async getIsCombineStrictlyTitleGroup() {
    return await getIsCombineStrictlyTitleGroupData();
  },

  async setIsCombineStrictlyTitleGroup(isCombineStrictlyTitleGroup) {
    await setIsCombineStrictlyTitleGroupData(isCombineStrictlyTitleGroup);
  },

  async getCommentWalkSpeed() {
    return await getCommentWalkSpeedData();
  },

  async setCommentWalkSpeed(commentWalkSpeed) {
    return await setCommentWalkSpeedData(commentWalkSpeed);
  },

  async getIsAIHelpCommentWalk() {
    return await getIsAIHelpCommentWalkData();
  },

  async setIsAIHelpCommentWalk(isAIHelpCommentWalk) {
    await setIsAIHelpCommentWalkData(isAIHelpCommentWalk);
  },
};

export { commentWalkService };
