import { KEY_PLATFORM } from "../contants/constant-extention.js";
import { getAuthFromStorage } from "../services/auth-service.js";
import { getDeviceId } from "../services/device-service.js";
import { systemSettingService } from "../services/system-setting-service.js";
import { DB_getValue, DB_setValue } from "./api-helper.js";
import { CustomError } from "./exception.js";
import { logActions, logError } from "./utils.js";

/**
 * @typedef {Object} ApiResponse
 * @property {number} status
 * @property {Object} data
 * @property {string} message
 * @property {boolean} success
 * @property {Object} errors
 * @property {string} code
 */

async function getCachedRequest(key) {
	try {
		const res = await DB_getValue(key);
		return res;
	} catch (error) {
		logError(error);
		return null;
	}
}

async function setCachedRequest(key, value) {
	try {
		await DB_setValue(key, value);
	} catch (error) {
		logError(error);
	}
}

/**
 *
 * @param {string} params
 * @param {boolean} cached
 * @param {number} timeCached - minutes
 * @returns {Promise<ApiResponse>}
 */
async function get(params, cached = false, timeCached = 10) {
	try {
		const domain =
			(await systemSettingService.getBaseServerDomain()) + "/api/v1";

		const api = domain + params;

		const oneMinutes = 1000 * 60;
		if (cached) {
			const cachedRequest = await getCachedRequest(api);
			const now = Date.now();
			if (cachedRequest && Number(cachedRequest.time) > now) {
				logActions(
					"cached response for " +
						params +
						`: (expired at ${new Date(cachedRequest.time).toLocaleString()})`,
					cachedRequest.value,
				);
				return cachedRequest.value;
			}
		}

		const header = await getHeader();

		const response = await fetch(api, {
			method: "GET",
			headers: header,
		});

		const res = await response.json();

		logActions("get response for " + params + ":", res);

		if (!res?.success) {
			throw new CustomError(res?.code, res?.message);
		}

		if (cached) {
			setCachedRequest(api, {
				value: res,
				time: Date.now() + Number(timeCached) * oneMinutes,
			});
		}

		return res;
	} catch (error) {
		throw error;
	}
}

/**
 * @param {string} params
 * @returns {Promise<ApiResponse>}
 */
async function post(params, options) {
	try {
		const header = await getHeader();

		const domain =
			(await systemSettingService.getBaseServerDomain()) + "/api/v1";

		const response = await fetch(domain + params, {
			method: "POST",
			headers: header,
			body: JSON.stringify(options),
		});

		const res = await response.json();

		if (response.ok && response.status === 204) {
			const dataTemp = {
				status: 204,
				data: null,
				message: "ok",
			};
			logActions("post response for " + params + ": No content", dataTemp);
			return dataTemp;
		}

		logActions("post response for " + params + ":", res);

		if (!res?.success) {
			throw new CustomError(res?.code, res?.message);
		}
		return res;
	} catch (error) {
		throw error;
	}
}

/**
 * @param {string} params
 * @returns {Promise<ApiResponse>}
 */
async function patch(params, options) {
	try {
		const header = await getHeader();

		const domain =
			(await systemSettingService.getBaseServerDomain()) + "/api/v1";

		const response = await fetch(domain + params, {
			method: "PATCH",
			headers: header,
			body: JSON.stringify(options),
		});

		if (response.ok && response.status === 204) {
			const dataTemp = {
				status: 204,
				data: null,
				message: "ok",
			};
			logActions("patch response for " + params + ": No content", dataTemp);
			return dataTemp;
		}

		const res = await response.json();

		logActions("patch response for " + params + ":", res);

		if (!res?.success) {
			throw new CustomError(res?.code, res?.message);
		}
		return res;
	} catch (error) {
		throw error;
	}
}

/**
 * @param {string} params
 * @returns {Promise<ApiResponse>}
 */
async function del(params) {
	try {
		const header = await getHeader();

		const domain =
			(await systemSettingService.getBaseServerDomain()) + "/api/v1";

		const response = await fetch(domain + params, {
			method: "DELETE",
			headers: header,
		});

		if (response.ok && response.status === 204) {
			const dataTemp = {
				status: 204,
				data: null,
				message: "ok",
			};
			logActions("del response for " + params + ": No content", dataTemp);
			return dataTemp;
		}

		const res = await response.json();

		logActions("del response for " + params + ":", res);

		if (!res?.success) {
			throw new CustomError(res?.code, res?.message);
		}
		return res;
	} catch (error) {
		throw error;
	}
}

/**
 * @param {string} params
 * @param {Array<File>} files
 * @param {boolean} isMultiple
 * @returns {Promise<ApiResponse>}
 */
async function postImage({ params, files, isMultiple = false }) {
	try {
		const formData = new FormData();

		if (isMultiple) {
			files.forEach((file) => {
				formData.append("files", file);
			});
		} else {
			formData.append("file", files);
		}

		const header = await getHeader();
		delete header["Content-Type"];

		const domain =
			(await systemSettingService.getBaseServerDomain()) + "/api/v1";

		const response = await fetch(domain + params, {
			method: "POST",
			headers: header,
			body: formData,
		});

		const res = await response.json();

		if (!res?.success) {
			throw new CustomError(res?.code, res?.message);
		}
		return res;
	} catch (error) {
		throw error;
	}
}

async function getHeader() {
	let header = {
		"Content-Type": "application/json",
		"X-Request-Platform": KEY_PLATFORM,
	};

	const auth = await getAuthFromStorage();

	if (auth) {
		header["Authorization"] = `Bearer ${auth?.token}`;
	}

	const deviceId = await getDeviceId();
	if (deviceId) {
		header["X-Device-Id"] = deviceId;
	}

	return header;
}

export { get, post, patch, del, postImage };
