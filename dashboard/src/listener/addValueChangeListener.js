import { KEY_MESSAGE_FROM_BACKGROUND } from "../../../contants/constant-extention.js";
import {
  KEY_ALL_GROUPS,
  KEY_AUTH,
  KEY_COMMENT_WALK,
  KEY_GROUPS_NEED_POST,
  KEY_HISTORY_LOGS,
  KEY_IS_DEVELOPER_MODE,
  KEY_IS_IN_PROGRESS,
  KEY_IS_PREMIUM,
  KEY_IS_TEST,
  KEY_POST,
  KEY_SCHEDULER,
  KEY_STOP_TASK,
  prefix,
} from "../../../contants/contants.js";
import {
  disabledElementProgress,
  enabledElementProgress,
  getAllFieldsSetting,
  hideElement,
  hideField,
  showElement,
  showField,
} from "../../../helpers/elementDom.js";
import { handleShowOrHideElementPremium } from "../../../helpers/premium.js";
import { logSchedulerHelper } from "../../../helpers/scheduler.js";
import {
  automationCommentWalk,
  automationContinue,
} from "../../../services/automation-service.js";
import { commentWalkService } from "../../../services/comment-walk-service.js";
import { clearAndCreateSchedulerAlarm } from "../../../services/scheduler-service.js";
import { setIsTestInStorage } from "../../../services/storage-service.js";
import { setProgressTool } from "../../../utils/bgr-storage.js";
import { logError } from "../../../utils/utils.js";
import { updateDataSavedInfo } from "../draw_element/dataSavedInfo.js";
import { addLog, drawHistoryLogItem } from "../draw_element/panel-log.js";
import { updateAuthUI } from "../helpers/header.js";

export default function addValueChangeListener() {
  const keys = [
    KEY_IS_TEST,
    KEY_SCHEDULER,
    KEY_ALL_GROUPS,
    KEY_IS_IN_PROGRESS,
    KEY_POST,
    KEY_GROUPS_NEED_POST,
    KEY_IS_DEVELOPER_MODE,
    KEY_HISTORY_LOGS,
    KEY_IS_PREMIUM,
    // KEY_IS_USE_LOCAL_STORAGE,
    KEY_AUTH,
    KEY_COMMENT_WALK.IS_COMMENT_WALK_PROCESSING,
    KEY_COMMENT_WALK.COUNT_COMMENT_WALK_POSTED_PER_BATCH,
    KEY_COMMENT_WALK.IS_ACTIVE,
    KEY_STOP_TASK,
    KEY_MESSAGE_FROM_BACKGROUND.AUTOMATION.POST_CONTINUE,
    KEY_MESSAGE_FROM_BACKGROUND.AUTOMATION.COMMENT_WALK,
  ];
  const { setIsTest, setIsCommentWalk } = getAllFieldsSetting();
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === "local") {
      for (const key of keys) {
        try {
          if (changes[key]) {
            const newVal = changes[key]?.newValue;

            if (key === KEY_AUTH) {
              await updateAuthUI(newVal);
            }
            if (
              key === KEY_IS_IN_PROGRESS ||
              key === KEY_COMMENT_WALK.IS_COMMENT_WALK_PROCESSING
            ) {
              await handleIsProgress(key, newVal);
            }
            if (key === KEY_IS_DEVELOPER_MODE) {
              await handleIsDeveloperMode(newVal);
            }
            if (key === KEY_IS_TEST) {
              setIsTest(newVal);
            }
            if (key === KEY_HISTORY_LOGS) {
              handleHisoryLog(newVal);
            }
            if (key === KEY_IS_PREMIUM) {
              handleShowOrHideElementPremium(newVal);
            }
            if (key === KEY_COMMENT_WALK.IS_ACTIVE) {
              setIsCommentWalk(newVal);
            }

            if (key === KEY_STOP_TASK) {
              handleStopTask(newVal);
            }

            //Fake send message from background
            if (key === KEY_MESSAGE_FROM_BACKGROUND.AUTOMATION.COMMENT_WALK) {
              await automationCommentWalk();
            }
            if (key === KEY_MESSAGE_FROM_BACKGROUND.AUTOMATION.POST_CONTINUE) {
              await automationContinue();
            }

            updateDataSavedInfo();
            break;
          }
        } catch (error) {
          logError("listener - addValueChangeListener error: ", error);
        }
      }
    }
  });
}

