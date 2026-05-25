import {
  initialTimeDelay,
  KEY_IS_DEVELOPER_MODE,
  KEY_IS_FIX_STEAL_ALL_FOCUS,
  KEY_IS_FIX_STEAL_FOCUS,
  KEY_IS_IN_PROGRESS,
  KEY_IS_RANDOM_BATCH_POST,
  KEY_IS_RANDOM_TIME_POST,
  KEY_IS_SHUFFLE_GROUPS_NEED_POST,
  KEY_IS_SHUFFLE_SCHEDULER_TIME,
  KEY_IS_SPAMMED,
  KEY_IS_SPECIAL_FRAME_HOURS,
  KEY_IS_TEST,
  KEY_MAX_GROUP_PER_TIME,
  prefix,
} from "../../../contants/contants.js";
import {
  getTextWithLanguage,
  logError,
  now,
  randomID,
} from "../../../utils/utils.js";
import {
  createSchedulerDailyHours,
  createSchedulerHours,
  createSchedulerMinutes,
  getCorrectNextTime,
  getListFrameHours,
  getSchedulerWithType,
} from "../helpers/scheduler.js";
import {
  getTimeDelayInStorage,
  setStrictlyMatchTitleGroupInStorage,
  setTimeDelayInStorage,
} from "../helpers/storage.js";
import {
  addSpecialFrameHoursService,
  clearAndCreateSchedulerAlarm,
  clearSchedulerAuto,
  deleteSpecialFrameHoursService,
  getIsScheduler,
  getSchedulerService,
  getSpecialFrameHoursService,
  setSchedulerService,
  setSpecialFrameHoursService,
  updateSpecialFrameHoursService,
} from "../services/scheduler-service.js";
import { DB_getValue, DB_setValue } from "../utils/api-helper.js";
import { updateDataSavedInfo } from "./dataSavedInfo.js";
import { createDialog, dialogViewScheduler } from "./dialog.js";
import { showNotify } from "./notify.js";
import { addLog } from "./panel-log.js";

