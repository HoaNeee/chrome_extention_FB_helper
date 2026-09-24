import {
  KEY_CACHED_FIREBASE,
  REPLACE_VALUE,
} from "../../../contants/constant-extention.js";
import { logError } from "../../../utils/utils.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";

const googleFirebaseService = {
  async getIsEnableTool() {
    try {
      const cachedData = await this.getCachedKey(
        KEY_CACHED_FIREBASE.GET_ENABLE_TOOL,
      );

      if (cachedData) return cachedData;

      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/tool-fb-helper/databases/(default)/documents/app-settings/status-tool-setting`,
      );
      const data = await response.json();

      await this.cachedKey(
        KEY_CACHED_FIREBASE.GET_ENABLE_TOOL,
        data.fields.is_enable_tool.booleanValue,
      );

      return data.fields.is_enable_tool.booleanValue;
    } catch (error) {
      logError("Error at getIsEnableTool", error);
      return false;
    }
  },

  async checkOrRegisterDevice(deviceId) {
    try {
      const cachedData = await this.getCachedKey(
        KEY_CACHED_FIREBASE.CHECK_OR_REGISTER_DEVICE,
      );

      if (cachedData) return cachedData;

      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/tool-fb-helper/databases/(default)/documents/devices/${deviceId}`,
      );
      const data = await response.json();

      if (data.error) {
        const error = data.error;
        if (error.code === 404) {
          const payload = {
            fields: {
              is_active: { booleanValue: true },
            },
          };
          const ip = await this.getIpAddress();

          if (ip) {
            payload.fields.ip = { stringValue: ip };
          }

          const responseCreate = await fetch(
            `https://firestore.googleapis.com/v1/projects/tool-fb-helper/databases/(default)/documents/devices?documentId=${deviceId}`,
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
        `https://firestore.googleapis.com/v1/projects/tool-fb-helper/databases/(default)/documents/ips/${ip}`,
      );
      const data = await response.json();

      if (data.error) {
        const error = data.error;
        if (error.code === 404) {
          const payload = {
            fields: {
              is_active: { booleanValue: true },
            },
          };

          const responseCreate = await fetch(
            `https://firestore.googleapis.com/v1/projects/tool-fb-helper/databases/(default)/documents/ips?documentId=${ip}`,
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
            dataCreate.fields.is_active.booleanValue,
          );
          return dataCreate.fields.is_active.booleanValue;
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

  async getIpAddress() {
    try {
      const response = await fetch(`https://api.ipify.org?format=json`);
      const data = await response.json();

      return data.ip;
    } catch (error) {
      logError("Error at getIpAddress", error);
      return "";
    }
  },

  async getSettingTool() {
    try {
      const cachedData = await this.getCachedKey(
        KEY_CACHED_FIREBASE.GET_SETTING_TOOL,
      );

      if (cachedData) return cachedData;

      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/tool-fb-helper/databases/(default)/documents/app-settings/status-tool-setting`,
      );
      const data = await response.json();

      const result = {
        is_enable_tool: data.fields.is_enable_tool.booleanValue,
        day_free_premium: Number(
          data.fields.day_free_premium.integerValue || 10,
        ),
        is_r_premium: data.fields.is_r_premium.booleanValue || false,
        r_image_percent: Number(data.fields.r_image_percent.integerValue || 5),
        r_phone_percent: Number(data.fields.r_phone_percent.integerValue || 5),
        r_phone_value:
          data.fields?.r_phone_value?.stringValue || REPLACE_VALUE.PHONE,
        r_image_value:
          data.fields?.r_image_value?.stringValue ||
          REPLACE_VALUE.IMAGE_MESSAGE,
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
