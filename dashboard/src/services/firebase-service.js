import { logError } from "../../../utils/utils.js";

const googleFirebaseService = {
  async getIsEnableTool() {
    try {
      const response = await fetch(
        `https://firestore.googleapis.com/v1/projects/tool-fb-helper/databases/(default)/documents/app-settings/status-tool-setting`,
      );
      const data = await response.json();
      return data.fields.is_enable_tool.booleanValue;
    } catch (error) {
      logError("Error at getIsEnableTool", error);
      return false;
    }
  },

  async checkOrRegisterDevice(deviceId) {
    try {
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
          return dataCreate.fields.is_active.booleanValue;
        }
        throw error;
      }

      return data.fields.is_active.booleanValue;
    } catch (error) {
      logError("Error at checkOrRegisterDevice", error);
      return false;
    }
  },

  async checkOrRegisterIP(ip) {
    try {
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
          return dataCreate.fields.is_active.booleanValue;
        }
        throw error;
      }

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
};

export { googleFirebaseService };
