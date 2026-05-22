import {
  KEY_CURRENT_WINDOW_ID,
  KEY_FIRST_TIME_USE,
} from "../contants/constant-extention.js";
import {
  KEY_IS_FIX_STEAL_FOCUS,
  KEY_IS_PREMIUM,
  KEY_IS_SHUFFLE_GROUPS_NEED_POST,
} from "../contants/contants.js";
import { getTextWithLanguage, initLanguage, logError } from "../utils/utils.js";
import { dialogContainer } from "./src/draw_element/dialog.js";
import {
  addLog,
  createPanelLog,
  scrollHistoryLogs,
} from "./src/draw_element/panel-log.js";
import { createPanel } from "./src/draw_element/panel.js";
import {
  disabledElement,
  enabledElement,
  getAllFieldsSetting,
} from "./src/helpers/elementDom.js";
import { initialData } from "./src/helpers/initial.js";
import addValueChangeListener from "./src/listener/addValueChangeListener.js";
import {
  getDataSavedInStorage,
  setDataSavedInStorage,
} from "./src/services/dataSavedService.js";
import { DB_getValue, DB_setValue } from "./src/utils/api-helper.js";

async function main() {
  try {
    await initLanguage();

    await initialGlobalData();

    const mainElement = document.querySelector("main");

    dialogContainer({ anchorElem: document.body });

    const divTab = drawTab();

    document.body.insertBefore(divTab, mainElement);

    const root = document.querySelector(`#tm_root`);
    if (root) {
      root.style.display = "none";
      root.style.pointerEvents = "none";
    }
    migrateDataSaved();
    createPanel(mainElement);
    createPanelLog(mainElement);
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
        displayValue: tabValue === "dashboard" ? "grid" : "block",
      });
    } else {
      changeTab({ tabValue: "dashboard", displayValue: "grid" });
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
            displayValue: tabValue === "dashboard" ? "grid" : "block",
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
  } catch (error) {
    logError("Error at dashboard main: ", error);
  }
}

function changeTab({ tabValue = "dashboard", displayValue = "block" } = {}) {
  const root = document.querySelector("#tm_root");
  const allTabs = root.querySelectorAll("[data-tab-value]");
  const allTabItems = document.querySelectorAll(".tab-item");

  allTabItems.forEach((tabItem) => {
    if (tabItem.getAttribute("data-tab-value") === tabValue) {
      tabItem.classList.add("tab-item-active");
    } else {
      tabItem.classList.remove("tab-item-active");
    }
  });

  if (tabValue === "logs") {
    setTimeout(() => {
      scrollHistoryLogs();
    }, 0);
  }

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

async function initialGlobalData() {
  try {
    const currentWindow = await chrome.windows.getCurrent();

    DB_setValue(KEY_CURRENT_WINDOW_ID, currentWindow.id);

    const isFirstTimeUse = await DB_getValue(KEY_FIRST_TIME_USE);

    if (isFirstTimeUse === undefined || isFirstTimeUse === null) {
      DB_setValue(KEY_FIRST_TIME_USE, true);
      addLog({
        vi: "Bắt đầu sử dụng tiện ích",
        en: "Start using the extension",
      });
      DB_setValue(KEY_IS_SHUFFLE_GROUPS_NEED_POST, true);
      DB_setValue(KEY_IS_FIX_STEAL_FOCUS, true);
      DB_setValue(KEY_IS_PREMIUM, false);
    } else {
      DB_setValue(KEY_FIRST_TIME_USE, false);
    }
  } catch (error) {
    logError("Error at initialGlobalData: ", error);
  }
}

main();
