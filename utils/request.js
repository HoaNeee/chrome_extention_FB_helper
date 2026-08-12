import { getAuthFromStorage } from "../services/auth-service.js";
import { CustomError } from "./exception.js";

const DOMAIN = "http://localhost:8080";
const BASE_URL = DOMAIN + "/api/v1";

/**
 * @typedef {Object} ApiResponse
 * @property {number} status
 * @property {Object} data
 * @property {string} message
 * @property {boolean} success
 * @property {Object} errors
 * @property {string} code
 */

/**
 *
 * @param {string} params
 * @returns {Promise<ApiResponse>}
 */
async function get(params) {
  try {
    const header = await getAuthHeader();

    const response = await fetch(BASE_URL + params, {
      method: "GET",
      headers: header,
    });

    const res = await response.json();

    console.log("get response for " + params + ":", res);

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
async function post(params, options) {
  try {
    const header = await getAuthHeader();
    header["Content-Type"] = "application/json";

    const response = await fetch(BASE_URL + params, {
      method: "POST",
      headers: header,
      body: JSON.stringify(options),
    });

    const res = await response.json();

    console.log("post response for " + params + ":", res);

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
    const header = await getAuthHeader();
    header["Content-Type"] = "application/json";

    const response = await fetch(BASE_URL + params, {
      method: "PATCH",
      headers: header,
      body: JSON.stringify(options),
    });

    const res = await response.json();

    console.log("patch response for " + params + ":", res);

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
    const header = await getAuthHeader();
    header["Content-Type"] = "application/json";

    const response = await fetch(BASE_URL + params, {
      method: "DELETE",
      headers: header,
    });

    const res = await response.json();

    console.log("del response for " + params + ":", res);

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

    const header = await getAuthHeader();

    const response = await fetch(BASE_URL + params, {
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

async function getAuthHeader() {
  const auth = await getAuthFromStorage();
  let header = {};
  if (auth) {
    header = {
      Authorization: `Bearer ${auth?.token}`,
    };
  }

  return header;
}

export { get, post, patch, del, postImage };
