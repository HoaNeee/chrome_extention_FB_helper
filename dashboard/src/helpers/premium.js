import {
  KEY_IS_FIX_STEAL_ALL_FOCUS,
  KEY_IS_RANDOM_BATCH_POST,
  KEY_IS_RANDOM_TIME_POST,
  KEY_IS_SHUFFLE_SCHEDULER_TIME,
} from "../../../contants/contants.js";
import { logError } from "../../../utils/utils.js";
import { DB_setValue } from "../utils/api-helper.js";
import {
  hideElement,
  hideField,
  showElement,
  showField,
} from "./elementDom.js";

/**
 *
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
    } else {
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
      hideElement(".special-frame-hours-container");
      hideField({
        selector: "#tm_checkbox-is-random-time-post",
        fieldSelector: ".tm_field-container",
      });
      Promise.all([
        DB_setValue(KEY_IS_RANDOM_BATCH_POST, false),
        DB_setValue(KEY_IS_FIX_STEAL_ALL_FOCUS, false),
        DB_setValue(KEY_IS_SHUFFLE_SCHEDULER_TIME, false),
        DB_setValue(KEY_IS_RANDOM_TIME_POST, false),
      ]);
    }
  } catch (error) {
    logError(
      "Error at handle show or hide element premium at addValueChange",
      error,
    );
  }
}

export { handleShowOrHideElementPremium };