async function createPanelSetting(anchorElem = document.body) {
  try {
    const rootSetting = document.createElement("div");
    rootSetting.className = "tm_tab-setting";
    rootSetting.setAttribute("data-tab-value", "settings");

    const groupsHTML = `
      <div class="${prefix}section">
        <h2>${getTextWithLanguage({ vi: "Cài đặt nâng cao", en: "Advanced Setting" })}</h2>
        <div class="${prefix}field-container">
            <label for="${prefix}input-max-group-per-time">${getTextWithLanguage({ vi: "Số lượng nhóm tối đa mỗi lần", en: "Max group per time" })}</label>
            <div style="display: flex; gap: 4px;">
              <input min="1" type="number" id="${prefix}input-max-group-per-time" class="${prefix}input-outline" style="display: inline-block; flex: 1;">
              <button id="${prefix}btn-save-max-group-per-time" class="not-style">${getTextWithLanguage({ vi: "Lưu", en: "Save" })}</button>
            </div>
          </div>
          <div style="">
            <div class="${prefix}field-container">
              <label for="${prefix}input-strictly-match-title-group">${getTextWithLanguage({ vi: `Các từ khóa lọc nghiêm ngặt trong tên (cách nhau bằng dấu phẩy ',')`, en: "Strictly match title keywords group (separate by comma ',')" })}</label>
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
        <h2>${getTextWithLanguage({ vi: "Tùy chọn thêm", en: "Optionals" })}</h2>
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
        <div id="${prefix}div-scheduler-options" style="padding-left: 16px; max-width: 250px; min-width: 200px;">
          <div style="margin-bottom: 4px; margin-top: 4px;">
            <button class="not-style" style="padding: 6px; font-size: 12px" id="${prefix}btn-view-scheduler">${getTextWithLanguage({ vi: "Xem lịch", en: "View scheduler" })}</button>
          </div>
          <div id="${prefix}div-scheduler-setting" style="margin-top: 8px;">
            <label for="${prefix}select-scheduler-type" style="margin-bottom: 4px; display: inline-block;">${getTextWithLanguage({ vi: "Chọn loại lịch", en: "Select scheduler type" })}:</label>
            <select id="${prefix}select-scheduler-type" class="custom-select" style="padding: 4px 0; width: 100%;">
              <option value="daily-hours">${getTextWithLanguage({ vi: "Hàng giờ (1:00,2:00,...)", en: "Daily hours (1:00,2:00,...)" })}</option>
              <option value="custom-every-minutes">${getTextWithLanguage({ vi: "Mỗi phút", en: "Every minutes" })} (1,5,10,...)</option>
              <option value="custom-every-hours">${getTextWithLanguage({ vi: "Mỗi giờ", en: "Every hours" })} (1,2,3,...)</option>
              <option value="custom-frame-hours">${getTextWithLanguage({ vi: "Khung giờ", en: "Frame hours" })} (1:01,2:12,4:20,...)</option>
            </select>
            <div id="${prefix}div-scheduler-daily-hours" style="display: none; padding: 4px; margin-top: 4px;">
              <div style="text-align: right;">
                <button class="not-style" style="padding: 4px; font-size: 12px; " id="${prefix}btn-reset-daily-hours">${getTextWithLanguage({ vi: "Đặt lại hàng ngày", en: "Reset daily hours" })}</button>
              </div>
            </div>
            <div id="${prefix}div-scheduler-custom-minutes" style="display: none; padding: 4px; margin-top: 4px;">
              <div class="${prefix}field-container">
                <label for="${prefix}input-custom-minutes" style="font-size: 11px">${getTextWithLanguage({ vi: "Nhập tùy chỉnh mỗi phút", en: "Enter custom every minutes" })}: </label>
                <input min="1"  type="number" id="${prefix}input-custom-minutes" class="${prefix}input-outline not-style" placeholder="Ex: 1,5,10,...">
                <div style="text-align: right;">
                  <button class="not-style" style="padding: 4px; font-size: 12px; " id="${prefix}btn-save-custom-minutes">${getTextWithLanguage({ vi: "Lưu", en: "Save" })}</button>
                </div>
              </div>
            </div>
            <div id="${prefix}div-scheduler-custom-hours" style="display: none; padding: 4px; margin-top: 4px;">
              <div class="${prefix}field-container">
                <label for="${prefix}input-custom-hours" style="font-size: 11px">${getTextWithLanguage({ vi: "Nhập tùy chỉnh mỗi giờ", en: "Enter custom every hours" })}: </label>
                <input min="1"  type="number" id="${prefix}input-custom-hours" class="${prefix}input-outline not-style" placeholder="Ex: 1,2,3,...">
                <div style="text-align: right;">
                  <button class="not-style" style="padding: 4px; font-size: 12px; " id="${prefix}btn-save-custom-hours">${getTextWithLanguage({ vi: "Lưu", en: "Save" })}</button>
                </div>
              </div>
            </div>
            <div id="${prefix}div-scheduler-custom-frame-hours" style="display: none; padding: 4px; margin-top: 4px;">
              <div class="${prefix}field-container">
                <label for="${prefix}input-custom-frame-hours" style="font-size: 11px">${getTextWithLanguage({ vi: "Nhập khung giờ (phân tách bằng dấu phẩy ',')", en: "Enter hours (Sperator with comma ',')" })} <p>${getTextWithLanguage({ vi: "Ví dụ", en: "Example" })}: 1:00, 2:00, 3:00,...</p></label>
                <input style="width: 100%; font-size: 12px;" type="text" id="${prefix}input-custom-frame-hours" class="${prefix}input-outline not-style" placeholder="Ex: 1:00,2:00,...">
              </div>
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                <button class="not-style" style="padding: 4px; font-size: 10px; " id="${prefix}btn-add-frame-hours">${getTextWithLanguage({ vi: "Thêm khung giờ", en: "Add frame hours" })}</button>
                <button class="not-style" style="padding: 4px; font-size: 10px; " id="${prefix}btn-remove-frame-hours">${getTextWithLanguage({ vi: "Xóa khung giờ", en: "Remove frame hours" })}</button>
                <button class="not-style" style="padding: 4px; font-size: 10px; " id="${prefix}btn-reset-frame-hours">${getTextWithLanguage({ vi: "Đặt lại khung giờ", en: "Reset frame hours" })}</button>
              </div>
            </div>
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
        <h2>${getTextWithLanguage({ vi: "Cài đặt thời gian chờ (sẽ cộng trừ một vài đơn vị)", en: "Delay Settings (will add or subtract a few units)" })}</h2>
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

    const advancedSettingHTML = `
      <div class="${prefix}advanced-setting">
        ${groupsHTML}
        ${optionalHTML}
        ${schedulerHTML}
        ${timeDelayHTML}
      </div>
  `;

    rootSetting.innerHTML = advancedSettingHTML;

    const root = anchorElem.querySelector("#tm_root");
    if (root) {
      root.appendChild(rootSetting);
    }

    const {
      setIsShow: setIsShowViewDialogScheduler,
      changeContent: changeViewSchedulerContent,
    } = createDialog({
      html: dialogViewScheduler([]),
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
      function setShowSchedulerCustomMinutes(isShow) {
        const divCustomMinutes = root.querySelector(
          `#${prefix}div-scheduler-custom-minutes`,
        );
        if (divCustomMinutes) {
          divCustomMinutes.style.display = isShow ? "block" : "none";
        }
      }

      function setShowSchedulerCustomHours(isShow) {
        const divCustomHours = root.querySelector(
          `#${prefix}div-scheduler-custom-hours`,
        );
        if (divCustomHours) {
          divCustomHours.style.display = isShow ? "block" : "none";
        }
      }

      function setShowSchedulerCustomFrameHours(isShow) {
        const divCustomFrameHours = root.querySelector(
          `#${prefix}div-scheduler-custom-frame-hours`,
        );
        if (divCustomFrameHours) {
          divCustomFrameHours.style.display = isShow ? "block" : "none";
        }
      }

      function setShowSchedulerDailyHours(isShow) {
        const divDailyHours = root.querySelector(
          `#${prefix}div-scheduler-daily-hours`,
        );
        if (divDailyHours) {
          divDailyHours.style.display = isShow ? "block" : "none";
        }
      }

      return {
        setShowSchedulerCustomMinutes,
        setShowSchedulerCustomHours,
        setShowSchedulerCustomFrameHours,
        setShowSchedulerDailyHours,
      };
    }

    const {
      setShowSchedulerCustomFrameHours,
      setShowSchedulerCustomHours,
      setShowSchedulerCustomMinutes,
      setShowSchedulerDailyHours,
    } = schedulerEvent();

    async function onChangeSchedulerType(val) {
      const newSchduler = await getSchedulerService();
      newSchduler.type = val;

      changeViewSchedulerContent(
        dialogViewScheduler(await getSchedulerWithType(val)),
      );

      switch (val) {
        case "daily-hours":
          setShowSchedulerCustomHours(false);
          setShowSchedulerCustomMinutes(false);
          setShowSchedulerCustomFrameHours(false);
          setShowSchedulerDailyHours(true);
          break;
        case "custom-every-minutes":
          setShowSchedulerCustomHours(false);
          setShowSchedulerCustomMinutes(true);
          setShowSchedulerCustomFrameHours(false);
          setShowSchedulerDailyHours(false);
          break;
        case "custom-every-hours":
          setShowSchedulerCustomHours(true);
          setShowSchedulerCustomMinutes(false);
          setShowSchedulerCustomFrameHours(false);
          setShowSchedulerDailyHours(false);
          break;
        case "custom-frame-hours":
          setShowSchedulerCustomFrameHours(true);
          setShowSchedulerCustomHours(false);
          setShowSchedulerCustomMinutes(false);
          setShowSchedulerDailyHours(false);
          break;

        default:
          break;
      }
      scheduler = newSchduler;
      setSchedulerService(newSchduler);
    }

    //initial data for panel
    async function initialDataPanel() {
      await onChangeSchedulerType(scheduler.type);
      changeViewSchedulerContent(
        dialogViewScheduler(await getSchedulerWithType(scheduler.type)),
      );
      const selectSchedulerType = root.querySelector(
        `#${prefix}select-scheduler-type`,
      );
      if (selectSchedulerType) {
        selectSchedulerType.value = scheduler.type;
      }
      const inputCustomMinutes = root.querySelector(
        `#${prefix}input-custom-minutes`,
      );
      if (inputCustomMinutes) {
        inputCustomMinutes.value = scheduler.valueMinutes || "";
      }
      const inputCustomHours = root.querySelector(
        `#${prefix}input-custom-hours`,
      );
      if (inputCustomHours) {
        inputCustomHours.value = scheduler.valueHours || "";
      }
    }

    await initialDataPanel();

    function saveCustomHoursEvent() {
      try {
        const inputCustomHours = document.querySelector(
          `#tm_input-custom-hours`,
        );
        if (inputCustomHours) {
          const val = inputCustomHours.value;
          const newSchedulerHours = createSchedulerHours(val);
          scheduler.schedulerHours = newSchedulerHours;
          scheduler.valueHours = val;
          changeViewSchedulerContent(
            dialogViewScheduler(scheduler.schedulerHours),
          );
          setSchedulerService(scheduler);
          showNotify({
            message: "Save custom every hours successfully",
            type: "success",
          });
          addLog({
            vi: `Đã cập nhật khoảng thời gian mới: ${val} giờ`,
            en: `Updated new interval: ${val} hours`,
          });
          if (scheduler.isScheduler) {
            clearAndCreateSchedulerAlarm();
            addLog({
              vi: "Chức năng lên lịch đang được bật, hãy chú ý thời gian đăng bài tiếp theo",
              en: "Scheduler is enabled, please pay attention to the next post time",
            });
          }
        }
      } catch (error) {
        showNotify({
          message: error.message,
          type: "error",
        });
      }
    }

    async function saveCustomMinutesEvent() {
      try {
        const inputCustomMinutes = document.querySelector(
          `#tm_input-custom-minutes`,
        );
        if (inputCustomMinutes) {
          let val = inputCustomMinutes.value;
          const isTest = (await DB_getValue(KEY_IS_TEST)) || false;
          const isDevMode = (await DB_getValue(KEY_IS_DEVELOPER_MODE)) || false;
          val = Number(val);

          if (val < 5) {
            if (isTest || isDevMode) val = Math.max(1, val);
            else val = 5;
          }

          const newSchedulerMinutes = await createSchedulerMinutes(val);
          scheduler.schedulerMinutes = newSchedulerMinutes;
          scheduler.valueMinutes = val;
          changeViewSchedulerContent(
            dialogViewScheduler(scheduler.schedulerMinutes),
          );
          setSchedulerService(scheduler);
          showNotify({
            message: "Save custom every minutes successfully",
            type: "success",
          });

          addLog({
            vi: `Đã cập nhật khoảng thời gian mới: ${val} phút`,
            en: `Updated new interval: ${val} minutes`,
          });
          if (scheduler.isScheduler) {
            clearAndCreateSchedulerAlarm();
            addLog({
              vi: "Chức năng lên lịch đang được bật, hãy chú ý thời gian đăng bài tiếp theo",
              en: "Scheduler is enabled, please pay attention to the next post time",
            });
          }
        }
      } catch (error) {
        showNotify({
          message: error.message || error,
          type: "error",
        });
      }
    }

    function addOrRemoveFrameHoursEvent({ cb, isRemove = false }) {
      const inputCustomFrameHours = document.querySelector(
        `#tm_input-custom-frame-hours`,
      );
      if (inputCustomFrameHours) {
        try {
          const val = inputCustomFrameHours.value;
          // const { h, m } = convertFrameHours(val);
          const list = getListFrameHours(val);

          if (isRemove) {
            const newList = [];
            for (const time of scheduler.frameHours) {
              if (!list.find((t) => t.h === time.h && t.m === time.m)) {
                newList.push(time);
              }
            }
            scheduler.frameHours = newList;
            showNotify({
              message: "Remove frame hours successfully",
              type: "success",
            });
            cb?.();
            return;
          }

          const set = new Set(
            scheduler.frameHours.map((time) => `${time.h}:${time.m}`),
          );

          for (const time of list) {
            const { h, m } = time;
            if (!set.has(`${h}:${m}`)) {
              set.add(`${h}:${m}`);
              scheduler.frameHours.push({ h, m });
            }
          }

          showNotify({
            message: "Add frame hours successfully",
            type: "success",
          });

          cb?.();
        } catch (error) {
          showNotify({ message: error.message, type: "error" });
        }
      }
    }

    async function addEvent() {
      try {
        const btnSaveMaxGroupPerTime = document.querySelector(
          `#tm_btn-save-max-group-per-time`,
        );
        if (btnSaveMaxGroupPerTime) {
          btnSaveMaxGroupPerTime.addEventListener("click", () => {
            try {
              const maxGroupPerTime = document.querySelector(
                `#tm_input-max-group-per-time`,
              );
              if (maxGroupPerTime) {
                let val = maxGroupPerTime.value;
                if (!Number.isNaN(Number(val))) {
                  val = Math.max(1, Number(val));
                  DB_setValue(KEY_MAX_GROUP_PER_TIME, Number(val));
                } else {
                  DB_setValue(KEY_MAX_GROUP_PER_TIME, 1);
                }
              }
              showNotify({
                message: "Save max group per time successfully",
                type: "success",
              });
              updateDataSavedInfo();
            } catch (error) {
              logError("Error save max group per time: ", error);
              showNotify({
                message: "Save max group per time failed",
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

        const btnSaveCustomMinutes = document.querySelector(
          `#tm_btn-save-custom-minutes`,
        );
        if (btnSaveCustomMinutes) {
          btnSaveCustomMinutes.addEventListener(
            "click",
            saveCustomMinutesEvent,
          );
        }

        const btnSaveCustomHours = document.querySelector(
          `#tm_btn-save-custom-hours`,
        );
        if (btnSaveCustomHours) {
          btnSaveCustomHours.addEventListener("click", saveCustomHoursEvent);
        }

        const btnAddFrameHours = document.querySelector(
          `#tm_btn-add-frame-hours`,
        );
        if (btnAddFrameHours) {
          btnAddFrameHours.addEventListener("click", () => {
            addOrRemoveFrameHoursEvent({
              cb: () => {
                changeViewSchedulerContent(
                  dialogViewScheduler(scheduler.frameHours),
                );
                setSchedulerService(scheduler);
              },
            });
          });
        }

        const btnRemoveFrameHours = document.querySelector(
          `#tm_btn-remove-frame-hours`,
        );
        if (btnRemoveFrameHours) {
          btnRemoveFrameHours.addEventListener("click", () => {
            addOrRemoveFrameHoursEvent({
              isRemove: true,
              cb: () => {
                changeViewSchedulerContent(
                  dialogViewScheduler(scheduler.frameHours),
                );
                setSchedulerService(scheduler);
              },
            });
          });
        }

        const btnResetFrameHours = document.querySelector(
          `#tm_btn-reset-frame-hours`,
        );

        if (btnResetFrameHours) {
          btnResetFrameHours.addEventListener("click", () => {
            scheduler.frameHours = [];
            changeViewSchedulerContent(
              dialogViewScheduler(scheduler.frameHours),
            );
            showNotify({
              message: "Reset frame hours successfully",
              type: "success",
            });
            setSchedulerService(scheduler);
          });
        }

        const btnResetDailyHours = document.querySelector(
          `#tm_btn-reset-daily-hours`,
        );
        if (btnResetDailyHours) {
          btnResetDailyHours.addEventListener("click", () => {
            scheduler.dailyHours = createSchedulerDailyHours();
            changeViewSchedulerContent(
              dialogViewScheduler(scheduler.dailyHours),
            );
            showNotify({
              message: "Reset daily hours successfully",
              type: "success",
            });
            setSchedulerService(scheduler);
          });
        }
        //end scheduler

        const btnSaveStrictlyMatchTitleGroup = root.querySelector(
          `#${prefix}btn-save-strictly-match-title-group`,
        );
        if (btnSaveStrictlyMatchTitleGroup) {
          btnSaveStrictlyMatchTitleGroup.addEventListener("click", () => {
            try {
              const inputStrictlyMatchTitleGroup = root.querySelector(
                `#${prefix}input-strictly-match-title-group`,
              );
              const strictlyMatchTitleGroup = inputStrictlyMatchTitleGroup.value
                .split(",")
                .map((item) => item.trim())
                .filter((item) => item !== "");
              setStrictlyMatchTitleGroupInStorage(strictlyMatchTitleGroup);
              showNotify({
                message: "Save keywords successfully",
                type: "success",
              });
            } catch (error) {
              logError("Error setStrictlyMatchTitleGroupInStorage: ", error);
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
            const framesHours = await getSpecialFrameHoursService();
            changeContentDialogViewSpecialHours(
              createDialogViewSpecialFrameHours(framesHours),
            );
            setIsShowDialogViewSpecialHours(true);
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
                await setSpecialFrameHoursService([]);
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
        const inputPerTime = root.querySelector(`#tm_input-max-group-per-time`);
        if (inputPerTime) {
          //ctrl + shift + D/d to toggle developer mode
          inputPerTime.addEventListener("keydown", async (e) => {});
        }

        const inputStrictlyMatchGroup = root.querySelector(
          `#${prefix}input-strictly-match-title-group`,
        );
        if (inputStrictlyMatchGroup) {
          //ctrl + s/S to save keywords
          inputStrictlyMatchGroup.addEventListener("keydown", async (e) => {
            if (e.ctrlKey && (e.key === "S" || e.key === "s")) {
              e.preventDefault();
              try {
                const strictlyMatchTitleGroup = inputStrictlyMatchGroup.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter((item) => item !== "");
                setStrictlyMatchTitleGroupInStorage(strictlyMatchTitleGroup);
                showNotify({
                  message: "Save keywords successfully",
                  type: "success",
                });
              } catch (error) {
                logError("Error setStrictlyMatchTitleGroupInStorage: ", error);
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
              DB_setValue(KEY_IS_IN_PROGRESS, val);
              if (!val) {
                const isScheduler = await getIsScheduler();
                if (isScheduler) {
                  clearAndCreateSchedulerAlarm();
                }
              }
            } catch (error) {
              logError("Error checkboxIsProcessing change: ", error);
            }
          });
        }

        const checkboxIsTest = root.querySelector(`#tm_checkbox-is-test`);
        if (checkboxIsTest) {
          checkboxIsTest.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_TEST, val);
          });
        }

        const checkboxIsFixStealFocus = root.querySelector(
          "#tm_checkbox-is-fix-steal-focus",
        );
        if (checkboxIsFixStealFocus) {
          checkboxIsFixStealFocus.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_FIX_STEAL_FOCUS, val);
            updateDataSavedInfo();
          });
        }

        const checkboxIsFixStealAllFocus = root.querySelector(
          "#tm_checkbox-is-fix-steal-all-focus",
        );
        if (checkboxIsFixStealAllFocus) {
          checkboxIsFixStealAllFocus.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_FIX_STEAL_ALL_FOCUS, val);
            updateDataSavedInfo();
          });
        }

        const checboxIsShuffleSchedulerTime = root.querySelector(
          `#${prefix}checkbox-is-shuffle-scheduler-time`,
        );
        if (checboxIsShuffleSchedulerTime) {
          checboxIsShuffleSchedulerTime.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_SHUFFLE_SCHEDULER_TIME, val);
            updateDataSavedInfo();
          });
        }

        const checboxIsShuffleGroupsNeedPost = root.querySelector(
          `#${prefix}checkbox-is-shuffle-groups-need-post`,
        );
        if (checboxIsShuffleGroupsNeedPost) {
          checboxIsShuffleGroupsNeedPost.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_SHUFFLE_GROUPS_NEED_POST, val);
            updateDataSavedInfo();
          });
        }

        const checkboxIsSpammed = root.querySelector(
          `#${prefix}checkbox-is-spammed`,
        );
        if (checkboxIsSpammed) {
          checkboxIsSpammed.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_SPAMMED, val);
            updateDataSavedInfo();
          });
        }

        const checkboxIsRandomBatchPost = root.querySelector(
          `#${prefix}checkbox-is-random-batch-post`,
        );
        if (checkboxIsRandomBatchPost) {
          checkboxIsRandomBatchPost.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_RANDOM_BATCH_POST, val);
            updateDataSavedInfo();
          });
        }

        const checkboxIsRandomTimePost = root.querySelector(
          `#${prefix}checkbox-is-random-time-post`,
        );
        if (checkboxIsRandomTimePost) {
          checkboxIsRandomTimePost.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_RANDOM_TIME_POST, val);
            updateDataSavedInfo();
          });
        }

        const checkboxIsScheduler = root.querySelector(
          `#tm_checkbox-is-scheduler`,
        );
        if (checkboxIsScheduler) {
          checkboxIsScheduler.addEventListener("change", async (e) => {
            try {
              const val = e.target.checked;
              scheduler.isScheduler = val;
              setSchedulerService({ ...scheduler, time: now() });
              if (!val) {
                clearSchedulerAuto();
                addLog({
                  vi: "Chức năng lên lịch tự động đã được tắt",
                  en: "Turn off scheduler auto",
                });
              } else {
                const nextTime = await getCorrectNextTime();
                const date = new Date(nextTime).toLocaleString();
                addLog({
                  vi: `Chức năng lên lịch tự động đã được bật, thời gian đăng tiếp theo ${date}`,
                  en: `Turn on scheduler auto, next time ${date}`,
                });
                clearAndCreateSchedulerAlarm();
              }
            } catch (error) {
              logError("Error at checkboxIsScheduler: ", error);
            }
          });
        }

        const checkboxIsSpecialFrameHours = root.querySelector(
          `#${prefix}checkbox-is-special-frame-hours`,
        );
        if (checkboxIsSpecialFrameHours) {
          checkboxIsSpecialFrameHours.addEventListener("change", (e) => {
            const val = e.target.checked;
            DB_setValue(KEY_IS_SPECIAL_FRAME_HOURS, val);
            updateDataSavedInfo();
          });
        }

        const selectSchedulerType = root.querySelector(
          `#${prefix}select-scheduler-type`,
        );
        if (selectSchedulerType) {
          selectSchedulerType.addEventListener("change", async (e) => {
            const val = e.target.value;
            await onChangeSchedulerType(val);
          });
        }

        //Delay time for each step when posting
        const timeDelay = await getTimeDelayInStorage();

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
          inputClickToPost.addEventListener("change", (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.clickToPost = val || initialTimeDelay.clickToPost;
            setTimeDelayInStorage(timeDelay);
          });
        }

        if (inputFillContent) {
          inputFillContent.addEventListener("change", (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.fillContent = val || initialTimeDelay.fillContent;
            setTimeDelayInStorage(timeDelay);
          });
        }

        if (inputFillFile) {
          inputFillFile.addEventListener("change", (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.fillFile = val || initialTimeDelay.fillFile;
            setTimeDelayInStorage(timeDelay);
          });
        }

        if (inputOpenNewTab) {
          inputOpenNewTab.addEventListener("change", (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.openNewTab = val || initialTimeDelay.openNewTab;
            setTimeDelayInStorage(timeDelay);
          });
        }

        if (inputDelayPost) {
          inputDelayPost.addEventListener("change", (e) => {
            const val = Number.isNaN(Number(e.target.value))
              ? 1
              : Number(e.target.value || 1);
            timeDelay.post = val || initialTimeDelay.post;
            setTimeDelayInStorage(timeDelay);
          });
        }
      } catch (error) {
        logError("Error at addFieldsEvent: ", error);
        throw new Error("Error at addFieldsEvent: " + error);
      }
    }

    await addFieldsEvent();
  } catch (error) {
    logError("Error at createPanelSetting: ", error);
  }
}

