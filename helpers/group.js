import {
  KEY_GROUPS_NEED_POST,
  MAX_GROUP_PER_TIME_INITIAL,
  prefix,
  STATUS_TASK,
} from "../contants/contants.js";
import { getListIdDataGroupPostCheckeds } from "../services/data-group-post-service.js";
import {
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
  setAllGroupPostedsInStorage,
} from "../services/groupService.js";
import {
  getIsSpecialFrameHoursData,
  getMaxGroupPerTimeData,
  getTimeDelayData,
} from "../services/setting-service.js";
import { getObjectIsInSpecialFrameHours } from "../services/special-frame-hours-service.js";
import {
  getCountResetGroupInStorage,
  getCurrentCountPostLength,
  setCountResetGroupInStorage,
  setCurrentCountPostLength,
} from "../services/storage-service.js";
import { DB_setValue } from "../utils/api-helper.js";
import {
  cvString,
  getListTitle,
  logActions,
  logError,
  randomRateBoolean,
  shuffleArray,
} from "../utils/utils.js";

/**
 * Check if all group need post have been posted.
 * Note: if exist error, also return false, but log error to console
 *
 * @returns {Promise<boolean>} true if all group need post have been posted, false if exist group have not been posted or exist error
 * */
async function checkIsPostedAllGroup() {
  try {
    const object = await getListGroupsNeedPostInStorage();
    const idsCheckeds = await getListIdDataGroupPostCheckeds();
    const listGroups =
      object?.groups.filter((gr) => idsCheckeds.includes(gr.id)) || [];

    const posteds = await getAllGroupPostedsInStorage();
    const set = new Set(posteds);

    const totalGroupsNeedPost = await getTotalGroupsNeedPost();

    if (set.size >= totalGroupsNeedPost) {
      return true;
    }

    for (const need of listGroups) {
      const groups = need?.groups || [];
      const isExistPending = groups.some((gr) => !set.has(gr.id_href));
      if (isExistPending) {
        return false;
      }
    }

    return true;
  } catch (error) {
    logError("Error check posted all group: " + error);
    return false;
  }
}

/**
 * Reset all group need post to pending and save to storage, also reset groups posted and post length
 */
async function resetPostedGroupAndSave() {
  try {
    const countReset = await getCountResetGroupInStorage();
    await setCountResetGroupInStorage(countReset + 1);

    const object = await getListGroupsNeedPostInStorage();
    const listGroups = object?.groups || [];
    const newList = listGroups.map((need) => {
      const newGrs = (need?.groups || []).map((gr) => ({
        ...gr,
        status: STATUS_TASK.PENDING,
      }));
      return {
        ...need,
        groups: shuffleArray(newGrs),
      };
    });

    await Promise.all([
      setCurrentCountPostLength(0),
      setAllGroupPostedsInStorage([]),
      DB_setValue(KEY_GROUPS_NEED_POST, {
        groups: newList,
        forceChange: false,
      }),
    ]);
  } catch (error) {
    throw new Error("Error reset posted group and save: " + error);
  }
}

/**
 *
 * @param {{title: string, listGroups: Array<{title: string, href: string}>, titleStrictlyMatch: string}} object of string keywords to strictly match title group
 * @returns {Array<{title: string, id_href: string}>} array of groups that match with title, if not exist return empty array
 */
function getGroupsMatch({ title, listGroups, titleStrictlyMatch } = {}) {
  try {
    const data = [];
    const listTitle = getListTitle(title);
    if (!title || !title.trim() || !listTitle.length) {
      return data;
    }

    const listTitleStrictlyMatch = getListTitle(titleStrictlyMatch);

    const set = new Set();
    for (const tit of listTitle) {
      for (const gr of listGroups) {
        const convertTitleGroup = cvString(gr.title);

        const isMatchStrictly = !listTitleStrictlyMatch.length
          ? true
          : listTitleStrictlyMatch.some((tit) => {
              return convertTitleGroup.includes(tit);
            });

        const href = gr.href || gr.id_href;

        if (
          isMatchStrictly &&
          convertTitleGroup.includes(tit) &&
          !set.has(href)
        ) {
          set.add(href);
          data.push(gr);
        }
      }
    }

    return shuffleArray(data);
  } catch (error) {
    logError("Error get groups match: " + error);
    throw new Error("Error get groups match: " + error);
  }
}