async function handleHisoryLog(histories) {
  try {
    if (histories && Array.isArray(histories) && histories.length) {
      const historyLogsElem = document.querySelector(".history-logs");
      const historyAtDashboardElem = document.querySelector(
        ".history-logs-at-dashboard",
      );

      const lastHistories = histories[histories.length - 1];

      if (lastHistories) {
        if (historyLogsElem) {
          const div = drawHistoryLogItem(lastHistories);
          historyLogsElem.appendChild(div);
          historyLogsElem.scrollTo({
            top: historyLogsElem.scrollHeight,
          });
        }

        if (historyAtDashboardElem) {
          const div2 = drawHistoryLogItem(lastHistories);
          historyAtDashboardElem.appendChild(div2);
          historyAtDashboardElem.scrollTo({
            top: historyAtDashboardElem.scrollHeight,
          });
        }
      }
    }
  } catch (error) {
    logError("Error at addLog method: ", error);
  }
}

async function handleIsProgress(key, val) {
  const { setIsProcessing, setIsCommentWalkProcessing } = getAllFieldsSetting();
  try {
    if (key === KEY_IS_IN_PROGRESS) {
      setIsProcessing(val);
    }
    if (key === KEY_COMMENT_WALK.IS_COMMENT_WALK_PROCESSING) {
      setIsCommentWalkProcessing(val);
    }
    if (val) {
      disabledElementProgress(key);
    }
    if (!val) {
      enabledElementProgress(key);
      await clearAndCreateSchedulerAlarm();
    }
  } catch (error) {
    logError("Error at handleIsProgress: ", error);
  }
}

async function handleStopTask(isStopTask) {
  try {
    const { setStatusTool } = getAllFieldsSetting();
    setStatusTool(!isStopTask);
    const switchStatusTool = document.querySelector(
      `#${prefix}switch-status-tool-at-header`,
    );
    if (switchStatusTool) {
      switchStatusTool.checked = !isStopTask;
    }
    if (isStopTask) {
      await commentWalkService.setIsCommentWalkProcessing(false);
      await setProgressTool(false);
      addLog({
        vi: "Tiện ích đã được tắt",
        en: "Tool has been stopped",
        type: "info",
      });
    } else {
      addLog({
        vi: "Tiện ích đã được bật lại, khởi tạo lại các tác vụ",
        en: "Tool has been turned on, initializing tasks",
        type: "info",
      });
      await clearAndCreateSchedulerAlarm();
      await logSchedulerHelper();
    }
  } catch (error) {
    logError("Error at handleStopTask: ", error);
  }
}

async function handleIsDeveloperMode(newVal) {
  const { setIsTest } = getAllFieldsSetting();
  if (newVal) {
    showElement("#tm_btn-reset-all-data-saved");
    showElement("#tm_btn-test-auto");
    showElement("#tm_btn-click");
    showElement("#tm_btn-click-2");
    showField({
      selector: "#tm_checkbox-is-test",
      fieldSelector: ".tm_field-container",
    });
    showField({
      selector: "#tm_checkbox-is-spammed",
      fieldSelector: ".tm_field-container",
    });
  } else {
    await setIsTestInStorage(false);
    setIsTest(false);
    hideElement("#tm_btn-test-auto");
    hideElement("#tm_btn-click");
    hideElement("#tm_btn-click-2");
    hideField({
      selector: "#tm_checkbox-is-test",
      fieldSelector: ".tm_field-container",
    });
    hideField({
      selector: "#tm_checkbox-is-spammed",
      fieldSelector: ".tm_field-container",
    });
    hideElement("#tm_btn-reset-all-data-saved");
  }
}
