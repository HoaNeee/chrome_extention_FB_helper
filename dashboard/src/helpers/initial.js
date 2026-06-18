import {
  getIndexsGroupChecked,
  getIsDeveloperModeInStorage,
  getIsFixStealAllFocusInStorage,
  getIsInteractBeforePostInStorage,
  getIsRandomBatchPost,
  getIsRandomTimePost,
  getIsShuffleGroupNeedPost,
  getIsShuffleSchedulerTimeInStorage,
  getIsSpammedInStorage,
  getIsStealFocusInStorage,
  getIsTestInStorage,
  getLanguageInStorage,
  getMaxGroupPerTimeInStorage,
  getPremiumInStorage,
  getProgress,
  getStrictlyMatchTitleGroupInStorage,
  getTimeDelayInStorage,
  setMaxGroupPerTimeInStorage,
} from "../services/storage-service.js";
import {
  disabledElement,
  enabledElement,
  getAllFieldsAdvancedSetting,
  getAllFieldsSetting,
  hideElement,
  hideField,
  showElement,
  showField,
} from "./elementDom.js";
import {
  MAX_GROUP_PER_TIME_INITIAL,
  initialTimeDelay,
  KEY_IS_DARK_THEME,
} from "../../../contants/contants.js";
import { updateDataSavedInfo } from "../draw_element/dataSavedInfo.js";
import {
  getIsDashboardTab,
  logActions,
  logError,
} from "../../../utils/utils.js";
import { DB_getValue } from "../utils/api-helper.js";
import { getDataSavedInStorage } from "../services/dataSavedService.js";
import {
  clearAndCreateSchedulerAlarm,
  clearSchedulerAuto,
  getIsSpecialFrameHoursInStore,
  getSchedulerService,
} from "../services/scheduler-service.js";
import { shuffleTimes } from "./scheduler.js";
import { initHistoryLogs } from "../draw_element/panel-log.js";
import { handleShowOrHideElementPremium } from "./premium.js";
import {
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
  setAllGroupPostedsInStorage,
} from "../services/groupService.js";
import {
  getIsCommentWhenPostSuccessService,
  getListCommentWhenPostSuccessService,
} from "../services/comment-service.js";

