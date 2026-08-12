import { DEFAULT_DEVICE_ID } from "../contants/constant-extention.js";
import {
  KEY_DEVICE,
  KEY_USED_TO_LOGINED_THIS_DEVICE,
} from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { post } from "../utils/request.js";
import { genID, random } from "../utils/utils.js";

/**
 * @typedef {Object} Device
 * @property {string} id
 * @property {string} device_name
 * @property {string} device_type
 */

async function getDeviceId() {
  const device = await getDeviceFromStorage();
  if (device) {
    return device.id;
  }
  const newDevice = createNewDevice();
  await createNewDeviceAndForceSave(newDevice);
  return newDevice.id;
}

async function getUsedToLoginedThisDevice() {
  return (await DB_getValue(KEY_USED_TO_LOGINED_THIS_DEVICE)) || false;
}

async function setUsedToLoginedThisDevice(b) {
  await DB_setValue(KEY_USED_TO_LOGINED_THIS_DEVICE, b);
}

/**
 * Get device from storage
 * @returns {Promise<Device>}
 */
async function getDeviceFromStorage() {
  try {
    const device = await DB_getValue(KEY_DEVICE);
    return device || null;
  } catch (error) {
    throw error;
  }
}

/**
 * Set device to storage
 * @param {Device} device
 */
async function setDeviceInStorage(device) {
  try {
    const existed = await getDeviceFromStorage();
    if (existed === undefined || existed === null) {
      await DB_setValue(KEY_DEVICE, device);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Create new device
 * @returns {Device}
 */
function createNewDevice() {
  return {
    id: genID(8),
    device_name: "New Device " + random(100, 999),
    device_type: getDeviceTypeByBrowser(),
  };
}

async function createNewDeviceAndForceSave() {
  const device = createNewDevice();
  await DB_setValue(KEY_DEVICE, device);
  return device;
}

async function createNewDeviceRequest(device) {
  try {
    const res = await post("/devices", device);
    return res?.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get device type by browser
 * @returns {string}
 */
function getDeviceTypeByBrowser() {
  if (typeof window !== "undefined") {
    const browser = window?.browser;
    if (browser?.coccoc) {
      return "Coc Coc";
    }
    if (browser?.chrome) {
      return "Chrome";
    } else if (browser?.firefox) {
      return "Firefox";
    } else if (browser?.safari) {
      return "Safari";
    } else if (browser?.edge) {
      return "Edge";
    }
  }
  return "Chrome";
}

export {
  getDeviceId,
  getUsedToLoginedThisDevice,
  setUsedToLoginedThisDevice,
  getDeviceFromStorage,
  setDeviceInStorage,
  createNewDevice,
  createNewDeviceAndForceSave,
  getDeviceTypeByBrowser,
  createNewDeviceRequest,
};
