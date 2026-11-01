import {
	KEY_USE_SERVER_NAME,
	REPLACE_VALUE,
	SERVER_NAME,
} from "../contants/constant-extention.js";
import {
	KEY_BASE_SERVER_DOMAIN,
	KEY_DEFAULT_VALUE,
} from "../contants/contants.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { get } from "../utils/request.js";
import { logActions, logError } from "../utils/utils.js";
import { googleFirebaseService } from "./firebase-service.js";

/**
 * @typedef {import('../types/types.js').SystemSetting} SystemSetting
 * @typedef {import('../types/types.js').SystemToolSetting} SystemToolSetting
 * @typedef {import('../types/types.js').SystemPostSetting} SystemPostSetting
 * @typedef {import('../types/types.js').SystemCommentWalkSetting} SystemCommentWalkSetting
 */

export const systemSettingService = {
	/**
	 * @returns {Promise<SystemSetting>}
	 */
	async getSystemSetting() {
		try {
			const serverNameObject = await this.getUseServerNameObject();
			if (serverNameObject.firebase) {
				return null;
			}

			const res = await get("/system-setting", true);
			return res?.data;
		} catch (error) {
			logError("Error at getSystemSetting: ", error);
		}
	},

	/**
	 * @returns {Promise<SystemSetting|SystemToolSetting|SystemPostSetting|SystemCommentWalkSetting>}
	 */
	async getAllSystemSetting() {
		try {
			const useServerNameObject = await this.getUseServerNameObject();
			let setting = null;
			if (useServerNameObject.firebase) {
				setting = await googleFirebaseService.getSettingTool();
			}
			if (useServerNameObject.main) {
				const [systemSetting, toolSetting, postSetting, commentWalkSetting] =
					await Promise.all([
						this.getSystemSetting(),
						this.getSystemToolSetting(),
						this.getSystemPostSetting(),
						this.getSystemCommentWalkSetting(),
					]);
				setting = {
					...systemSetting,
					...toolSetting,
					...postSetting,
					...commentWalkSetting,
				};
			}
			return setting;
		} catch (error) {
			logError("Error at getAllSystemSetting: ", error);
		}
	},

	/**
	 * @returns {Promise<SystemToolSetting>}
	 */
	async getSystemToolSetting() {
		const defaultRes = {
			day_free_premium: 5,
			break_per_batch_percent: 10,
		};

		try {
			const serverNameObject = await this.getUseServerNameObject();
			if (serverNameObject.firebase) {
				return defaultRes;
			}

			const res = await get("/system-setting/tool", true);
			return res?.data;
		} catch (error) {
			logError("Error at getSystemToolSetting", error);
			return defaultRes;
		}
	},

	/**
	 * @returns {Promise<SystemPostSetting>}
	 */
	async getSystemPostSetting() {
		const defaultRes = {
			is_replace_image: true,
			is_replace_phone: true,
			percent_replace_image: 5,
			percent_replace_phone: 5,
			replace_phone_value: REPLACE_VALUE.PHONE,
			replace_image_value: REPLACE_VALUE.IMAGE_MESSAGE,
			url_get_list_groups: KEY_DEFAULT_VALUE.DEFAULT_URL_GET_LIST_GROUPS,
			pattern_url_post_in_groups:
				KEY_DEFAULT_VALUE.DEFAULT_PATTERN_URL_POST_IN_GROUPS,
			comment_after_post_percent: 20,
			interact_before_post_percent: 20,
		};

		try {
			const serverNameObject = await this.getUseServerNameObject();
			if (serverNameObject.firebase) {
				return defaultRes;
			}

			const res = await get("/system-setting/post", true);
			return res.data;
		} catch (error) {
			logError("Error at getSystemPostSetting", error);
			return defaultRes;
		}
	},

	/**
	 * @returns {Promise<SystemCommentWalkSetting>}
	 */
	async getSystemCommentWalkSetting() {
		const defaultRes = {
			pattern_url_post_comment_walks:
				KEY_DEFAULT_VALUE.DEFAULT_PATTERN_URL_POST_COMMENT_WALKS,
			url_comment_walk_searches: KEY_DEFAULT_VALUE.DEFAULT_URL_COMMENT_WALKS,
			url_comment_walk_homes: KEY_DEFAULT_VALUE.DEFAULT_URL_COMMENT_WALK_HOMES,
		};

		try {
			const serverNameObject = await this.getUseServerNameObject();
			if (serverNameObject.firebase) {
				return defaultRes;
			}

			const res = await get("/system-setting/comment-walk", true);
			return res?.data;
		} catch (error) {
			logError("Error at getSystemCommentWalkSetting", error);
			return defaultRes;
		}
	},

	//simulate .env
	async getBaseDomainFromFirebase() {
		try {
			const settingTool = await googleFirebaseService.getSettingTool();
			return (
				settingTool?.base_domain_server ||
				KEY_DEFAULT_VALUE.DEFAULT_SERVER_DOMAIN
			);
		} catch (error) {
			logError("Error at getBaseDomainFromFirebase", error);
			return KEY_DEFAULT_VALUE.DEFAULT_SERVER_DOMAIN;
		}
	},

	async checkServerMainIsLive() {
		try {
			const domain = await this.getBaseDomainFromFirebase();
			await fetch(`${domain}/api/v1/system-setting`);
			await this.setUseServerName(SERVER_NAME.MAIN);
			logActions("Use server main");
		} catch {
			logActions("Use server firebase");
			await this.setUseServerName(SERVER_NAME.FIREBASE);
		}
	},

	async getUseServerNameObject() {
		try {
			const useServerName = await this.getUseServerName();
			return {
				main: useServerName === SERVER_NAME.MAIN,
				firebase: useServerName === SERVER_NAME.FIREBASE,
			};
		} catch (error) {
			logError("Error at getUseServerNameObject", error);
			return {
				firebase: true,
				main: false,
			};
		}
	},

	async getUseServerName() {
		return await DB_getValue(KEY_USE_SERVER_NAME);
	},

	async setUseServerName(useServerName) {
		await DB_setValue(KEY_USE_SERVER_NAME, useServerName);
	},

	async setBaseServerDomain(baseServerDomain) {
		await DB_setValue(KEY_BASE_SERVER_DOMAIN, baseServerDomain);
	},

	async getBaseServerDomain() {
		return await DB_getValue(KEY_BASE_SERVER_DOMAIN);
	},
};
