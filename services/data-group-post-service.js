import DataGroupPost from "../class/DataGroupPost.js";
import {
  ERROR_CODE,
  KEY_IMPORT_EXPORT_TYPE,
} from "../contants/constant-extention.js";
import {
  KEY_CURRENT_DATA_GROUP_POST,
  KEY_INDEX_GROUP_POST,
  KEY_INDEXS_GROUP_CHECKED,
} from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { DataGroupPostDB } from "../utils/data-group-post-db.js";
import { CustomError } from "../utils/exception.js";
import { del, get, patch, post, postImage } from "../utils/request.js";
import {
  genID,
  getTextWithLanguage,
  logActions,
  logError,
  parseBase64ToFile,
  parseBlobToFile,
  parseFileToObjectBase64,
  parseUrlToBlob,
  random,
} from "../utils/utils.js";
import { getDeviceId } from "./device-service.js";
import {
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
} from "./groupService.js";
import { getIsShuffleGroupNeedPostData } from "./setting-service.js";
import { getIsUseLocalStorage } from "./storage-global-service.js";
import { setChangeGroupsCheckedFlag } from "./storage-service.js";

/**
 * @param {DataGroupPost} data array of data saved in storage
 * @returns {Promise<DataGroupPost>}
 */
async function addDataGroupPost(data) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();

    if (isUseLocalStorage) {
      let blobs = await Promise.all(
        Array.from(data?.files || []).map(
          async (file) => await parseFileToObjectBase64(file),
        ),
      );

      data.files = blobs;

      const db = new DataGroupPostDB();
      const dataSaveds = (await getListDataGroupPostInStorage()) || [];
      dataSaveds.push(data);
      await db.saveDataPosts(dataSaveds);
      return data;
    }

    if (data.files.length) {
      const responseUrls = await postImage({
        params: "/files/uploads",
        isMultiple: true,
        files: data.files,
      });
      data.files = responseUrls.data;
    }

    const res = await post("/data-group-posts", data);
    return res.data;
  } catch (error) {
    logError("Error addDataSavedInStorage: " + error);
    throw new Error("Error addDataSavedInStorage: " + error);
  }
}

/**
 * @param {DataGroupPost[]} data array of data saved in storage
 * @returns {Promise<void>}
 */
async function setListDataGroupPostInStorage(data) {
  try {
    const db = new DataGroupPostDB();
    await db.saveDataPosts(data);
  } catch (error) {
    logError("Error setListDataGroupPostInStorage: " + error);
    throw error;
  }
}

/**
 * @returns {Promise<DataGroupPost[]>} array of data saved in storage, if not exist return empty array
 */
async function getListDataGroupPostInStorage() {
  try {
    const db = new DataGroupPostDB();
    let data = await db.getAllDataSaved();
    if (!data) {
      data = [];
      await db.saveDataPosts(data);
    }

    return data;
  } catch (error) {
    logError("Error getDataSaved: " + error);
    throw new Error("Error getDataSaved: " + error);
  }
}

/**
 * Get all groups that need to be posted from saved data (group to be checked)
 * @returns {Promise<Array<DataGroupPost>>} all groups that need to be posted from saved data (group to be checked)
 */
async function getListDataGroupPostNeedPost() {
  try {
    const listDataGroupPost = await getListDataGroupPost();
    const idsCheckeds = await getListIdDataGroupPostCheckeds();
    const list = [];

    for (const data of listDataGroupPost) {
      const id = data.id;
      if (idsCheckeds.includes(id)) {
        list.push(data);
      }
    }

    return list;
  } catch (error) {
    logError("Error getListDataGroupPostNeedPost: " + error);
    throw error;
  }
}

/**
 * @returns {Promise<DataGroupPost[]>} array of data saved in storage, if not exist return empty array
 */
async function getListDataGroupPost() {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    return await getListDataGroupPostInStorage();
  }
  return await getDataGroupPostRequest();
}

async function getDataGroupPostRequest() {
  try {
    const res = await get("/data-group-posts");
    return res.data;
  } catch (error) {
    logError("Error getDataGroupPostRequest: " + error);
    throw error;
  }
}

/**
 * @param {string} id id of data group post
 * @param {boolean} isEditFile is edit file
 * @param {DataGroupPost} dataGroupPost data group post
 * @returns {Promise<DataGroupPost>}
 */
