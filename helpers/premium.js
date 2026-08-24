import { KEY_IS_SHUFFLE_SCHEDULER_TIME, prefix } from "../contants/contants.js";
import { logError } from "../utils/utils.js";
import { DB_setValue } from "../utils/api-helper.js";
import {
  hideElement,
  hideField,
  showElement,
  showField,
} from "./elementDom.js";
import {
  setIsCommentWalkData,
  setIsExecutePriorityTaskData,
  setIsFixStealAllFocusData,
  setIsRandomBreakBatchData,
  setIsRandomTimePostData,
} from "../services/setting-service.js";

/**
 * @param {boolean} isPremium
 */
async function handleShowOrHideElementPremium(isPremium) {
  try {
    if (isPremium) {
      showField({
        selector: "#tm_checkbox-is-random-batch-post",
        fieldSelector: ".tm_field-container",
      });
      showField({
        selector: "#tm_checkbox-is-fix-steal-all-focus",
        fieldSelector: ".tm_field-container",
      });
      showField({
        selector: "#tm_checkbox-is-shuffle-scheduler-time",
        fieldSelector: ".tm_field-container",
      });
      showElement(".special-frame-hours-container");
      showField({
        selector: "#tm_checkbox-is-random-time-post",
        fieldSelector: ".tm_field-container",
      });
      showElement(`div.${prefix}comment-walk-tab`);
      showElement(`li.tab-item[data-tab-value="comment-walk"]`);
      showElement(".comment-walk-setting");
      showElement(`#${prefix}btn-reset-commented-walk`);
      showField({
        selector: "#tm_checkbox-is-execute-priority-task",
        fieldSelector: ".tm_field-container",
      });
      showElement(`.${prefix}div-priority-task`);
    } else {
      hideElement(`div.${prefix}comment-walk-tab`);
      hideElement(`li.tab-item[data-tab-value="comment-walk"]`);
      hideField({
        selector: "#tm_checkbox-is-random-batch-post",
        fieldSelector: ".tm_field-container",
      });
      hideField({
        selector: "#tm_checkbox-is-fix-steal-all-focus",
        fieldSelector: ".tm_field-container",
      });
      hideField({
        selector: "#tm_checkbox-is-shuffle-scheduler-time",
        fieldSelector: ".tm_field-container",
      });
      hideField({
        selector: "#tm_checkbox-is-execute-priority-task",
        fieldSelector: ".tm_field-container",
      });
      hideElement(".special-frame-hours-container");
      hideElement(`.${prefix}div-priority-task`);
      hideField({
        selector: "#tm_checkbox-is-random-time-post",
        fieldSelector: ".tm_field-container",
      });
      hideElement(".comment-walk-setting");
      hideElement(`#${prefix}btn-reset-commented-walk`);
      await Promise.all([
        setIsRandomBreakBatchData(false),
        setIsFixStealAllFocusData(false),
        setIsRandomTimePostData(false),
        setIsCommentWalkData(false),
        setIsExecutePriorityTaskData(false),
        DB_setValue(KEY_IS_SHUFFLE_SCHEDULER_TIME, false),
      ]);
    }
  } catch (error) {
    logError(
      "Error at handle show or hide element premium at addValueChange",
      error,
    );
  }
}

const LIST_TAB_WITH_PREMIUM = ["comment-walk"];

export { handleShowOrHideElementPremium, LIST_TAB_WITH_PREMIUM };