/**
 *
 * @returns {Promise<{ isPostedAll: boolean, isPostedMaxGroupPerTime: boolean }>}
 */
async function checkPostedAllGroupOrMaxGroupPerTime() {
  let isPostedMaxGroupPerTime = false;
  let isPostedAll = false;
  try {
    const currentLengthPost = await getCurrentCountPostLength();
    let maxGroupPerTime = await getMaxGroupPerTimeData();

    const isSpecialFrameHour = await getIsSpecialFrameHoursData();
    if (isSpecialFrameHour) {
      const frame = await getObjectIsInSpecialFrameHours();
      if (frame) {
        maxGroupPerTime = frame?.max_group || 0;
      }
    }

    const isSub = randomRateBoolean(4, 10);
    const maxGroupPerTimeDiff = isSub ? maxGroupPerTime - 1 : maxGroupPerTime;
    const isPostedAllGroups = await checkIsPostedAllGroup();
    if (currentLengthPost >= maxGroupPerTimeDiff || isPostedAllGroups) {
      if (isPostedAllGroups) {
        isPostedAll = true;
      } else {
        isPostedMaxGroupPerTime = true;
      }
    }
  } catch (error) {
    logError("Error check posted all group or max group per time: ", error);
  }
  return { isPostedAll, isPostedMaxGroupPerTime };
}

/**
 * Get time delay to post all groups per time (in seconds)
 * @returns {Promise<number>} - seconds
 */
async function getTimeToPostOneGroup() {
  try {
    const timeDelay = await getTimeDelayData();

    const totalTimeDelayPost =
      timeDelay.time_delay_click_to_post +
      1 +
      timeDelay.time_delay_fill_content +
      1 +
      timeDelay.time_delay_fill_file +
      1 +
      timeDelay.time_delay_open_new_tab +
      1 +
      timeDelay.time_delay_post +
      1;
    return totalTimeDelayPost + 4;
  } catch (error) {
    logActions("Error get time to post one groups: " + error);
  }
}

async function getTotalGroupsNeedPost() {
  try {
    const data = await getListGroupsNeedPostInStorage();
    const groupsNeedPost = data?.groups || [];
    const set = new Set();
    groupsNeedPost.forEach((group) => {
      const groups = group?.groups || [];
      groups.forEach((gr) => {
        set.add(gr.id_href);
      });
    });
    return set.size;
  } catch (error) {
    logError("Error get total groups need post: ", error);
  }
  return 0;
}

async function updateUIDataGroupPostCheckeds(ids, forceUpdate = false) {
  try {
    if (!ids) {
      ids = await getListIdDataGroupPostCheckeds(forceUpdate);
    }
    const container = document.querySelector(
      `#${prefix}list-data-groups-container`,
    );
    if (!container) {
      return;
    }
    const elements = container.querySelectorAll(`[data-group-id]`);

    for (const element of elements) {
      const id = element.getAttribute("data-group-id");
      const checkbox = element.querySelector('input[type="checkbox"]');
      checkbox.checked = !!ids.includes(id);
    }
  } catch (error) {
    logError("Error update UI data group post checkeds: ", error);
  }
}

export {
  checkIsPostedAllGroup,
  checkPostedAllGroupOrMaxGroupPerTime,
  getGroupsMatch,
  getTimeToPostOneGroup,
  getTotalGroupsNeedPost,
  resetPostedGroupAndSave,
  updateUIDataGroupPostCheckeds,
};
