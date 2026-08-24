import {
  DEFAULT_COMMENT_WALK_SETTING,
  initialTimeDelay,
  KEY_COMMENT_WALK,
  KEY_DEFAULT_VALUE,
  KEY_IS_DARK_THEME,
  KEY_IS_IN_PROGRESS,
} from "../../../contants/contants.js";
import {
  disabledElementProgress,
  enabledElementProgress,
  getAllFieldsAdvancedSetting,
  getAllFieldsSetting,
  hideElement,
  hideField,
  showElement,
  showField,
} from "../../../helpers/elementDom.js";
import { handleShowOrHideElementPremium } from "../../../helpers/premium.js";
import { shuffleTimes } from "../../../helpers/scheduler.js";
import {
  getAuthFromStorage,
  getPremiumService,
  getProfile,
} from "../../../services/auth-service.js";
import {
  getListCommentWhenPostSuccessService,
  getMaxCommentPerTimeService,
  setMaxCommentPerTimeService,
} from "../../../services/comment-service.js";
import { commentWalkService } from "../../../services/comment-walk-service.js";
import { getListDataGroupPost } from "../../../services/data-group-post-service.js";
import {
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
  setAllGroupPostedsInStorage,
} from "../../../services/groupService.js";
import {
  getMaxPostInteractService,
  setMaxPostInteractService,
} from "../../../services/interact-before-post-service.js";
import {
  clearAndCreateSchedulerAlarm,
  clearSchedulerAuto,
  initialSchedulerSetting,
} from "../../../services/scheduler-service.js";
import {
  getContentQueryExcludesCommonData,
  getContentQueryIncludesCommonData,
  getIsCommentWalkData,
  getIsCommentWhenPostSuccessData,
  getIsExecutePriorityTaskData,
  getIsFixStealAllFocusData,
  getIsFixStealFocusData,
  getIsInteractBeforePostData,
  getIsRandomBreakBatchData,
  getIsRandomTimePostData,
  getIsSchedulerData,
  getIsShuffleGroupNeedPostData,
  getIsSpammedData,
  getIsSpecialFrameHoursData,
  getIsStopTaskData,
  getMatchRateValueContentQueryIncludesCommonData,
  getMaxCommentWalkPerBatchData,
  getMaxGroupPerTimeData,
  getPriorityTaskData,
  getStrictlyMatchTitleGroupData,
  getTimeBreakWhenSpammedData,
  getTimeDelayCommentWalk,
  getTimeDelayData,
  initialDeviceSetting,
  setContentQueryExcludesCommonData,
  setContentQueryIncludesCommonData,
  setMatchRateValueContentQueryIncludesCommonData,
  setTimeBreakWhenSpammedData,
} from "../../../services/setting-service.js";
import { setIsUseLocalStorage } from "../../../services/storage-global-service.js";
import {
  getIsDeveloperModeInStorage,
  getIsShuffleSchedulerTimeInStorage,
  getIsTestInStorage,
  getLanguageInStorage,
  getProgress,
} from "../../../services/storage-service.js";
import { DB_getValue } from "../../../utils/api-helper.js";
import { handleErrorHelper } from "../../../utils/exception.js";
import {
  getIsDashboardTab,
  logActions,
  logError,
} from "../../../utils/utils.js";
import { updateDataSavedInfo } from "../draw_element/dataSavedInfo.js";
import { initHistoryLogs } from "../draw_element/panel-log.js";
import { updateAuthUI } from "./header.js";

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
        setIsCommentWalkProcessing,
        setIsCommentWalk,
        setMaxCommentWalkPerBatch,
        setTimeBreakWhenSpammed,
        setContentQueryIncludesCommon,
        setContentQueryExcludesCommon,
        setMatchRateValueContentQueryIncludesCommon,
        setStatusTool,
        setPriorityTaskCommentWalk,
        setPriorityTaskPost,
        setIsExecutePriorityTask,
      } = getAllFieldsSetting();

      //get max group
      try {
        let maxGroup = await getMaxGroupPerTimeData();
        setMaxGroupPerTime(maxGroup);
      } catch (error) {
        logError("Error when get or set max group per time", error);
      }

      const priorityTask = await getPriorityTaskData();
      setPriorityTaskCommentWalk(priorityTask.priority_task_comment_walk);
      setPriorityTaskPost(priorityTask.priority_task_post);

      const isExecutePriorityTask = await getIsExecutePriorityTaskData();
      setIsExecutePriorityTask(isExecutePriorityTask);

      const isTesting = await getIsTestInStorage();
      setIsTest(isTesting);

      const isProcessing = await getProgress();
      if (isProcessing) {
        disabledElementProgress(KEY_IS_IN_PROGRESS);
      } else {
        enabledElementProgress(KEY_IS_IN_PROGRESS);
      }
      setIsProcessing(isProcessing);

      const isProgressCommentWalk =
        await commentWalkService.getIsCommentWalkProcessing();
      if (isProgressCommentWalk) {
        disabledElementProgress(KEY_COMMENT_WALK.IS_COMMENT_WALK_PROCESSING);
      } else {
        enabledElementProgress(KEY_COMMENT_WALK.IS_COMMENT_WALK_PROCESSING);
      }
      setIsCommentWalkProcessing(isProgressCommentWalk);

      const isFixStealFocus = await getIsFixStealFocusData();
      setIsFixStealFocus(isFixStealFocus);

      const isFixStealAllFocus = await getIsFixStealAllFocusData();
      setIsFixStealAllFocus(isFixStealAllFocus);

      const isSpammed = await getIsSpammedData();
      setIsSpammed(isSpammed);

      const isShuffleSchedulerTime = await getIsShuffleSchedulerTimeInStorage();
      setIsShuffleSchedulerTime(isShuffleSchedulerTime);

      const isShuffleGroupsNeedPost = await getIsShuffleGroupNeedPostData();
      setIsShuffleGroupsNeedPost(isShuffleGroupsNeedPost);

      const isRandomTimePost = await getIsRandomTimePostData();
      setIsRandomTimePost(isRandomTimePost);

      const isSpecialFrameHours = await getIsSpecialFrameHoursData();
      setIsSpecialFrameHours(isSpecialFrameHours);

      const timeBreakWhenSpammed = await getTimeBreakWhenSpammedData();
      if (!timeBreakWhenSpammed) {
        await setTimeBreakWhenSpammedData(
          KEY_DEFAULT_VALUE.DEFAULT_TIME_BREAK_WHEN_SPAMMED,
        );
        setTimeBreakWhenSpammed(
          KEY_DEFAULT_VALUE.DEFAULT_TIME_BREAK_WHEN_SPAMMED,
        );
      } else {
        setTimeBreakWhenSpammed(timeBreakWhenSpammed);
      }

      const contentQueryIncludes = await getContentQueryIncludesCommonData();
      if (contentQueryIncludes) {
        setContentQueryIncludesCommon(contentQueryIncludes.join(", "));
      } else {
        await setContentQueryIncludesCommonData(
          KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_INCLUDES_COMMON,
        );
        setContentQueryIncludesCommon(
          KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_INCLUDES_COMMON.join(", "),
        );
      }

      const contentQueryExcludes = await getContentQueryExcludesCommonData();
      if (contentQueryExcludes) {
        setContentQueryExcludesCommon(contentQueryExcludes.join(", "));
      } else {
        await setContentQueryExcludesCommonData(
          KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_EXCLUDES_COMMON,
        );
        setContentQueryExcludesCommon(
          KEY_DEFAULT_VALUE.DEFAULT_CONTENT_QUERY_EXCLUDES_COMMON.join(", "),
        );
      }

      const matchRateValueContentQueryIncludesCommon =
        await getMatchRateValueContentQueryIncludesCommonData();
      if (matchRateValueContentQueryIncludesCommon) {
        setMatchRateValueContentQueryIncludesCommon(
          matchRateValueContentQueryIncludesCommon,
        );
      } else {
        await setMatchRateValueContentQueryIncludesCommonData(
          KEY_DEFAULT_VALUE.DEFAULT_MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON,
        );
        setMatchRateValueContentQueryIncludesCommon(
          KEY_DEFAULT_VALUE.DEFAULT_MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON,
        );
      }

      const isStopTask = await getIsStopTaskData();
      setStatusTool(!isStopTask);

      const isScheduler = await getIsSchedulerData();

      if (isScheduler) {
        setSchedulerSetting(isScheduler);
        clearAndCreateSchedulerAlarm();
      } else {
        clearSchedulerAuto();
      }

      //shuffle time
      if (getIsDashboardTab(location.href) && isShuffleSchedulerTime) {
        shuffleTimes();
      }

      const strictlyMatchTitleGroup = await getStrictlyMatchTitleGroupData();
      if (strictlyMatchTitleGroup && Array.isArray(strictlyMatchTitleGroup)) {
        setStrictlyMatchTitleGroup(strictlyMatchTitleGroup.join(", "));
      }

      const isRandomBatchPost = await getIsRandomBreakBatchData();
      setIsRandomBatchPost(isRandomBatchPost);

      const {
        setIsCommentWhenPostSuccess,
        setKeyWordsComment,
        setIsInteractBeforePost,
        setMaxCommentPerTime,
        setMaxPostInteract,
      } = getAllFieldsAdvancedSetting();

      const isCommentWhenPostSuccess = await getIsCommentWhenPostSuccessData();
      setIsCommentWhenPostSuccess(isCommentWhenPostSuccess);
      const listComment = await getListCommentWhenPostSuccessService();
      setKeyWordsComment(listComment.join("\n"));

      const isInteractBeforePost = await getIsInteractBeforePostData();
      setIsInteractBeforePost(isInteractBeforePost);

      let maxCommentPerTime = await getMaxCommentPerTimeService();
      if (!maxCommentPerTime) {
        maxCommentPerTime = 1;
        await setMaxCommentPerTimeService(maxCommentPerTime);
      }
      setMaxCommentPerTime(maxCommentPerTime);

      let maxPost = await getMaxPostInteractService();
      if (!maxPost) {
        maxPost = 1;
        await setMaxPostInteractService(maxPost);
      }
      setMaxPostInteract(maxPost);

      const maxCommentWalkPerBatch = await getMaxCommentWalkPerBatchData();
      setMaxCommentWalkPerBatch(maxCommentWalkPerBatch);

      const isCommentWalk = await getIsCommentWalkData();
      setIsCommentWalk(isCommentWalk);
    }

    await initialSettings();

    const listGroups = await getListGroupsNeedPostInStorage();
    logActions("Initial list groups need post: ", listGroups);
    const dataSaved = (await getListDataGroupPost()) || [];
    logActions("Initial data saved: ", dataSaved);

    async function initialInputTimeDelay() {
      const timeDelay = await getTimeDelayData();

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
          timeDelay.time_delay_click_to_post ||
          initialTimeDelay.time_delay_click_to_post;
      }
      if (inputFillContent) {
        inputFillContent.value =
          timeDelay.time_delay_fill_content ||
          initialTimeDelay.time_delay_fill_content;
      }
      if (inputFillFile) {
        inputFillFile.value =
          timeDelay.time_delay_fill_file ||
          initialTimeDelay.time_delay_fill_file;
      }
      if (inputDelayPost) {
        inputDelayPost.value =
          timeDelay.time_delay_post || initialTimeDelay.time_delay_post;
      }
      if (inputOpenNewTab) {
        inputOpenNewTab.value =
          timeDelay.time_delay_open_new_tab ||
          initialTimeDelay.time_delay_open_new_tab;
      }

      const timeDelayCommentWalk = await getTimeDelayCommentWalk();

      const inputTimeDelayFillContentCommentWalkMin =
        anchorElement.querySelector(
          `#tm_input-time-delay-fill-content-comment-walk-min`,
        );
      const inputTimeDelayFillContentCommentWalkMax =
        anchorElement.querySelector(
          `#tm_input-time-delay-fill-content-comment-walk-max`,
        );
      const inputTimeDelayFillFileCommentWalk = anchorElement.querySelector(
        `#tm_input-time-delay-fill-file-comment-walk`,
      );
      const inputTimeDelaySubmitCommentWalk = anchorElement.querySelector(
        `#tm_input-time-delay-submit-comment-walk`,
      );

      if (inputTimeDelayFillContentCommentWalkMin) {
        inputTimeDelayFillContentCommentWalkMin.value =
          timeDelayCommentWalk.time_delay_fill_content_comment_walk_min ||
          DEFAULT_COMMENT_WALK_SETTING.time_delay_fill_content_comment_walk_min;
      }
      if (inputTimeDelayFillContentCommentWalkMax) {
        inputTimeDelayFillContentCommentWalkMax.value =
          timeDelayCommentWalk.time_delay_fill_content_comment_walk_max ||
          DEFAULT_COMMENT_WALK_SETTING.time_delay_fill_content_comment_walk_max;
      }
      if (inputTimeDelayFillFileCommentWalk) {
        inputTimeDelayFillFileCommentWalk.value =
          timeDelayCommentWalk.time_delay_fill_file_comment_walk ||
          DEFAULT_COMMENT_WALK_SETTING.time_delay_fill_file_comment_walk;
      }
      if (inputTimeDelaySubmitCommentWalk) {
        inputTimeDelaySubmitCommentWalk.value =
          timeDelayCommentWalk.time_delay_submit_comment_walk ||
          DEFAULT_COMMENT_WALK_SETTING.time_delay_submit_comment_walk;
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
      showElement("#tm_btn-reset-all-data-saved");
      showElement("#tm_btn-test-auto");
      showField({
        selector: "#tm_checkbox-is-test",
        fieldSelector: ".tm_field-container",
      });
      showElement("#tm_btn-click");
      showElement("#tm_btn-click-2");
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
      hideElement("#tm_btn-click-2");
      hideField({
        selector: "#tm_checkbox-is-spammed",
        fieldSelector: ".tm_field-container",
      });
      hideElement("#tm_btn-reset-all-data-saved");
    }

    const isPremium = await getPremiumService();
    await handleShowOrHideElementPremium(isPremium);

    await updateDataSavedInfo();
    await initHistoryLogs();
  } catch (error) {
    logError("Error initialData: ", error);
  }
}

async function initialFastAndFirst() {
  try {
    try {
      let user = null;
      const auth = await getAuthFromStorage();
      console.log("auth", auth);
      if (auth) {
        user = await getProfile();
      } else {
        await setIsUseLocalStorage(true);
      }
      await updateAuthUI(user);
    } catch (error) {
      handleErrorHelper({
        name: "initialFastAndFirst",
        error,
        isShowNotify: false,
      });
    }

    await Promise.all([initialDeviceSetting(), initialSchedulerSetting()]);

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
    handleErrorHelper({ error, isShowNotify: false });
  }
}

export { initialData, initialFastAndFirst };
