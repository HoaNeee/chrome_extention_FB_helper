import {
  KEY_ADD_LOG,
  KEY_ADD_TIME_DELAY_FOR_SCHEDULER,
  KEY_ADD_URL_COMMENTED,
  KEY_CAN_COMMENT_WALK_THIS_POST,
  KEY_CAN_COMMENT_WALK_THIS_TAB,
  KEY_CLOSE_THIS_TAB,
  KEY_CLOSE_THIS_WINDOW,
  KEY_COMMENT_WALK_REQUEST,
  KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST,
  KEY_COMPLETED_COMMENT_WALK_THIS_BATCH,
  KEY_CURRENT_WINDOW_ID,
  KEY_GET_ALL_METADATA_COMMENT_WALK,
  KEY_GET_CURRENT_DATA_GROUP_SAVED_NEED_POST,
  KEY_GET_KEY_SAVED,
  KEY_GET_LIST_GROUPS,
  KEY_GET_PARSE_FILE,
  KEY_INTERACT_BEFORE_POST_REQUEST,
  KEY_MESSAGE_FROM_BACKGROUND,
  KEY_NEXT_POST_GROUP,
  KEY_OPEN_IN_TAB,
  KEY_SCHEDULER_ALARMS,
  KEY_SET_KEY_SAVED,
  KEY_SET_PROCESSING_COMMENT_WALK,
  KEY_STOP_TASK_REQUEST,
  KEY_UPDATE_IS_SPAMMED,
  KEY_UPDATE_STATUS_TASK,
  STATUS_RESPONSE,
} from "./contants/constant-extention.js";
import {
  KEY_CAN_POST_THIS_TAB,
  KEY_COMMENT_WALK,
  KEY_DEFAULT_VALUE,
  KEY_IS_SCROLL_DETECT_LIST_GROUP,
  KEY_IS_SHUFFLE_SCHEDULER_TIME,
  KEY_LAST_TIME_POST,
  KEY_NEXT_TIME_POST_WHEN_SPAMMED,
  KEY_TAB,
  KEY_TASK_NAME,
  KEY_TIME_DELAY,
  STATUS_TASK,
  URL_LIST_GROUPS,
} from "./contants/contants.js";
import { addLog } from "./dashboard/src/draw_element/panel-log.js";
import { deviceHelper } from "./helpers/device-helper.js";
import {
  checkPostedAllGroupOrMaxGroupPerTime,
  resetPostedGroupAndSave,
} from "./helpers/group.js";
import {
  getCorrectNextTime,
  logSchedulerHelper,
  shuffleTimes,
} from "./helpers/scheduler.js";
import {
  checkUser,
  getAuthFromStorage,
  getPremiumService,
  isAuthentication,
  logoutService,
  setPremiumService,
} from "./services/auth-service.js";
import { openNewTaskHepler } from "./services/automation-service.js";
import { getAllMetadataComments } from "./services/comment-service.js";
import { commentWalkService } from "./services/comment-walk-service.js";
import {
  getCurrentDataGroupPosting,
  getCurrentGroupNeedPost,
  getCurrentIdDataGroupPost,
  getRandomIdDataGroupPostChecked,
  setCurrentIdDataGroupPost,
} from "./services/data-group-post-service.js";
import {
  createNewDeviceAndForceSave,
  getDeviceFromStorage,
  getListTaskNameInactive,
  getRandomTaskNameWithPriority,
  setCurrentTaskName,
} from "./services/device-service.js";
import {
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
} from "./services/groupService.js";
import { getMaxPostInteractService } from "./services/interact-before-post-service.js";
import {
  clearAndCreateSchedulerAlarm,
  clearSchedulerAuto,
} from "./services/scheduler-service.js";
import {
  getIsCommentWalkData,
  getIsCommentWhenPostSuccessData,
  getIsExecutePriorityTaskData,
  getIsInteractBeforePostData,
  getIsRandomBreakBatchData,
  getIsSchedulerData,
  getIsSpammedData,
  getIsStopTaskData,
  getTimeBreakWhenSpammedData,
  getTimeDelayData,
  setIsFixStealFocusData,
  setIsShuffleGroupNeedPostData,
  setIsSpammedData,
  setLastTimePostData,
} from "./services/setting-service.js";
import {
  initIsUseLocalStorage,
  setIsUseLocalStorage,
} from "./services/storage-global-service.js";
import {
  getCountBatchPost,
  getDecidedInteractBeforePostInStorage,
  getIsFirstTimeUseToolInStorage,
  getIsScrollDetectListGroupInStorage,
  getNextTimePostWhenSpammed,
  getTimeDelayForScheduler,
  setCountBatchPost,
  setCountResetGroupInStorage,
  setCurrentCountPostLength,
  setDecidedInteractBeforePostInStorage,
  setIsFirstTimeUseToolInStorage,
  setIsScrollDetectListGroupInStorage,
  setTimeDelayForScheduler,
} from "./services/storage-service.js";
import {
  DB_deleteValue,
  DB_getValue,
  DB_setValue,
} from "./utils/api-helper.js";
import {
  getProgressTool,
  getTask,
  saveTask,
  setProgressTool,
  setStatusTask,
} from "./utils/bgr-storage.js";
import { handleErrorHelper } from "./utils/exception.js";
import {
  getIsDashboardTab,
  getTextWithLanguage,
  logActions,
  logError,
  now,
  parseBlobToFile,
  parseFileToObjectBase64,
  parseUrlToBlob,
  random,
  randomRateBoolean,
} from "./utils/utils.js";

//KEY TEST, DELETE AFTER FINISH
// const KEY_COUNT_TRIGGER_TEST = "count triggered";
const KEY_OPEN_DASHBOARD = "OPEN_DASHBOARD";

//ALARMS
chrome.alarms.onAlarm.addListener((alarm) => {
  handleOnAlarm(alarm);
});