function createDialogAddSpecialHours() {
  const divContainer = document.createElement("div");
  divContainer.style.paddingTop = "12px";
  divContainer.style.width = "300px";

  const { fieldElement: fieldFromTime, inputElement: inputFromTime } =
    createFieldElement({
      id: `${prefix}input-from-time`,
      label: getTextWithLanguage({
        vi: "Thời gian bắt đầu (giờ): ",
        en: "Start time (hour): ",
      }),
      inputOptions: {
        min: 0,
        max: 23,
      },
      placeholder: "EX: 2",
      typeInput: "number",
    });

  const { fieldElement: fieldToTime, inputElement: inputToTime } =
    createFieldElement({
      id: `${prefix}select-to-time`,
      label: getTextWithLanguage({
        vi: "Thời gian kết thúc (giờ): ",
        en: "End time (hour): ",
      }),
      inputOptions: {
        min: 0,
        max: 23,
      },
      placeholder: "EX: 4",
      typeInput: "number",
    });

  const { fieldElement: fieldMaxGroup, inputElement: inputMaxGroup } =
    createFieldElement({
      id: `${prefix}max-group`,
      label: getTextWithLanguage({
        vi: "Số nhóm tối đa: ",
        en: "Max groups: ",
      }),
      inputOptions: {
        min: 1,
      },
      placeholder: "EX: 10",
      typeInput: "number",
    });

  const divBtnChange = document.createElement("div");
  divBtnChange.style.marginTop = "12px";
  divBtnChange.style.marginBottom = "12px";
  divBtnChange.style.width = "100%";

  const btnChangeDayOfWeek = document.createElement("button");
  btnChangeDayOfWeek.textContent = getTextWithLanguage({
    vi: "Thay đổi ngày trong tuần",
    en: "Change day of week",
  });
  btnChangeDayOfWeek.className = `${prefix}btn-change-day-of-week not-style`;

  let listDate = LIST_DATE;
  let divListDate = getListDateElement(listDate);

  btnChangeDayOfWeek.addEventListener("click", () => {
    Swal.fire({
      title: getTextWithLanguage({
        vi: "Chọn ngày",
        en: "Select day",
      }),
      html: divListDate,
      // target: divContainer,
      heightAuto: false,
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: true,
      width: `${divContainer.offsetWidth}px`,
      customClass: {
        container: "swal-container-custom",
      },
      confirmButtonText: getTextWithLanguage({
        vi: "Đồng ý",
        en: "Confirm",
      }),
      cancelButtonText: getTextWithLanguage({
        vi: "Hủy",
        en: "Cancel",
      }),
    }).then((res) => {
      if (res.isConfirmed) {
        listDate = getCheckboxDateSpecial();
        changeListDateElement(listDate);
      } else {
        resetCheckboxDateSpecial(listDate);
      }
    });
  });

  divBtnChange.appendChild(btnChangeDayOfWeek);

  const fieldDayOfWeek = document.createElement("div");

  fieldDayOfWeek.style.marginTop = "12px";
  fieldDayOfWeek.style.padding = "12px 0";

  const lblDayOfWeek = document.createElement("label");
  lblDayOfWeek.textContent = getTextWithLanguage({
    vi: "Áp dụng các ngày:",
    en: "Apply dates:",
  });
  lblDayOfWeek.style.width = "100%";
  lblDayOfWeek.style.marginBottom = "6px";
  lblDayOfWeek.style.display = "inline-block";

  fieldDayOfWeek.appendChild(lblDayOfWeek);

  const listDateElement = document.createElement("div");
  listDateElement.style.minHeight = "50px";
  listDateElement.style.border = "1px solid #ddd";
  listDateElement.style.padding = "8px";
  listDateElement.style.borderRadius = "4px";
  listDateElement.style.backgroundColor = "var(--tm-bg-primary)";

  function changeListDateElement(listDate = []) {
    listDateElement.innerHTML = listDate
      .map((item) => `<span>${getTextDate(item)}</span>`)
      .join(", ");
  }

  changeListDateElement(listDate);

  fieldDayOfWeek.appendChild(listDateElement);
  fieldDayOfWeek.appendChild(divBtnChange);

  divContainer.appendChild(fieldFromTime);
  divContainer.appendChild(fieldToTime);
  divContainer.appendChild(fieldMaxGroup);

  divContainer.appendChild(fieldDayOfWeek);

  const divFooter = document.createElement("div");
  divFooter.style.display = "flex";
  divFooter.style.justifyContent = "flex-end";
  divFooter.style.marginTop = "12px";

  const btnAdd = document.createElement("button");
  btnAdd.id = `${prefix}btn-add-special-hours`;
  btnAdd.textContent = getTextWithLanguage({
    vi: "Lưu",
    en: "Save",
  });
  btnAdd.className = `${prefix}btn-add-special-hours`;

  divFooter.appendChild(btnAdd);

  const divError = document.createElement("div");
  divError.style.color = "var(--tm-text-danger)";

  function handleError(msg) {
    divError.textContent = msg || "";
  }
  divContainer.appendChild(divError);

  divContainer.appendChild(divFooter);

  btnAdd.addEventListener("click", () => {
    try {
      const fromTime = inputFromTime.value;
      const toTime = inputToTime.value;
      const maxGroup = inputMaxGroup.value;

      const id = randomID();

      const payload = {
        fromTime,
        toTime,
        maxGroup,
        id,
        dates: listDate,
      };

      addSpecialFrameHoursService(payload)
        .then(() => {
          showNotify({
            message: "Thêm thành công",
          });
          handleError("");
          inputFromTime.value = "";
          inputToTime.value = "";
          inputMaxGroup.value = "";
          listDate = LIST_DATE;
          changeListDateElement(listDate);
          divListDate = getListDateElement(listDate);
        })
        .catch((error) => handleError(error.message || error));
    } catch (error) {
      handleError(error.message || error);
      logError("Error at btnAdd click: ", error);
    }
  });

  return divContainer;
}

