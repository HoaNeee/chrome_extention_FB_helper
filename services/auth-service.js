import { KEY_AUTH, KEY_IS_PREMIUM } from "../contants/contants.js";
import {
  DB_deleteValue,
  DB_getValue,
  DB_setValue,
} from "../utils/api-helper.js";
import { get, post } from "../utils/request.js";
import {
  getIsUseLocalStorage,
  setIsUseLocalStorage,
} from "./storage-global-service.js";

/**
 * @typedef {Object} Auth
 * @property {string} username
 * @property {string} token
 * @property {string} user_id
 * @property {string} role
 * @property {string} status
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} username
 * @property {string} role
 * @property {string} status
 * @property {string} email
 * @property {string} created_at
 * @property {string} avatar
 */

async function loginService(username, password) {
  try {
    const res = await post("/auth/login", {
      username,
      password,
    });

    return res.data;
  } catch (error) {
    await removeAuthFromStorage();
    await setIsUseLocalStorage(true);
    throw error;
  }
}

/**
 *
 * @param {Auth} auth
 */
async function setAuthInStorage(auth) {
  await DB_setValue(KEY_AUTH, auth);
}

/**
 * Get auth from storage
 * @returns {Promise<Auth|null>}
 */
async function getAuthFromStorage() {
  return await DB_getValue(KEY_AUTH);
}

async function removeAuthFromStorage() {
  await DB_deleteValue(KEY_AUTH);
}

async function isAuthentication() {
  const auth = await getAuthFromStorage();
  if (!auth) {
    return false;
  }
  const isUseLocalStorage = await getIsUseLocalStorage();
  if (isUseLocalStorage) {
    return false;
  }
  return true;
}

async function logoutService() {
  try {
    await removeAuthFromStorage();
    await setIsUseLocalStorage(true);
    location.reload();
  } catch (error) {
    throw error;
  }
}

async function getProfile() {
  try {
    const res = await get("/users/me");
    return res.data;
  } catch (error) {
    await removeAuthFromStorage();
    await setIsUseLocalStorage(true);
    throw error;
  }
}

async function getProfileService() {
  try {
    const isAuthen = await isAuthentication();
    if (!isAuthen) {
      return null;
    }
    return await getProfile();
  } catch (error) {
    throw error;
  }
}

/**
 * @returns {Promise<boolean>} The setting for whether the extension is in premium mode, defaulting to false if not set
 */
async function getPremiumService() {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      const isPremium = await DB_getValue(KEY_IS_PREMIUM);
      return isPremium;
    }

    const res = await get("/users/is-premium");
    return !!res.data;
  } catch (error) {
    logError(`Error getPremiumInStorage`, error);
    return false;
  }
}

async function setPremiumService(isPremium) {
  try {
    const isUseLocalStorage = await getIsUseLocalStorage();
    if (isUseLocalStorage) {
      await DB_setValue(KEY_IS_PREMIUM, isPremium);
      return;
    }

    // await post("/users/set-premium", { isPremium });
  } catch (error) {
    logError(`Error setPremiumService`, error);
  }
}

async function checkUser() {
  try {
    const res = await get("/users/check");
    return res?.data;
  } catch (error) {
    throw error;
  }
}

export {
  loginService,
  getAuthFromStorage,
  removeAuthFromStorage,
  isAuthentication,
  getProfile,
  logoutService,
  setAuthInStorage,
  getProfileService,
  getPremiumService,
  setPremiumService,
  checkUser,
};
