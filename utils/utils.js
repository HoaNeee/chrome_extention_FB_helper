import {
  MAX_LENGTH_FILE_NAME,
  URL_SEARCH_PAGE,
} from "../contants/constant-extention.js";
import {
  getIsDeveloperModeInStorage,
  getLanguageInStorage,
} from "../services/storage-service.js";

async function sleep(duration) {
  return await new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *
 * @param {number} win rate want to win
 * @param {number} total total rate
 * @returns {boolean} true if win, false if lose
 */
function randomRateBoolean(win = 0, total = 100) {
  const randomNumber = Math.random() * total;
  return randomNumber <= win;
}

function randomNumberValue(list = []) {
  const total = list.reduce((acc, val) => acc + val, 0);
  let rand = Math.random() * total;

  let newList = [...list];

  newList = newList.sort((a, b) => b - a); //sort descending

  for (const num of newList) {
    if (rand < num) return num;
    rand -= num;
  }

  return list.length ? list[0] : 0;
}

function now() {
  return Date.now();
}

/**
 *
 * @param {string} str string to convert
 * @returns {string} convert
 * @example cvString("xin chào") => "xin chao"
 */
function cvString(str) {
  return str
    .normalize("NFD") // Tách dấu ra khỏi chữ cái (ví dụ: á -> a + ´)
    .replace(/[\u0300-\u036f]/g, "") // Xóa các ký tự dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D") // Xử lý riêng chữ đ
    .replace(/[^a-zA-Z0-9\s]/g, "") // Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ cái, số, khoảng trắng
    .replace(/\s+/g, " ") // Thay thế nhiều khoảng trắng bằng một khoảng trắng duy nhất
    .toLowerCase()
    .trim();
}

/**
 * @param {File} file
 * @returns {Promise<{name: string, base64Data: string, type: string}>}
 */
async function parseFileToObjectBase64(file) {
  const base64Data = await fileToBase64(file);
  return {
    name: file.name,
    base64Data,
    type: file.type,
  };
}

/**
 * @param {File} file
 * @returns {Promise<string>} base64 data
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 *
 * @param {{ name: string, base64Data: string, type: string }} param0
 * @returns
 */
function parseBase64ToFile({ name, base64Data, type }) {
  const blob = parseBase64ToBlob({ name, base64Data, type });

  const split = name ? name?.split(".") : [];

  let fileName = genID();
  let ext = "jpg";

  if (split.length > 1) {
    fileName = split[0];
    ext = split[split.length - 1];
  }

  if (fileName.length > MAX_LENGTH_FILE_NAME) {
    fileName = fileName.slice(0, MAX_LENGTH_FILE_NAME);
  }

  //convert name again
  const newName = fileName + "_" + genID() + "." + ext;
  const file = new File([blob], newName, { type });
  return file;
}

/**
 *
 * @param {{ name: string, base64Data: string, type: string }} objectURL
 * @returns
 */
function parseBase64ToBlob(objectURL) {
  const base64Data = objectURL.base64Data?.split(",")[1];
  if (!base64Data) return null;
  const binaryData = atob(base64Data);
  const len = binaryData.length;
  const uint8Array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    uint8Array[i] = binaryData.charCodeAt(i);
  }
  const blob = new Blob([uint8Array], { type: objectURL.type });

  return blob;
}

/**
 *
 * @param {string} url
 * @returns {Promise<Blob>}
 */
async function parseUrlToBlob(url) {
  // return new Promise((resolve, reject) => {
  //   const xhr = new XMLHttpRequest();
  //   xhr.open("GET", url, true);
  //   xhr.responseType = "blob";
  //   xhr.onload = () => {
  //     if (xhr.status === 200) {
  //       resolve(xhr.response);
  //     } else {
  //       reject(xhr.statusText);
  //     }
  //   };
  //   xhr.send();
  // });
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    logError("Error parsing URL to blob: ", error);
    throw new Error(error?.message || "Error parsing URL to blob");
  }
}

/**
 *
 * @param {Blob} blob
 * @param {string} name
 * @returns {File}
 */
function parseBlobToFile(blob, name = null) {
  let fileName = genID();
  let ext = getExtensionByMimeType(blob.type);

  if (name) {
    const split = name?.split(".");
    if (split.length > 1) {
      const origin = split[0];
      if (origin.includes("//")) {
        fileName = origin.slice(origin.lastIndexOf("/") + 1);
      } else {
        fileName = origin;
      }
    }

    if (fileName.length > MAX_LENGTH_FILE_NAME) {
      fileName = fileName.slice(0, MAX_LENGTH_FILE_NAME);
    }
  }

  fileName = fileName.replaceAll(/[-_./"]/g, "");

  //convert name again
  const newName = fileName + "_" + genID() + "." + ext;

  return new File([blob], newName, { type: blob.type });
}

function getExtensionByMimeType(mimeType) {
  const mimeTypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/svg+xml": "svg",
    "image/tiff": "tif",
    "image/vnd.microsoft.icon": "ico",
    "image/apng": "apng",
    "image/avif": "avif",
    "image/x-icon": "ico",
  };

  return mimeTypes[mimeType?.toLowerCase()] || "jpg";
}

/**
 *
 * @param {string} value string to split
 * @returns {Array<string>} array of string
 * @example getListTitle("xin chào, tôi là ai") => ["xin chào", "tôi là ai"]
 */
function getListTitle(value) {
  if (!value || !value.trim()) return [];

  return value
    .trim()
    .split(/,|\n/) //split by comma or newline
    .map((val) => cvString(val.trim()))
    .filter((val) => val.trim());
}

/**
 * get language at facebook page
 * @returns {string} language
 */

function getLanguage() {
  try {
    const html = document.documentElement;
    const lang = html.getAttribute("lang");
    return lang;
  } catch (e) {
    console.log("Error getlanguage: " + e);
  }
}

function isMatchURL(url) {
  const href = url;
  const currentHref = location.href;
  if (href !== currentHref) {
    return false;
  }
  return true;
}

function convertCorrectHref(href) {
  if (
    href &&
    typeof href === "string" &&
    href.charAt(href.length - 1) !== "/"
  ) {
    return href + "/";
  }
  return href;
}

function randomID() {
  return Math.random().toString(36).substring(2, 10);
}

function genID(length = 10) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

function genIDNumber(length = 8) {
  const pat = "0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += pat.charAt(random(0, pat.length));
  }
  if (id.charAt(0) === "0") {
    id = random(1, pat.length) + id.slice(1);
  }
  return Number(id);
}