//EVENT: tab remove
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  handleOnRemove(tabId);
});

//EVENT: reload not create tab
chrome.webNavigation.onCommitted.addListener((details) => {
  handleOnCommited(details);
});

// ============================================================
// MESSAGE ROUTER: Listens for messages from content scripts
// ============================================================

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  try {
    switch (msg.type) {
      case KEY_OPEN_IN_TAB:
        handleOpenInTab(msg);
        break;

      //CLOSE THIS TAB
      case KEY_CLOSE_THIS_TAB:
        handleCloseThisTab(sender.tab.id);
        break;

      case KEY_GET_LIST_GROUPS:
        handleGetListGroups();
        break;

      case KEY_CAN_POST_THIS_TAB:
        handleCanPostThisTab(sender, sendResponse);
        return true;

      case KEY_OPEN_DASHBOARD:
        handleOpenDashboard();
        break;

      case KEY_UPDATE_STATUS_TASK:
        setStatusTask(msg.data.status);
        break;

      case KEY_GET_CURRENT_DATA_GROUP_SAVED_NEED_POST:
        handleGetCurrentDataGroupSavedNeedPost(sendResponse);
        return true;

      case KEY_NEXT_POST_GROUP:
        nextGroupPost();
        break;

      case KEY_UPDATE_IS_SPAMMED:
        handleUpdateIsSpammed(msg.data.isSpammed);
        break;

      case KEY_ADD_LOG:
        handleAddLog(msg.data);
        break;

      case KEY_GET_KEY_SAVED:
        handleGetKeySaved(msg.data?.key, sendResponse);
        return true;

      case KEY_SET_KEY_SAVED:
        handleSetKeySaved(msg.data?.key, msg.data?.value, sendResponse);
        return true;

      case KEY_CLOSE_THIS_WINDOW:
        handleCloseThisWindow(sender);
        break;

      case KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST.GET_ALL_METADATA:
        handleGetAllMetadataComments(sendResponse);
        return true;

      case KEY_ADD_TIME_DELAY_FOR_SCHEDULER:
        handleAddTimeDelayForScheduler(msg.data.timeDelay);
        break;
      case KEY_INTERACT_BEFORE_POST_REQUEST.GET_ALL_METADATA:
        handleGetAllMetadataInteractBeforePost(sendResponse);
        return true;

      case KEY_LAST_TIME_POST:
        handleUpdateLastTimePost(msg.data.time);
        break;
      case KEY_TIME_DELAY:
        handleGetTimeDelay(sendResponse);
        return true;
      case KEY_GET_PARSE_FILE:
        handleParseFile(msg.data?.files, sendResponse);
        return true;

      case KEY_CAN_COMMENT_WALK_THIS_TAB:
        handleCanCommentWalkThisTab(sender, sendResponse);
        return true;

      case KEY_GET_ALL_METADATA_COMMENT_WALK:
        handleGetAllMetadataCommentWalk(sendResponse);
        return true;

      case KEY_SET_PROCESSING_COMMENT_WALK:
        handleSetProcessingCommentWalk(msg.data?.isProcessing);
        break;

      case KEY_CAN_COMMENT_WALK_THIS_POST:
        handleCanCommentWalkThisPost(msg.data?.url, sendResponse);
        return true;

      case KEY_ADD_URL_COMMENTED:
        handleAddUrlCommented(msg.data?.url);
        break;

      case KEY_COMPLETED_COMMENT_WALK_THIS_BATCH:
        handleCompletedCommentWalkThisBatch(sender);
        return true;

      case KEY_STOP_TASK_REQUEST.GET_IS_STOP_TASK:
        handleGetIsStopTask(sendResponse);
        return true;

      case KEY_COMMENT_WALK_REQUEST.UPDATE_LAST_TIME_COMMENT:
        handleUpdateLastTimeComment(msg.data?.time);
        break;
    }
  } catch (error) {
    logError("Error at background: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: error.message || error || "Something went wrong",
    });
    return true;
  }
});