function createDialogViewSpecialFrameHours(framesHours = []) {
  try {
    const divContainer = document.createElement("div");
    divContainer.style.paddingTop = "12px";
    divContainer.style.display = "flex";
    divContainer.style.flexDirection = "column";
    divContainer.style.gap = "12px";
    divContainer.style.height = "100%";
    divContainer.style.overflow = "hidden";
    divContainer.style.overflowY = "auto";
    divContainer.className = "custom-scrollbar";
    divContainer.style.paddingRight = "14px";
    divContainer.style.paddingBottom = "16px";

    if (!framesHours.length) {
      const divEmpty = document.createElement("div");
      divEmpty.style.padding = "12px";
      divEmpty.textContent = "Chưa có khung giờ nào";
      divEmpty.style.textAlign = "center";
      divContainer.appendChild(divEmpty);
      return divContainer;
    }

    framesHours.forEach((item) => {
      const key = item.id;

      const divItem = document.createElement("div");
      divItem.style.display = "flex";
      divItem.style.gap = "12px";
      divItem.style.padding = "6px";
      divItem.style.border = "1px solid var(--tm-border-color)";
      divItem.style.borderRadius = "4px";
      divItem.style.flexDirection = "column";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "custom-checkbox";
      checkbox.checked = item.checked;

      checkbox.addEventListener("change", (e) => {
        updateSpecialFrameHoursService({
          ...item,
          checked: e.target.checked || false,
        })
          .then()
          .catch((error) => {
            showNotify({
              message: error.message || error,
              type: "error",
            });

            checkbox.checked = item.checked;
          });
      });

      const divInfo = document.createElement("div");
      divInfo.style.display = "flex";

      const divCoverInfoAndCheckbox = document.createElement("div");
      divCoverInfoAndCheckbox.style.display = "flex";
      divCoverInfoAndCheckbox.style.alignItems = "center";
      divCoverInfoAndCheckbox.style.gap = "12px";

      divCoverInfoAndCheckbox.appendChild(checkbox);
      divCoverInfoAndCheckbox.appendChild(divInfo);

      const divAction = document.createElement("div");
      divAction.style.display = "flex";
      divAction.style.gap = "12px";
      divAction.style.alignItems = "center";
      divAction.style.paddingLeft = "30px";

      const btnEdit = document.createElement("button");
      btnEdit.className = `${prefix}btn-edit-special-hours not-style`;

      const btnDelete = document.createElement("button");
      btnDelete.className = `${prefix}btn-delete-special-hours not-style`;

      const btnEditDates = document.createElement("button");
      btnEditDates.textContent = getTextWithLanguage({
        vi: "Sửa ngày",
        en: "Edit dates",
      });
      btnEditDates.className = "not-style";

      let isEditMode = false;

      divAction.appendChild(btnEdit);
      divAction.appendChild(btnDelete);

      function changeMode(mode = "view") {
        if (mode === "view") {
          const dates = item.dates || [];
          isEditMode = false;
          btnEdit.textContent = getTextWithLanguage({
            vi: "Sửa",
            en: "Edit",
          });
          btnDelete.textContent = getTextWithLanguage({
            vi: "Xóa",
            en: "Delete",
          });
          divInfo.style.gap = "2px";
          divInfo.style.flexDirection = "column";
          divInfo.style.alignItems = "start";
          divInfo.innerHTML = `
          <div style="display: flex; gap: 12px; align-items: center;">
            <p>${getTextWithLanguage({
              vi: "Giờ bắt đầu",
              en: "Start time",
            })}: ${item.fromTime}</p>
            <p>${getTextWithLanguage({
              vi: "Giờ kết thúc",
              en: "End time",
            })}: ${item.toTime}</p>
            <p>${getTextWithLanguage({
              vi: "Số nhóm tối đa",
              en: "Max group",
            })}: ${item.maxGroup}</p>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <p>${getTextWithLanguage({
              vi: "Ngày áp dụng",
              en: "Dates",
            })}: ${
              dates.length
                ? dates.map((date) => getTextDate(date)).join(", ")
                : getTextWithLanguage({
                    vi: "Không áp dụng",
                    en: "Not apply",
                  })
            }</p>
          </div>
          `;
          divAction.insertBefore(btnEditDates, btnDelete);
          return;
        }

        if (mode === "edit") {
          divAction.removeChild(btnEditDates);
          isEditMode = true;
          btnEdit.textContent = getTextWithLanguage({
            vi: "Lưu",
            en: "Save",
          });
          btnDelete.textContent = getTextWithLanguage({
            vi: "Hủy",
            en: "Cancel",
          });
          const { fieldElement: fieldFromTime } = createFieldElement({
            id: `${prefix}from-time-${key}`,
            label: getTextWithLanguage({
              vi: "Bắt đầu: ",
              en: "Start: ",
            }),
            placeholder: "EX: 9",
            typeInput: "number",
            inputOptions: {
              min: 0,
              max: 23,
            },
            isRow: true,
            isSmaller: true,
            initialValue: item.fromTime,
          });

          const { fieldElement: fieldToTime } = createFieldElement({
            id: `${prefix}to-time-${key}`,
            label: getTextWithLanguage({
              vi: "Kết thúc: ",
              en: "End: ",
            }),
            placeholder: "EX: 17",
            typeInput: "number",
            inputOptions: {
              min: 0,
              max: 23,
            },
            isRow: true,
            isSmaller: true,
            initialValue: item.toTime,
          });

          const { fieldElement: fieldMaxGroup } = createFieldElement({
            id: `${prefix}max-group-${key}`,
            label: getTextWithLanguage({
              vi: "Nhóm: ",
              en: "Group: ",
            }),
            placeholder: "EX: 5",
            typeInput: "number",
            inputOptions: {
              min: 1,
              max: 100,
            },
            isRow: true,
            isSmaller: true,
            initialValue: item.maxGroup,
          });

          divInfo.innerHTML = "";
          divInfo.style.gap = "0px";
          divInfo.style.flexDirection = "row";
          divInfo.style.alignItems = "center";
          divInfo.appendChild(fieldFromTime);
          divInfo.appendChild(fieldToTime);
          divInfo.appendChild(fieldMaxGroup);
        }
      }

      changeMode("view");

      btnEdit.addEventListener("click", () => {
        if (isEditMode) {
          const fromTime = document.getElementById(
            `${prefix}from-time-${key}`,
          ).value;
          const toTime = document.getElementById(
            `${prefix}to-time-${key}`,
          ).value;
          const maxGroup = document.getElementById(
            `${prefix}max-group-${key}`,
          ).value;

          const payload = {
            ...item,
            fromTime,
            toTime,
            maxGroup,
            checked: checkbox.checked,
          };

          updateSpecialFrameHoursService(payload)
            .then(() => {
              showNotify({
                message: getTextWithLanguage({
                  vi: "Cập nhật thành công",
                  en: "Update success!",
                }),
              });
              item = { ...payload };
              changeMode("view");
            })
            .catch((error) => {
              showNotify({
                message: error.message || error,
                type: "error",
              });
            });
          return;
        }
        changeMode("edit");
      });

      btnEditDates.addEventListener("click", () => {
        let listDates = item.dates || [];
        const elements = getListDateElement(listDates);
        Swal.fire({
          title: getTextWithLanguage({
            vi: "Sửa ngày",
            en: "Edit dates",
          }),
          html: elements,
          heightAuto: false,
          customClass: {
            container: "swal-container-custom",
          },
          width: 260,
          showCloseButton: true,
          showCancelButton: true,
          cancelButtonText: getTextWithLanguage({
            vi: "Hủy",
            en: "Cancel",
          }),
          showConfirmButton: true,
          confirmButtonText: getTextWithLanguage({
            vi: "Lưu",
            en: "Save",
          }),
          preConfirm: () => {
            try {
              listDates = getCheckboxDateSpecial();
              updateSpecialFrameHoursService({
                ...item,
                dates: listDates,
              })
                .then(() => {
                  item.dates = listDates;
                  changeMode("view");
                  showNotify({
                    message: getTextWithLanguage({
                      vi: "Cập nhật thành công",
                      en: "Update success!",
                    }),
                  });
                  return true;
                })
                .catch((error) => {
                  showNotify({
                    message: error.message || error,
                    type: "error",
                  });
                  return false;
                });
            } catch (error) {
              logError(error);
              showNotify({
                message: getTextWithLanguage({
                  vi: "Đã có lỗi xảy ra",
                  en: "Update date fail!",
                }),
                type: "error",
              });
              return false;
            }
          },
        });
      });

      let isConfrimDelete = false;
      let timerDelete = null;
      btnDelete.addEventListener("click", () => {
        if (isEditMode) {
          changeMode("view");
          return;
        }

        if (isConfrimDelete) {
          clearTimeout(timerDelete);
          deleteSpecialFrameHoursService(key)
            .then(() => {
              showNotify({
                message: getTextWithLanguage({
                  vi: "Xóa thành công",
                  en: "Delete success!",
                }),
                duration: 2000,
              });

              divItem.remove();
            })
            .catch((error) => {
              isConfrimDelete = false;
              btnDelete.textContent = getTextWithLanguage({
                vi: "Xóa",
                en: "Delete",
              });
              btnDelete.style.background = "";
              showNotify({
                message: error.message || error,
                type: "error",
              });
            });

          return;
        }

        isConfrimDelete = true;
        btnDelete.textContent = getTextWithLanguage({
          vi: "Xác nhận",
          en: "Confirm",
        });
        btnDelete.style.background = "var(--tm-text-danger)";

        timerDelete = setTimeout(() => {
          isConfrimDelete = false;
          btnDelete.textContent = getTextWithLanguage({
            vi: "Xóa",
            en: "Delete",
          });
          btnDelete.style.background = "";
        }, 2000);
      });

      divItem.appendChild(divCoverInfoAndCheckbox);
      divItem.appendChild(divAction);

      divContainer.appendChild(divItem);
    });

    return divContainer;
  } catch (error) {
    logError("Error at createDialogViewSpecialFrameHours: ", error);
  }
}

