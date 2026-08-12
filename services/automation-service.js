import { KEY_POST, KEY_TAB, STATUS_TASK } from "../contants/contants.js";
import { showNotify } from "../dashboard/src/draw_element/notify.js";
import { addLog } from "../dashboard/src/draw_element/panel-log.js";
import { DB_openInTab, DB_setValue } from "../utils/api-helper.js";
import {
  getTextWithLanguage,
  logActions,
  logError,
  now,
  sleep,
} from "../utils/utils.js";
import { getPremiumService } from "./auth-service.js";
import {
  getListDataGroupPostNeedPost,
  getListIdDataGroupPostCheckeds,
  getRandomIdDataGroupPostChecked,
  setCurrentDataGroupPosting,
  setCurrentIdDataGroupPost,
} from "./data-group-post-service.js";
import {
  getAllDataGroupsInStorage,
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
  setAllGroupPostedsInStorage,
  updateGroupNeedPosts,
} from "./groupService.js";
import {
  getIsFixStealAllFocusData,
  getIsFixStealFocusData,
  getIsSpecialFrameHoursData,
} from "./setting-service.js";
import { getObjectIsInSpecialFrameHours } from "./special-frame-hours-service.js";
import {
  getChangeGroupsCheckedFlag,
  getIsStopTaskInStorage,
  getIsTestInStorage,
  setChangeGroupsCheckedFlag,
  setCurrentCountPostLength,
  setIsStopTaskInStorage,
  setIsTestInStorage,
  setProgress,
} from "./storage-service.js";

async function checkAndLogSpecialFrameHour() {
  try {
    const isSpecialFrameHour = await getIsSpecialFrameHoursData();
    const isPremium = await getPremiumService();
    if (isSpecialFrameHour && isPremium) {
      await sleep(500);
      addLog({
        vi: "Chức năng khung giờ đặc biệt đang được bật, đang kiểm tra có thuộc khung giờ đặc biệt không",
        en: "Special frame hours function is enabled, checking if it belongs to special frame hours",
      });

      const object = await getObjectIsInSpecialFrameHours();

      await sleep(500);
      if (object) {
        addLog({
          vi:
            "Khung giờ hiện tại thuộc khung giờ đặc biệt, số nhóm tối đa trong lần này sẽ là: " +
            object.max_group,
          en:
            "Current time belongs to special frame hours, max groups this time will be: " +
            object.max_group,
        });
      } else {
        addLog({
          vi: "Hiện tại không thuộc khung giờ đặc biệt, tiếp tục đăng bài bình thường",
          en: "Current time does not belong to special frame hours, continue normal posting",
        });
      }
    }
  } catch (error) {
    logError("Error checking special frame hour: ", error);
  }
}

async function autoWithFirstTask() {
  //run new task
  try {
    const object = await getListGroupsNeedPostInStorage();
    const listGroups = object?.groups || [];

    logActions("List groups: ", object);

    //just run with first task
    if (Array.isArray(listGroups)) {
      if (!listGroups.length) {
        showNotify({
          message: getTextWithLanguage({
            vi: "Không có dữ liệu nhóm cần đăng",
            en: "No group need post",
          }),
          type: "error",
        });
        setProgress(false);
        return;
      }

      const id = await getRandomIdDataGroupPostChecked();

      //optional
      if (!id) {
        logActions("Reset all groups need post to pending");
        addLog({
          vi: "Tiện ích đã bị tạm dừng do đợt đăng bài này không có dữ liệu nào được chọn, hãy chọn ít nhất 1 dữ liệu để đăng.",
          en: "The utility has been paused because no data was selected for this batch, please select at least 1 data to post.",
        });
        setProgress(false);
        return;
      }

      await setCurrentIdDataGroupPost(id);
      const listDataGroupPostNeedPost = await getListDataGroupPostNeedPost();
      const dataGroupPostFound = listDataGroupPostNeedPost.find(
        (i) => i.id === id,
      );
      if (dataGroupPostFound) {
        await setCurrentDataGroupPosting(dataGroupPostFound);
      }

      const need = listGroups.find((gr) => gr.id === id);
      const groups = need?.groups || [];
      const posteds = await getAllGroupPostedsInStorage();
      const set = new Set(posteds);
      const name = need.name || need.title;

      if (!groups || !groups.length) {
        showNotify({
          message: getTextWithLanguage({
            vi: `Dữ liệu ${name} không có nhóm phù hợp`,
            en: `Data ${name} no group found`,
          }),
          type: "error",
        });
        setProgress(false);
        return;
      }

      addLog({
        vi: `Dữ liệu nhóm cần đăng đợt này: ${name} - số lượng nhóm: ${groups.length}`,
        en: `Data of groups need to post this batch: ${name} - number of groups: ${groups.length}`,
      });

      await checkAndLogSpecialFrameHour();

      //first task
      const task = groups.find(
        (gr) => gr.status === STATUS_TASK.PENDING && !set.has(gr.id_href),
      );
      if (task) {
        logActions("First task", task);
        setCurrentCountPostLength(0);

        await sleep(2000);

        DB_setValue(KEY_POST, { task, time: now() });

        await openNewTaskHepler(task);
      }
    }
  } catch (error) {
    logError("Error at autoWithFirstTask: " + error);
    throw error;
  }
}