async function nextGroupPost() {
  try {
    const isStop = await getIsStopTaskData();
    const isProgress = await getProgressTool();

    const isSpammed = await getIsSpammedData();

    if (isStop || isSpammed || !isProgress) {
      setProgressTool(false);
      clearAndCreateSchedulerAlarm();
      return;
    }
    const { isPostedAll, isPostedMaxGroupPerTime } =
      await checkPostedAllGroupOrMaxGroupPerTime();

    if (isPostedAll || isPostedMaxGroupPerTime) {
      await setCurrentCountPostLength(0);
      await setProgressTool(false);

      if (isPostedAll) {
        logActions("[Background] All group have been posted");
        addLog({
          vi: "Tất cả nhóm đã được đăng, đặt lại tất cả nhóm thành đang chờ và chuyển sang đợt tiếp theo",
          en: "All group have been posted, reset all group to pending and switch to next batch",
        });
        await resetPostedGroupAndSave();
      } else {
        const isRandomBatchPost = await getIsRandomBreakBatchData();
        if (isRandomBatchPost) {
          const countBatchPost = await getCountBatchPost();
          setCountBatchPost(countBatchPost + 1);
        }
        logActions("[Background] Max group per time have been posted");
        addLog({
          vi: "Số lượng nhóm đã đăng đạt giới hạn, chuyển sang đợt tiếp theo (nếu lên lịch đang được bật)",
          en: "Max group per time have been posted, switch to next batch (if scheduler is enabled)",
        });
      }

      await clearAndCreateSchedulerAlarm();
      await logSchedulerHelper();

      return;
    }

    const objectList = await getListGroupsNeedPostInStorage();
    let currentIdGroup = await getCurrentIdDataGroupPost();

    if (!currentIdGroup) {
      await setProgressTool(false);
      addLog({
        vi: "Không tìm thấy dữ liệu được chọn, hãy thêm hoặc đánh dấu dữ liệu cần đăng bài",
        en: "No group need post, please add or mark the data to be posted",
      });
      return;
    }

    const listGroups = objectList?.groups || [];
    const need = listGroups.find((gr) => gr.id === currentIdGroup);

    if (!need || !need.groups || !need.groups.length) {
      await setProgressTool(false);
      addLog({
        vi: "Dữ liệu hiện tại không có nhóm nào phù hợp, hãy tham gia thêm nhóm hoặc chọn lại dữ liệu khác",
        en: "Current data does not have any suitable group, please join more groups or select other data",
      });
      return;
    }
    const posteds = await getAllGroupPostedsInStorage();
    const set = new Set(posteds);

    let groups = need?.groups || [];

    //continue task
    const isExistGroupPending = groups.some(
      (gr) => !set.has(gr.id_href) && gr.status === STATUS_TASK.PENDING,
    );

    if (!isExistGroupPending) {
      addLog({
        vi: "Tất cả nhóm trong dữ liệu hiện tại đã được đăng, đang tìm dữ liệu khác được chọn phù hợp",
        en: "All group in current data have been posted, looking for other suitable data",
      });
      let id = await getRandomIdDataGroupPostChecked();
      if (!id) {
        await resetPostedGroupAndSave();
        id = await getRandomIdDataGroupPostChecked();
      }
      if (!id) {
        return;
      }
      await setCurrentIdDataGroupPost(id);
      const need = await getCurrentGroupNeedPost();
      groups = need?.groups || [];
    }

    const nextTaskFind = groups.find((gr) => {
      return gr.status === STATUS_TASK.PENDING && !set.has(gr.id_href);
    });

    if (nextTaskFind) {
      logActions("open next task: ", nextTaskFind);
      await saveTask({ task: nextTaskFind, time: now() });

      await openNewTaskHepler(nextTaskFind);
    }
    //not found next task
    else {
      await setProgressTool(false);
      addLog({
        vi: "Không tìm thấy nhóm tiếp theo để đăng, có thể tất cả nhóm trong dữ liệu hiện tại đã được đăng",
        en: "No next task to post, maybe all group in current data have been posted",
      });
    }
  } catch (error) {
    await setProgressTool(false);
    logError("Error at next group post: ", error);
    addLog({
      vi: "Đã xảy ra lỗi khi tìm nhóm tiếp theo để đăng, tạm dừng tiện ích",
      en: "Error occurred while finding next group to post, pause tool",
    });
  }
}

//handle can post this tab
async function handleCanPostThisTab(sender, sendResponse) {
  try {
    const lastTabPostId = await DB_getValue(KEY_TAB.LAST_POST_TAB_OPEN_ID);
    const taskObject = await getTask();
    const task = taskObject?.task;

    if (lastTabPostId === sender.tab.id) {
      setStatusTask(STATUS_TASK.SELECTING);
      sendResponse({
        status: STATUS_RESPONSE.SUCCESS,
        data: {
          can_post: true,
          data: task,
        },
      });

      return true;
    }
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message:
        "Can not post this tab, because this tab maybe open by user, not by tool",
    });
    return true;
  } catch (error) {
    logError("Error can post this tab: ", error);
  }
}

async function handleCanCommentWalkThisTab(sender, sendResponse) {
  try {
    const commentTabId = await commentWalkService.getTabIdCommentWalk();
    if (!commentTabId) {
      sendResponse({
        status: STATUS_RESPONSE.FAIL,
        message:
          "Can not comment walk this tab, because this tab maybe open by user, not by tool",
      });
      return true;
    }

    // const isComment = await getIsCommentWalkData();
    // if (!isComment) {
    //   sendResponse({
    //     status: STATUS_RESPONSE.FAIL,
    //     message:
    //       "Can not comment walk this tab, because is comment walk disabled",
    //   });
    //   return true;
    // }

    if (commentTabId !== sender.tab.id) {
      sendResponse({
        status: STATUS_RESPONSE.FAIL,
        message:
          "Can not comment walk this tab, because this tab maybe open by user, not by tool",
      });
      return true;
    }

    const currentId = await commentWalkService.getCurrentIdCommentWalkActive();
    if (!currentId) {
      sendResponse({
        status: STATUS_RESPONSE.FAIL,
        message:
          "Can not comment walk this tab, because id comment walk not found",
      });
      return true;
    }

    const commentWalk = await commentWalkService.getCommentWalkById(currentId);
    if (!commentWalk) {
      sendResponse({
        status: STATUS_RESPONSE.FAIL,
        message:
          "Can not comment walk this tab, because comment walk data not found",
      });
      return true;
    }

    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data: {
        can_comment_walk: true,
        data: commentWalk,
      },
    });
    return true;
  } catch (error) {
    logError("Error can comment walk this tab: ", error);
  }
}

async function handleCanCommentWalkThisPost(url, sendResponse) {
  try {
    const commented = await commentWalkService.checkUrlCommented(url);

    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data: {
        can_comment_walk: !commented,
      },
    });
    return true;
  } catch (error) {
    logError("Error at handleCanCommentWalkThisPost: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: getTextWithLanguage({
        vi: "Lỗi khi lấy dữ liệu",
        en: "Error getting data",
      }),
    });
    return true;
  }
}

