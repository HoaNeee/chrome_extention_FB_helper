import {
	addAllEvtTooltipForElement,
	addCssForTextarea,
} from "../helpers/elementDom.js";
import { LIST_TAB_WITH_PREMIUM } from "../helpers/premium.js";
import { getPremiumService } from "../services/auth-service.js";
import {
	getIsUseLocalStorage,
	initialTheme,
} from "../services/storage-global-service.js";
import { getTextWithLanguage, initLanguage, logError } from "../utils/utils.js";
import {
	closeDialogLoading,
	createDialog,
	dialogContainer,
	dialogDisabledTool,
	showDialogLoading,
} from "./src/draw_element/dialog.js";
import { createPanelCommentWalkTab } from "./src/draw_element/panel-comment-walk-tab.js";
import { createPanel } from "./src/draw_element/panel-dashboard.js";
import { createPanelTabGroup } from "./src/draw_element/panel-data-group-tab.js";
import { addLog, createPanelLog } from "./src/draw_element/panel-log.js";
import { createPanelAdvancedSetting } from "./src/draw_element/panel-setting-advanced-tab.js";
import { createPanelSetting } from "./src/draw_element/panel-setting-tab.js";

import {
	KEY_ALL_STATUS,
	KEY_MIGRATE_DATA,
} from "../contants/constant-extention.js";
import {
	checkOrCreateDeviceService,
	checkOrCreateIpAddress,
	getDeviceId,
} from "../services/device-service.js";
import { googleFirebaseService } from "../services/firebase-service.js";
import { ipAddressService } from "../services/ip-address-service.js";
import { systemSettingService } from "../services/system-setting-service.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { addEvtHeader } from "./src/helpers/header.js";
import {
	initialAuth,
	initialCss,
	initialData,
	initialDomainServer,
	initialUseServerName,
} from "./src/helpers/initial.js";
import addValueChangeListener from "./src/listener/addValueChangeListener.js";
import { setIsChangedSettingData } from "../services/setting-service.js";

async function main() {
	try {
		dialogContainer({ anchorElem: document.body });

		const mainElement = document.querySelector("main");

		const root = document.querySelector(`#tm_root`);
		if (root) {
			root.style.display = "none";
			root.style.pointerEvents = "none";
		}

		await initLanguage();
		await initialTheme();

		showDialogLoading();

		await initialCss();
		await initialDomainServer();
		await initialUseServerName();
		await initialAuth();
		await addEvtHeader();

		const statusCheck = await checkStatusDeviceOrIp();
		if (!statusCheck) {
			closeDialogLoading();
			return;
		}

		await migrateDataSaved();

		closeDialogLoading();

		const divTab = drawTab();

		document.body.insertBefore(divTab, mainElement);

		await Promise.all([
			createPanel(mainElement),
			createPanelLog(mainElement),
			createPanelSetting(mainElement),
			createPanelTabGroup(mainElement),
			createPanelAdvancedSetting(mainElement),
			createPanelCommentWalkTab(mainElement),
		]);

		await initialData(mainElement);

		addValueChangeListener();

		const hashParams = new URLSearchParams(location.hash);

		const tabValue = hashParams.get("#nav");

		const isPremium = await getPremiumService();

		if (tabValue) {
			if (!isPremium && LIST_TAB_WITH_PREMIUM.includes(tabValue)) {
				changeTab({ tabValue: "dashboard", displayValue: "flex" });
			} else {
				changeTab({
					tabValue,
					displayValue: tabValue === "dashboard" ? "flex" : "block",
				});
			}
		} else {
			changeTab({ tabValue: "dashboard", displayValue: "flex" });
		}

		root.style.display = "block";
		root.style.pointerEvents = "auto";

		const tabs = document.querySelector(".tabs-list");
		if (tabs) {
			const tabItems = tabs.querySelectorAll(".tab-item");

			tabItems.forEach((tabItem) => {
				tabItem.addEventListener("click", () => {
					const tabValue = tabItem.getAttribute("data-tab-value");
					location.hash = `nav=${tabValue}`;

					changeTab({
						tabValue,
						displayValue: tabValue === "dashboard" ? "flex" : "block",
					});
					if (tabValue === "settings-advanced") {
						addCssForTextarea();
					}
				});
			});
		}

		window.addEventListener("online", () => {
			addLog({
				vi: "Đã kết nối với internet",
				en: "Connected to internet",
			});
		});

		window.addEventListener("offline", () => {
			addLog({
				vi: "Đã mất kết nối với internet",
				en: "Disconnected from internet",
			});
		});

		addAllEvtTooltipForElement();
		addCssForTextarea();

		const isUseLocalStore = await getIsUseLocalStorage();
		if (!isUseLocalStore) {
			await setIsChangedSettingData(false);
		}

		test();
	} catch (error) {
		logError("Error at dashboard main: ", error);
	}
}

