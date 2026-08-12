import {
  initialTimeDelay,
  KEY_IS_SHUFFLE_SCHEDULER_TIME,
  prefix,
  SCHEDULER_TYPE,
} from "../../../contants/contants.js";
import {
  createSchedulerDailyHours,
  createSchedulerHours,
  createSchedulerMinutes,
  getSchedulerWithType,
  logSchedulerHelper,
} from "../../../helpers/scheduler.js";
import {
  genIDNumber,
  getTextWithLanguage,
  logError,
  randomID,
} from "../../../utils/utils.js";
import {
  getSchedulerDetail,
  getSchedulerService,
  changeTypeScheduler,
  clearSchedulerAuto,
  setSchedulerDetail,
  clearAndCreateSchedulerAlarm,
} from "../../../services/scheduler-service.js";
import {
  getIsSchedulerData,
  getTimeDelayData,
  setIsFixStealAllFocusData,
  setIsFixStealFocusData,
  setIsRandomBreakBatchData,
  setIsRandomTimePostData,
  setIsSchedulerData,
  setIsShuffleGroupNeedPostData,
  setIsSpammedData,
  setIsSpecialFrameHoursData,
  setMaxGroupPerTimeData,
  setStrictlyMatchTitleGroupData,
  setTimeDelayData,
} from "../../../services/setting-service.js";
import {
  getIsDeveloperModeInStorage,
  getIsTestInStorage,
  setCountBatchPost,
  setCountResetGroupInStorage,
  setCurrentCountPostLength,
  setIsTestInStorage,
  setProgress,
} from "../../../services/storage-service.js";
import { DB_getValue, DB_setValue } from "../../../utils/api-helper.js";
import { updateDataSavedInfo } from "./dataSavedInfo.js";
import { createDialog, dialogViewScheduler } from "./dialog.js";
import { showNotify } from "./notify.js";
import { addLog } from "./panel-log.js";
import {
  createDialogAddSpecialHours,
  createDialogViewSpecialFrameHours,
} from "./special-frame-hours.js";
import {
  clearAllSpecialFrameHours,
  getSpecialFrameHoursService,
} from "../../../services/special-frame-hours-service.js";
import { handleErrorHelper } from "../../../utils/exception.js";