/**
 * Create field element helper
 * @param {{
 *   id: string,
 *   label: string,
 *   placeholder: string,
 *   typeInput: string,
 *   inputOptions: HTMLInputElement,
 *   isRow: boolean,
 *   isSmaller: boolean,
 *   initialValue: string | number | boolean,
 * }} object
 * @returns {{fieldElement: HTMLElement, inputElement: HTMLInputElement}} - Object chứa field
 */
function createFieldElement({
  id = "",
  label = "",
  placeholder,
  typeInput = "text",
  inputOptions = {},
  className = `${prefix}input-outline not-style`,
  isRow = false,
  isSmaller = false,
  initialValue = null,
} = {}) {
  const divContainer = document.createElement("div");
  divContainer.className = `${prefix}field-container ${isRow ? "field-row" : ""} ${isSmaller ? "field-smaller" : ""}`;

  const labelElement = document.createElement("label");
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const inputElement = document.createElement("input");
  inputElement.id = id;
  inputElement.className = className || `${prefix}input-outline not-style`;
  inputElement.placeholder = placeholder;
  inputElement.type = typeInput;
  if (initialValue !== null && initialValue !== undefined) {
    inputElement.value = initialValue;
  }

  if (inputOptions) {
    Object.keys(inputOptions).forEach((key) => {
      inputElement.setAttribute(key, inputOptions[key]);
    });
  }

  divContainer.appendChild(labelElement);
  divContainer.appendChild(inputElement);

  return { fieldElement: divContainer, inputElement };
}

