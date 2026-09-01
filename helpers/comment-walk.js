import CommentWalk from "../class/CommentWalk.js";
import { KEY_IMPORT_EXPORT_TYPE } from "../contants/constant-extention.js";
import { DEFAULT_KEY_FILTER_RECENT_POST } from "../contants/contants.js";
import { showNotify } from "../dashboard/src/draw_element/notify.js";
import { addLog } from "../dashboard/src/draw_element/panel-log.js";
import { openNewTabHelper } from "../services/automation-service.js";
import { commentWalkService } from "../services/comment-walk-service.js";
import { getIsUseLocalStorage } from "../services/storage-global-service.js";
import { handleErrorHelper } from "../utils/exception.js";
import {
	cloneData,
	getTextWithLanguage,
	logError,
	parseBlobToFile,
	parseFileToObjectBase64,
	parseUrlToBlob,
} from "../utils/utils.js";

const commentWalkHelper = {
	async goToPageSearch(query) {
		try {
			const urlTest = `https://www.facebook.com/search/top?q=${encodeURIComponent(query)}&filters=${DEFAULT_KEY_FILTER_RECENT_POST}`;
			await openNewTabHelper(urlTest, async (tabId) => {
				await commentWalkService.setTabIdCommentWalk(tabId);
			});
		} catch (error) {
			logError("goToPageSearch", error);
		}
	},

	async gotoPageHome() {
		try {
			const urlTest = `https://www.facebook.com/`;
			await openNewTabHelper(urlTest, async (tabId) => {
				await commentWalkService.setTabIdCommentWalk(tabId);
			});
		} catch (error) {
			logError("gotoPageHome", error);
		}
	},

	/**
	 * @param {CommentWalk | CommentWalk[]} data
	 */
	async exportDataCommentWalk(data) {
		try {
			let newData = cloneData(data);

			let name = "";

			if (Array.isArray(data)) {
				let time = new Date()
					.toLocaleString("vi-VN")
					.replace(/[,:\\/\s]/g, "_");
				name = `list_comment_walk_${time}.json`;
			} else {
				name = `comment_walk_for_${data?.name || data.id}.json`;
			}

			const isUseLocalStorage = await getIsUseLocalStorage();
			if (!isUseLocalStorage) {
				if (Array.isArray(newData)) {
					newData = await Promise.all(
						newData.map(async (item) => {
							if (item.files) {
								item.files = await Promise.all(
									item.files.map(async (file) => {
										const blob = await parseUrlToBlob(file);
										const fileParse = parseBlobToFile(blob, file);
										const object = await parseFileToObjectBase64(fileParse);
										return object;
									}),
								);
							}
							return item;
						}),
					);
				} else {
					if (newData.files) {
						newData.files = await Promise.all(
							newData.files.map(async (file) => {
								const blob = await parseUrlToBlob(file);
								const fileParse = parseBlobToFile(blob, file);
								const object = await parseFileToObjectBase64(fileParse);
								return object;
							}),
						);
					}
				}
			}

			if (Array.isArray(newData)) {
				newData = newData.map((item) => ({
					...item,
					[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE]:
						KEY_IMPORT_EXPORT_TYPE.COMMENT_WALK,
				}));
			} else {
				newData[KEY_IMPORT_EXPORT_TYPE.KEY_FIELD_OBJECT_TYPE] =
					KEY_IMPORT_EXPORT_TYPE.COMMENT_WALK;
			}

			const newDataJson = JSON.stringify(newData);

			const blob = new Blob([newDataJson], { type: "application/json" });
			const url = URL.createObjectURL(blob);

			const a = document.createElement("a");
			a.href = url;

			a.download = name;
			a.click();

			URL.revokeObjectURL(url);

			if (Array.isArray(newData)) {
				addLog({
					vi: `Bạn vừa xuất ${newData.length} dữ liệu bình luận dạo vào file JSON`,
					en: `You just exported ${newData.length} data comment walk to a JSON file`,
				});
			}
		} catch (error) {
			logError("exportDataCommentWalk", error);
		}
	},

	async importDataCommentWalk(cb = () => {}) {
		try {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".json";
			input.click();
			input.addEventListener("change", async (event) => {
				try {
					const file = event.target.files[0];
					const reader = new FileReader();
					reader.onload = async function (e) {
						try {
							const content = e.target.result;
							const data = JSON.parse(content);
							const listDataGroupImported =
								await commentWalkService.importDataCommentWalk(data);
							if (listDataGroupImported.length) {
								cb?.(listDataGroupImported);
								showNotify({
									message: getTextWithLanguage({
										vi: "Nhập dữ liệu bình luận dạo thành công",
										en: "Import data comment walk successfully",
									}),
									type: "success",
								});
								addLog({
									vi: `Bạn vừa thêm ${listDataGroupImported.length} bình luận dạo vào danh sách bình luận dạo từ file`,
									en: `You just added ${listDataGroupImported.length} comment walk to the list of comment walk from importing a file`,
								});
							}
						} catch (error) {
							handleErrorHelper({
								name: "ImportDataCommentWalk",
								error,
							});
						}
					};
					reader.readAsText(file);
				} catch (error) {
					logError("Error at importDataCommentWalk: ", error);
				}
			});
		} catch (error) {
			logError("importDataCommentWalk", error);
		}
	},
};

export { commentWalkHelper };
