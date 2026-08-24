import {
  addAllEvtTooltipForElement,
  addCssForTextarea,
} from "../helpers/elementDom.js";
import { LIST_TAB_WITH_PREMIUM } from "../helpers/premium.js";
import { getPremiumService } from "../services/auth-service.js";
import { initialTheme } from "../services/storage-global-service.js";
import { initLanguage, logError } from "../utils/utils.js";
import { dialogContainer } from "./src/draw_element/dialog.js";
import { createPanelCommentWalkTab } from "./src/draw_element/panel-comment-walk-tab.js";
import { createPanel } from "./src/draw_element/panel-dashboard.js";
import { createPanelTabGroup } from "./src/draw_element/panel-data-group-tab.js";
import { addLog, createPanelLog } from "./src/draw_element/panel-log.js";
import { createPanelAdvancedSetting } from "./src/draw_element/panel-setting-advanced-tab.js";
import { createPanelSetting } from "./src/draw_element/panel-setting-tab.js";
import { changeTab, drawTab } from "./src/draw_element/tab.js";
import { addEvtHeader } from "./src/helpers/header.js";
import { initialData, initialFastAndFirst } from "./src/helpers/initial.js";
import addValueChangeListener from "./src/listener/addValueChangeListener.js";

async function main() {
  try {
    dialogContainer({ anchorElem: document.body });

    await initLanguage();
    await initialTheme();
    await initialFastAndFirst();
    await addEvtHeader();

    const mainElement = document.querySelector("main");

    const divTab = drawTab();

    document.body.insertBefore(divTab, mainElement);

    const root = document.querySelector(`#tm_root`);
    if (root) {
      root.style.display = "none";
      root.style.pointerEvents = "none";
    }

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

main();
