import {
  KEY_ALL_GROUPS,
  KEY_COUNT_RESET_GROUPS,
  KEY_GROUPS_NEED_POST,
  KEY_GROUPS_POSTED,
  prefix,
} from "../../../contants/contants.js";
import { resetPostedGroupAndSave } from "../../../helpers/group.js";
import {
  getPremiumService,
  setPremiumService,
} from "../../../services/auth-service.js";
import {
  automation,
  automationCommentWalk,
  automationContinue,
  automationTest,
} from "../../../services/automation-service.js";
import { commentWalkService } from "../../../services/comment-walk-service.js";
import { getRandomTaskNameWithPriority } from "../../../services/device-service.js";
import {
  getListGroupsService,
  updateGroupNeedPosts,
} from "../../../services/groupService.js";
import {
  clearAndCreateSchedulerAlarm,
  clearSchedulerAuto,
} from "../../../services/scheduler-service.js";
import {
  getIsSchedulerData,
  getIsSpammedData,
  setIsSpammedData,
  setIsStopTaskData,
} from "../../../services/setting-service.js";
import { getIsUseLocalStorage } from "../../../services/storage-global-service.js";
import {
  getIsDeveloperModeInStorage,
  setCountResetGroupInStorage,
  setIsDeveloperModeInStorage,
  setProgress,
} from "../../../services/storage-service.js";
import { DB_deleteValue, DB_setValue } from "../../../utils/api-helper.js";
import { getTextWithLanguage, logError, sleep } from "../../../utils/utils.js";
import { createButtonConfirm } from "./button.js";
import { updateDataSavedInfo } from "./dataSavedInfo.js";
import { createDialog, dialogConfirm } from "./dialog.js";
import { showNotify } from "./notify.js";
import { addLog } from "./panel-log.js";

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
              <button button id="${prefix}btn-get-list-groups-of-user" style="width: 100%;">${getTextWithLanguage({ vi: "Lấy danh sách nhóm", en: "Get List Groups" })}</button>
              <button button id="${prefix}btn-continue-post" style="width: 100%;">${getTextWithLanguage({ vi: "Tiếp tục", en: "Continue" })}</button>
              </div>
              <button button id="${prefix}btn-auto-comment-walk" style="width: 100%; padding: 16px;">${getTextWithLanguage({ vi: "Tự động bình luận dạo", en: "Auto Comment Walk" })}</button>
              <button button id="${prefix}btn-update-groups-need-post" style="width: 100%; padding: 16px;">${getTextWithLanguage({ vi: "Cập nhật danh sách nhóm cần đăng", en: "Update groups need post" })}</button>
            <div id="${prefix}div-btn-reset-groups-posted" style="width: 100%;"></div>
            <div id="${prefix}div-btn-reset-comment-walk" style="width: 100%;"></div>
            <div id="${prefix}div-btn-reset-groups" style="width: 100%;"></div>
            <button button id="${prefix}btn-reset-is-spammed" style="width: 100%; padding: 16px;">${getTextWithLanguage({ vi: "Đặt lại trạng thái bị spam", en: "Reset is spammed" })}</button>
            <button button id="${prefix}btn-reset" style="width: 100%; padding: 16px;">${getTextWithLanguage({ vi: "Đặt lại tất cả", en: "Reset All" })}</button>
            <button button id="${prefix}btn-test-auto" style="width: 100%; padding: 16px;">${getTextWithLanguage({ vi: "Kiểm thử (dev)", en: "Test Auto" })}</button>
            <button button id="${prefix}btn-reset-all-data-saved" style="width: 100%; padding: 16px;">${getTextWithLanguage({ vi: "Đặt lại tất cả dữ liệu đã lưu", en: "Reset all data saved" })}</button>
            <button button id="${prefix}btn-click" style="width: 100%; padding: 16px;">${getTextWithLanguage({ vi: "Click", en: "Click" })}</button>
            <button button id="${prefix}btn-click-2" style="width: 100%; padding: 16px;">${getTextWithLanguage({ vi: "Click 2", en: "Click 2" })}</button>
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
          await resetAllEvent();
          setIsShowConfirmDialogReset(false);
          showNotify({
            message: getTextWithLanguage({
              vi: "Đặt lại tất cả dữ liệu thành công",
              en: "Reset all data successfully",
            }),
            type: "success",
          });
          await sleep(500);
          addLog({
            vi: "Đã đặt lại tất cả dữ liệu",
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

      async function resetAllEvent() {
        try {
          await chrome.storage.local.clear();
        } catch (error) {
          logError("Error at reset all event: ", error);
          showNotify({
            message: getTextWithLanguage({
              vi: "Đặt lại tất cả dữ liệu thất bại",
              en: "Reset all data failed",
            }),
            type: "error",
          });
        }
      }

      const btnGetListGroups = document.querySelector(
        `#tm_btn-get-list-groups-of-user`,
      );
      if (btnGetListGroups) {
        btnGetListGroups.addEventListener("click", async () => {
          try {
            await getListGroupsService();
          } catch (error) {
            logError("Error at btnGetListGroups click event: ", error);
          }
        });
      }

      const divBtnResetGroups = document.querySelector(
        `#tm_div-btn-reset-groups`,
      );
      if (divBtnResetGroups) {
        divBtnResetGroups.appendChild(
          createButtonConfirm({
            id: `${prefix}btn-reset-groups`,
            title: getTextWithLanguage({
              en: "Reset All Groups",
              vi: "Đặt lại tất cả nhóm",
            }),
            titleConfirm: getTextWithLanguage({
              en: "Confirm",
              vi: "Xác nhận lại",
            }),
            className: "w-full",
            style: {
              padding: "16px 8px",
            },
            onConfirm: async () => {
              try {
                await Promise.all([
                  DB_deleteValue(KEY_GROUPS_NEED_POST),
                  DB_deleteValue(KEY_GROUPS_POSTED),
                  DB_deleteValue(KEY_ALL_GROUPS),
                ]);
                DB_setValue(KEY_COUNT_RESET_GROUPS, 0);

                showNotify({
                  message: getTextWithLanguage({
                    en: "Reset all groups successfully",
                    vi: "Đặt lại tất cả nhóm thành công",
                  }),
                  type: "success",
                });
                addLog({
                  vi: "Bạn đã xóa danh sách nhóm đã lấy, danh sách nhóm đã đăng, danh sách nhóm cần đăng",
                  en: "You reset list groups gotten, list groups posted, list groups need post",
                });
              } catch (error) {
                logError("Error at btnResetGroups click event: ", error);
                showNotify({
                  message: getTextWithLanguage({
                    en: "Reset all group failed",
                    vi: "Đặt lại tất cả nhóm thất bại",
                  }),
                  type: "error",
                });
              }
            },
          }),
        );
      }

      const divBtnResetGroupPosted = document.querySelector(
        `#tm_div-btn-reset-groups-posted`,
      );
      if (divBtnResetGroupPosted) {
        divBtnResetGroupPosted.appendChild(
          createButtonConfirm({
            id: `${prefix}btn-reset-groups-posted`,
            title: getTextWithLanguage({
              en: "Reset Groups Posted",
              vi: "Đặt lại nhóm đã đăng",
            }),
            titleConfirm: getTextWithLanguage({
              en: "Confirm",
              vi: "Xác nhận lại",
            }),
            className: "w-full",
            style: {
              padding: "16px 8px",
            },
            onConfirm: async () => {
              try {
                await resetPostedGroupAndSave();
                await setCountResetGroupInStorage(0);

                showNotify({
                  message: getTextWithLanguage({
                    en: "Reset groups posted successfully",
                    vi: "Đặt lại nhóm đã đăng thành công",
                  }),
                  type: "success",
                });

                addLog({
                  vi: "Đặt lại tất cả nhóm thành chờ",
                  en: "Set all groups to pending",
                });
              } catch (error) {
                logError("Error at btnResetGroups click event: ", error);
                showNotify({
                  message: getTextWithLanguage({
                    en: "Reset all group failed",
                    vi: "Đặt lại tất cả nhóm thất bại",
                  }),
                  type: "error",
                });
              }
            },
          }),
        );
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
          try {
            await setIsStopTaskData(true);
            showNotify({
              message: getTextWithLanguage({
                en: "Auto was be stopped",
                vi: "Tiện ích tự động đã dừng",
              }),
              type: "error",
            });
          } catch (error) {
            logError("Error at btnStop click event: ", error);
          }
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
            addLog({
              vi: "Bắt đầu thực hiện tác vụ đăng bài tự động",
              en: "Start auto post task",
            });
            clearSchedulerAuto();
            await automation();
          } catch (error) {
            setProgress(false);
            logError("Error at btnAuto click event: ", error);
          }
        });
      }

      const btnAutoCommentWalk = document.querySelector(
        `#tm_btn-auto-comment-walk`,
      );
      if (btnAutoCommentWalk) {
        btnAutoCommentWalk.addEventListener("click", async () => {
          try {
            await commentWalkService.setCountCommentWalkPostedPerBatch(0);
            await automationCommentWalk();
          } catch (error) {
            setProgress(false);
            logError("Error at btnAutoCommentWalk click event: ", error);
          }
        });
      }

      const btnClick = document.querySelector(`#tm_btn-click`);
      if (btnClick) {
        btnClick.addEventListener("click", async () => {
          try {
            // await commentWalkService.setCountCommentWalkPostedPerBatch(0);
            // // await commentWalkService.setListUrlCommented([]);
            // await automationCommentWalk();
            // const arr = [2, 3];
            // const total = arr.reduce((acc, val) => acc + val, 0);
            // for (const num of arr) {
            //   console.log(num, randomRateBoolean(total - num, total));
            // }
            // console.log(randomNumberValue(arr));
            console.log(await getRandomTaskNameWithPriority());
          } catch (error) {
            logError("Error at btnClick click event: ", error);
          }
        });
      }

      const btnClick2 = document.querySelector(`#tm_btn-click-2`);
      if (btnClick2) {
        btnClick2.addEventListener("click", async () => {
          try {
            // const id = await commentWalkService.getRandomIdCommentWalkActive();
            // const commentWalk = await commentWalkService.getCommentWalkById(id);
            // const keywords = commentWalk.keyword_query_includes;
            // console.log(keywords);
            // for (const key of keywords) {
            //   console.log(cvString(key));
            // }
            // const array = await getContentQueryExcludesCommonData();
            // for (const item of array) {
            //   console.log(cvString(item));
            // }
            // const strTest =
            //   "Em cần tìm trọ tài chính dưới 5tr ạ. Mng cmt sdt + ảnh em tự liên hệ ạ.";
            // console.log(cvStringHigher(strTest));
            // DB_setValue(KEY_STOP_TASK, false);
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
            await updateGroupNeedPosts(true);

            showNotify({
              message: "Update groups need post successfully",
              type: "success",
            });

            addLog({
              vi: "Bạn vừa cập nhật danh sách nhóm cần đăng",
              en: "You just updated the list of groups need post",
            });
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
            const isSpammed = await getIsSpammedData();
            if (isSpammed) {
              await setIsSpammedData(false);
              addLog({
                vi: "Bạn vừa đặt lại trạng thái bị spam",
                en: "You just reset spammed status",
              });
              showNotify({
                message: getTextWithLanguage({
                  vi: "Đặt lại trạng thái bị spam thành công",
                  en: "Reset spammed status successfully",
                }),
                type: "success",
              });
              updateDataSavedInfo();
              const isScheduler = await getIsSchedulerData();
              if (isScheduler) {
                await clearAndCreateSchedulerAlarm();
              }
            }
          } catch (error) {
            logError("Error at btnResetIsSpammed click event: ", error);
          }
        });
      }

      const divBtnResetCommentWalk = document.querySelector(
        `#${prefix}div-btn-reset-comment-walk`,
      );
      if (divBtnResetCommentWalk) {
        const buttonConfirmResetCommentWalk = createButtonConfirm({
          id: `${prefix}btn-reset-comment-walk`,
          title: getTextWithLanguage({
            vi: "Đặt lại danh sách đã bình luận",
            en: "Reset list url commented",
          }),
          titleConfirm: getTextWithLanguage({
            vi: "Xác nhận",
            en: "Confirm",
          }),
          className: "w-full",
          style: {
            padding: "16px 8px",
          },
          onConfirm: async () => {
            try {
              await commentWalkService.setListUrlCommented([]);
              showNotify({
                message: getTextWithLanguage({
                  vi: "Đặt lại danh sách URL đã bình luận thành công",
                  en: "Reset list url commented successfully",
                }),
                type: "success",
              });
              addLog({
                vi: "Bạn vừa đặt lại danh sách URL đã bình luận",
                en: "You just reset list url commented",
              });
              updateDataSavedInfo();
            } catch (error) {
              logError("Error at btnResetCommentedWalk click event: ", error);
              showNotify({
                message: getTextWithLanguage({
                  vi: "Đặt lại danh sách URL đã bình luận thất bại",
                  en: "Reset list url commented failed",
                }),
                type: "error",
              });
            }
          },
        });
        divBtnResetCommentWalk.appendChild(buttonConfirmResetCommentWalk);
      }
    }

    addButtonsEvent();
    //end add event for buttons

    async function shortCutEvent() {
      document.addEventListener("keydown", async (e) => {
        if (e.ctrlKey && e.shiftKey) {
          if (e.key === "D" || e.key === "d") {
            e.preventDefault();
            const devMode = await getIsDeveloperModeInStorage();
            await setIsDeveloperModeInStorage(!devMode);
            updateDataSavedInfo();
          }
          if (e.key === "P" || e.key === "p") {
            e.preventDefault();
            const isUseLocalStorage = await getIsUseLocalStorage();
            if (isUseLocalStorage) {
              const isPremium = await getPremiumService();
              await setPremiumService(!isPremium);

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
        }
      });
    }

    await shortCutEvent();
  } catch (error) {
    logError("Error at createPanel: ", error);
  }
}

export { createPanel };
