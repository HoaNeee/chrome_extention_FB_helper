import { KEY_IS_USE_LOCAL_STORAGE } from "../contants/constant-extention.js";
import { KEY_IS_DARK_THEME } from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { logError } from "../utils/utils.js";

let isUseLocalStorage = null;

async function getIsUseLocalStorage() {
  return await DB_getValue(KEY_IS_USE_LOCAL_STORAGE, true);
}

async function setIsUseLocalStorage(b = false) {
  isUseLocalStorage = b;
  await DB_setValue(KEY_IS_USE_LOCAL_STORAGE, b);
}

async function initIsUseLocalStorage() {
  const is = await DB_getValue(KEY_IS_USE_LOCAL_STORAGE);
  if (is === null || is === undefined) {
    isUseLocalStorage = true;
    await setIsUseLocalStorage(true);
  } else {
    isUseLocalStorage = !!is;
  }
}

const map = new Map();

async function initialTheme() {
  try {
    const isDark = (await DB_getValue(KEY_IS_DARK_THEME)) || false;
    if (isDark) {
      map.set("theme", "dark");
    } else {
      map.set("theme", "light");
    }
  } catch (error) {
    logError("Error initialTheme: " + error);
  }
}

async function setTheme(isDark) {
  try {
    map.set("theme", isDark ? "dark" : "light");
    await DB_setValue(KEY_IS_DARK_THEME, isDark);
  } catch (error) {
    logError("Error setTheme: " + error);
  }
}

function getTheme() {
  return map.get("theme") || "light";
}

export {
  getIsUseLocalStorage,
  setIsUseLocalStorage,
  initIsUseLocalStorage,
  initialTheme,
  getTheme,
  setTheme,
};
