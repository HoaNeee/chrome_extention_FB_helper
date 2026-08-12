import { getTextWithLanguage } from "../../../utils/utils.js";

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
      <li class="tab-item" data-tab-value="groups">${getTextWithLanguage({ vi: "Dữ liệu nhóm", en: "Group's data" })}</li>
      <li class="tab-item" data-tab-value="logs">${getTextWithLanguage({ vi: "Nhật ký", en: "Logs" })}</li>
      <li class="tab-item" data-tab-value="settings-advanced">${getTextWithLanguage({ vi: "Cài đặt nâng cao", en: "Advanced Settings" })}</li>
    </ul>
  `;
  return div;
}

export { drawTab, changeTab, getTitleByTabValue };