async function createPanelSetting(anchorElem = document.body) {
  try {
    const rootSetting = document.createElement("div");
    rootSetting.className = "tm_tab-setting";
    rootSetting.setAttribute("data-tab-value", "settings");

    const groupsHTML = `
      <div class="${prefix}section">
        <h2 class="${prefix}title-section">${getTextWithLanguage({ vi: "Cài đặt cơ bản", en: "Basic Setting" })}</h2>
        <div class="${prefix}field-container">
            <label for="${prefix}input-max-group-per-time">${getTextWithLanguage({ vi: "Số lượng nhóm tối đa mỗi lần", en: "Max group per time" })}</label>
            <div style="display: flex; gap: 4px;">
              <input min="1" type="number" id="${prefix}input-max-group-per-time" class="${prefix}input-outline" style="display: inline-block; flex: 1;">
              <button id="${prefix}btn-save-max-group-per-time" class="not-style">${getTextWithLanguage({ vi: "Lưu", en: "Save" })}</button>
            </div>
          </div>
          <div style="">
            <div class="${prefix}field-container">
              <label for="${prefix}input-strictly-match-title-group">${getTextWithLanguage({ vi: `Các từ khóa lọc nghiêm ngặt trong tên (cách nhau bằng dấu phẩy ',')`, en: "Strictly match title keywords group (separate by comma ',')" })}:
              </label>
              <div style="display: flex; gap: 4px;">
                <textarea placeholder="Ex: Cho thuê trọ, nhà trọ, ..." id="${prefix}input-strictly-match-title-group" class="${prefix}input-outline" style="flex: 1; height: 70px; padding: 8px 4px"></textarea>
              </div>
            </div>

            <div class="${prefix}field-description" style="margin-left: 4px"><span style="color: var(--tm-text-secondary); font-size: 10px;">${getTextWithLanguage({ vi: "(Tránh trường hợp lọc nhầm nhóm không mong muốn)", en: "(Avoid mistakenly filtering unwanted groups)" })}</span></div>
            <div style="text-align: end; margin-top: 4px;">
              <button id="${prefix}btn-save-strictly-match-title-group" class="not-style">${getTextWithLanguage({ vi: "Lưu từ khóa", en: "Save keywords" })}</button>
            </div>
          </div>
      </div>
    `;

    const optionalHTML = `
      <div class="${prefix}section">
        <h2 class="${prefix}title-section">${getTextWithLanguage({ vi: "Tùy chọn cơ bản", en: "Basic Setting" })}</h2>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-processing">
          <label for="${prefix}checkbox-is-processing" style="user-select: none;">${getTextWithLanguage({ vi: "Đang chạy", en: "Auto is processing" })}</label>
        </div>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-test">
          <label for="${prefix}checkbox-is-test" style="user-select: none;">${getTextWithLanguage({ vi: "Đang kiểm thử", en: "Auto is testing" })}</label>
        </div>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-spammed">
          <label for="${prefix}checkbox-is-spammed" style="user-select: none;">${getTextWithLanguage({ vi: "Bị spam", en: "Is spammed" })}</label>
        </div>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-fix-steal-focus">
          <label for="${prefix}checkbox-is-fix-steal-focus" style="user-select: none;">${getTextWithLanguage({ vi: "Tránh nhảy tab", en: "Fix steal focus" })}</label>
        </div>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-shuffle-groups-need-post">
          <label for="${prefix}checkbox-is-shuffle-groups-need-post" style="user-select: none;">${getTextWithLanguage({ vi: "Tự động trộn nhóm cần đăng", en: "Shuffle groups need post" })}</label>
        </div>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-random-batch-post">
          <label for="${prefix}checkbox-is-random-batch-post" style="user-select: none;">${getTextWithLanguage({ vi: "Tự động nghỉ giữa các đợt", en: "Random break between batches" })}</label>
        </div>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-random-time-post">
          <label for="${prefix}checkbox-is-random-time-post" style="user-select: none;">${getTextWithLanguage({ vi: "Ngẫu nhiên thời gian đăng bài", en: "Random time post" })}</label>
        </div>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-fix-steal-all-focus">
          <label for="${prefix}checkbox-is-fix-steal-all-focus" style="user-select: none;">${getTextWithLanguage({ vi: "Tránh nhảy tab hoàn toàn (Thử nghiệm)", en: "Fix steal all focus (Beta)" })}</label>
        </div>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-shuffle-scheduler-time">
          <label for="${prefix}checkbox-is-shuffle-scheduler-time" style="user-select: none;">${getTextWithLanguage({ vi: "Tự động trộn lịch (Thử nghiệm)", en: "Shuffle scheduler time (Beta)" })}</label>
        </div>
      </div>
    `;

    const schedulerHTML = `
      <div class="${prefix}section">
        <h2>${getTextWithLanguage({ vi: "Cài đặt lịch", en: "Scheduler" })}</h2>
        <div class="${prefix}field-container field-checkbox">
          <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-scheduler">
          <label for="${prefix}checkbox-is-scheduler" style="user-select: none;">${getTextWithLanguage({ vi: "Chế độ lên lịch", en: "Scheduler Mode" })}</label>
        </div>
        <div id="${prefix}div-scheduler-options" style="padding-left: 16px; max-width: 300px; min-width: 200px;">
          <div style="margin-bottom: 4px; margin-top: 4px;">
            <button class="not-style" style="padding: 6px; font-size: 12px" id="${prefix}btn-view-scheduler">${getTextWithLanguage({ vi: "Xem lịch", en: "View scheduler" })}</button>
          </div>
          <div id="${prefix}div-scheduler-setting" style="margin-top: 8px;">
            <label for="${prefix}select-scheduler-type" style="margin-bottom: 4px; display: inline-block;">${getTextWithLanguage({ vi: "Chọn loại lịch", en: "Select scheduler type" })}:</label>
            <select id="${prefix}select-scheduler-type" class="custom-select" style="padding: 4px 0; width: 100%;">
              <option value="${SCHEDULER_TYPE.DAILY_HOURS}">${getTextWithLanguage({ vi: "Hàng giờ cố định (1:00,2:00,...)", en: "Daily hours (1:00,2:00,...)" })}</option>
              <option value="${SCHEDULER_TYPE.EVERY_MINUTES}">${getTextWithLanguage({ vi: "Mỗi phút tùy chỉnh", en: "Every minutes custom" })} (1,5,10,...)</option>
              <option value="${SCHEDULER_TYPE.EVERY_HOURS}">${getTextWithLanguage({ vi: "Mỗi giờ tùy chỉnh", en: "Every hours custom" })} (1,2,3,...)</option>
              <option value="${SCHEDULER_TYPE.CUSTOM_DAILY_MINUTES}">${getTextWithLanguage({ vi: "Bộ lịch mỗi phút", en: "Custom scheduler every minutes" })} (1,5,10,...)</option>
              <option value="${SCHEDULER_TYPE.CUSTOM_DAILY_HOURS}">${getTextWithLanguage({ vi: "Bộ lịch mỗi giờ", en: "Custom scheduler every hours" })} (1,2,3,...)</option>
            </select>
            <div id="${prefix}div-scheduler-daily-hours" style="display: none; padding: 4px; margin-top: 4px;">
              <div style="text-align: right;">
                <button class="not-style" style="padding: 4px; font-size: 12px; " id="${prefix}btn-reset-daily-hours">${getTextWithLanguage({ vi: "Đặt lại hàng ngày", en: "Reset daily hours" })}</button>
              </div>
            </div>
            <div id="${prefix}scheduler-custom" style="margin-left: 12px; margin-top: 6px;"></div>
          </div>
        </div>
        <div class="special-frame-hours-container">
          <div class="${prefix}field-container field-checkbox">
            <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-special-frame-hours">
            <label for="${prefix}checkbox-is-special-frame-hours" style="user-select: none;">${getTextWithLanguage({ vi: "Khung giờ đặc biệt", en: "Special frame hours" })}</label>
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap; padding-left: 18px; margin-top: 6px" class="inner-special-frame-hours">
            <button class="not-style" id="${prefix}btn-add-special-frame-hours">${getTextWithLanguage({ vi: "Thêm khung giờ", en: "Add frame hours" })}</button>
            <button class="not-style" id="${prefix}btn-view-special-frame-hours">${getTextWithLanguage({ vi: "Xem khung giờ", en: "Show frame hours" })}</button>
            <button class="not-style" id="${prefix}btn-clear-special-frame-hours">${getTextWithLanguage({ vi: "Xóa toàn bộ khung giờ", en: "Clear frame hours" })}</button>
          </div>
        </div>
      </div>
    `;

    const timeDelayHTML = `
      <div class="${prefix}section">
        <h2 class="${prefix}title-section">${getTextWithLanguage({ vi: "Cài đặt thời gian chờ khi đăng bài (sẽ cộng trừ một vài đơn vị)", en: "Delay Settings for posting (will add or subtract a few units)" })}</h2>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px">
          <div class="${prefix}field-container">
            <label for="${prefix}input-delay-click-to-post" style="font-size: 13px">${getTextWithLanguage({ vi: "Chọn thời gian chờ nhấn nút hiển thị hộp thoại đăng", en: "Enter delay click to post" })} (${getTextWithLanguage({ vi: "Giây", en: "Seconds" })}): </label>
            <input min="1"  type="number" id="${prefix}input-delay-click-to-post" class="${prefix}input-outline" placeholder="Ex: 1,5,10,...">
          </div>
          <div class="${prefix}field-container">
            <label for="${prefix}input-delay-fill-content" style="font-size: 13px">${getTextWithLanguage({ vi: "Chọn thời gian chờ điền nội dung", en: "Enter delay fill content" })} (${getTextWithLanguage({ vi: "Giây", en: "Seconds" })}): </label>
            <input min="1"  type="number" id="${prefix}input-delay-fill-content" class="${prefix}input-outline" placeholder="Ex: 1,5,10,...">
          </div>
          <div class="${prefix}field-container">
            <label for="${prefix}input-delay-fill-file" style="font-size: 13px">${getTextWithLanguage({ vi: "Chọn thời gian chờ điền tệp/file", en: "Enter delay fill file" })} (${getTextWithLanguage({ vi: "Giây", en: "Seconds" })}): </label>
            <input min="1"  type="number" id="${prefix}input-delay-fill-file" class="${prefix}input-outline" placeholder="Ex: 1,5,10,...">
          </div>
          <div class="${prefix}field-container">
            <label for="${prefix}input-delay-post" style="font-size: 13px">${getTextWithLanguage({ vi: "Chọn thời gian chờ nhấn nút đăng bài", en: "Enter delay post" })} (${getTextWithLanguage({ vi: "Giây", en: "Seconds" })}): </label>
            <input min="1"  type="number" id="${prefix}input-delay-post" class="${prefix}input-outline" placeholder="Ex: 1,5,10,...">
          </div>
          <div class="${prefix}field-container">
            <label for="${prefix}input-delay-open-new-tab" style="font-size: 13px">${getTextWithLanguage({ vi: "Chọn thời gian chờ mở tab mới", en: "Enter delay open new tab" })} (${getTextWithLanguage({ vi: "Giây", en: "Seconds" })}): </label>
            <input min="1" type="number" id="${prefix}input-delay-open-new-tab" class="${prefix}input-outline" placeholder="Ex: 1,5,10,...">
          </div>
        </div>
      </div>
    `;

    const basicSettingHTML = `
      <div class="${prefix}basic-setting">
        ${groupsHTML}
        ${optionalHTML}
        ${schedulerHTML}
        ${timeDelayHTML}
      </div>
  `;

    rootSetting.innerHTML = basicSettingHTML;

    const root = anchorElem.querySelector("#tm_root");
    if (root) {
      root.appendChild(rootSetting);
    }

    const {
      setIsShow: setIsShowViewDialogScheduler,
      changeContent: changeViewSchedulerContent,
    } = createDialog({
      html: dialogViewScheduler(null, []),
      isConfirm: true,
    });

    const { setIsShow: setIsShowDialogAddSpecialHours } = createDialog({
      html: createDialogAddSpecialHours(),
      isConfirm: true,
      title: getTextWithLanguage({
        vi: "Thêm khung giờ đặc biệt",
        en: "Add special hours",
      }),
    });

    const {
      setIsShow: setIsShowDialogViewSpecialHours,
      changeContent: changeContentDialogViewSpecialHours,
    } = createDialog({
      html: "",
      title: getTextWithLanguage({
        vi: "Khung giờ đặc biệt",
        en: "Special frame hours",
      }),
    });

    let scheduler = await getSchedulerService();

    function schedulerEvent() {
      function setShowSchedulerDailyHours(isShow) {
        const divDailyHours = root.querySelector(
          `#${prefix}div-scheduler-daily-hours`,
        );
        if (divDailyHours) {
          divDailyHours.style.display = isShow ? "block" : "none";
        }
      }

      return {
        setShowSchedulerDailyHours,
      };
    }

    const { setShowSchedulerDailyHours } = schedulerEvent();

    async function onChangeSchedulerType(val, isSave = true) {
      try {
        if (isSave) {
          await changeTypeScheduler(val);
        }

        const details = await getSchedulerDetail(val);

        const listTime = await getSchedulerWithType(val);

        changeViewSchedulerContent(dialogViewScheduler(val, listTime));

        function createElementSchedulerCustom({
          label = "",
          id = "",
          placeholder = "",
          value,
          onSave,
        }) {
          const div = document.createElement("div");
          div.id = `${prefix}div-scheduler-custom-daily-hours`;
          div.style.padding = "4px";
          div.style.marginTop = "4px";

          const labelEl = document.createElement("label");
          labelEl.htmlFor = id;
          labelEl.style.fontSize = "12px";
          labelEl.innerText = label;

          const input = document.createElement("input");
          input.type = "number";
          input.id = id;
          input.className = `${prefix}input-outline not-style`;
          input.placeholder = placeholder;
          input.value = value || "";
          input.style.marginTop = "4px";

          const divSave = document.createElement("div");
          divSave.style.textAlign = "right";
          divSave.style.marginTop = "8px";

          const buttonSave = document.createElement("button");
          buttonSave.className = "not-style";
          buttonSave.style.padding = "6px 12px";
          buttonSave.style.fontSize = "12px";
          buttonSave.id = `${prefix}btn-save-scheduler`;
          buttonSave.innerText = getTextWithLanguage({
            vi: "Lưu",
            en: "Save",
          });

          buttonSave.onclick = () => {
            const value = input.value;
            onSave?.(Number(value));
          };

          divSave.appendChild(buttonSave);
          div.appendChild(labelEl);
          div.appendChild(input);
          div.appendChild(divSave);

          return div;
        }

        const divSchedulerCustom = document.querySelector(
          `#${prefix}scheduler-custom`,
        );
        if (divSchedulerCustom) {
          divSchedulerCustom.innerHTML = "";
        }

        setShowSchedulerDailyHours(val === SCHEDULER_TYPE.DAILY_HOURS);

        const timeValue = details?.scheduler_time_value || 5;

        switch (val) {
          case SCHEDULER_TYPE.EVERY_MINUTES:
            const divCustomEveryMinutes = createElementSchedulerCustom({
              label: getTextWithLanguage({
                vi: "Nhập tùy chỉnh mỗi phút",
                en: "Enter custom every minutes",
              }),
              id: `${prefix}input-${SCHEDULER_TYPE.EVERY_MINUTES}`,
              placeholder: "Ex: 1,2,3,...",
              value: timeValue,
              onSave: async (value) => {
                try {
                  await setSchedulerDetail(val, {
                    scheduler_time_list: null,
                    scheduler_time_value: Number(value),
                  });
                  showNotify({
                    message: getTextWithLanguage({
                      vi: "Lưu cài đặt thành công",
                      en: "Save settings successfully",
                    }),
                  });
                  addLog({
                    vi:
                      "Đã cập nhật thời gian cho lịch trình tùy chỉnh: " +
                      value +
                      " phút",
                    en:
                      "Updated time for custom schedule: " + value + " minutes",
                  });
                } catch (error) {
                  logError("Error at save every minutes: ", error);
                  showNotify({
                    message: getTextWithLanguage({
                      vi: "Lưu cài đặt thất bại",
                      en: "Save settings failed",
                    }),
                    type: "error",
                  });
                }
              },
            });
            if (divSchedulerCustom) {
              divSchedulerCustom.appendChild(divCustomEveryMinutes);
            }
            break;
          case SCHEDULER_TYPE.EVERY_HOURS:
            const divCustomEveryHours = createElementSchedulerCustom({
              label: getTextWithLanguage({
                vi: "Nhập tùy chỉnh mỗi giờ",
                en: "Enter custom every hours",
              }),
              id: `${prefix}input-${SCHEDULER_TYPE.EVERY_HOURS}`,
              placeholder: "Ex: 1,2,3,...",
              value: timeValue,
              onSave: async (value) => {
                try {
                  await setSchedulerDetail(val, {
                    scheduler_time_list: null,
                    scheduler_time_value: Number(value),
                  });
                  showNotify({
                    message: getTextWithLanguage({
                      vi: "Lưu cài đặt thành công",
                      en: "Save settings successfully",
                    }),
                  });
                  addLog({
                    vi:
                      "Đã cập nhật thời gian cho lịch trình tùy chỉnh: " +
                      value +
                      " giờ",
                    en: "Updated time for custom schedule: " + value + " hours",
                  });
                } catch (error) {
                  logError("Error at save every hours: ", error);
                  showNotify({
                    message: getTextWithLanguage({
                      vi: "Lưu cài đặt thất bại",
                      en: "Save settings failed",
                    }),
                    type: "error",
                  });
                }
              },
            });
            if (divSchedulerCustom) {
              divSchedulerCustom.appendChild(divCustomEveryHours);
            }

            break;
          case SCHEDULER_TYPE.CUSTOM_DAILY_MINUTES:
            const divCustomDailyMinutes = createElementSchedulerCustom({
              label: getTextWithLanguage({
                vi: "Nhập giá trị bộ lịch mỗi phút",
                en: "Enter value of scheduler every minutes",
              }),
              id: `${prefix}input-${SCHEDULER_TYPE.CUSTOM_DAILY_MINUTES}`,
              placeholder: "Ex: 1,2,3,...",
              value: timeValue,
              onSave: async (value) => {
                await saveCustomDailyMinutesEvent(value, val);
              },
            });
            if (divSchedulerCustom) {
              divSchedulerCustom.appendChild(divCustomDailyMinutes);
            }

            break;

          case SCHEDULER_TYPE.CUSTOM_DAILY_HOURS:
            const divCustomDailyHours = createElementSchedulerCustom({
              label: getTextWithLanguage({
                vi: "Nhập giá trị bộ lịch mỗi giờ",
                en: "Enter value of scheduler every hours",
              }),
              id: `${prefix}input-${SCHEDULER_TYPE.CUSTOM_DAILY_HOURS}`,
              placeholder: "Ex: 1,2,3,...",
              value: timeValue,
              onSave: async (value) => {
                await saveCustomDailyHoursEvent(value, val);
              },
            });
            if (divSchedulerCustom) {
              divSchedulerCustom.appendChild(divCustomDailyHours);
            }
            break;

          case SCHEDULER_TYPE.FRAME_HOURS:
            break;

          default:
            break;
        }

        scheduler.scheduler_type = val;

        return true;
      } catch (error) {
        handleErrorHelper({
          name: "changeSchedulerType",
          error,
          isShowNotify: false,
        });
        return false;
      }
    }

    //initial data for panel setting
    async function initialDataPanelSetting() {
      await onChangeSchedulerType(scheduler.scheduler_type, false);
      changeViewSchedulerContent(
        dialogViewScheduler(
          scheduler.scheduler_type,
          await getSchedulerWithType(scheduler.scheduler_type),
        ),
      );
      const select = document.querySelector(`#${prefix}select-scheduler-type`);
      if (select) {
        select.value = scheduler.scheduler_type;
      }
    }

    await initialDataPanelSetting();

    async function saveCustomDailyHoursEvent(value, type) {
      const inputCustomHours = document.querySelector(
        `#${prefix}input-${SCHEDULER_TYPE.CUSTOM_DAILY_HOURS}`,
      );
      const isScheduler = await getIsSchedulerData();
      try {
        if (inputCustomHours) {
          const val = value || inputCustomHours.value;
          const listTime = createSchedulerHours(val);
          changeViewSchedulerContent(
            dialogViewScheduler(scheduler.scheduler_type, listTime),
          );
          await setSchedulerDetail(type, {
            scheduler_time_list: listTime,
            scheduler_time_value: Number(val),
          });
          showNotify({
            message: "Save custom every hours successfully",
            type: "success",
          });
          addLog({
            vi: `Đã cập nhật bộ lịch với khoảng thời gian mới: ${val} giờ`,
            en: `Updated new interval: ${val} hours`,
          });
          if (isScheduler) {
            clearAndCreateSchedulerAlarm();
            addLog({
              vi: "Chức năng lên lịch đang được bật, hãy chú ý thời gian đăng bài tiếp theo",
              en: "Scheduler is enabled, please pay attention to the next post time",
            });
          }
        }
      } catch (error) {
        logError("Error at save custom daily hours: ", error);
        showNotify({
          message: getTextWithLanguage({
            vi: "Lỗi khi lưu bộ lịch",
            en: "Error when saving scheduler",
          }),
          type: "error",
        });
      }
    }

    async function saveCustomDailyMinutesEvent(value, type) {
      const inputCustomMinutes = document.querySelector(
        `#${prefix}input-${SCHEDULER_TYPE.CUSTOM_DAILY_MINUTES}`,
      );
      value = Number(value);
      try {
        const isScheduler = await getIsSchedulerData();
        const isTest = await getIsTestInStorage();
        const isDevMode = await getIsDeveloperModeInStorage();

        if (value < 5) {
          if (isTest || isDevMode) value = Math.max(1, value);
          else value = 5;
          inputCustomMinutes.value = value;
        }

        const listTime = await createSchedulerMinutes(value);

        await setSchedulerDetail(type, {
          scheduler_time_value: value,
          scheduler_time_list: listTime,
        });

        changeViewSchedulerContent(dialogViewScheduler(type, listTime));
        showNotify({
          message: getTextWithLanguage({
            en: "Save custom every minutes successfully",
            vi: "Lưu cài đặt khoảng thời gian thành công",
          }),
          type: "success",
        });

        addLog({
          vi: `Đã cập nhật bộ lịch với khoảng thời gian mới: ${value} phút`,
          en: `Updated new interval: ${value} minutes`,
        });
        if (isScheduler) {
          clearAndCreateSchedulerAlarm();
          addLog({
            vi: "Chức năng lên lịch đang được bật, hãy chú ý thời gian đăng bài tiếp theo",
            en: "Scheduler is enabled, please pay attention to the next post time",
          });
        }
      } catch (error) {
        logError("Error at save custom daily minutes: ", error);
        showNotify({
          message: getTextWithLanguage({
            vi: "Lỗi khi cập nhật bộ lịch",
            en: "Error when updating scheduler",
          }),
          type: "error",
        });
        inputCustomMinutes.value = value;
      }
    }

    async function addEvent() {
      try {
        const btnSaveMaxGroupPerTime = document.querySelector(
          `#tm_btn-save-max-group-per-time`,
        );
        if (btnSaveMaxGroupPerTime) {
          btnSaveMaxGroupPerTime.addEventListener("click", async () => {
            try {
              const maxGroupPerTime = document.querySelector(
                `#tm_input-max-group-per-time`,
              );
              if (maxGroupPerTime) {
                let val = maxGroupPerTime.value;
                if (!Number.isNaN(Number(val))) {
                  val = Math.max(1, Number(val));
                  await setMaxGroupPerTimeData(Number(val));
                } else {
                  await setMaxGroupPerTimeData(1);
                }
              }
              showNotify({
                message: getTextWithLanguage({
                  en: "Save max group per time successfully",
                  vi: "Lưu cài đặt số bài đăng trong mỗi đợt thành công",
                }),
                type: "success",
              });
              await Promise.all([
                setCurrentCountPostLength(0),
                setCountBatchPost(0),
                setCountResetGroupInStorage(0),
              ]);
              updateDataSavedInfo();
            } catch (error) {
              logError("Error save max group per time: ", error);
              showNotify({
                message: getTextWithLanguage({
                  en: "Save max group per time failed",
                  vi: "Lưu cài đặt số bài đăng trong mỗi đợt thất bại",
                }),
                type: "error",
              });
            }
          });
        }

        //scheduler
        const btnViewScheduler = document.querySelector(
          `#tm_btn-view-scheduler`,
        );
        if (btnViewScheduler) {
          btnViewScheduler.addEventListener("click", () => {
            setIsShowViewDialogScheduler(true);
          });
        }

        const btnResetDailyHours = document.querySelector(
          `#tm_btn-reset-daily-hours`,
        );
        if (btnResetDailyHours) {
          btnResetDailyHours.addEventListener("click", async () => {
            try {
              const listTime = createSchedulerDailyHours();
              await setSchedulerDetail(SCHEDULER_TYPE.DAILY_HOURS, {
                scheduler_time_list: listTime,
                scheduler_time_value: null,
              });
              changeViewSchedulerContent(
                dialogViewScheduler(scheduler.scheduler_type, listTime),
              );
              showNotify({
                message: "Reset daily hours successfully",
                type: "success",
              });
            } catch (error) {
              logError("Error at reset daily hours", error);
              showNotify({
                vi: "Đã có lỗi xảy ra",
                en: "Some thing went wrong",
              });
            }
          });
        }
        //end scheduler

        const btnSaveStrictlyMatchTitleGroup = root.querySelector(
          `#${prefix}btn-save-strictly-match-title-group`,
        );
        if (btnSaveStrictlyMatchTitleGroup) {
          btnSaveStrictlyMatchTitleGroup.addEventListener("click", async () => {
            try {
              const inputStrictlyMatchTitleGroup = root.querySelector(
                `#${prefix}input-strictly-match-title-group`,
              );
              const val = inputStrictlyMatchTitleGroup.value;
              await setStrictlyMatchTitleGroupData(val);
              showNotify({
                message: "Save keywords successfully",
                type: "success",
              });
            } catch (error) {
              logError("Error setStrictlyMatchTitleGroupInStorage: ", error);
              showNotify({
                message: "Some thing went wrong",
                type: "error",
              });
            }
          });
        }

        const btnAddSpecialFrameHours = root.querySelector(
          `#${prefix}btn-add-special-frame-hours`,
        );
        if (btnAddSpecialFrameHours) {
          btnAddSpecialFrameHours.addEventListener("click", () => {
            setIsShowDialogAddSpecialHours(true);
          });
        }

        const btnViewSpecialFrameHours = root.querySelector(
          `#${prefix}btn-view-special-frame-hours`,
        );
        if (btnViewSpecialFrameHours) {
          btnViewSpecialFrameHours.addEventListener("click", async () => {
            try {
              const framesHours = await getSpecialFrameHoursService();
              changeContentDialogViewSpecialHours(
                createDialogViewSpecialFrameHours(framesHours),
              );
              setIsShowDialogViewSpecialHours(true);
            } catch (error) {
              logError("Error btnViewSpecialFrameHours: ", error);
              showNotify({
                message: getTextWithLanguage({
                  en: "Some thing went wrong",
                  vi: "Đã có lỗi xảy ra",
                }),
                type: "error",
              });
            }
          });
        }

        const btnClearSpecialFrameHours = root.querySelector(
          `#${prefix}btn-clear-special-frame-hours`,
        );
        if (btnClearSpecialFrameHours) {
          let isConfrimClear = false;
          let timerDelete = null;
          btnClearSpecialFrameHours.addEventListener("click", async () => {
            try {
              if (isConfrimClear) {
                clearTimeout(timerDelete);
                await clearAllSpecialFrameHours();
                showNotify({
                  message: getTextWithLanguage({
                    vi: "Xóa tất cả khung giờ thành công",
                    en: "Delete all frames hours success!",
                  }),
                  type: "success",
                });
                isConfrimClear = false;
                btnClearSpecialFrameHours.textContent = getTextWithLanguage({
                  vi: "Xóa tất cả khung giờ",
                  en: "Delete all frames hours",
                });
                btnClearSpecialFrameHours.style.backgroundColor = "";
                return;
              }
              isConfrimClear = true;
              btnClearSpecialFrameHours.textContent = getTextWithLanguage({
                vi: "Xác nhận",
                en: "Confirm",
              });
              btnClearSpecialFrameHours.style.backgroundColor =
                "var(--tm-text-danger)";

              timerDelete = setTimeout(() => {
                isConfrimClear = false;
                btnClearSpecialFrameHours.textContent = getTextWithLanguage({
                  vi: "Xóa tất cả khung giờ",
                  en: "Delete all frames hours",
                });
                btnClearSpecialFrameHours.style.backgroundColor = "";
              }, 3000);
            } catch (error) {
              logError("Error btnClearSpecialFrameHours: ", error);
              showNotify({
                message: getTextWithLanguage({
                  vi: "Xóa tất cả khung giờ thất bại",
                  en: "Delete all frames hours fail!",
                }),
                type: "error",
              });
              isConfrimClear = false;
            }
          });
        }
      } catch (error) {
        logError("Error at addEvent: ", error);
      }
    }

    await addEvent();

    //add event for fields
    async function addFieldsEvent() {
      try {
        const inputStrictlyMatchGroup = root.querySelector(
          `#${prefix}input-strictly-match-title-group`,
        );
        if (inputStrictlyMatchGroup) {
          //ctrl + s/S to save keywords
          inputStrictlyMatchGroup.addEventListener("keydown", async (e) => {
            if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
              e.preventDefault();
              try {
                const val = inputStrictlyMatchGroup.value;
                await setStrictlyMatchTitleGroupData(val);
                showNotify({
                  message: getTextWithLanguage({
                    vi: "Lưu từ khóa thành công",
                    en: "Save keywords success!",
                  }),
                  type: "success",
                });
              } catch (error) {
                logError("Error setStrictlyMatchTitleGroupInStorage: ", error);
                showNotify({
                  message: getTextWithLanguage({
                    vi: "Đã có lỗi xảy ra",
                    en: "Some thing went wrong!",
                  }),
                  type: "error",
                });
              }
            }
          });
        }

        const checkboxIsProcessing = root.querySelector(
          `#tm_checkbox-is-processing`,
        );
        if (checkboxIsProcessing) {
          checkboxIsProcessing.addEventListener("change", async (e) => {
            try {
              const val = e.target.checked;
              await setProgress(val);
              if (!val) {
                const isScheduler = await getIsSchedulerData();
                if (isScheduler) {
                  clearAndCreateSchedulerAlarm();
                }
              }
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsProcessing",
                error,
                isShowNotify: false,
              });
            }
          });
        }

        const checkboxIsTest = root.querySelector(`#tm_checkbox-is-test`);
        if (checkboxIsTest) {
          checkboxIsTest.addEventListener("change", async (e) => {
            const val = e.target.checked;
            try {
              await setIsTestInStorage(val);
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsTest",
                error,
                isShowNotify: false,
              });
              e.target.checked = !val;
            }
            // console.log(e);
          });
        }

        const checkboxIsFixStealFocus = root.querySelector(
          "#tm_checkbox-is-fix-steal-focus",
        );
        if (checkboxIsFixStealFocus) {
          checkboxIsFixStealFocus.addEventListener("change", async (e) => {
            const val = e.target.checked;
            try {
              await setIsFixStealFocusData(val);
              updateDataSavedInfo();
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsFixStealFocus",
                error,
                isShowNotify: false,
              });
              e.target.checked = !val;
            }
          });
        }

        const checkboxIsFixStealAllFocus = root.querySelector(
          "#tm_checkbox-is-fix-steal-all-focus",
        );
        if (checkboxIsFixStealAllFocus) {
          checkboxIsFixStealAllFocus.addEventListener("change", async (e) => {
            const val = e.target.checked;
            try {
              // DB_setValue(KEY_IS_FIX_STEAL_ALL_FOCUS, val);
              await setIsFixStealAllFocusData(val);
              updateDataSavedInfo();
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsFixStealAllFocus",
                error,
                isShowNotify: false,
              });
              e.target.checked = !val;
            }
          });
        }

        const checboxIsShuffleSchedulerTime = root.querySelector(
          `#${prefix}checkbox-is-shuffle-scheduler-time`,
        );
        if (checboxIsShuffleSchedulerTime) {
          checboxIsShuffleSchedulerTime.addEventListener("change", (e) => {
            const val = e.target.checked;
            //DO THEN
            DB_setValue(KEY_IS_SHUFFLE_SCHEDULER_TIME, val);
            updateDataSavedInfo();
          });
        }

        const checboxIsShuffleGroupsNeedPost = root.querySelector(
          `#${prefix}checkbox-is-shuffle-groups-need-post`,
        );
        if (checboxIsShuffleGroupsNeedPost) {
          checboxIsShuffleGroupsNeedPost.addEventListener(
            "change",
            async (e) => {
              const val = e.target.checked;
              try {
                // DB_setValue(KEY_IS_SHUFFLE_GROUPS_NEED_POST, val);
                await setIsShuffleGroupNeedPostData(val);
                updateDataSavedInfo();
              } catch (error) {
                handleErrorHelper({
                  name: "checboxIsShuffleGroupsNeedPost",
                  error,
                  isShowNotify: false,
                });
                e.target.checked = !val;
              }
            },
          );
        }

        const checkboxIsSpammed = root.querySelector(
          `#${prefix}checkbox-is-spammed`,
        );
        if (checkboxIsSpammed) {
          checkboxIsSpammed.addEventListener("change", async (e) => {
            const val = e.target.checked;
            // DB_setValue(KEY_IS_SPAMMED, val);
            try {
              await setIsSpammedData(val);
              updateDataSavedInfo();
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsSpammed",
                error,
                isShowNotify: false,
              });
              e.target.checked = !val;
            }
          });
        }

        const checkboxIsRandomBatchPost = root.querySelector(
          `#${prefix}checkbox-is-random-batch-post`,
        );
        if (checkboxIsRandomBatchPost) {
          checkboxIsRandomBatchPost.addEventListener("change", async (e) => {
            const val = e.target.checked;
            // DB_setValue(KEY_IS_RANDOM_BATCH_POST, val);
            try {
              await setIsRandomBreakBatchData(val);
              updateDataSavedInfo();
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsRandomBatchPost",
                error,
                isShowNotify: false,
              });
              e.target.checked = !val;
            }
          });
        }

        const checkboxIsRandomTimePost = root.querySelector(
          `#${prefix}checkbox-is-random-time-post`,
        );
        if (checkboxIsRandomTimePost) {
          checkboxIsRandomTimePost.addEventListener("change", async (e) => {
            const val = e.target.checked;
            // DB_setValue(KEY_IS_RANDOM_TIME_POST, val);
            try {
              await setIsRandomTimePostData(val);
              updateDataSavedInfo();
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsRandomTimePost",
                error,
                isShowNotify: false,
              });
              e.target.checked = !val;
            }
          });
        }

        const checkboxIsScheduler = root.querySelector(
          `#tm_checkbox-is-scheduler`,
        );
        if (checkboxIsScheduler) {
          checkboxIsScheduler.addEventListener("change", async (e) => {
            const val = e.target.checked;
            try {
              await setIsSchedulerData(val);
              if (!val) {
                clearSchedulerAuto();
                addLog({
                  vi: "Chức năng lên lịch tự động đã được tắt",
                  en: "Turn off scheduler auto",
                });
              } else {
                await clearAndCreateSchedulerAlarm();
                await logSchedulerHelper();
              }
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsScheduler",
                error,
                isShowNotify: false,
              });
              e.target.checked = !val;
            }
          });
        }

        const checkboxIsSpecialFrameHours = root.querySelector(
          `#${prefix}checkbox-is-special-frame-hours`,
        );
        if (checkboxIsSpecialFrameHours) {
          checkboxIsSpecialFrameHours.addEventListener("change", async (e) => {
            const val = e.target.checked;
            try {
              // DB_setValue(KEY_IS_SPECIAL_FRAME_HOURS, val);
              await setIsSpecialFrameHoursData(val);
              updateDataSavedInfo();
            } catch (error) {
              handleErrorHelper({
                name: "checkboxIsSpecialFrameHours",
                error,
                isShowNotify: false,
              });
              e.target.checked = !val;
            }
          });
        }

        const selectSchedulerType = root.querySelector(
          `#${prefix}select-scheduler-type`,
        );
        if (selectSchedulerType) {
          selectSchedulerType.addEventListener("change", async (e) => {
            const val = e.target.value;
            const success = await onChangeSchedulerType(val);
            if (!success) {
              e.target.value = scheduler.scheduler_type;
            }
          });
        }

        //Delay time for each step when posting
        const timeDelay = await getTimeDelayData();

        const inputClickToPost = root.querySelector(
          `#tm_input-delay-click-to-post`,
        );
        const inputFillContent = root.querySelector(
          `#tm_input-delay-fill-content`,
        );
        const inputFillFile = root.querySelector(`#tm_input-delay-fill-file`);
        const inputOpenNewTab = root.querySelector(
          `#tm_input-delay-open-new-tab`,
        );
        const inputDelayPost = root.querySelector(`#tm_input-delay-post`);

        if (inputClickToPost) {
          inputClickToPost.addEventListener("change", async (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.time_delay_click_to_post =
              val || initialTimeDelay.time_delay_click_to_post;
            try {
              await setTimeDelayData(timeDelay);
            } catch (error) {
              logError("Error inputClickToPost change: ", error);
            }
          });
        }

        if (inputFillContent) {
          inputFillContent.addEventListener("change", async (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.time_delay_fill_content =
              val || initialTimeDelay.time_delay_fill_content;
            try {
              await setTimeDelayData(timeDelay);
            } catch (error) {
              logError("Error inputFillContent change: ", error);
            }
          });
        }

        if (inputFillFile) {
          inputFillFile.addEventListener("change", async (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.time_delay_fill_file =
              val || initialTimeDelay.time_delay_fill_file;
            try {
              await setTimeDelayData(timeDelay);
            } catch (error) {
              logError("Error inputFillFile change: ", error);
            }
          });
        }

        if (inputOpenNewTab) {
          inputOpenNewTab.addEventListener("change", async (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.time_delay_open_new_tab =
              val || initialTimeDelay.time_delay_open_new_tab;
            try {
              await setTimeDelayData(timeDelay);
            } catch (error) {
              logError("Error inputOpenNewTab change: ", error);
            }
          });
        }

        if (inputDelayPost) {
          inputDelayPost.addEventListener("change", (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.time_delay_post = val || initialTimeDelay.time_delay_post;
            try {
              setTimeDelayData(timeDelay);
            } catch (error) {
              logError("Error inputDelayPost change: ", error);
            }
          });
        }
      } catch (error) {
        logError("Error at addFieldsEvent: ", error);
      }
    }

    await addFieldsEvent();
  } catch (error) {
    logError("Error at createPanelSetting: ", error);
  }
}

export { createPanelSetting };