async function handleCompletedCommentWalkThisBatch(sender) {
  try {
    await commentWalkService.setIsCommentWalkProcessing(false);
    const tabId = sender.tab.id;
    await commentWalkService.setTabIdCommentWalk(null);
    await commentWalkService.setCountCommentWalkPostedPerBatch(0);

    addLog({
      vi: "Đã hoàn thành đợt bình luận dạo, chuyển sang đợt tiếp theo (nếu lên lịch đang được bật)",
      en: "Completed comment walk batch, switching to the next batch (if scheduling is enabled)",
    });

    const countBatch = await getCountBatchPost();
    await setCountBatchPost(countBatch + 1);

    await handleCloseThisTab(tabId);
    await clearAndCreateSchedulerAlarm();
  } catch (error) {
    logError("Error at handleCompletedCommentWalkThisBatch: ", error);
    addLog({
      vi:
        "Đã xảy ra lỗi khi hoàn thành đợt bình luận dạo: " + error?.message ||
        error?.msg ||
        error,
      en:
        "Error occurred while completing comment walk batch: " +
          error?.message ||
        error?.msg ||
        error,
      type: "error",
    });
  }
}

async function handleOpenInTab(msg) {
  try {
    const t = await chrome.tabs.create({
      url: msg.url,
      active: msg.active !== false,
    });
    await DB_setValue(KEY_TAB.LAST_POST_TAB_OPEN_ID, t.id);
  } catch (error) {
    logError("Error open in tab: ", error);
  }
}

async function handleGetListGroups() {
  try {
    await DB_setValue(KEY_IS_SCROLL_DETECT_LIST_GROUP, true);
    const tab = await chrome.tabs.create({
      url: URL_LIST_GROUPS,
      active: true,
    });
    await DB_setValue(KEY_TAB.TAB_GET_LIST_GROUP_ID, tab.id);

    //DO LATER: create popup window for get list group
    // const win = await chrome.windows.create({
    //   url: URL_LIST_GROUPS,
    //   type: "popup",
    //   width: 900,
    //   height: 800,
    // });
    // await BG_setValue(KEY_WINDOW.WINDOW_GET_LIST_GROUP_ID, win.id);
  } catch (error) {
    logError("Error get list groups: ", error);
  }
}

async function handleOpenDashboard() {
  const urlDashboard = chrome.runtime.getURL(
    "dashboard/dashboard.html#nav=dashboard",
  );
  const tabs = await chrome.tabs.query({});
  if (tabs && Array.isArray(tabs) && tabs?.length > 0) {
    for (const tab of tabs) {
      const url = tab.url;
      if (url.includes("dashboard")) {
        chrome.tabs.update(tab.id, { active: true });
        return;
      }
    }
    chrome.tabs.create({
      url: urlDashboard,
      active: true,
    });
  }
}

async function handleGetCurrentDataGroupSavedNeedPost(sendResponse) {
  try {
    const isProgress = await getProgressTool();
    if (!isProgress) {
      sendResponse({
        status: STATUS_RESPONSE.FAIL,
        message: "Tool is not running",
      });
      return true;
    }
    const data = await getCurrentDataGroupPosting();
    const contents = data?.contents || [];

    if (!contents.length) {
      sendResponse({
        status: STATUS_RESPONSE.FAIL,
        message: "No content to post",
      });
      return true;
    }

    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data: data,
    });
  } catch (error) {
    logError("Error get current data group saved need post: ", error);
  }
}

async function handleGetIsStopTask(sendResponse) {
  try {
    const stop = await getIsStopTaskData();
    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data: stop,
    });
  } catch (error) {
    logError("Error get is stop task: ", error);
  }
}

async function handleUpdateIsSpammed(isSpammed) {
  try {
    if (isSpammed) {
      await addLog({
        vi: "Tài khoản người dùng đã bị spam, tạm dừng tiện ích",
        en: "User account is spammed, pausing the tool",
      });
      setProgressTool(false);
      const timeBreak =
        (await getTimeBreakWhenSpammedData()) ||
        KEY_DEFAULT_VALUE.DEFAULT_TIME_BREAK_WHEN_SPAMMED;
      const nextTime = now() + 1000 * 60 * 60 * 24 * timeBreak;
      await DB_setValue(KEY_NEXT_TIME_POST_WHEN_SPAMMED, nextTime);
      await setIsSpammedData(isSpammed);
    }
  } catch (error) {
    logError("Error update is spammed: ", error);
  }
}

async function handleAddLog(message) {
  try {
    addLog({ vi: message?.vi || "", en: message?.en || "" });
  } catch (error) {
    logError("Error add log: ", error);
  }
}

async function handleWelcomeBack() {
  try {
    const isAuthen = await isAuthentication();
    if (isAuthen) {
      const auth = await getAuthFromStorage();
      if (auth) {
        addLog({
          vi: "Chào mừng bạn quay trở lại, " + auth.username,
          en: "Welcome back, " + auth.username,
        });
      }
    } else {
      addLog({
        vi: "Chào mừng bạn quay trở lại",
        en: "Welcome back",
      });
    }

    const isPremium = await getPremiumService();

    if (isPremium) {
      addLog({
        vi: "Chế độ Premium đã được kích hoạt",
        en: "Premium mode is activated",
      });
    }

    await logSchedulerHelper();

    const isProgress = await getProgressTool();
    const isCommentWalkProcessing =
      await commentWalkService.getIsCommentWalkProcessing();
    if (isProgress || isCommentWalkProcessing) {
      if (isProgress) {
        await setProgressTool(false);
      }
      if (isCommentWalkProcessing) {
        await commentWalkService.setIsCommentWalkProcessing(false);
      }
      addLog({
        vi: "Đã phát hiện tiện ích vừa được khởi động lại trong lúc đang có tác vụ chạy dở, tác vụ trước đó đã bị ngắt",
        en: "Detected that the tool was just restarted while a task was in progress, the previous task has been interrupted",
      });
    }
    await setTimeDelayForScheduler(0);
    await setCountResetGroupInStorage(0);
  } catch (error) {
    logError("Error at handleWelcomeBack method: ", error);
  }
}

async function handleCloseThisTab(tabId) {
  try {
    chrome.tabs.query({}, function (tabs) {
      const id = tabId;
      if (tabs && Array.isArray(tabs) && tabs.find((t) => t.id === id)) {
        chrome.tabs.remove(id);
      }
    });
  } catch (error) {
    logError("Error handle close this tab: ", error);
  }
}

