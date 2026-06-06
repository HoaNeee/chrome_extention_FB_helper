import { getTextWithLanguage, initLanguage, logError } from "../utils/utils.js";
import { dialogContainer } from "./src/draw_element/dialog.js";
import { createPanelTabGroup } from "./src/draw_element/panel-group-tab.js";
import { addLog, createPanelLog } from "./src/draw_element/panel-log.js";
import { createPanelSetting } from "./src/draw_element/panel-setting-tab.js";
import { createPanel } from "./src/draw_element/panel.js";
import {
	addAllEvtTooltipForElement,
	disabledElement,
	enabledElement,
	getAllFieldsSetting,
} from "./src/helpers/elementDom.js";
import { initialData, initialFastAndFirst } from "./src/helpers/initial.js";
import { initialTheme } from "./src/helpers/storage.js";
import addValueChangeListener from "./src/listener/addValueChangeListener.js";
import {
	getDataSavedInStorage,
	setDataSavedInStorage,
} from "./src/services/dataSavedService.js";

async function main() {
	try {
		await initLanguage();
		await initialTheme();
		await initialFastAndFirst();

		const mainElement = document.querySelector("main");

		dialogContainer({ anchorElem: document.body });

		const divTab = drawTab();

		document.body.insertBefore(divTab, mainElement);

		const root = document.querySelector(`#tm_root`);
		if (root) {
			root.style.display = "none";
			root.style.pointerEvents = "none";
		}
		createPanel(mainElement);
		createPanelLog(mainElement);
		createPanelSetting(mainElement);
		createPanelTabGroup(mainElement);
		await initialData(mainElement);

		const { setIsProcessing } = getAllFieldsSetting();

		addValueChangeListener(async (newVal) => {
			try {
				setIsProcessing(newVal);
				if (newVal) {
					disabledElement({ selector: "#tm_btn-auto" });
					disabledElement({ selector: "#tm_btn-continue-post" });
					disabledElement({ selector: "#tm_btn-get-data-groups" });
				}
				if (!newVal) {
					enabledElement({ selector: "#tm_btn-auto" });
					enabledElement({ selector: "#tm_btn-continue-post" });
					enabledElement({ selector: "#tm_btn-get-data-groups" });
				}
			} catch (error) {
				logError("Error at dashboard addValueChangeListener: ", error);
			}
		});

		const hash = new URLSearchParams(location.hash);
		const tabValue = hash.get("#nav");

		if (tabValue) {
			changeTab({
				tabValue,
				displayValue: tabValue === "dashboard" ? "flex" : "block",
			});
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

		//test api
		//at spring u need config cors for web

		//at @RestController
		// @CrossOrigin(origins = "*")
		// or at @SpringBootApplication
		// @CrossOrigin(origins = "*")
		// fetch("http://localhost:8080/api/products", {
		//   headers: {
		//     "Content-Type": "application/json",
		//     Authorization:
		//       "Bearer " +
		//       "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTc4MDQxNzk3NX0.VxCK3PwOtB1x0zbz6iLPxHpFhzT77LoTcnJd84Dem-c",
		//   },
		//   // credentials: "include",
		// })
		//   .then((res) => res.json())
		//   .then((data) => {
		//     console.log(data);
		//   })
		//   .catch((err) => {
		//     console.log(err);
		//   });
	} catch (error) {
		logError("Error at dashboard main: ", error);
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
      <li class="tab-item tab-item-active" data-tab-value="dashboard">${getTextWithLanguage({ vi: "Bảng điểu khiển", en: "Dashboard" })}</li>
      <li class="tab-item" data-tab-value="logs">${getTextWithLanguage({ vi: "Nhật ký", en: "Logs" })}</li>
      <li class="tab-item" data-tab-value="settings">${getTextWithLanguage({ vi: "Cài đặt", en: "Settings" })}</li>
      <li class="tab-item" data-tab-value="groups">${getTextWithLanguage({ vi: "Danh sách nhóm", en: "Groups" })}</li>
    </ul>
  `;
	return div;
}

async function migrateDataSaved() {
	try {
		const dataSaved = await getDataSavedInStorage();
		let prio = 1;
		for (const data of dataSaved || []) {
			if (data.priority === null || data.priority === undefined) {
				data.priority = prio;
				prio++;
			}
		}
		setDataSavedInStorage(dataSaved);
	} catch (error) {
		logError("Error at migrate DataSaved", error);
	}
}

main();