async function test() {
	try {
		// const id = await getRandomIndexGroupChecked();
		// console.log(id);
		// const setting = await getSettingByDeviceRequest();
		// console.log(setting);
		// const nextTime = await getNextTimePost();
		// console.log(new Date(nextTime));
		// const deviceId = await getDeviceId();
		// const res = await get("/schedulers/" + deviceId);
		// console.log(res);
		// const listKey = await DB_listValues();
		// console.log(listKey);
		// console.log(await getSchedulerService());
		// console.log(await getListCommentWhenPostSuccessService());
		// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		//   if (request.type === "TEST") {
		//     console.log("Data at dashboard: ", request.data);
		//     sendResponse({ status: "success", data: "Data received at dashboard" });
		//   }
		// });
	} catch (error) {
		logError("Error at test: ", error);
	}
}

function getTitleByTabValue(tabValue) {
	switch (tabValue) {
		case "dashboard":
			return getTextWithLanguage({ vi: "Bảng điểu khiển", en: "Dashboard" });
		case "logs":
			return getTextWithLanguage({ vi: "Nhật ký", en: "Logs" });
		case "settings":
			return getTextWithLanguage({ vi: "Cài đặt", en: "Settings" });
		case "groups":
			return getTextWithLanguage({ vi: "Danh sách nhóm", en: "Groups" });
		case "settings-advanced":
			return getTextWithLanguage({
				vi: "Cài đặt nâng cao",
				en: "Advanced Settings",
			});

		default:
			return "";
	}
}

function changeTab({ tabValue = "dashboard", displayValue = "block" } = {}) {
	const root = document.querySelector("#tm_root");
	const allTabs = root.querySelectorAll("[data-tab-value]");
	const allTabItems = document.querySelectorAll(".tab-item");

	const titleElement = document.querySelector("title");
	if (titleElement) {
		titleElement.textContent = getTitleByTabValue(tabValue);
	}

	allTabItems.forEach((tabItem) => {
		if (tabItem.getAttribute("data-tab-value") === tabValue) {
			tabItem.classList.add("tab-item-active");
		} else {
			tabItem.classList.remove("tab-item-active");
		}
	});

	allTabs.forEach((tab) => {
		const tabValueCurrent = tab.getAttribute("data-tab-value");
		if (tabValueCurrent === tabValue) {
			tab.style.display = displayValue;
			tab.style.pointerEvents = "auto";
		} else {
			tab.style.display = "none";
			tab.style.pointerEvents = "none";
		}
	});
}

