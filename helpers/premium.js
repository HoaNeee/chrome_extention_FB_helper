import { KEY_FEATURE_FLAG } from "../contants/constant-extention.js";
import { prefix } from "../contants/contants.js";
import { checkFeatureEnable } from "../services/device-service.js";
import { logError } from "../utils/utils.js";
import {
  hideElement,
  hideField,
  showElement,
  showField,
} from "./elementDom.js";

async function handleShowOrHideElementPremium() {
  try {
    const [
      random_break_batch,
      fix_steal_all_focus,
      shuffle_scheduler_time,
      random_time_post,
      special_frame_hour,
      priority_task,
      comment_walk,
    ] = await Promise.all([
      checkFeatureEnable(KEY_FEATURE_FLAG.FIELD.IS_RANDOM_BREAK_BATCH),
      checkFeatureEnable(KEY_FEATURE_FLAG.FIELD.IS_FIX_STEAL_ALL_FOCUS),
      checkFeatureEnable(KEY_FEATURE_FLAG.FIELD.IS_SHUFFLE_SCHEDULER_TIME),
      checkFeatureEnable(KEY_FEATURE_FLAG.FIELD.IS_RANDOM_TIME_POST),
      checkFeatureEnable(KEY_FEATURE_FLAG.FIELD.SPECIAL_FRAME_HOUR),
      checkFeatureEnable(KEY_FEATURE_FLAG.FIELD.PRIORITY_TASK),
      checkFeatureEnable(KEY_FEATURE_FLAG.FIELD.COMMENT_WALK),
    ]);

    if (random_break_batch) {
      showField({
        selector: "#tm_checkbox-is-random-batch-post",
        fieldSelector: ".tm_field-container",
      });
    } else {
      hideField({
        selector: "#tm_checkbox-is-random-batch-post",
        fieldSelector: ".tm_field-container",
      });
    }

    if (fix_steal_all_focus) {
      showField({
        selector: "#tm_checkbox-is-fix-steal-all-focus",
        fieldSelector: ".tm_field-container",
      });
    } else {
      hideField({
        selector: "#tm_checkbox-is-fix-steal-all-focus",
        fieldSelector: ".tm_field-container",
      });
    }

    if (shuffle_scheduler_time) {
      showField({
        selector: "#tm_checkbox-is-shuffle-scheduler-time",
        fieldSelector: ".tm_field-container",
      });
    } else {
      hideField({
        selector: "#tm_checkbox-is-shuffle-scheduler-time",
        fieldSelector: ".tm_field-container",
      });
    }

    if (special_frame_hour) {
      showElement(".special-frame-hours-container");
    } else {
      hideElement(".special-frame-hours-container");
    }

    if (random_time_post) {
      showField({
        selector: "#tm_checkbox-is-random-time-post",
        fieldSelector: ".tm_field-container",
      });
    } else {
      hideField({
        selector: "#tm_checkbox-is-random-time-post",
        fieldSelector: ".tm_field-container",
      });
    }

    if (priority_task) {
      showField({
        selector: "#tm_checkbox-is-execute-priority-task",
        fieldSelector: ".tm_field-container",
      });
      showElement(`.${prefix}div-priority-task`);
    } else {
      hideElement(`.${prefix}div-priority-task`);
      hideField({
        selector: "#tm_checkbox-is-random-time-post",
        fieldSelector: ".tm_field-container",
      });
    }

    if (comment_walk) {
      showElement(`div.${prefix}comment-walk-tab`);
      showElement(`li.tab-item[data-tab-value="comment-walk"]`);
      showElement(".comment-walk-setting");
      showElement(`#${prefix}btn-reset-commented-walk`);
    } else {
      hideElement(`div.${prefix}comment-walk-tab`);
      hideElement(`li.tab-item[data-tab-value="comment-walk"]`);
      hideElement(".comment-walk-setting");
      hideElement(`#${prefix}btn-reset-commented-walk`);
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
