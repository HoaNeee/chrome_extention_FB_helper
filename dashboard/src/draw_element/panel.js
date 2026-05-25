import {
  KEY_ALL_GROUPS,
  KEY_GROUPS_NEED_POST,
  KEY_GROUPS_POSTED,
  KEY_IS_IN_PROGRESS,
  KEY_IS_TEST,
  KEY_POST,
  KEY_RETRY_CALL,
  KEY_STOP_TASK,
  KEY_POST_LENGTH,
  KEY_INDEXS_GROUP_CHECKED,
  KEY_IS_SCROLL_DETECT_LIST_GROUP,
  prefix,
  KEY_IS_DEVELOPER_MODE,
  KEY_COUNT_RESET_GROUPS,
  KEY_IS_DARK_THEME,
  KEY_LANGUAGE,
  KEY_IS_SPAMMED,
  KEY_IS_PREMIUM,
  KEY_TAB,
  KEY_SPECIAL_FRAME_HOURS,
} from "../../../contants/contants.js";
import { getGroupsMatch, resetPostedGroupAndSave } from "../helpers/group.js";

import {
  setProgress,
  getProgress,
  getStrictlyMatchTitleGroupInStorage,
  setTheme,
} from "../helpers/storage.js";
import {
  getAllDataGroupsInStorage,
  getListGroupsService,
  setGroupsNeedPost,
} from "../services/groupService.js";
import {
  DB_getValue,
  DB_setValue,
  DB_deleteValue,
} from "../utils/api-helper.js";
import {
  sleep,
  logError,
  getTextWithLanguage,
  logActions,
} from "../../../utils/utils.js";
import { updateDataSavedInfo } from "./dataSavedInfo.js";
import { createDialog, dialogConfirm, dialogViewScheduler } from "./dialog.js";
import { showNotify } from "./notify.js";
import { getDataGroupsSavedNeedPost } from "../services/dataSavedService.js";
import {
  automation,
  automationContinue,
  automationTest,
} from "../services/automation-service.js";
import {
  clearSchedulerAuto,
  getSchedulerService,
  getSpecialFrameHoursService,
} from "../services/scheduler-service.js";
import { addLog } from "./panel-log.js";
import { KEY_CURRENT_WINDOW_ID } from "../../../contants/constant-extention.js";

function drawInnerRoot() {
  const innerRoot = document.createElement("div");
  innerRoot.classList.add("tm_inner-root");
  innerRoot.setAttribute("data-tab-value", "dashboard");

  const dashboardHTML = `
      <div class="${prefix}div-dashboard custom-scrollbar">
        <h3 style="margin-bottom: 8px;">${getTextWithLanguage({ vi: "Hành Động", en: "Action" })}</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; flex-direction: column;">
            <div style="display: flex; gap: 4px;">
            <button button id="${prefix}btn-auto" style="width: 100%;">${getTextWithLanguage({ vi: "Tự động", en: "Auto New" })}</button>
              <button button id="${prefix}btn-stop-task" style="width: 100%;">${getTextWithLanguage({ vi: "Dừng", en: "Stop All" })}</button>
            </div>
            <div style="display: flex; gap: 4px;">
            <button button id="${prefix}btn-get-data-groups" style="width: 100%;">${getTextWithLanguage({ vi: "Lấy danh sách nhóm", en: "Get List Groups" })}</button>
              <button button id="${prefix}btn-continue-post" style="width: 100%;">${getTextWithLanguage({ vi: "Tiếp tục", en: "Continue" })}</button>
            </div>
            <div style="display: flex; gap: 4px;">
              <button button id="${prefix}btn-set-all-groups-to-pending" style="width: 100%;">${getTextWithLanguage({ vi: "Đặt tất cả nhóm thành đang chờ", en: "Set All Groups To Pending" })}</button>
              <button button id="${prefix}btn-reset-groups-need-post" style="width: 100%;">${getTextWithLanguage({ vi: "Đặt lại nhóm cần đăng", en: "Reset Groups Need Post" })}</button>
            </div>
            <div style="display: flex; gap: 4px;">
              <button button id="${prefix}btn-reset-groups" style="width: 100%;">${getTextWithLanguage({ vi: "Đặt lại tất cả nhóm", en: "Reset All Groups" })}</button>
              <button button id="${prefix}btn-reset-is-spammed" style="width: 100%;">${getTextWithLanguage({ vi: "Đặt lại trạng thái bị spam", en: "Reset is spammed" })}</button>
            </div>
            <button button id="${prefix}btn-update-groups-need-post" style="width: 100%;">${getTextWithLanguage({ vi: "Cập nhật danh sách nhóm cần đăng", en: "Update groups need post" })}</button>
            <button button id="${prefix}btn-reset" style="width: 100%;">${getTextWithLanguage({ vi: "Đặt lại tất cả", en: "Reset All" })}</button>
            <button button id="${prefix}btn-test-auto" style="width: 100%;">${getTextWithLanguage({ vi: "Kiểm thử (dev)", en: "Test Auto" })}</button>
            <button button id="${prefix}btn-click" style="width: 100%;">${getTextWithLanguage({ vi: "Click", en: "Click" })}</button>
        </div>
      </div>
    `;

  const logHTML = `
    <div class="${prefix}inner-log">
      <div style="display: flex; flex-direction: column; flex: 1; overflow: hidden;">
        <h3 style="margin-bottom: 8px;">${getTextWithLanguage({ vi: "Lịch sử", en: "History" })}</h3>
        <div style="flex: 1; overflow: hidden;">
          <div class="history-logs-at-dashboard custom-scrollbar"></div>
        </div>
      </div>
    </div>
    `;

  innerRoot.innerHTML = `
    <div style="padding-bottom: 12px; margin-bottom: 12px; border-bottom: 1px solid var(--tm-border-color);">
        <h2 style="margin-bottom: 8px;">${getTextWithLanguage({ vi: "Thông tin nhanh", en: "Quick Info" })}</h2>
        <div id="${prefix}data-saved-info-at-dashboard"></div>
    </div>
    <div class="${prefix}inner-root-body">
      ${dashboardHTML}
      ${logHTML}
    </div>
  `;

  return innerRoot;
}

