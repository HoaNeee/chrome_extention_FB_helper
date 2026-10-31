import { logError } from "../utils/utils.js";

export const ipAddressService = {
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