function drawTab() {
	const div = document.createElement("div");
	div.className = "tabs";
	div.innerHTML = `
    <ul class="tabs-list">
      <li class="tab-item" data-tab-value="dashboard">${getTextWithLanguage({ vi: "Bảng điểu khiển", en: "Dashboard" })}</li>
      <li class="tab-item" data-tab-value="settings">${getTextWithLanguage({ vi: "Cài đặt", en: "Settings" })}</li>
      <li class="tab-item" data-tab-value="settings-advanced">${getTextWithLanguage({ vi: "Cài đặt nâng cao", en: "Advanced Settings" })}</li>
      <li class="tab-item" data-tab-value="groups">${getTextWithLanguage({ vi: "Dữ liệu nhóm", en: "Group's data" })}</li>
      <li class="tab-item" data-tab-value="comment-walk">${getTextWithLanguage({ vi: "Bình luận dạo", en: "Comment Walk" })}</li>
      <li class="tab-item" data-tab-value="logs">${getTextWithLanguage({ vi: "Nhật ký", en: "Logs" })}</li>
    </ul>
  `;
	return div;
}

async function migrateDataSaved() {
	try {
		const isMigrated = await DB_getValue(
			KEY_MIGRATE_DATA.IS_MIGATE_DATA_GROUP_POST,
		);
		if (isMigrated) return;

		const dbName = "dataPostSavedDB";
		const storeName = "dataPostSaved";
		const KEY = "data_post_saved";

		async function openDB() {
			return new Promise((resolve, reject) => {
				const request = indexedDB.open(dbName, 1);

				request.onerror = () => reject(request.error);
				request.onsuccess = () => resolve(request.result);

				request.onupgradeneeded = (event) => {
					const db = event.target.result;
					if (!db.objectStoreNames.contains(storeName)) {
						db.createObjectStore(storeName);
					}
				};
			});
		}

		const db = await openDB();
		const tx = db.transaction(storeName, "readwrite");
		const store = tx.objectStore(storeName);

		const request = store.put([], KEY);
		await new Promise((resolve, reject) => {
			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});

		await DB_setValue(KEY_MIGRATE_DATA.IS_MIGATE_DATA_GROUP_POST, true);
	} catch (error) {
		logError("Error at migrate DataSaved", error);
	}
}

async function checkStatusDeviceOrIp() {
	const useServerNameObject =
		await systemSettingService.getUseServerNameObject();

	function createAndShowDialogDisabledTool() {
		const { setIsShow: setIsShowDialogDisabledTool } = createDialog({
			html: dialogDisabledTool(),
			isConfirm: true,
			showClose: false,
			clickOutSideToClose: false,
		});
		setIsShowDialogDisabledTool(true);
	}

	try {
		if (useServerNameObject.firebase) {
			const status = await googleFirebaseService.getStatusTool();
			if (!status || status === KEY_ALL_STATUS.MAINTAINING) {
				closeDialogLoading();
				createAndShowDialogDisabledTool();
				return false;
			}

			const deviceId = await getDeviceId();
			if (deviceId) {
				const ip = await ipAddressService.getIpAddress();
				const isActiveIp = await googleFirebaseService.checkOrRegisterIP(ip);
				if (!isActiveIp) {
					closeDialogLoading();
					createAndShowDialogDisabledTool();
					return false;
				}
				const isActive =
					await googleFirebaseService.checkOrRegisterDevice(deviceId);
				if (!isActive) {
					closeDialogLoading();
					createAndShowDialogDisabledTool();
					return false;
				}
			}
		} else if (useServerNameObject.main) {
			const systemSetting = await systemSettingService.getSystemSetting();
			if (
				systemSetting.status === KEY_ALL_STATUS.INACTIVE ||
				systemSetting.status === KEY_ALL_STATUS.MAINTAINING
			) {
				closeDialogLoading();
				createAndShowDialogDisabledTool();
				return false;
			}

			const ipAddress = await checkOrCreateIpAddress();
			if (ipAddress?.status === KEY_ALL_STATUS.INACTIVE) {
				closeDialogLoading();
				createAndShowDialogDisabledTool();
				return false;
			}

			const device = await checkOrCreateDeviceService();
			if (device?.status === KEY_ALL_STATUS.INACTIVE) {
				closeDialogLoading();
				createAndShowDialogDisabledTool();
				return false;
			}
		}

		return true;
	} catch (error) {
		logError("Error at checkStatusDeviceOrIp", error);
		return false;
	}
}

main();