async function upadateDataGroupPost(id, isEditFile = false, dataGroupPost) {
  const isUseLocalStorage = await getIsUseLocalStorage();

  id = id || dataGroupPost.id;

  if (isUseLocalStorage) {
    //handle file
    if (isEditFile) {
      let blobs = await Promise.all(
        Array.from(dataGroupPost?.files || []).map(
          async (file) => await parseFileToObjectBase64(file),
        ),
      );

      dataGroupPost.files = blobs;
    }

    const dataGroupPosts = await getListDataGroupPostInStorage();
    const index = dataGroupPosts.findIndex(
      (item) => item.id === dataGroupPost.id,
    );
    if (index !== -1) {
      dataGroupPosts[index] = dataGroupPost;
    }

    await setListDataGroupPostInStorage(dataGroupPosts);

    return dataGroupPost;
  }

  //handle file
  if (isEditFile) {
    const responseUrls = await postImage({
      params: "/files/uploads",
      isMultiple: true,
      files: dataGroupPost.files,
    });
    dataGroupPost.files = responseUrls.data;
  }

  const res = await patch(`/data-group-posts/${id}`, dataGroupPost);

  if (res.data) {
    return { ...dataGroupPost, ...res.data };
  }
  return dataGroupPost;
}

/**
 * @param {string} id id of data group post
 * @returns {Promise<boolean>}
 */
async function deleteDataGroupPost(id) {
  const isUseLocalStorage = await getIsUseLocalStorage();

  const dataGroupPosts = await getListDataGroupPost();
  const newDataGroupPosts = dataGroupPosts.filter((item) => item.id !== id);

  const indexsChecked = await getListIdDataGroupPostCheckeds();
  const set = new Set(indexsChecked);
  set.delete(id);

  await setListDataGroupPostCheckedInStorage(Array.from(set));
  if (!isUseLocalStorage) {
    await del(`/data-group-posts/${id}`);
  } else {
    await setListDataGroupPostInStorage(newDataGroupPosts);
  }

  return true;
}

/**
 * @returns {Promise<Array<String>>} The indexs of group checked stored in storage, defaulting to an empty array if not set
 */
async function getListIdDataGroupPostCheckeds(force = false) {
  const isUseLocalStorage = await getIsUseLocalStorage();
  const ids = await DB_getValue(KEY_INDEXS_GROUP_CHECKED);

  if (isUseLocalStorage) {
    return ids || [];
  }

  if (ids && !force) {
    return ids;
  }

  const device_id = await getDeviceId();

  const res = await get(`/data-group-posts/details/${device_id}`);
  const listIds = res?.data
    ?.filter((item) => item.is_active)
    .map((item) => item.data_group_post_id);

  if (listIds) {
    await setListDataGroupPostCheckedInStorage(listIds);
  }

  return listIds || [];
}

/**
 * @param {{id: string, checked: boolean}} indexs The indexs of group checked
 */
async function updateDataGroupPostChecked(id, checked) {
  const indexs = await getListIdDataGroupPostCheckeds();
  const set = new Set(indexs);
  if (checked) {
    set.add(id);
  } else {
    set.delete(id);
  }

  const isUseLocalStorage = await getIsUseLocalStorage();

  if (!isUseLocalStorage) {
    const device_id = await getDeviceId();

    await patch("/data-group-posts/details", {
      data_group_post_id: id,
      device_id,
      is_active: checked,
    });
  }

  await setListDataGroupPostCheckedInStorage(Array.from(set));
  setChangeGroupsCheckedFlag(true);
  return true;
}

/**
 *
 * @param {Array<DataGroupPost> | DataGroupPost} data
 * @returns {Promise<Array<DataGroupPost>>}
 */
