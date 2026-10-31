import { KEY_COMMENT_WALK_AREA } from "../contants/constant-extention.js";
import { commentWalkService } from "../services/comment-walk-service.js";
import { systemSettingService } from "../services/system-setting-service.js";
import { correctTextByPattern, logError } from "../utils/utils.js";

export const hrefHelper = {
  async checkUrlGetListGroup(url) {
    try {
      if (typeof url !== "string") return false;
      const postSetting = await systemSettingService.getSystemPostSetting();
      const urls = postSetting.url_get_list_groups;
      for (const u of urls) {
        if (url.includes(u)) return true;
      }
      return false;
    } catch (error) {
      logError("Error at hrefHelper.checkUrlGetListGroup: ", error);
      return false;
    }
  },

  async checkUrlPostInGroup(url) {
    try {
      if (typeof url !== "string") return false;
      const postSetting = await systemSettingService.getSystemPostSetting();
      const patterns = postSetting.pattern_url_post_in_groups;
      for (const pat of patterns) {
        if (correctTextByPattern(url, pat)) return true;
      }
      return false;
    } catch (error) {
      logError("Error at hrefHelper.checkUrlPostInGroup: ", error);
      return false;
    }
  },

  async checkUrlPostCommentWalk(url) {
    try {
      if (typeof url !== "string") return false;
      const commentSetting =
        await systemSettingService.getSystemCommentWalkSetting();
      const patterns = commentSetting.pattern_url_post_comment_walks;
      for (const pat of patterns) {
        if (correctTextByPattern(url, pat)) return true;
      }
      return false;
    } catch (error) {
      logError("Error at hrefHelper.checkUrlPostCommentWalk: ", error);
      return false;
    }
  },

  async checkUrlCommentWalkPage(url) {
    try {
      if (typeof url !== "string") return false;

      const commentWalkSetting =
        await systemSettingService.getSystemCommentWalkSetting();

      const urlCommentWalkHomes = commentWalkSetting.url_comment_walk_homes;
      const urlCommentWalkSearches =
        commentWalkSetting.url_comment_walk_searches;

      const area = await commentWalkService.getCurrentCommentWalkArea();

      if (area === KEY_COMMENT_WALK_AREA.SEARCH_PAGE) {
        for (const u of urlCommentWalkSearches) {
          if (url.includes(u)) return true;
        }
      }

      if (area === KEY_COMMENT_WALK_AREA.HOME) {
        for (const u of urlCommentWalkHomes) {
          if (url.includes(u)) return true;
        }
      }

      return false;
    } catch (error) {
      logError("Error at hrefHelper.checkUrlCommentWalkPage: ", error);
      return false;
    }
  },
};