async function handleOnCommited(details) {
  try {
    if (details.frameId === 0) {
      //start_page
      //auto_bookmark, link, reload

      const currentId = details.tabId;

      if (details.transitionType === "reload") {
        const tabIdGetListGroup = await DB_getValue(
          KEY_TAB.TAB_GET_LIST_GROUP_ID,
        );
        //check get list groups tab was be reload
        if (currentId === tabIdGetListGroup) {
          const isScroll = await getIsScrollDetectListGroupInStorage();
          if (isScroll) {
            await setIsScrollDetectListGroupInStorage(false);
            await DB_deleteValue(KEY_TAB.TAB_GET_LIST_GROUP_ID);
            addLog({
              vi: "Đã dừng lấy danh sách nhóm do tab bị load lại thủ công",
              en: "Stopped getting group list because tab was reloaded manually",
            });
          }
        }

        const tabIdPost = await DB_getValue(KEY_TAB.LAST_POST_TAB_OPEN_ID);
        //check when posting was be reload -> set
        if (currentId === tabIdPost) {
          setProgressTool(false);
          await DB_deleteValue(KEY_TAB.LAST_POST_TAB_OPEN_ID);
          addLog({
            vi: "Đã dừng đăng bài đợt này do tab bị load lại thủ công",
            en: "Stopped posting this batch because tab was reloaded manually",
          });
        }

        const tabIdCommentWalk = await commentWalkService.getTabIdCommentWalk();
        if (currentId === tabIdCommentWalk) {
          await commentWalkService.setIsCommentWalkProcessing(false);
          await DB_deleteValue(KEY_COMMENT_WALK.TAB_ID_COMMENT_WALK);
          addLog({
            vi: "Đã dừng bình luận đợt này do tab bị load lại thủ công",
            en: "Stopped comment this batch because tab was reloaded manually",
          });
        }

        if (getIsDashboardTab(details.url)) {
          await initialGlobalDataWhenReload();
        }
      }

      if (details.transitionType !== "reload") {
        const url = details.url || "";

        //when user open dashboard tab -> set tab id, not exist dashboard tab and reload it
        if (getIsDashboardTab(url)) {
          await initialGlobalData();
          await DB_setValue(KEY_TAB.TAB_DASHBOARD_ID, currentId);
        }
      }
    }
  } catch (error) {
    logError("Error at handleOnCommited method: ", error);
  }
}

async function handleOnRemove(tabId) {
  async function handleScheduler() {
    try {
      const isScheduler = await getIsSchedulerData();
      if (isScheduler) {
        await clearAndCreateSchedulerAlarm();
        await logSchedulerHelper();
      }
    } catch (error) {
      logError("Error handle scheduler: ", error);
    }
  }

  try {
    const tabIdGetListGroup = await DB_getValue(KEY_TAB.TAB_GET_LIST_GROUP_ID);
    if (tabId === tabIdGetListGroup) {
      const isScroll = await getIsScrollDetectListGroupInStorage();
      if (isScroll) {
        await setIsScrollDetectListGroupInStorage(false);
        await DB_deleteValue(KEY_TAB.TAB_GET_LIST_GROUP_ID);
        addLog({
          vi: "Đã dừng lấy danh sách nhóm do tab bị đóng thủ công",
          en: "Stopped getting group list because tab was closed manually",
        });
      }
    }

    //check when posting was be close
    const tabIdPost = await DB_getValue(KEY_TAB.LAST_POST_TAB_OPEN_ID);
    if (tabId === tabIdPost) {
      const isProgress = await getProgressTool();
      if (isProgress) {
        await setProgressTool(false);
        await DB_deleteValue(KEY_TAB.LAST_POST_TAB_OPEN_ID);
        addLog({
          vi: "Đã dừng đăng bài đợt này do tab đăng bài bị đóng thủ công",
          en: "Stopped posting this batch because tab posting was closed manually",
        });
        handleScheduler();
      }
    }

    //check when comment walk was be close
    const tabIdCommentWalk = await commentWalkService.getTabIdCommentWalk();
    if (tabId === tabIdCommentWalk) {
      const isCommentWalkProcessing =
        await commentWalkService.getIsCommentWalkProcessing();
      if (isCommentWalkProcessing) {
        await commentWalkService.setIsCommentWalkProcessing(false);
        await DB_deleteValue(KEY_COMMENT_WALK.TAB_ID_COMMENT_WALK);
        addLog({
          vi: "Đã dừng bình luận đợt này do tab bình luận bị đóng thủ công",
          en: "Stopped comment this batch because tab comment was closed manually",
        });
        handleScheduler();
      }
    }

    const tabIdDashboard = await DB_getValue(KEY_TAB.TAB_DASHBOARD_ID);
    if (tabId === tabIdDashboard) {
      clearSchedulerAuto();
      DB_deleteValue(KEY_TAB.TAB_DASHBOARD_ID);
    }
  } catch (error) {
    logError("Error at handleRemove", error);
  }
}

async function handleGetKeySaved(key, sendResponse) {
  try {
    const data = await DB_getValue(key);
    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data,
    });
  } catch (error) {
    logError("Error at handleGetKeySaved: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: getTextWithLanguage({
        vi: "Lỗi khi lấy dữ liệu",
        en: "Error getting data",
      }),
    });
  }
}

async function handleSetKeySaved(key, value, sendResponse) {
  try {
    await DB_setValue(key, value);
    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data: true,
    });
  } catch (error) {
    logError("Error at handleSetKeySaved: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: getTextWithLanguage({
        vi: "Lỗi khi lưu dữ liệu",
        en: "Error saving data",
      }),
    });
  }
}