async function logActions(...args) {
  const isDevMode = await getIsDeveloperModeInStorage();
  if (isDevMode) {
    console.log(...args);
    // console.trace();
  }
}

function logError(...args) {
  console.log(...args);
}

function shuffleArray(array = []) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    let temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

function findMatch({ data = [], key = "key", value = "" }) {
  return data.find((item) => item?.[key] === value);
}

function getIsCorrectPostURL(href) {
  if (!href || typeof href !== "string") {
    return false;
  }
  // https://www.facebook.com/groups/123456789/ or https://www.facebook.com/groups/123456789 or https://www.facebook.com/groups/namegroup
  const pattern = /^https:\/\/www\.facebook\.com\/groups\/[a-zA-Z0-9.]+\/?$/;
  return pattern.test(href);
}

let language = "vi";

async function initLanguage() {
  language = await getLanguageInStorage();
}

/**
 * @typedef {'vi'|'en'} Language
 * @param {{vi?: string, en?: string}} obj
 * @returns {string}
 */
function getTextWithLanguage({ vi = "", en = "" } = {}) {
  if (language === "vi") {
    return vi;
  }
  return en;
}

/**
 *
 * @param {string} url - url to check
 * @returns {boolean}
 */
function getIsDashboardTab(url) {
  if (!url || typeof url !== "string") {
    return false;
  }
  //chrome-extension://elehgogfekmbafjelekchplgdplbdefj/dashboard/dashboard.html#nav=....
  const pattern =
    /^chrome-extension:\/\/[a-zA-Z0-9.]+\/dashboard\/dashboard\.html([?#].*)?$/;
  const isMatch = pattern.test(url);
  return isMatch;
}

function getIsCorrectURL() {
  return true;
}

function cloneData(data) {
  if (Array.isArray(data)) {
    return data.map((item) => cloneData(item));
  }
  if (typeof data === "object") {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, cloneData(value)]),
    );
  }
  return data;
}

function checkIsFacebookUrl(url) {
  if (typeof url !== "string") return false;
  return url.includes("facebook.com");
}

function checkIsSearchPageUrl(url) {
  if (typeof url !== "string") return false;
  return url.includes(URL_SEARCH_PAGE);
}

function checkIsSearchPagePostUrl(url) {
  if (typeof url !== "string") return false;
  // https://www.facebook.com/groups/phongtrocaugiaymydinhmetri/permalink/3342506675944081/
  // https://www.facebook.com/groups/phongtrocaugiaymydinhmetri/permalink/3342506675944081
  const pattern =
    /^https:\/\/www\.facebook\.com\/groups\/[a-zA-Z0-9._-]+\/permalink\/[A-Za-z0-9_.-\\/]+(\/?)$/;
  return pattern.test(url);
}

/**
 *
 * @param {string} str - string to split
 * @param {string} key - key to split
 * @returns {Array<string>}
 */
function splitString(str, key = ",") {
  if (!str || typeof str !== "string" || !str.trim()) return [];
  return str
    .split(key)
    .map((item) => item.trim())
    .filter((item) => item.trim());
}

/**
 * @param {string} str - string to convert
 * @returns {string}
 */
function cvStringHigher(str) {
  return str
    .normalize("NFD") // Tách dấu ra khỏi chữ cái (ví dụ: á -> a + ´)
    .replace(/[̀-ͯ]/g, "") // Xóa các ký tự dấu
    .replace(/đ/g, "d") // Xử lý riêng chữ đ
    .replace(/Đ/g, "D") // Xử lý riêng chữ Đ
    .replace(/[^a-zA-Z0-9\s]/g, " ") // Loại bỏ ký tự đặc biệt, chỉ giữ lại chữ cái, số, khoảng trắng (kể cả dấu cách) thành khoảng trắng
    .replace(/\s+/g, " ") // Thay thế nhiều khoảng trắng bằng một khoảng trắng duy nhất
    .toLocaleLowerCase()
    .trim();
}

export {
  sleep,
  random,
  now,
  cvString,
  fileToBase64,
  parseBase64ToBlob,
  getListTitle,
  getLanguage,
  isMatchURL,
  convertCorrectHref,
  randomID,
  findMatch,
  parseBase64ToFile,
  shuffleArray,
  logError,
  logActions,
  getIsCorrectPostURL,
  initLanguage,
  getTextWithLanguage,
  getIsDashboardTab,
  getIsCorrectURL,
  randomRateBoolean,
  parseUrlToBlob,
  parseBlobToFile,
  genID,
  parseFileToObjectBase64,
  cloneData,
  genIDNumber,
  checkIsFacebookUrl,
  checkIsSearchPageUrl,
  checkIsSearchPagePostUrl,
  splitString,
  cvStringHigher,
  randomNumberValue,
};