function getCheckboxDateSpecial(anchorElem = document.body) {
  const listDate = [];
  const checkboxChecked = anchorElem.querySelectorAll(".checkbox-special-date");

  for (const ch of checkboxChecked) {
    const val = ch.getAttribute("data-value");
    if (ch.checked) {
      listDate.push(Number(val));
    }
  }

  return listDate;
}

const LIST_DATE = [0, 1, 2, 3, 4, 5, 6];

function getTextDate(date) {
  if (date == 0)
    return getTextWithLanguage({
      vi: "Chủ nhật",
      en: "Sunday",
    });
  if (date == 1)
    return getTextWithLanguage({
      vi: "Thứ 2",
      en: "Monday",
    });
  if (date == 2)
    return getTextWithLanguage({
      vi: "Thứ 3",
      en: "Tuesday",
    });
  if (date == 3)
    return getTextWithLanguage({
      vi: "Thứ 4",
      en: "Wednesday",
    });
  if (date == 4)
    return getTextWithLanguage({
      vi: "Thứ 5",
      en: "Thursday",
    });
  if (date == 5)
    return getTextWithLanguage({
      vi: "Thứ 6",
      en: "Friday",
    });
  if (date == 6)
    return getTextWithLanguage({
      vi: "Thứ 7",
      en: "Saturday",
    });
  return "";
}

function getListDateElement(list = []) {
  const listElement = document.createElement("div");
  listElement.style.display = "flex";
  listElement.style.flexDirection = "column";
  listElement.style.gap = "4px";

  LIST_DATE.forEach((item) => {
    const divItem = document.createElement("div");
    divItem.style.display = "flex";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = list.includes(item);
    checkbox.className = "checkbox-special-date custom-checkbox";
    checkbox.setAttribute("data-value", item);

    const id = `${prefix}checkbox-special-date-${item}`;
    checkbox.id = id;

    const text = getTextDate(item);
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = text;
    label.style.fontSize = "14px";

    divItem.appendChild(checkbox);
    divItem.appendChild(label);
    listElement.appendChild(divItem);
  });

  return listElement;
}

function resetCheckboxDateSpecial(listDate = [], anchorElem = document.body) {
  const checkboxChecked = anchorElem.querySelectorAll(".checkbox-special-date");

  for (const ch of checkboxChecked) {
    const val = ch.getAttribute("data-value");
    ch.checked = listDate.includes(Number(val));
  }
}

export { createPanelSetting };