async function handleGetAllMetadataComments(sendResponse) {
  try {
    const data = await getAllMetadataComments();
    const numberComment = random(1, data.max_comment_per_post);
    data.max_comment_per_post = numberComment;

    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data,
    });
  } catch (error) {
    logError("Error at handleGetAllMetadataComments: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: getTextWithLanguage({
        vi: "Lỗi khi lấy dữ liệu",
        en: "Error getting data",
      }),
    });
  }
}

async function handleGetAllMetadataCommentWalk(sendResponse) {
  try {
    const data = await commentWalkService.getAllMetadataCommentWalk();

    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data,
    });
  } catch (error) {
    logError("Error at handleGetAllMetadataCommentWalk: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: getTextWithLanguage({
        vi: "Lỗi khi lấy dữ liệu",
        en: "Error getting data",
      }),
    });
  }
}

async function handleParseFile(files, sendResponse) {
  try {
    const list = [];
    if (files && Array.isArray(files)) {
      for await (const file of files) {
        let parse = file;
        if (typeof file === "string") {
          const blob = await parseUrlToBlob(file);
          const newFile = parseBlobToFile(blob, file);
          parse = await parseFileToObjectBase64(newFile);
        }
        if (parse) {
          list.push(parse);
        }
      }
    }

    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data: list,
    });
  } catch (error) {
    logError("Error at handleParseFile: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: getTextWithLanguage({
        vi: "Lỗi khi parse file",
        en: "Error parsing file",
      }),
    });
  }
}

async function handleSetProcessingCommentWalk(isProcessing) {
  try {
    await commentWalkService.setIsCommentWalkProcessing(isProcessing);
  } catch (error) {
    logError("Error at handleSetProcessingCommentWalk: ", error);
  }
}

async function handleUpdateLastTimePost(time) {
  try {
    await setLastTimePostData(time);
  } catch (error) {
    logError("Error at handleUpdateLastTimePost: ", error);
  }
}

async function handleUpdateLastTimeComment(time) {
  try {
    await commentWalkService.setLastTimeCommentWalkSuccess(time);
  } catch (error) {
    logError("Error at handleUpdateLastTimeComment: ", error);
  }
}

async function handleAddUrlCommented(url) {
  try {
    await commentWalkService.addUrlCommented(url);
  } catch (error) {
    logError("Error at handleAddUrlCommented: ", error);
  }
}

async function initialGlobalDataWhenReload() {
  async function initialAuth() {
    try {
      const auth = await getAuthFromStorage();
      if (auth) {
        const res = await checkUser();
        if (!res) {
          await logoutService();
        }
      } else {
        await setIsUseLocalStorage(true);
      }
    } catch (error) {
      handleErrorHelper({
        name: "[background] initialAuth",
        error,
        code: error.code,
        isShowNotify: false,
      });
    }
  }

  try {
    await initialAuth();
    await initIsUseLocalStorage();
  } catch (error) {
    logError("Error at initialGlobalDataWhenReload: ", error);
  }
}

async function initialGlobalData() {
  try {
    await initIsUseLocalStorage();

    logActions("Initial data global run");
    const currentWindow = await chrome.windows.getCurrent();

    await DB_setValue(KEY_CURRENT_WINDOW_ID, currentWindow.id);

    const isFirstTimeUse = await getIsFirstTimeUseToolInStorage();

    if (isFirstTimeUse === undefined || isFirstTimeUse === null) {
      await setIsFirstTimeUseToolInStorage(true);
      addLog({
        vi: "Bắt đầu sử dụng tiện ích",
        en: "Start using the extension",
      });

      await Promise.all([
        setIsShuffleGroupNeedPostData(true),
        setIsFixStealFocusData(true),
      ]);
      await setPremiumService(false);

      const device = await getDeviceFromStorage();
      if (!device) {
        await createNewDeviceAndForceSave();
      }
    } else {
      await handleWelcomeBack();
      await setIsFirstTimeUseToolInStorage(false);
    }
  } catch (error) {
    logError("Error at initialGlobalData: ", error);
  }
}

//TODO: DO LATER
async function handleCloseThisWindow(sender) {
  try {
    console.log("Close this window");
    console.log("Sender", sender);
  } catch (error) {
    logError("Error at handleCloseThisWindow: ", error);
  }
}

async function handleAddTimeDelayForScheduler(timeDelay) {
  try {
    const time = await getTimeDelayForScheduler();
    const newTimeDelay = time + timeDelay;
    await setTimeDelayForScheduler(Number(newTimeDelay));
  } catch (error) {
    logError("Error at handleAddTimeDelayForScheduler: ", error);
  }
}

async function handleGetAllMetadataInteractBeforePost(sendResponse) {
  try {
    const can_interact = await getDecidedInteractBeforePostInStorage();
    const max_post_interact_per_batch = await getMaxPostInteractService();

    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data: {
        can_interact,
        max_post_interact_per_batch,
      },
    });
  } catch (error) {
    logError("Error at handleGetAllMetadataInteractBeforePost: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: getTextWithLanguage({
        vi: "Lỗi khi lấy dữ liệu",
        en: "Error getting data",
      }),
    });
  }
}

async function handleGetTimeDelay(sendResponse) {
  try {
    const data = await getTimeDelayData();
    sendResponse({
      status: STATUS_RESPONSE.SUCCESS,
      data,
    });
  } catch (error) {
    logError("Error at handleGetTimeDelay: ", error);
    sendResponse({
      status: STATUS_RESPONSE.FAIL,
      message: getTextWithLanguage({
        vi: "Lỗi khi lấy dữ liệu",
        en: "Error getting data",
      }),
    });
  }
}

