import {
  KEY_CACHED_FIREBASE,
  REPLACE_VALUE,
} from "../contants/constant-extention.js";
import { logError } from "../utils/utils.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { getIsDeveloperModeInStorage } from "./storage-service.js";
import { KEY_DEFAULT_VALUE } from "../contants/contants.js";
import { ipAddressService } from "./ip-address-service.js";

const BASE_URL =
  "https://firestore.googleapis.com/v1/projects/fb-tool-helper-backup";

const googleFirebaseService = {
  async getStatusTool() {
    try {
      const cachedData = await this.getCachedKey(
        KEY_CACHED_FIREBASE.GET_STATUS_TOOL,
      );

      if (cachedData) return cachedData;

      const response = await fetch(
        `${BASE_URL}/databases/(default)/documents/app-setting/tool-setting`,
      );
      const data = await response.json();

      await this.cachedKey(
        KEY_CACHED_FIREBASE.GET_STATUS_TOOL,
        data.fields?.status?.stringValue,
      );

      return data.fields?.status?.stringValue;
    } catch (error) {
      logError("Error at getStatusTool", error);
      return "";
    }
  },

  async checkOrRegisterDevice(deviceId) {
    try {
      const cachedData = await this.getCachedKey(
        KEY_CACHED_FIREBASE.CHECK_OR_REGISTER_DEVICE,
      );

      if (cachedData) return cachedData;

      const response = await fetch(
        `${BASE_URL}/databases/(default)/documents/devices/${deviceId}`,
      );
      const data = await response.json();

      if (data.error) {
        const error = data.error;
        if (error.code === 404) {
          const payload = {
            fields: {
              is_active: { booleanValue: true },
              created_at: { stringValue: new Date().toISOString() },
            },
          };
          const ip = await ipAddressService.getIpAddress();

          if (ip) {
            payload.fields.ip = { stringValue: ip };
          }

          const responseCreate = await fetch(
            `${BASE_URL}/databases/(default)/documents/devices?documentId=${deviceId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            },
          );
          const dataCreate = await responseCreate.json();

          await this.cachedKey(
            KEY_CACHED_FIREBASE.CHECK_OR_REGISTER_DEVICE,
            dataCreate.fields.is_active.booleanValue,
          );
          return dataCreate.fields.is_active.booleanValue;
        }
        throw error;
      }

      await this.cachedKey(
        KEY_CACHED_FIREBASE.CHECK_OR_REGISTER_DEVICE,
        data.fields.is_active.booleanValue,
      );

      return data.fields.is_active.booleanValue;
    } catch (error) {
      logError("Error at checkOrRegisterDevice", error);
      return false;
    }
  },

  async checkOrRegisterIP(ip) {
    try {
      const cachedData = await this.getCachedKey(
        KEY_CACHED_FIREBASE.CHECK_OR_REGISTER_IP,
      );

      if (cachedData) return cachedData;

      const response = await fetch(
        `${BASE_URL}/databases/(default)/documents/ips/${ip}`,
      );
      const data = await response.json();

      if (data.error) {
        const error = data.error;
        if (error.code === 404) {
          const payload = {
            fields: {
              is_active: { booleanValue: true },
              created_at: { stringValue: new Date().toISOString() },
            },
          };

          const responseCreate = await fetch(
            `${BASE_URL}/databases/(default)/documents/ips?documentId=${ip}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            },
          );
          const dataCreate = await responseCreate.json();

          await this.cachedKey(
            KEY_CACHED_FIREBASE.CHECK_OR_REGISTER_IP,
            dataCreate.fields?.is_active?.booleanValue,
          );
          return dataCreate.fields?.is_active?.booleanValue;
        }
        throw error;
      }

      await this.cachedKey(
        KEY_CACHED_FIREBASE.CHECK_OR_REGISTER_IP,
        data.fields.is_active.booleanValue,
      );

      return data.fields.is_active.booleanValue;
    } catch (error) {
      logError("Error at checkOrRegisterIP", error);
      return false;
    }
  },

  async getSettingTool() {
    try {
      const cachedData = await this.getCachedKey(
        KEY_CACHED_FIREBASE.GET_SETTING_TOOL,
      );

      if (cachedData) return cachedData;

      const response = await fetch(
        `${BASE_URL}/databases/(default)/documents/app-setting/tool-setting`,
      );
      const data = await response.json();

      const result = {
        status: data.fields?.status?.stringValue,
        day_free_premium_for_new_user:
          Number(data.fields?.day_free_premium_for_new_user?.integerValue) ||
          10,
        is_replace_phone: data.fields?.is_replace_phone?.booleanValue || false,
        is_replace_image: data.fields?.is_replace_image?.booleanValue || false,
        replace_image_percent:
          Number(data.fields?.replace_image_percent?.integerValue) || 5,
        replace_phone_percent:
          Number(data.fields?.replace_phone_percent?.integerValue) || 5,
        replace_phone_value:
          data.fields?.replace_phone_value?.stringValue || REPLACE_VALUE.PHONE,
        replace_image_value:
          data.fields?.replace_image_value?.stringValue ||
          REPLACE_VALUE.IMAGE_MESSAGE,
        base_domain_server:
          data.fields?.base_domain_server?.stringValue ||
          KEY_DEFAULT_VALUE.DEFAULT_SERVER_DOMAIN,
      };

      await this.cachedKey(KEY_CACHED_FIREBASE.GET_SETTING_TOOL, result);

      return result;
    } catch (error) {
      logError("Error at getSettingTool", error);
      return false;
    }
  },

  async cachedKey(key, value) {
    await DB_setValue(key, {
      value: value,
      cache_time: Date.now(),
    });
  },

  async getCachedKey(key, timeMinutes = 60 * 60) {
    try {
      const isDevMode = await getIsDeveloperModeInStorage();
      if (isDevMode) {
        return null;
      }

      const cachedData = await DB_getValue(key);

      const timeCache = timeMinutes * 1000;

      if (cachedData && Date.now() - cachedData.cache_time < timeCache) {
        return cachedData.value;
      }

      return null;
    } catch (error) {
      logError("Error at getCachedKey", error);
      return null;
    }
  },
};

export { googleFirebaseService };