async function importDataGroupPosts(data) {
  if (!data) {
    return [];
  }

  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    const listDataGroupPost = await getListDataGroupPost();

    let priority = (await getMaxPriority()) + 1;

    if (Array.isArray(data)) {
      if (
        data.some(
          (item) =>
            item[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE] &&
            item[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE] !==
              KEY_IMPORT_EXPORT_TYPE.DATA_GROUP_POST,
        )
      ) {
        throw new CustomError(
          ERROR_CODE.SELF,
          getTextWithLanguage({
            vi: "Dữ liệu nhóm không đúng định dạng",
            en: "Data group is not in the correct format",
          }),
        );
      }

      for (const object of listDataGroupPost) {
        object.priority = priority++;
        object.id = genID();
      }
      const newList = [...listDataGroupPost, ...data];
      await setListDataGroupPostInStorage(newList);
      return newList;
    }

    //import just only one object
    if (
      data[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE] &&
      data[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE] !==
        KEY_IMPORT_EXPORT_TYPE.DATA_GROUP_POST
    ) {
      throw new CustomError(
        ERROR_CODE.SELF,
        getTextWithLanguage({
          vi: "Dữ liệu nhóm không đúng định dạng",
          en: "Data group is not in the correct format",
        }),
      );
    }
    data.priority = priority;
    data.id = genID();
    const newList = [...listDataGroupPost, data];
    await setListDataGroupPostInStorage(newList);
    return newList;
  }

  const listDataGroupPosts = await getListDataGroupPost();
  let priority = listDataGroupPosts.length + 1;

  let payload = [];

  if (Array.isArray(data)) {
    data = await Promise.all(
      data.map(async (object) => {
        object.priority = priority++;
        if (object.files) {
          try {
            const files = object.files.map((obj) => parseBase64ToFile(obj));
            const responseUrls = await postImage({
              params: "/files/uploads",
              isMultiple: true,
              files,
            });
            object.files = responseUrls.data;
          } catch (error) {
            logError("Error importDataGroupPosts: " + error);
            object.files = [];
          }
        }
        return object;
      }),
    );

    payload = data;
  } else {
    //handle single data
    data.priority = priority;
    if (data.files) {
      const files = data.files.map((obj) => parseBase64ToFile(obj));
      const responseUrls = await postImage({
        params: "/files/uploads",
        isMultiple: true,
        files,
      });
      data.files = responseUrls.data;
    }
    payload = [data];
  }

  const deviceId = await getDeviceId();

  const res = await post("/data-group-posts/import-data", {
    list_data_group_post: payload,
    device_id: deviceId,
  });

  return res.data;
}

/**
 *
 * @param {Array<DataGroupPost> | DataGroupPost}  data
 */