async function handleOnAlarm(alarm) {
  try {
    //

    async function randomInteractBeforePost() {
      try {
        const isInteract = await getIsInteractBeforePostData();
        if (isInteract) {
          addLog({
            vi: "Chức năng tương tác trước khi đăng bài đang được bật, đang kiểm tra xem có nên tương tác bài viết trước không",
            en: "The function of interacting before posting is enabled, checking if it should interact with posts before posting",
          });
          if (randomRateBoolean(20, 100)) {
            addLog({
              vi: "Đã quyết định tương tác bài viết trước khi đăng bài",
              en: "Decided to interact with posts before posting",
            });
            await setDecidedInteractBeforePostInStorage(true);
          } else {
            addLog({
              vi: "Đã quyết định bỏ qua tương tác bài viết trước khi đăng bài, tiếp tục thực hiện tác vụ đăng bài",
              en: "Decided to skip interacting with posts before posting, continuing to perform posting task",
            });
            await setDecidedInteractBeforePostInStorage(false);
          }
        }
      } catch (error) {
        logError("Error random interact before post:", error);
        addLog({
          vi: `Đã xảy ra lỗi khi quyết định tương tác bài viết trước khi đăng bài, ${error}`,
          en: `Error occurred while deciding to interact with posts before posting, ${error}`,
        });
      }
    }

    async function logWhenSpammedPost() {
      const nextTimePost = await getNextTimePostWhenSpammed();
      const date = new Date(nextTimePost).toLocaleString();
      addLog({
        vi: `Tài khoản của bạn đã bị đánh dấu là spam bởi Facebook, không thể đăng bài trong 1 khoảng thời gian, thời gian tiếp theo sẽ là ${date}`,
        en: `Your account has been flagged as spam by Facebook, cannot post for a while, next post will be at ${date}`,
      });
      setCountBatchPost(0);
      clearAndCreateSchedulerAlarm();
      return;
    }

    async function handleStopTool() {
      await commentWalkService.setIsCommentWalkProcessing(false);
      await setProgressTool(false);
      await clearAndCreateSchedulerAlarm();
    }

    async function sendMessageExecutePost() {
      await DB_setValue(
        KEY_MESSAGE_FROM_BACKGROUND.AUTOMATION.POST_CONTINUE,
        Date.now(),
      );
    }

    async function sendMessageExecuteCommentWalk() {
      await DB_setValue(
        KEY_MESSAGE_FROM_BACKGROUND.AUTOMATION.COMMENT_WALK,
        Date.now(),
      );
    }

    async function handleExecuteTask() {
      const premium = await getPremiumService();
      const isSpammed = await getIsSpammedData();

      async function executeTaskPost() {
        if (isSpammed) {
          await logWhenSpammedPost();
          return;
        }
        const isCommentWhenPost = await getIsCommentWhenPostSuccessData();
        if (isCommentWhenPost) {
          addLog({
            vi: "Chức năng bình luận sau khi đăng bài đang được bật, bình luận sẽ được ngẫu nhiên thực hiện hoặc không sau khi hoàn tất việc đăng bài",
            en: "The function of commenting after posting is enabled, will be performed or not randomly after completing the posting",
          });
        }
        await randomInteractBeforePost();

        await sendMessageExecutePost();
      }

      async function executeTaskCommentWalk() {
        addLog({
          vi: "Chức năng bình luận dạo đang được bật, công việc hiện tại của tiện ích là bình luận dạo",
          en: "The function of commenting walk is enabled, the current task of the tool is commenting walk",
        });
        await sendMessageExecuteCommentWalk();
      }

      if (!premium) {
        await executeTaskPost();
        return;
      }

      const isExecuteWithPriority = await getIsExecutePriorityTaskData();
      const isCommentWalk = await getIsCommentWalkData();
      if (!isExecuteWithPriority) {
        if (isCommentWalk) {
          await executeTaskCommentWalk();
        } else {
          await executeTaskPost();
        }
        return;
      }

      addLog({
        vi: "Chế độ thực hiện công việc theo độ ưu tiên đang được bật, tiện ích sẽ chọn công việc ngẫu nhiên có độ ưu tiên cao để thực hiện",
        en: "The mode of performing tasks according to priority is enabled, the tool will select the random task with high priority to perform",
      });

      const listTaskNameInactive = await getListTaskNameInactive();
      if (listTaskNameInactive.length) {
        const listLabelTask = listTaskNameInactive
          .map((i) => deviceHelper.getTaskLabelWithName(i))
          .join(", ");

        addLog({
          vi:
            "Các tác vụ có thể không thực hiện được (có thể bị spam,...): " +
            listLabelTask,
          en:
            "Tasks that may not be performed (maybe spammed,...): " +
            listLabelTask,
        });
      }

      const taskName = await getRandomTaskNameWithPriority();
      await setCurrentTaskName(taskName);

      addLog({
        vi:
          "Công việc hiện tại của tiện ích: " +
          deviceHelper.getTaskLabelWithName(taskName),
        en:
          "Current task of the tool: " +
          deviceHelper.getTaskLabelWithName(taskName),
      });

      switch (taskName) {
        case KEY_TASK_NAME.POST:
          await executeTaskPost();
          break;
        case KEY_TASK_NAME.COMMENT_WALK:
          await sendMessageExecuteCommentWalk();
          break;
        default:
          addLog({
            vi: "Không tìm thấy công việc hợp lệ để thực hiện, có thể tất cả công việc đều đang bị spam, dừng tác vụ đợt này",
            en: "No valid task found to perform, maybe all tasks are being spammed, stopping this batch",
          });
          await handleStopTool();
          break;
      }
    }

    if (alarm.name === KEY_SCHEDULER_ALARMS) {
      const tabs = await chrome.tabs.query({});

      let isOpenningDashboardTab = false;
      for (const tab of tabs) {
        const url = tab.url;
        if (getIsDashboardTab(url)) {
          isOpenningDashboardTab = true;
          break;
        }
      }

      if (!isOpenningDashboardTab) {
        clearSchedulerAuto();
        return;
      }

      const isCommentWalk = await getIsCommentWalkData();
      let isSpammed = await getIsSpammedData();
      const isDetectingGroup = await getIsScrollDetectListGroupInStorage();

      if (isSpammed) {
        const nextTimeWhenSpamed = await getNextTimePostWhenSpammed();
        const now = Date.now();
        if (now > nextTimeWhenSpamed) {
          await setIsSpammedData(false);
          isSpammed = false;
        }
      }

      const isProgress = await getProgressTool();
      const isProgressCommentWalk =
        await commentWalkService.getIsCommentWalkProcessing();

      if (isProgress || isProgressCommentWalk) {
        if (isCommentWalk) {
          commentWalkService.setIsCommentWalkProcessing(false);
        } else {
          setProgressTool(false);
        }

        addLog({
          vi: "Tiện ích đang bị treo do lỗi khi thực hiện công việc trước đó, đang đặt lại trạng thái và chuyển sang đợt tiếp theo",
          en: "Tool is stuck due to previous error when performing the task, resetting status and switching to the next batch",
        });

        const lastTabPostOpenId = await DB_getValue(
          KEY_TAB.LAST_POST_TAB_OPEN_ID,
        );

        if (lastTabPostOpenId !== undefined && lastTabPostOpenId !== null) {
          await handleCloseThisTab(lastTabPostOpenId);
          await DB_deleteValue(KEY_TAB.LAST_POST_TAB_OPEN_ID);
        }

        if (isCommentWalk) {
          const tabIdCommentWalk =
            await commentWalkService.getTabIdCommentWalk();
          if (tabIdCommentWalk !== undefined && tabIdCommentWalk !== null) {
            await handleCloseThisTab(tabIdCommentWalk);
            await DB_deleteValue(KEY_COMMENT_WALK.TAB_ID_COMMENT_WALK);
          }
        }

        clearAndCreateSchedulerAlarm();

        return;
      }

      const isRandomBatchPost = await getIsRandomBreakBatchData();
      if (isRandomBatchPost) {
        addLog({
          vi: "Đã đến giờ thực hiện công việc trong lịch trình, chế độ nghỉ ngẫu nhiên đang bật, đang tính toán có nên thực hiện công việc đợt này không",
          en: "It's time to perform the task in the schedule, random rest mode is enabled, calculating whether to perform the task this batch or not",
        });

        async function sleepThisTime() {
          const nextTime = await getCorrectNextTime();
          const date = new Date(nextTime);
          addLog({
            vi:
              "Đã quyết định nghỉ thực hiện các tác vụ đợt này, chuyển sang đợt tiếp theo lúc: " +
              date.toLocaleString(),
            en:
              "Decided to skip performing tasks this batch, will start next batch at: " +
              date.toLocaleString(),
          });

          if (isCommentWalk) {
            await commentWalkService.setIsCommentWalkProcessing(false);
          } else {
            setProgressTool(false);
          }

          setCountBatchPost(0);
          clearAndCreateSchedulerAlarm();
        }

        const countBatchPost = await getCountBatchPost();
        if (countBatchPost > 8) {
          sleepThisTime();
          return;
        }

        if (countBatchPost >= 5 && countBatchPost <= 8) {
          //increase percent to sleep this time
          if (randomRateBoolean(30, 100)) {
            sleepThisTime();
            return;
          }
        }

        //random this time to post or not with 10% chance
        if (randomRateBoolean(10, 100) && countBatchPost >= 2) {
          sleepThisTime();
          return;
        }

        addLog({
          vi: "Đã quyết định thực hiện các tác vụ đợt này",
          en: "Decided to perform this batch of tasks",
        });

        const isStop = await getIsStopTaskData();
        if (isStop) {
          addLog({
            vi: "Tiện ích đang trong trạng thái tắt, dừng tác vụ",
            en: "Tool is in off state, stopping task",
          });
          await handleStopTool();
          return;
        }

        if (isDetectingGroup) {
          addLog({
            vi: "Tiện ích đang trong trạng thái lấy danh sách nhóm của người dùng, dừng tác vụ",
            en: "Tool is in detecting list group state of user, stopping task",
          });
          await handleStopTool();
          return;
        }

        await handleExecuteTask();

        return;
      }

      const isPremium = await getPremiumService();
      if (isPremium) {
        addLog({
          vi: "Đã đến giờ thực hiện công việc trong lịch trình, chế độ nghỉ ngẫu nhiên đang tắt, sẽ bắt đầu đợt công việc",
          en: "It's time to do work in the schedule, random rest mode is off, will start this work",
        });
      } else {
        addLog({
          vi: "Đã đến giờ thực hiện công việc trong lịch trình, sẽ bắt đầu đợt công việc",
          en: "It's time to do work in the schedule, will start this work",
        });
      }

      const isStop = await getIsStopTaskData();
      if (isStop) {
        addLog({
          vi: "Tiện ích đang trong trạng thái tắt, dừng tác vụ",
          en: "Tool is in off state, stopping task",
        });
        await handleStopTool();
        return;
      }

      if (isDetectingGroup) {
        addLog({
          vi: "Tiện ích đang trong trạng thái lấy danh sách nhóm của người dùng, dừng tác vụ",
          en: "Tool is in detecting list group state of user, stopping task",
        });
        await handleStopTool();
        return;
      }

      await handleExecuteTask();

      const isShuffle =
        (await DB_getValue(KEY_IS_SHUFFLE_SCHEDULER_TIME)) || false;
      if (isShuffle) {
        shuffleTimes();
      }

      //TODO: FIX LATER
      //force create schduler when tab post maybe frozen
      // const isScheduler = await getIsSchedulerData();
      // if (isScheduler) {
      //   clearAndCreateSchedulerAlarm();
      // }
    }
  } catch (error) {
    logError("Error at alarm: ", error);
  }
}

console.log("[FB Auto Post] Background service worker started");