//just call one time when init app
async function createPanel(doc = document.body) {
  try {
    const root = doc.querySelector("#tm_root");

    const innerRoot = drawInnerRoot();

    root.appendChild(innerRoot);

    doc.appendChild(root);

    //add event for buttons
    function addButtonsEvent() {
      const dialogConfirmHTML = dialogConfirm({
        title: getTextWithLanguage({
          en: "Are you sure to reset all data?",
          vi: "Bạn có chắc chắn muốn xóa tất cả dữ liệu?",
        }),
        onConfirm: async () => {
          resetAllEvent();
          setIsShowConfirmDialogReset(false);
          showNotify({
            message: "Reset all data successfully",
            type: "success",
          });
          await sleep(500);
          addLog({
            vi: "Đặt lại tất cả dữ liệu",
            en: "Reset all data",
          });
          location.reload();
        },
        onCancel: () => {
          setIsShowConfirmDialogReset(false);
        },
      });

      const { setIsShow: setIsShowConfirmDialogReset } = createDialog({
        html: dialogConfirmHTML,
        isConfirm: true,
      });

      function resetAllEvent() {
        try {
          DB_deleteValue(KEY_POST_LENGTH);
          DB_deleteValue(KEY_STOP_TASK);
          DB_deleteValue(KEY_RETRY_CALL);
          DB_deleteValue(KEY_POST);
          DB_deleteValue(KEY_GROUPS_NEED_POST);
          DB_deleteValue(KEY_GROUPS_POSTED);
          DB_deleteValue(KEY_ALL_GROUPS);
          DB_deleteValue(KEY_IS_IN_PROGRESS);
          DB_deleteValue(KEY_IS_TEST);
          DB_setValue(KEY_IS_SCROLL_DETECT_LIST_GROUP, true);
          DB_setValue(KEY_COUNT_RESET_GROUPS, 0);
        } catch (error) {
          showNotify({
            message: error.message,
            type: "error",
          });
        }
      }

      const btnGetListGroups = document.querySelector(
        `#tm_btn-get-data-groups`,
      );
      if (btnGetListGroups) {
        btnGetListGroups.addEventListener("click", async () => {
          try {
            getListGroupsService();
          } catch (error) {
            logError("Error at btnGetListGroups click event: ", error);
          }
        });
      }

      const btnResetGroups = document.querySelector(`#tm_btn-reset-groups`);
      if (btnResetGroups) {
        let isConfirmingResetAllGroups = false;
        let timeOutIdResetAllGroups = null;
        btnResetGroups.addEventListener("click", async () => {
          if (isConfirmingResetAllGroups) {
            if (timeOutIdResetAllGroups) {
              clearTimeout(timeOutIdResetAllGroups);
              timeOutIdResetAllGroups = null;
            }
            DB_deleteValue(KEY_GROUPS_NEED_POST);
            DB_deleteValue(KEY_GROUPS_POSTED);
            DB_deleteValue(KEY_ALL_GROUPS);
            showNotify({
              message: "Reset all groups successfully",
              type: "success",
            });
            isConfirmingResetAllGroups = false;
            btnResetGroups.innerText = getTextWithLanguage({
              en: "Reset All Groups",
              vi: "Đặt lại tất cả nhóm",
            });
            btnResetGroups.style.background = "";
            DB_setValue(KEY_COUNT_RESET_GROUPS, 0);
            addLog({
              vi: "Đặt lại tất cả nhóm",
              en: "Reset all groups",
            });
          } else {
            isConfirmingResetAllGroups = true;
            btnResetGroups.innerText = getTextWithLanguage({
              en: "Click again to confirm",
              vi: "Xác nhận lại",
            });
            btnResetGroups.style.background = "var(--tm-text-danger)";
            timeOutIdResetAllGroups = setTimeout(() => {
              isConfirmingResetAllGroups = false;
              btnResetGroups.innerText = getTextWithLanguage({
                en: "Reset All Groups",
                vi: "Đặt lại tất cả nhóm",
              });
              btnResetGroups.style.background = "";
            }, 3000);
          }
        });
      }

      const btnResetGroupNeedPost = document.querySelector(
        `#tm_btn-reset-groups-need-post`,
      );
      if (btnResetGroupNeedPost) {
        let isConfirmingResetGroupsNeedPost = false;
        let timeOutIdResetGroupNeedPost = null;
        btnResetGroupNeedPost.addEventListener("click", async () => {
          if (isConfirmingResetGroupsNeedPost) {
            if (timeOutIdResetGroupNeedPost) {
              clearTimeout(timeOutIdResetGroupNeedPost);
              timeOutIdResetGroupNeedPost = null;
            }
            DB_deleteValue(KEY_GROUPS_NEED_POST);
            DB_deleteValue(KEY_GROUPS_POSTED);
            DB_setValue(KEY_POST_LENGTH, 0);
            showNotify({
              message: "Reset groups need post successfully",
              type: "success",
            });
            isConfirmingResetGroupsNeedPost = false;
            btnResetGroupNeedPost.innerText = getTextWithLanguage({
              en: "Reset Groups Need Post",
              vi: "Đặt lại nhóm cần đăng",
            });
            btnResetGroupNeedPost.style.background = "";
            DB_setValue(KEY_COUNT_RESET_GROUPS, 0);
            await updateDataSavedInfo();
            addLog({
              vi: "Đặt lại nhóm cần đăng",
              en: "Reset groups need post",
            });
          } else {
            isConfirmingResetGroupsNeedPost = true;
            btnResetGroupNeedPost.innerText = getTextWithLanguage({
              en: "Click again to confirm",
              vi: "Xác nhận lại",
            });
            btnResetGroupNeedPost.style.background = "var(--tm-text-danger)";
            timeOutIdResetGroupNeedPost = setTimeout(() => {
              isConfirmingResetGroupsNeedPost = false;
              btnResetGroupNeedPost.innerText = getTextWithLanguage({
                en: "Reset Groups Need Post",
                vi: "Đặt lại nhóm cần đăng",
              });
              btnResetGroupNeedPost.style.background = "";
            }, 3000);
          }
        });
      }

      const btnSetAllGroupsToPending = document.querySelector(
        `#tm_btn-set-all-groups-to-pending`,
      );
      if (btnSetAllGroupsToPending) {
        let isConfirmingSetAllGroupsToPending = false;
        let timeOutIdSetAllGroupsToPending = null;
        btnSetAllGroupsToPending.addEventListener("click", async () => {
          if (isConfirmingSetAllGroupsToPending) {
            if (timeOutIdSetAllGroupsToPending) {
              clearTimeout(timeOutIdSetAllGroupsToPending);
              timeOutIdSetAllGroupsToPending = null;
            }

            await resetPostedGroupAndSave();
            showNotify({
              message: "Set all groups to pending successfully",
              type: "success",
            });
            isConfirmingSetAllGroupsToPending = false;
            btnSetAllGroupsToPending.innerText = getTextWithLanguage({
              en: "Set All Groups To Pending",
              vi: "Đặt lại tất cả nhóm thành chờ",
            });
            btnSetAllGroupsToPending.style.background = "";
            DB_setValue(KEY_COUNT_RESET_GROUPS, 0);
            addLog({
              vi: "Đặt lại tất cả nhóm thành chờ",
              en: "Set all groups to pending",
            });
          } else {
            isConfirmingSetAllGroupsToPending = true;
            btnSetAllGroupsToPending.innerText = getTextWithLanguage({
              en: "Click again to confirm",
              vi: "Xác nhận lại",
            });
            btnSetAllGroupsToPending.style.background = "var(--tm-text-danger)";
            timeOutIdSetAllGroupsToPending = setTimeout(() => {
              isConfirmingSetAllGroupsToPending = false;
              btnSetAllGroupsToPending.innerText = getTextWithLanguage({
                en: "Set All Groups To Pending",
                vi: "Đặt lại tất cả nhóm thành chờ",
              });
              btnSetAllGroupsToPending.style.background = "";
            }, 3000);
          }
        });
      }

      const btnContinue = document.querySelector(`#tm_btn-continue-post`);
      if (btnContinue) {
        btnContinue.addEventListener("click", async () => {
          try {
            clearSchedulerAuto();
            await automationContinue();
          } catch (error) {
            logError("Error at btnContinue click event: ", error);
          }
        });
      }

      const btnTest = document.querySelector(`#tm_btn-test-auto`);
      if (btnTest) {
        btnTest.addEventListener("click", async () => {
          //auto test
          try {
            clearSchedulerAuto();
            await automationTest();
          } catch (error) {
            setProgress(false);
            logError("Error at btnTest click event: ", error);
          }
        });
      }

      const btnStop = document.querySelector(`#tm_btn-stop-task`);
      if (btnStop) {
        btnStop.addEventListener("click", async () => {
          if (await getProgress()) {
            showNotify({
              message: "Auto was be stopped",
              type: "error",
            });
          }
          setProgress(false);
          DB_setValue(KEY_STOP_TASK, true);
        });
      }

      const btnReset = document.querySelector(`#tm_btn-reset`);
      if (btnReset) {
        btnReset.addEventListener("click", () => {
          setIsShowConfirmDialogReset(true);
        });
      }

      const btnAuto = document.querySelector(`#tm_btn-auto`);
      if (btnAuto) {
        btnAuto.addEventListener("click", async () => {
          //auto
          try {
            clearSchedulerAuto();
            await automation();
            addLog({
              vi: "Bắt đầu đăng tự động",
              en: "Start auto post",
            });
          } catch (error) {
            setProgress(false);
            logError("Error at btnAuto click event: ", error);
          }
        });
      }

      const btnClick = document.querySelector(`#tm_btn-click`);
      if (btnClick) {
        btnClick.addEventListener("click", async () => {
          try {
            // chrome.tabs.query({}, function (tabs) {
            //   tabs.forEach((tab) => {
            //     chrome.tabs.reload(tab.id, {
            //       bypassCache: true,
            //     });
            //   });
            // });
            // setInterval(() => {
            //   addLog({
            //     en: "test log 1",
            //     vi: "test log 1 tieng viet",
            //   });
            // }, 1000);
            // console.log(await getRandomIndexGroupChecked());
            // console.log(await chrome.alarms.get(KEY_SCHEDULER_ALARMS));
            // console.log(await DB_getValue(KEY_IS_PREMIUM));
            // console.log(await DB_getValue(KEY_TAB.LAST_POST_TAB_OPEN_ID));
            console.log(await DB_getValue(KEY_CURRENT_WINDOW_ID));
            console.log(await chrome.windows.getCurrent());
            // console.log(await getSpecialFrameHoursService());
          } catch (error) {
            logError("Error at btnClick click event: ", error);
          }
        });
      }

      const btnUpdateGroupsNeedPost = document.querySelector(
        `#tm_btn-update-groups-need-post`,
      );
      if (btnUpdateGroupsNeedPost) {
        btnUpdateGroupsNeedPost.addEventListener("click", async () => {
          try {
            const allGroups = await getAllDataGroupsInStorage();

            const indexsChecked =
              (await DB_getValue(KEY_INDEXS_GROUP_CHECKED)) || [];

            const dataSaveds = await getDataGroupsSavedNeedPost();

            const listGroups = allGroups;

            const titleStrictlyMatch =
              await getStrictlyMatchTitleGroupInStorage();
            let list = [];
            for (const data of dataSaveds) {
              const id = data.id;
              if (
                indexsChecked &&
                Array.isArray(indexsChecked) &&
                indexsChecked.includes(id)
              ) {
                const title = data.title;
                const name = data.name || "";
                const priority = data.priority || 1;
                const listGroupsMatch = getGroupsMatch({
                  title,
                  listGroups,
                  titleStrictlyMatch,
                });

                list.push({
                  id,
                  title,
                  name,
                  priority,
                  groups: listGroupsMatch,
                });
              }
            }

            // //sort by groups length asc
            list = list.sort((a, b) => {
              if (
                a.priority !== b.priority &&
                a.priority !== undefined &&
                b.priority !== undefined &&
                a.priority !== null &&
                b.priority !== null
              ) {
                return a.priority - b.priority;
              }
              return a.groups.length - b.groups.length;
            });

            showNotify({
              message: "Update groups need post successfully",
              type: "success",
            });

            addLog({
              vi: "Bạn vừa cập nhật danh sách nhóm cần đăng",
              en: "You just updated the list of groups need post",
            });

            logActions("update data", list);

            await setGroupsNeedPost(list);
          } catch (error) {
            logError("Error at btnUpdateGroupsNeedPost click event: ", error);
          }
        });
      }

      const btnResetIsSpammed = document.querySelector(
        `#tm_btn-reset-is-spammed`,
      );
      if (btnResetIsSpammed) {
        btnResetIsSpammed.addEventListener("click", async () => {
          try {
            DB_setValue(KEY_IS_SPAMMED, false);
            updateDataSavedInfo();
          } catch (error) {
            logError("Error at btnResetIsSpammed click event: ", error);
          }
        });
      }

      const btnChangeTheme = document.body.querySelector(
        `#${prefix}btn-change-theme`,
      );
      if (btnChangeTheme) {
        btnChangeTheme.addEventListener("click", async () => {
          const isDarkTheme = (await DB_getValue(KEY_IS_DARK_THEME)) || false;
          const newIsDarkTheme = !isDarkTheme;
          await setTheme(newIsDarkTheme);
          if (newIsDarkTheme) {
            document.body.classList.add("dark");
            document.body.classList.remove("light");
          } else {
            document.body.classList.remove("dark");
            document.body.classList.add("light");
          }

          const svgs = document.querySelectorAll(".tm_svg");
          svgs.forEach((svg) => {
            svg.setAttribute("fill", newIsDarkTheme ? "white" : "black");
          });
        });
      }
    }

    addButtonsEvent();
    //end add event for buttons

    //add event for fields
    async function addFieldsEvent() {
      try {
        const selectLanguage = document.querySelector(`#tm_select-language`);
        if (selectLanguage) {
          selectLanguage.addEventListener("change", (e) => {
            const lang = e.target.value;
            DB_setValue(KEY_LANGUAGE, lang);
            location.reload();
          });
        }
      } catch (error) {
        logError("Error at addFieldsEvent: ", error);
        throw new Error("Error at addFieldsEvent: " + error);
      }
    }
    //end add event for fields

    await addFieldsEvent();

    async function shortCutEvent() {
      document.addEventListener("keydown", async (e) => {
        if (e.ctrlKey && e.shiftKey) {
          if (e.key === "D" || e.key === "d") {
            e.preventDefault();
            const devMode = (await DB_getValue(KEY_IS_DEVELOPER_MODE)) || false;
            DB_setValue(KEY_IS_DEVELOPER_MODE, !devMode);
            updateDataSavedInfo();
          }
          if (e.key === "P" || e.key === "p") {
            e.preventDefault();
            const isPremium = (await DB_getValue(KEY_IS_PREMIUM)) || false;
            DB_setValue(KEY_IS_PREMIUM, !isPremium);

            addLog({
              vi: isPremium
                ? "Chế độ Premium đã bị vô hiệu hóa"
                : "Chế độ Premium đã được kích hoạt",
              en: !isPremium
                ? "Premium mode has been disabled"
                : "Premium mode has been activated",
            });

            updateDataSavedInfo();
          }
        }
      });
    }

    await shortCutEvent();
  } catch (error) {
    logError("Error at createPanel: ", error);
  }
}

export { createPanel };