async function automationHelper({ isTest = false } = {}) {
  try {
    await setIsTestInStorage(isTest || false);
    await setIsStopTaskInStorage(false);
    setProgress(true);

    //check have all groups
    const allGroups = await getAllDataGroupsInStorage();
    if (!allGroups || !Array.isArray(allGroups) || !allGroups.length) {
      showNotify({
        message: getTextWithLanguage({
          vi: "Không có dữ liệu nhóm, hãy lấy danh sách nhóm trước",
          en: "No group data, please get list group first",
        }),
        type: "error",
      });
      addLog({
        vi: "Tiện ích đã bị tạm dừng do không có dữ liệu nhóm",
        en: "The utility has been paused because there is no group data",
      });
      await setProgress(false);
      return;
    }

    const indexsChecked = await getListIdDataGroupPostCheckeds();
    if (
      !indexsChecked ||
      !Array.isArray(indexsChecked) ||
      !indexsChecked.length
    ) {
      showNotify({
        message: "No group checked need post, please check again",
        type: "error",
      });
      setProgress(false);
      addLog({
        vi: "Tiện ích đã bị tạm dừng do đợt đăng bài này không có dữ liệu nào được chọn, hãy chọn ít nhất 1 dữ liệu để đăng.",
        en: "The utility has been paused because no data was selected for this batch, please select at least 1 data to post.",
      });
      return;
    }

    // const listDataGroupNeedPost = await getListDataGroupPostNeedPost();

    const listGroups = allGroups;

    const isStop = await getIsStopTaskInStorage();
    if (isStop) {
      showNotify({ message: "The task has been stopped", type: "error" });
      addLog({
        vi: "Tiện ích đã bị tạm dừng.",
        en: "The utility has been paused.",
      });
      await setProgress(false);
      return;
    }

    if (!listGroups.length) {
      showNotify({ message: "No group found", type: "error" });
      addLog({
        vi: "Tiện ích đã bị tạm dừng do danh sách nhóm trống, hãy lấy danh sách nhóm trước hoặc tham gia thêm vào các nhóm sau đó lấy lại dữ liệu.",
        en: "The utility has been paused because the list of groups is empty. Please get the list of groups first or join more groups and then get the data again.",
      });
      await setProgress(false);
      return;
    }

    const changeGroupCheckedFlag = await getChangeGroupsCheckedFlag();
    if (changeGroupCheckedFlag) {
      await updateGroupNeedPosts();
      await setChangeGroupsCheckedFlag(false);
    }

    autoWithFirstTask();
  } catch (error) {
    logError("Error at automation: " + error);
    addLog({
      vi: `Lỗi hệ thống. ${error}`,
      en: `System error. ${error}`,
    });
    setProgress(false);
    throw error;
  }
}

/**
 *
 * @param {{id_href: string, status: string}} task
 */
async function openNewTaskHepler(task = {}) {
  try {
    const isFixStealFocus = await getIsFixStealFocusData();
    const isFixStealAllFocus = await getIsFixStealAllFocusData();
    if (isFixStealAllFocus) {
      const tabId = await DB_openInTab(task.id_href, {
        active: false,
        insert: true,
      });
      await DB_setValue(KEY_TAB.LAST_POST_TAB_OPEN_ID, tabId);
    } else if (isFixStealFocus) {
      const tabId = await DB_openInTab(task.id_href, {
        active: false,
        insert: true,
      });
      await DB_setValue(KEY_TAB.LAST_POST_TAB_OPEN_ID, tabId);
      setTimeout(async () => {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        if (tabs.find((t) => t.id === tabId)) {
          chrome.tabs.update(tabId, { active: true });
        }
      }, 4000);
    } else {
      const tabId = await DB_openInTab(task.id_href, { active: true });
      await DB_setValue(KEY_TAB.LAST_POST_TAB_OPEN_ID, tabId);
    }
  } catch (error) {
    logError("Error at openNewTaskHepler: " + error);
    throw error;
  }
}

async function automation() {
  try {
    setAllGroupPostedsInStorage([]);
    setCurrentCountPostLength(0);
    await automationHelper({ isTest: false });
  } catch (error) {
    logError("Error at automation: " + error);
    setProgress(false);
  }
}

async function automationTest() {
  try {
    setAllGroupPostedsInStorage([]);
    setCurrentCountPostLength(0);
    await automationHelper({ isTest: true });
  } catch (error) {
    logError("Error at automation: " + error);
    setProgress(false);
  }
}

async function automationContinue() {
  try {
    setCurrentCountPostLength(0);
    const isTest = await getIsTestInStorage();
    await automationHelper({ isTest });
  } catch (error) {
    logError("Error at automation: " + error);
    setProgress(false);
  }
}

export { automation, automationContinue, automationTest, openNewTaskHepler };
