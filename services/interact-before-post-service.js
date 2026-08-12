import { KEY_INTERACT_BEFORE_POST } from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { get, patch } from "../utils/request.js";
import { getIsUseLocalStorage } from "./storage-global-service.js";

/**
 * @typedef {Object} InteractBeforePost
 * @property {number} max_post_interact_per_batch
 */

/**
 * @returns {Promise<number>} The max post interact, defaulting to 0 if not set
 */
async function getMaxPostInteractInStorage() {
  return (await DB_getValue(KEY_INTERACT_BEFORE_POST.MAX_POST_INTERACT)) || 1;
}

/**
 * @param {number} maxPostInteract The max post interact
 */
async function setMaxPostInteractInStorage(maxPostInteract) {
  await DB_setValue(
    KEY_INTERACT_BEFORE_POST.MAX_POST_INTERACT,
    maxPostInteract,
  );
}

async function getMaxPostInteractService() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      return await getMaxPostInteractInStorage();
    }

    const res = await get("/interact-before-posts/max-post-interact-per-batch");
    return res.data;
  } catch (error) {
    throw error;
  }
}

async function setMaxPostInteractService(max) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await setMaxPostInteractInStorage(max);
      return true;
    }

    const res = await patch("/interact-before-posts", {
      max_post_interact_per_batch: max,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<InteractBeforePost>}
 */
async function getAllMetadataInteractBeforePost() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const max = await getMaxPostInteractInStorage();
      return {
        max_post_interact_per_batch: max,
      };
    }

    const res = await get("/interact-before-posts");
    return res.data;
  } catch (error) {
    throw error;
  }
}

export {
  getMaxPostInteractService,
  setMaxPostInteractService,
  getAllMetadataInteractBeforePost,
};