async function initialData({ anchorElement = document.body }) {
  try {
    async function initialSettings() {
      const {
        setMaxGroupPerTime,
        setIsTest,
        setIsProcessing,
        setScheduler: setSchedulerSetting,
        setIsFixStealFocus,
        setStrictlyMatchTitleGroup,
        setIsShuffleSchedulerTime,
        setIsSpammed,
        setIsFixStealAllFocus,
        setIsShuffleGroupsNeedPost,
        setIsRandomBatchPost,
        setIsRandomTimePost,
        setIsSpecialFrameHours,
      } = getAllFieldsSetting();

      //get max group
      let maxGroup = await getMaxGroupPerTimeInStorage();
      if (!maxGroup) {
        maxGroup = MAX_GROUP_PER_TIME_INITIAL;
        setMaxGroupPerTimeInStorage(maxGroup);
      }

      setMaxGroupPerTime(maxGroup);

      const isTesting = await getIsTestInStorage();
      setIsTest(isTesting);

      const isProcessing = await getProgress();
      if (!isProcessing) {
        disabledElement({
          selector: "#tm_checkbox-is-processing",
          fieldSelector: ".tm_field-container",
          isCheckbox: true,
          isField: true,
        });
      } else {
        enabledElement({
          selector: "#tm_checkbox-is-processing",
          fieldSelector: ".tm_field-container",
          isField: true,
        });
      }
      setIsProcessing(isProcessing);

      const isFixStealFocus = await getIsStealFocusInStorage();
      setIsFixStealFocus(isFixStealFocus);

      const isFixStealAllFocus = await getIsFixStealAllFocusInStorage();
      setIsFixStealAllFocus(isFixStealAllFocus);

      const isSpammed = await getIsSpammedInStorage();
      setIsSpammed(isSpammed);

      const isShuffleSchedulerTime = await getIsShuffleSchedulerTimeInStorage();
      setIsShuffleSchedulerTime(isShuffleSchedulerTime);

      const isShuffleGroupsNeedPost = await getIsShuffleGroupNeedPost();
      setIsShuffleGroupsNeedPost(isShuffleGroupsNeedPost);

      const isRandomTimePost = await getIsRandomTimePost();
      setIsRandomTimePost(isRandomTimePost);

      const isSpecialFrameHours = await getIsSpecialFrameHoursInStore();
      setIsSpecialFrameHours(isSpecialFrameHours);

      const scheduler = await getSchedulerService();

      if (scheduler) {
        const isCheduler = scheduler.isScheduler || false;
        if (isCheduler) {
          setSchedulerSetting(isCheduler);
          clearAndCreateSchedulerAlarm();
        } else {
          clearSchedulerAuto();
        }

        //shuffle time
        if (getIsDashboardTab(location.href) && isShuffleSchedulerTime) {
          shuffleTimes();
        }
      }

      const strictlyMatchTitleGroup =
        await getStrictlyMatchTitleGroupInStorage();
      if (strictlyMatchTitleGroup) {
        setStrictlyMatchTitleGroup(strictlyMatchTitleGroup);
      }

      const isRandomBatchPost = await getIsRandomBatchPost();
      setIsRandomBatchPost(isRandomBatchPost);

      const {
        setIsCommentWhenPostSuccess,
        setKeyWordsComment,
        setIsInteractBeforePost,
      } = getAllFieldsAdvancedSetting();

      const isCommentWhenPostSuccess =
        await getIsCommentWhenPostSuccessService();
      setIsCommentWhenPostSuccess(isCommentWhenPostSuccess);
      const listComment = await getListCommentWhenPostSuccessService();
      setKeyWordsComment(listComment.join("\n"));

      const isInteractBeforePost = await getIsInteractBeforePostInStorage();
      setIsInteractBeforePost(isInteractBeforePost);
    }

    await initialSettings();

    const listGroups = await getListGroupsNeedPostInStorage();
    logActions("Initial list groups need post: ", listGroups);
    const dataSaved = (await getDataSavedInStorage()) || [];
    logActions("Initial data saved: ", dataSaved);

    //initial indexs checked
    const listGroupsContainer = anchorElement.querySelector(
      "#tm_list-groups-container",
    );
    if (listGroupsContainer) {
      const firstChild = listGroupsContainer.firstElementChild;
      if (firstChild) {
        const childs = firstChild.children || [];
        const indexsCheckeds = await getIndexsGroupChecked();
        logActions("Initial indexs checked: ", indexsCheckeds);
        for (const child of childs) {
          const id = child.getAttribute("data-group-id");
          if (id && indexsCheckeds.includes(id)) {
            const input = child.querySelector("input[type=checkbox]");
            if (input) {
              input.checked = true;
            }
          }
        }
      }
    }

    async function initialInputTimeDelay() {
      const timeDelay = await getTimeDelayInStorage();

      const inputClickToPost = anchorElement.querySelector(
        `#tm_input-delay-click-to-post`,
      );
      const inputFillContent = anchorElement.querySelector(
        `#tm_input-delay-fill-content`,
      );
      const inputFillFile = anchorElement.querySelector(
        `#tm_input-delay-fill-file`,
      );
      const inputOpenNewTab = anchorElement.querySelector(
        `#tm_input-delay-open-new-tab`,
      );
      const inputDelayPost =
        anchorElement.querySelector(`#tm_input-delay-post`);
      if (inputClickToPost) {
        inputClickToPost.value =
          timeDelay.clickToPost || initialTimeDelay.clickToPost;
      }
      if (inputFillContent) {
        inputFillContent.value =
          timeDelay.fillContent || initialTimeDelay.fillContent;
      }
      if (inputFillFile) {
        inputFillFile.value = timeDelay.fillFile || initialTimeDelay.fillFile;
      }
      if (inputDelayPost) {
        inputDelayPost.value = timeDelay.post || initialTimeDelay.post;
      }
      if (inputOpenNewTab) {
        inputOpenNewTab.value =
          timeDelay.openNewTab || initialTimeDelay.openNewTab;
      }
    }

    await initialInputTimeDelay();

    const selectLanguage = document.querySelector(`#tm_select-language`);
    const lang = await getLanguageInStorage();
    if (selectLanguage) {
      selectLanguage.value = lang.toLowerCase();
    }

    //...
    const gp = await getAllGroupPostedsInStorage();
    if (!gp) {
      await setAllGroupPostedsInStorage([]);
    }

    const isDevMode = await getIsDeveloperModeInStorage();
    if (isDevMode) {
      showElement("#tm_btn-test-auto");
      showField({
        selector: "#tm_checkbox-is-test",
        fieldSelector: ".tm_field-container",
      });
      showElement("#tm_btn-click");
      showField({
        selector: "#tm_checkbox-is-spammed",
        fieldSelector: ".tm_field-container",
      });
    } else {
      hideElement("#tm_btn-test-auto");
      hideField({
        selector: "#tm_checkbox-is-test",
        fieldSelector: ".tm_field-container",
      });
      hideElement("#tm_btn-click");
      hideField({
        selector: "#tm_checkbox-is-spammed",
        fieldSelector: ".tm_field-container",
      });
    }

    const isPremium = await getPremiumInStorage();
    handleShowOrHideElementPremium(isPremium);

    await updateDataSavedInfo();
    await initHistoryLogs();
  } catch (error) {
    logError("Error initialData: " + error);
  }
}

async function initialFastAndFirst() {
  try {
    const isDarkTheme = (await DB_getValue(KEY_IS_DARK_THEME)) || false;
    const body = document.querySelector(`body`);
    if (isDarkTheme) {
      body?.classList?.add("dark");
      body?.classList?.remove("light");
    } else {
      body?.classList?.remove("dark");
      body?.classList?.add("light");
    }
    const svgs = document.querySelectorAll(".tm_svg");
    svgs.forEach((svg) => {
      svg.setAttribute("fill", isDarkTheme ? "white" : "black");
    });
  } catch (error) {
    logError("Error initialFastAndFirst: " + error);
  }
}

export { initialData, initialFastAndFirst };
