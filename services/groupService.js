import { KEY_GET_LIST_GROUPS } from "../contants/constant-extention.js";
import {
  KEY_ALL_GROUPS,
  KEY_GROUPS_NEED_POST,
  KEY_GROUPS_POSTED,
  URL_LIST_GROUPS,
} from "../contants/contants.js";
import {
  getGroupsMatch,
  updateUIDataGroupPostCheckeds,
} from "../helpers/group.js";
import {
  DB_getValue,
  DB_sendMessage,
  DB_setValue,
} from "../utils/api-helper.js";
import { logActions, logError, now } from "../utils/utils.js";
import { getListDataGroupPostNeedPost } from "./data-group-post-service.js";
import { getStrictlyMatchTitleGroupData } from "./setting-service.js";
import { setIsStopTaskInStorage } from "./storage-service.js";

/**
 * @description This function will be redirect to list group page and scroll detect list group
 */
async function getListGroupsService() {
  try {
    setIsStopTaskInStorage(false);
    DB_sendMessage(KEY_GET_LIST_GROUPS, { url: URL_LIST_GROUPS });
  } catch (error) {
    logError("Error at get list group service", error);
  }
}

/**
 * Get the list of groups that need to be posted from storage
 * @returns {Promise<{
 * groups: Array<{id: string, title: string, name: string, priority: number, groups: Array<{id_href: string, status: string}>}>,
 * forceChange: boolean,
 * time: number}>
 * }
 * The object containing the groups and related information
 */
async function getListGroupsNeedPostInStorage() {
  const object = await DB_getValue(KEY_GROUPS_NEED_POST);

  return {
    groups: object?.groups || [],
    forceChange: object?.forceChange || false,
    time: object?.time || 0,
  };
}

/**
 * Get all group posted
 * @returns {Promise<Array<string>>} Array of group id posted
 */
async function getAllGroupPostedsInStorage() {
  const posteds = await DB_getValue(KEY_GROUPS_POSTED);
  return posteds || [];
}

/**
 * Set all group posted
 * @param {Array<string>} posteds - Array of group id posted
 * @returns {Promise<void>} void
 */
async function setAllGroupPostedsInStorage(posteds) {
  await DB_setValue(KEY_GROUPS_POSTED, posteds);
}

/**
 * Add a group to the list of groups that have been posted
 * @param {string} groupId - The id of the group to add
 * @returns {Promise<void>} void
 */
async function addGroupToGroupsPosted(groupId) {
  try {
    const groupPosteds = await getAllGroupPostedsInStorage();
    groupPosteds.push(groupId);
    await setAllGroupPostedsInStorage(groupPosteds);
  } catch (error) {
    logError("Error add group to groups posted: " + error);
    throw new Error("Error add group to groups posted: " + error);
  }
}

/**
 *
 * @returns {Promise<Array<{title: string, href: string}>|null>} array of all groups
 */
async function getAllDataGroupsInStorage() {
  try {
    const allGroups = await DB_getValue(KEY_ALL_GROUPS);
    return allGroups;
  } catch (error) {
    logError("Error getAllDataGroupsInStorage: " + error);
    throw new Error("Error getAllDataGroupsInStorage: " + error);
  }
}

/**
 *
 * @param {Array<{id: string, title: string, name: string, priority: number, groups: Array<{title: string, id_href: string}>}>} list
 * @returns no return
 */
async function setGroupsNeedPost(list) {
  try {
    const needPosts = [];

    for (const item of list) {
      const { id, title, name, priority, groups } = item;
      const grs = groups.map((gr) => ({
        id_href: gr.id_href || gr.href,
        status: "pending",
      }));
      needPosts.push({ id, title, name, priority, groups: grs });
    }

    DB_setValue(KEY_GROUPS_NEED_POST, {
      groups: needPosts,
      forceChange: true,
      time: now(),
    });
  } catch (error) {
    logError("Error set groups need post: " + error);
    throw new Error("Error set groups need post: " + error);
  }
}

async function updateGroupNeedPosts(forceChange = false) {
  try {
    const allGroups = await getAllDataGroupsInStorage();

    const listGroupsNeedPost = await getListDataGroupPostNeedPost();

    const listGroups = allGroups;

    const titleStrictlyMatch = await getStrictlyMatchTitleGroupData();
    const titleString = titleStrictlyMatch.join(", ");
    let list = [];
    for (const data of listGroupsNeedPost) {
      const id = data.id;

      const title = data.title;
      const name = data.name || "";
      const priority = data.priority || 1;
      const listGroupsMatch = getGroupsMatch({
        title,
        listGroups,
        titleStrictlyMatch: titleString,
      });

      list.push({
        id,
        title,
        name,
        priority,
        groups: listGroupsMatch,
      });
    }

    // //sort by groups length asc
    list = list.sort((a, b) => {
      if (
        a.priority !== b.priority &&
        a.priority !== undefined &&
        b.priority !== undefined &&
        a.priority !== null &&
        b.priority !== null
      ) {
        return a.priority - b.priority;
      }
      return a.groups.length - b.groups.length;
    });
    logActions("update group need posts", list);

    await setGroupsNeedPost(list);
    await updateUIDataGroupPostCheckeds(null, forceChange);
    return true;
  } catch (error) {
    logError("Error at update group need posts", error);
    throw error;
  }
}

export {
  getListGroupsService,
  setGroupsNeedPost,
  getAllDataGroupsInStorage,
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
  setAllGroupPostedsInStorage,
  addGroupToGroupsPosted,
  updateGroupNeedPosts,
};