async function exportDataGroupPost(data) {
  if (!data || (Array.isArray(data) && !data.length)) {
    throw new CustomError(
      ERROR_CODE.SELF,
      getTextWithLanguage({
        vi: "Dữ liệu nhóm trống, không thể thực hiện",
        en: "Data group post is empty, cannot export",
      }),
    );
  }

  const isUseLocalStorage = await getIsUseLocalStorage();
  let dataJson = JSON.stringify(data);

  let name = "";

  if (Array.isArray(data)) {
    let time = new Date().toLocaleString().replace(/[,:\\/\s]/g, "_");
    name = `data_groups_${time}.json`;
  } else {
    name = `data_group_post_for_${data.name}.json`;
  }

  if (!isUseLocalStorage) {
    if (Array.isArray(data)) {
      data = await Promise.all(
        data.map(async (item) => {
          if (item.files) {
            item.files = await Promise.all(
              item.files.map(async (file) => {
                const blob = await parseUrlToBlob(file);
                const fileParse = parseBlobToFile(blob, file);
                const object = await parseFileToObjectBase64(fileParse);
                return object;
              }),
            );
          }
          return item;
        }),
      );
    } else {
      if (data.files) {
        data.files = await Promise.all(
          data.files.map(async (file) => {
            const blob = await parseUrlToBlob(file);
            const fileParse = parseBlobToFile(blob, file);
            const object = await parseFileToObjectBase64(fileParse);
            return object;
          }),
        );
      }
    }
  }

  if (Array.isArray(data)) {
    data = data.map((item) => ({
      ...item,
      [KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE]:
        KEY_IMPORT_EXPORT_TYPE.DATA_GROUP_POST,
    }));
  } else {
    data[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE] =
      KEY_IMPORT_EXPORT_TYPE.DATA_GROUP_POST;
  }

  dataJson = JSON.stringify(data);

  const blob = new Blob([dataJson], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;

  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

async function getMaxPriority() {
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    const list = await getListDataGroupPost();
    return list.length;
  }
  const res = await get("/data-group-posts/get-max-priority");
  return res.data;
}

async function clearDataGroupPost() {
  const isUseLocalStorage = await getIsUseLocalStorage();

  if (!isUseLocalStorage) {
    await del("/data-group-posts/delete-all-data-group-post");
  } else {
    setListDataGroupPostInStorage([]);
  }
  setListDataGroupPostCheckedInStorage([]);
  return true;
}

/**
 *
 * @param {Array<string>} dataCheckeds
 */
async function setListDataGroupPostCheckedInStorage(dataCheckeds = []) {
  await DB_setValue(KEY_INDEXS_GROUP_CHECKED, dataCheckeds);
}

/**
 * @returns {Promise<string|null>} random ID of group or NULL if all groups are posted and reset to pending
 */
async function getRandomIdDataGroupPostChecked() {
  const objectList = await getListGroupsNeedPostInStorage();
  const listGroups = objectList?.groups || [];
  if (!listGroups.length) {
    return null;
  }

  let index = 0;
  let id = listGroups[index].id;

  const isShuffleGroup = await getIsShuffleGroupNeedPostData();
  if (isShuffleGroup) {
    index = random(0, listGroups.length - 1);
    id = listGroups[index].id;
  }

  let need = listGroups[index];

  let groups = need?.groups || [];

  const posteds = await getAllGroupPostedsInStorage();
  const set = new Set(posteds);

  groups = groups.filter((gr) => !set.has(gr.id_href));

  const isAllNotPending = groups.every((gr) => gr.status !== "pending");

  if (isAllNotPending) {
    let isPostedAll = true;
    for (const gr of listGroups) {
      if (gr.id === id) continue;

      const groupsTemp = gr?.groups || [];
      const isExistPending = groupsTemp.some(
        (gr) => gr.status === "pending" && !set.has(gr.id_href),
      );
      if (isExistPending) {
        id = gr.id;
        isPostedAll = false;
        break;
      }
    }

    if (isPostedAll) {
      //reset all -> return null
      logActions("Reset all groups need post to pending");
      return null;
    }

    return id;
  }

  return id;
}

/**
 * Get the current id of the group being posted
 * @returns {Promise<string|null>} The current id (index) or null if not set
 */
async function getCurrentIdDataGroupPost() {
  const id = await DB_getValue(KEY_INDEX_GROUP_POST);
  return id;
}

/**
 *
 * @param {string|null} index  The id of the group to set as currently being posted, or null to unset
 */
async function setCurrentIdDataGroupPost(id) {
  await DB_setValue(KEY_INDEX_GROUP_POST, id);
}

/**
 *
 * @returns Object: { id, title, groups: [ {id_href, status} ] } or null if not exist
 */
async function getCurrentGroupNeedPost() {
  const objectList = await getListGroupsNeedPostInStorage();
  let currentIdGroup = await getCurrentIdDataGroupPost();

  if (!currentIdGroup) {
    return null;
  }

  const listGroups = objectList?.groups || [];
  const need = listGroups.find((gr) => gr.id === currentIdGroup);

  return need;
}

/**
 *
 * @returns {Promise<DataGroupPost>} or null if not exist
 */
async function getCurrentDataGroupPosting() {
  try {
    const data = await DB_getValue(KEY_CURRENT_DATA_GROUP_POST);
    if (data) {
      return data;
    }

    const id = await getCurrentIdDataGroupPost();
    if (!id) {
      logError("No group checked in storage");
      return null;
    }
    const listDataGroupPosts = (await getListDataGroupPost()) || [];
    const res = listDataGroupPosts.find((d) => d.id === id);
    await setCurrentDataGroupPosting(res);
    return res;
  } catch (error) {
    logError("Error get current data group saved need post: " + error);
    throw new CustomError(
      ERROR_CODE.SELF,
      `Error get current data group saved need post: ${error?.message ?? error}`,
    );
  }
}

/**
 *
 * @param {DataGroupPost} data
 */
async function setCurrentDataGroupPosting(data) {
  await DB_setValue(KEY_CURRENT_DATA_GROUP_POST, data);
}

export {
  addDataGroupPost,
  clearDataGroupPost,
  deleteDataGroupPost,
  exportDataGroupPost,
  getCurrentDataGroupPosting,
  getCurrentGroupNeedPost,
  getCurrentIdDataGroupPost,
  getDataGroupPostRequest,
  getListDataGroupPost,
  getListDataGroupPostInStorage,
  getListDataGroupPostNeedPost,
  getListIdDataGroupPostCheckeds,
  getMaxPriority,
  getRandomIdDataGroupPostChecked,
  importDataGroupPosts,
  setCurrentDataGroupPosting,
  setCurrentIdDataGroupPost,
  setListDataGroupPostInStorage,
  upadateDataGroupPost,
  updateDataGroupPostChecked,
};
