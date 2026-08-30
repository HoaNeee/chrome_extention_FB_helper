import {
  KEY_IS_PREMIUM,
  KEY_TASK_NAME,
  prefix,
  SCHEDULER_TYPE,
} from "../../../contants/contants.js";
import { deviceHelper } from "../../../helpers/device-helper.js";
import {
  getTimeToPostOneGroup,
  getTotalGroupsNeedPost,
} from "../../../helpers/group.js";
import { getNextTimePost } from "../../../helpers/scheduler.js";
import { commentWalkService } from "../../../services/comment-walk-service.js";
import { getCurrentDataGroupPosting } from "../../../services/data-group-post-service.js";
import {
  getCurrentTaskName,
  getListTaskNameInactive,
} from "../../../services/device-service.js";
import {
  getAllDataGroupsInStorage,
  getAllGroupPostedsInStorage,
  getListGroupsNeedPostInStorage,
} from "../../../services/groupService.js";
import {
  getSchedulerDetail,
  getSchedulerService,
} from "../../../services/scheduler-service.js";
import {
  getIsCommentWalkData,
  getIsExecutePriorityTaskData,
  getIsFixStealAllFocusData,
  getIsFixStealFocusData,
  getIsRandomBreakBatchData,
  getIsRandomTimePostData,
  getIsSchedulerData,
  getIsShuffleGroupNeedPostData,
  getIsSpammedData,
  getIsSpecialFrameHoursData,
  getIsStopTaskData,
  getLastTimePostData,
  getMaxGroupPerTimeData,
} from "../../../services/setting-service.js";
import { getObjectIsInSpecialFrameHours } from "../../../services/special-frame-hours-service.js";
import {
  getCountBatchPost,
  getCountResetGroupInStorage,
  getCurrentCountPostLength,
  getIsDeveloperModeInStorage,
  getIsShuffleSchedulerTimeInStorage,
  getIsTestInStorage,
  getObjectTaskInStorage,
  getProgress,
} from "../../../services/storage-service.js";
import { DB_getValue } from "../../../utils/api-helper.js";
import { getTextWithLanguage, logError } from "../../../utils/utils.js";

function getStatusString(status) {
  switch (status) {
    case "pending":
      return getTextWithLanguage({ vi: "Đang chờ", en: "Pending" });
    case "selecting":
      return getTextWithLanguage({ vi: "Đang chọn", en: "Selecting" });
    case "posting":
      return getTextWithLanguage({ vi: "Đang đăng", en: "Posting" });
    case "done":
      return getTextWithLanguage({ vi: "Đã đăng", en: "Done" });
    case "error":
      return getTextWithLanguage({ vi: "Lỗi", en: "Error" });
    default:
      return status;
  }
}

function enabledString(val) {
  return val
    ? `<b>${getTextWithLanguage({ vi: "Đang bật", en: "Enabled" })}</b>`
    : `<b>${getTextWithLanguage({ vi: "Đang tắt", en: "Disabled" })}</b>`;
}

function colorByDisabled(val) {
  return val ? "var(--tm-text-success)" : "var(--tm-text-danger)";
}

function colorByStatus(status) {
  switch (status) {
    case "pending":
      return "orange";
    case "selecting":
      return "blue";
    case "posting":
      return "purple";
    case "done":
      return "var(--tm-text-success)";
    case "error":
      return "var(--tm-text-danger)";
    default:
      return "var(--tm-text-primary)";
  }
}

function getDataSavedHTML({
  allGroups = [],
  groupsNeedPost = [],
  groupsPosted = [],
  lengthPostedInCurrentTime = 0,
  isTesting = false,
  isProcessing = false,
  isScheduler = false,
  currentGroup = {},
  lastTimePost = 0,
  currentGroupNeedPost = {
    id: "",
    groups: [],
    title: "",
  },
  nextTimePost = 0,
  isDeveloperMode = false,
  maxGroupPerTime = 0,
  countResetGroups = 0,
  estimatedTotalTime = null,
  isFixStealFocus = false,
  isShuffleTime = false,
  isSpammed = false,
  countBatch = 0,
  isShuffleGroupsNeedPost = false,
  isRandomBatchPost = false,
  isPremium = false,
  isRandomTimePost,
  isSpecialFrameHours = false,
  maxGroupPerTimeInSpecialFrameHour = 0,
  isCommentWalk = false,
  isCommentWalkProcessing = false,
  lastTimeCommentWalk = 0,
  lengthCommented = 0,
  maxCommentWalk = 0,
  countCommentWalk = 0,
  isStopTask,
  currentTaskName = "",
}) {
  const set = new Set();
  groupsNeedPost.forEach((item) => {
    for (const it of item.groups) {
      set.add(it.id_href);
    }
  });

  let totalGroupsNeedPost = set.size;

  const postedsSet = new Set(groupsPosted);

  const totalCurrentGroupsPosted =
    currentGroupNeedPost?.groups?.filter((group) => {
      return postedsSet.has(group.id_href || group.href || group.id);
    })?.length || 0;

  const nextTime = new Date(nextTimePost);

  let estimatedTotalTimeText = getTextWithLanguage({
    vi: "Đang tính toán...",
    en: "Calculating...",
  });

  if (estimatedTotalTime && estimatedTotalTime >= 0) {
    estimatedTotalTime = Math.ceil(estimatedTotalTime / 60);
    const minutes = estimatedTotalTime % 60;
    const hours = Math.floor(estimatedTotalTime / 60);
    estimatedTotalTimeText = getTextWithLanguage({
      vi: `${hours} giờ ${minutes} phút`,
      en: `${hours} hours ${minutes} minutes`,
    });
  }

  const forDevHtml = isDeveloperMode
    ? `
    <div id="${prefix}is-testing-status">${getTextWithLanguage({ vi: "Đang kiểm thử", en: "Is Testing" })}: <span style="color: ${colorByDisabled(isTesting)};">${enabledString(isTesting)}</span></div>
          <div id="${prefix}is-developer-mode-status">${getTextWithLanguage({ vi: "Chế độ nhà phát triển", en: "Developer Mode" })}: <span style="color: ${colorByDisabled(isDeveloperMode)};">${enabledString(isDeveloperMode)}</span></div>
  `
    : "";

  const groupsHtml = `
      ${isPremium ? `<div>${getTextWithLanguage({ vi: "Trạng thái tiện ích", en: "Extension status" })}: <span style="color: ${colorByDisabled(!isStopTask)};">${enabledString(!isStopTask)}</span></div>` : ``}
      ${isPremium ? `<div>${getTextWithLanguage({ vi: "Công việc hiện tại", en: "Current job" })}: <span>${deviceHelper.getTaskLabelWithName(currentTaskName)}</span></div>` : ``}
      <div>${getTextWithLanguage({ vi: "Tổng số nhóm", en: "Total Groups" })}: <b>${allGroups.length}</b></div>
      <div>${getTextWithLanguage({ vi: "Số nhóm cần đăng", en: "Total Groups Need Post" })}: <b>${totalGroupsNeedPost}</b></div>
      <div>${getTextWithLanguage({ vi: "Số nhóm đã đăng", en: "Total Groups Posted" })}: <b>${groupsPosted.length}</b></div>
      <div>${getTextWithLanguage({ vi: "Hiện tại đang đăng", en: "Total Current Groups Posted" })}: <b>${lengthPostedInCurrentTime}/${maxGroupPerTime}</b></div>
      ${isPremium ? `<div>${getTextWithLanguage({ vi: "Đang đăng trong khung giờ đặc biệt", en: "Total Current Groups Posted In Special Frame Hour" })}: <b>${lengthPostedInCurrentTime}/${maxGroupPerTimeInSpecialFrameHour}</b>  ${!isSpecialFrameHours ? `(${getTextWithLanguage({ vi: "Đang tắt", en: "Off" })})` : ""} </div>` : ""}
      <div>${getTextWithLanguage({ vi: "Nhóm hiện tại cần đăng", en: "Total Current Need Post" })}: <b>${currentGroupNeedPost?.groups?.length || 0}</b></div>
      <div>${getTextWithLanguage({ vi: "Nhóm hiện tại đã đăng", en: "Total Current Groups Posted" })}: <b>${totalCurrentGroupsPosted}</b></div>
      <div>${getTextWithLanguage({ vi: "Số lần đặt lại nhóm", en: "Count Reset Groups" })}: <b>${countResetGroups}</b></div>
      ${isPremium ? `<div>${getTextWithLanguage({ vi: "Đợt đăng hiện tại", en: "Current Batch" })}: <b>${countBatch}</b></div>` : ""}
      <div>${getTextWithLanguage({ vi: "Tên nhóm hiện tại", en: "Current Group title" })}: ${currentGroupNeedPost?.name || currentGroupNeedPost?.title || "N/A"}</div>
  `;

  const statusHtml = `
      ${isPremium ? `<div id="${prefix}is-premium-status">${getTextWithLanguage({ vi: "Gói Premium", en: "Is Premium" })}: <span style="color: ${!isPremium ? "var(--tm-text-danger)" : "var(--tm-text-success)"};"><b>${getTextWithLanguage({ vi: isPremium ? "Có" : "Không", en: isPremium ? "Yes" : "No" })}</b></span></div>` : ""}
      <div id="${prefix}is-spammed-status">${getTextWithLanguage({ vi: "Đang bị spam", en: "Is Spammed" })}: <span style="color: ${isSpammed ? "var(--tm-text-danger)" : "var(--tm-text-success)"};"><b>${getTextWithLanguage({ vi: isSpammed ? "Có" : "Không", en: isSpammed ? "Yes" : "No" })}</b></span></div>
      <div id="${prefix}is-processing-status">${getTextWithLanguage({ vi: "Đang chạy auto", en: "Is Processing" })}: <span style="color: ${colorByDisabled(isProcessing)};">${enabledString(isProcessing)}</span></div>
      <div id="${prefix}is-scheduler-status">${getTextWithLanguage({ vi: "Đang lên lịch", en: "Is Scheduler" })}: <span style="color: ${colorByDisabled(isScheduler)};">${enabledString(isScheduler)}</span></div>
      <div id="${prefix}is-fix-steal-focus-status">${getTextWithLanguage({ vi: "Tránh nhảy tab", en: "Is Fix Steal Focus" })}: <span style="color: ${colorByDisabled(isFixStealFocus)};">${enabledString(isFixStealFocus)}</span></div>
      <div id="${prefix}is-shuffle-groups-need-post-status">${getTextWithLanguage({ vi: "Trộn nhóm cần đăng", en: "Is Shuffle Groups Need Post" })}: <span style="color: ${colorByDisabled(isShuffleGroupsNeedPost)};">${enabledString(isShuffleGroupsNeedPost)}</span></div>
      ${isPremium ? `<div id="${prefix}is-shuffle-time-status">${getTextWithLanguage({ vi: "Trộn lịch đăng", en: "Is Shuffle Time" })}: <span style="color: ${colorByDisabled(isShuffleTime)};">${enabledString(isShuffleTime)}</span></div>` : ""}
      ${isPremium ? `<div id="${prefix}is-random-batch-post-status">${getTextWithLanguage({ vi: "Đợt đăng bài ngẫu nhiên", en: "Is Random Batch Post" })}: <span style="color: ${colorByDisabled(isRandomBatchPost)};">${enabledString(isRandomBatchPost)}</span></div>` : ""}
      ${isPremium ? `<div id="${prefix}is-random-time-post-status">${getTextWithLanguage({ vi: "Ngẫu nhiên thời gian đăng", en: "Random time post" })}: <span style="color: ${colorByDisabled(isRandomTimePost)};">${enabledString(isRandomTimePost)}</span></div>` : ""}
      ${isPremium ? `<div id="${prefix}is-special-frame-hours">${getTextWithLanguage({ vi: "Khung giờ đặc biệt", en: "Special Frame Hours" })}: <span style="color: ${colorByDisabled(isSpecialFrameHours)};">${enabledString(isSpecialFrameHours)}</span></div>` : ""}
      ${isCommentWalk ? `<div id="${prefix}is-comment-walk-status">${getTextWithLanguage({ vi: "Bình luận dạo", en: "Is Comment Walk" })}: <span style="color: ${colorByDisabled(isCommentWalk)};">${enabledString(isCommentWalk)}</span></div>` : ""}
      ${isCommentWalkProcessing ? `<div id="${prefix}is-comment-walk-processing-status">${getTextWithLanguage({ vi: "Đang bình luận dạo", en: "Is Comment Walk Processing" })}: <span style="color: ${colorByDisabled(isCommentWalkProcessing)};">${enabledString(isCommentWalkProcessing)}</span></div>` : ""}
      ${forDevHtml}
  `;

  const groupInfoHtml = `
      <div style="word-break: break-word;">${getTextWithLanguage({ vi: "Nhóm hiện tại", en: "Current Group" })}: ${currentGroup?.id_href || getTextWithLanguage({ en: "Available", vi: "Không có sẵn" })}</div>
      <div>${getTextWithLanguage({ vi: "Trạng thái nhóm hiện tại", en: "Current Group status" })}: <span style="color: ${colorByStatus(currentGroup?.status)};"> <b>${getStatusString(currentGroup?.status || getTextWithLanguage({ en: "Available", vi: "Không có sẵn" }))}</b></span></div>
      <div>${getTextWithLanguage({ vi: "Bài đăng gần nhất", en: "Last time post" })}: ${lastTimePost ? new Date(lastTimePost).toLocaleString() : "N/A"}</div>
      <div>${getTextWithLanguage({ vi: "Thời gian đăng tiếp theo", en: "Next time post" })}: ${nextTimePost ? `${nextTime.getHours()}:${nextTime.getMinutes()} ${isScheduler ? (isSpammed ? `(${nextTime.toLocaleDateString()})` : `(${getTextWithLanguage({ vi: "Độ trễ vài đơn vị", en: "Several units of delay" })})`) : getTextWithLanguage({ vi: "(Lên lịch đang tắt)", en: "(Scheduler is off)" })}` : "N/A"}</div>
      <div>${getTextWithLanguage({
        vi: "Thời gian dự kiến đăng tất cả nhóm",
        en: "Estimated time to post all groups",
      })}: <b>${estimatedTotalTimeText}</b></div>  
  `;

  const commentWalkHtml = `
      <div>${getTextWithLanguage({ vi: "Số bình luận đã bình luận", en: "Total Comment Walk Posted" })}: <b>${lengthCommented}</b></div>
      <div>${getTextWithLanguage({ vi: "Số bình luận tối đa trong 1 lần", en: "Total Comment Walk Max Per Time" })}: <b>${maxCommentWalk}</b></div>
      <div>${getTextWithLanguage({ vi: "Thời gian bình luận gần nhất", en: "Last time comment walk" })}: ${lastTimeCommentWalk ? new Date(lastTimeCommentWalk).toLocaleString() : "N/A"}</div>
      <div>${getTextWithLanguage({ vi: "Số bình luận trong lần hiện tại", en: "Total Comment Walk This Time" })}: <b>${countCommentWalk}/${maxCommentWalk}</b></div>
  `;

  return `
        <div style="margin-top: 16px; font-size: 13px; width: 100%; display: flex; flex-direction: column; gap: 4px">
          ${groupsHtml}
          ${statusHtml}
          ${groupInfoHtml}
          ${isPremium ? commentWalkHtml : ""}
        </div>
      `;
}

function getDataSavedAtDashboardHTML({
  allGroups = [],
  groupsNeedPost = [],
  groupsPosted = [],
  isScheduler = false,
  lastTimePost = 0,
  nextTimePost = 0,
  maxGroupPerTime = 0,
  isSpammed = false,
  isProcessing = false,
  lengthPostedInCurrentTime = 0,
  lengthCommented = 0,
  isCommentWalk = false,
  isCommentWalkProcessing = false,
  countCommentWalk = 0,
  maxCommentWalk = 0,
  lastTimeCommentWalk = 0,
  isStopTask,
  isPremium,
  currentTaskName = "",
  listTaskInactive = [],
  isPriorityTask = false,
} = {}) {
  const set = new Set();
  groupsNeedPost.forEach((item) => {
    for (const it of item.groups) {
      set.add(it.id_href);
    }
  });

  let totalGroupsNeedPost = set.size;

  const nextTime = new Date(nextTimePost);

  function getLengthJob() {
    if (!isPremium) return lengthPostedInCurrentTime || 0;
    if (!isPriorityTask) {
      if (isCommentWalk) {
        return countCommentWalk;
      } else {
        return lengthPostedInCurrentTime;
      }
    }
    switch (currentTaskName) {
      case KEY_TASK_NAME.POST:
        return lengthPostedInCurrentTime;
      case KEY_TASK_NAME.COMMENT_WALK:
        return countCommentWalk;
      default:
        return 0;
    }
  }

  function getMaxJob() {
    if (!isPremium) return maxGroupPerTime;
    if (!isPriorityTask) {
      if (isCommentWalk) {
        return maxCommentWalk;
      } else {
        return maxGroupPerTime;
      }
    }
    switch (currentTaskName) {
      case KEY_TASK_NAME.POST:
        return maxGroupPerTime;
      case KEY_TASK_NAME.COMMENT_WALK:
        return maxCommentWalk;
      default:
        return 0;
    }
  }

  function getLastTimeJobDone() {
    if (!isPremium) return lastTimePost;
    if (!isPriorityTask) {
      if (isCommentWalk) {
        return lastTimeCommentWalk;
      } else {
        return lastTimePost;
      }
    }
    switch (currentTaskName) {
      case KEY_TASK_NAME.POST:
        return lastTimePost;
      case KEY_TASK_NAME.COMMENT_WALK:
        return lastTimeCommentWalk;
      default:
        return 0;
    }
  }

  function getTypeJob() {
    if (!isPremium)
      return deviceHelper.getTaskLabelWithName(KEY_TASK_NAME.POST);
    if (!isPriorityTask) {
      if (isCommentWalk) {
        return deviceHelper.getTaskLabelWithName(KEY_TASK_NAME.COMMENT_WALK);
      } else {
        return deviceHelper.getTaskLabelWithName(KEY_TASK_NAME.POST);
      }
    }
    switch (currentTaskName) {
      case KEY_TASK_NAME.POST:
        return deviceHelper.getTaskLabelWithName(KEY_TASK_NAME.POST);
      case KEY_TASK_NAME.COMMENT_WALK:
        return deviceHelper.getTaskLabelWithName(KEY_TASK_NAME.COMMENT_WALK);
      default:
        return "";
    }
  }

  const lengthJob = getLengthJob();
  const maxJob = getMaxJob();
  const lastTimeJobDone = getLastTimeJobDone();
  const typeJob = getTypeJob();

  const listTaskNameInactiveString = listTaskInactive
    .map((taskName) => deviceHelper.getTaskLabelWithName(taskName))
    .join(", ");

  const taskInactive = !isPremium
    ? `<div id="${prefix}is-spammed-status">${getTextWithLanguage({ vi: "Đang bị spam", en: "Is Spammed" })}: <span style="color: ${isSpammed ? "var(--tm-text-danger)" : "var(--tm-text-success)"};"><b>${getTextWithLanguage({ vi: isSpammed ? "Có" : "Không", en: isSpammed ? "Yes" : "No" })}</b></span></div>`
    : `<div>${getTextWithLanguage({ vi: "Công việc không hoạt động", en: "Inactive task" })}: ${listTaskInactive.length > 0 ? listTaskNameInactiveString : getTextWithLanguage({ vi: "Không", en: "No" })}</div>`;

  return `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; width: 100%;">
      <div>
        <div>${getTextWithLanguage({ vi: "Trạng thái tiện ích", en: "Extension status" })}: <span style="color: ${colorByDisabled(!isStopTask)};">${enabledString(!isStopTask)}</span></div>
        <div>${getTextWithLanguage({ vi: "Tổng số nhóm", en: "Total Groups" })}: <b>${allGroups.length}</b></div>
        <div>${getTextWithLanguage({ vi: "Số nhóm cần đăng", en: "Number of groups to post" })}: <b>${totalGroupsNeedPost}</b></div>
        <div>${getTextWithLanguage({ vi: "Số nhóm đã đăng", en: "Number of groups posted" })}: <b>${groupsPosted.length}</b></div>
        ${isPremium ? `<div>${getTextWithLanguage({ vi: "Số bài viết đã bình luận dạo", en: "Number of posts commented walk" })}: <b>${lengthCommented}</b></div>` : ""}
      </div>
      <div>
        ${taskInactive}
        <div>${getTextWithLanguage({ vi: "Đang chạy auto", en: "Is Processing" })}: <span style="color: ${colorByDisabled(isProcessing || isCommentWalkProcessing)};">${enabledString(isProcessing || isCommentWalkProcessing)}</span></div>
        ${isPremium ? `<div>${getTextWithLanguage({ vi: "Bình luận dạo", en: "Is Comment Walk" })}: <span style="color: ${colorByDisabled(isCommentWalk)};">${enabledString(isCommentWalk)}</span></div>` : ""}
        <div>${getTextWithLanguage({ vi: "Lên lịch", en: "Is Scheduler" })}: <span style="color: ${colorByDisabled(isScheduler)};">${enabledString(isScheduler)}</span></div>
      </div>
      <div>
        <div>${getTextWithLanguage({ vi: "Kiểu công việc", en: "Job Type" })}: <b>${typeJob}</b></div>
        <div>${getTextWithLanguage({ vi: "Công việc đã làm hiện tại", en: "Current job done" })}: <b>${lengthJob}/${maxJob}</b></div>
        <div>${getTextWithLanguage({ vi: "Thời gian gần nhất thực hiện", en: "Last time job done" })}: ${lastTimeJobDone ? new Date(lastTimeJobDone).toLocaleString() : "N/A"}</div>
        <div>${getTextWithLanguage({ vi: "Thời gian tiếp theo thực hiện", en: "Next time job done" })}: ${isScheduler ? `${nextTime.getHours()}:${nextTime.getMinutes()}` : "N/A"}</div>
      </div>
    </div>
  `;
}

async function updateDataSavedInfo() {
  try {
    const rootElement = document.querySelector("#tm_root");

    if (!rootElement) return;

    const dataSavedEl = rootElement.querySelector("#tm_data-saved-info");
    const dataSavedAtDashboard = rootElement.querySelector(
      "#tm_data-saved-info-at-dashboard",
    );

    const { groups: groupsNeedPost } = await getListGroupsNeedPostInStorage();

    const isScheduler = await getIsSchedulerData();
    const allGroups = await getAllDataGroupsInStorage();
    const groupsPosted = await getAllGroupPostedsInStorage();
    const isTesting = await getIsTestInStorage();
    const isProcessing = await getProgress();
    const currentGroupNeedPost = await getCurrentDataGroupPosting();
    const maxGroupPerTime = await getMaxGroupPerTimeData();
    const isFixStealFocus =
      (await getIsFixStealFocusData()) ||
      (await getIsFixStealAllFocusData()) ||
      false;

    const length = await getCurrentCountPostLength();
    const objectTask = await getObjectTaskInStorage();
    const lastTimePost = await getLastTimePostData();
    const isShuffleTime = await getIsShuffleSchedulerTimeInStorage();
    const isCommentWalk = await getIsCommentWalkData();
    const isCommentWalkProcessing =
      await commentWalkService.getIsCommentWalkProcessing();
    const countCommentWalk =
      await commentWalkService.getCountCommentWalkPostedPerBatch();
    const maxCommentWalk = await commentWalkService.getMaxCommentWalkPerBatch();
    const lastTimeCommentWalk =
      await commentWalkService.getLastTimeCommentWalkSuccess();

    const listCommented = await commentWalkService.getListUrlCommented();

    const lengthCommented = listCommented.reduce((acc, item) => {
      return acc + item.urls.length;
    }, 0);

    const listTaskInactive = await getListTaskNameInactive();

    const isStopTask = await getIsStopTaskData();

    const currentTaskName = await getCurrentTaskName();

    let nextTime = await getNextTimePost();

    async function getSpaceTimePost() {
      const scheduler = await getSchedulerService();
      const type = scheduler.scheduler_type;
      const schedulerDetail = await getSchedulerDetail(type);
      const time = schedulerDetail?.scheduler_time_value || 0;
      if (
        type === SCHEDULER_TYPE.CUSTOM_DAILY_HOURS ||
        type === SCHEDULER_TYPE.EVERY_HOURS ||
        type === SCHEDULER_TYPE.DAILY_HOURS
      ) {
        return time * 60 * 60;
      } else if (
        type === SCHEDULER_TYPE.CUSTOM_DAILY_MINUTES ||
        type === SCHEDULER_TYPE.EVERY_MINUTES
      ) {
        return time * 60;
      }
      return null;
    }

    //calulate time estimated total time post
    const timeToPostOneGroup = await getTimeToPostOneGroup();
    const timeSpacePost = await getSpaceTimePost();

    let estimatedTotalTime = null;

    if (timeSpacePost !== undefined && timeSpacePost !== null) {
      const totalGroupNeedPost = await getTotalGroupsNeedPost();

      estimatedTotalTime =
        totalGroupNeedPost * timeToPostOneGroup +
        ((totalGroupNeedPost - groupsPosted.length) / maxGroupPerTime) *
          timeSpacePost;
    }

    const isDeveloperMode = await getIsDeveloperModeInStorage();
    const countResetGroups = await getCountResetGroupInStorage();
    const countBatch = await getCountBatchPost();
    const isShuffleGroupsNeedPost = await getIsShuffleGroupNeedPostData();
    const isSpammed = await getIsSpammedData();
    const isRandomBatchPost = await getIsRandomBreakBatchData();
    const isRandomTimePost = await getIsRandomTimePostData();
    const isSpecialFrameHours = await getIsSpecialFrameHoursData();
    const isPriorityTask = await getIsExecutePriorityTaskData();
    let maxGroupPerTimeInSpecialFrameHour = 0;

    if (isSpecialFrameHours) {
      maxGroupPerTimeInSpecialFrameHour =
        (await getObjectIsInSpecialFrameHours())?.max_group || 0;
    }

    const isPremium = (await DB_getValue(KEY_IS_PREMIUM)) || false;

    const html = getDataSavedHTML({
      allGroups,
      groupsNeedPost,
      groupsPosted,
      lengthPostedInCurrentTime: length,
      isTesting,
      isProcessing,
      isScheduler,
      currentGroup: objectTask?.task || {},
      lastTimePost,
      currentGroupNeedPost,
      nextTimePost: nextTime,
      maxGroupPerTime,
      estimatedTotalTime,
      isFixStealFocus,
      isShuffleTime,
      isDeveloperMode,
      countResetGroups,
      isSpammed,
      countBatch,
      isShuffleGroupsNeedPost,
      isRandomBatchPost,
      isRandomTimePost,
      isSpecialFrameHours,
      maxGroupPerTimeInSpecialFrameHour,
      isPremium,
      countCommentWalk,
      isCommentWalk,
      isCommentWalkProcessing,
      lastTimeCommentWalk,
      lengthCommented,
      maxCommentWalk,
      isStopTask,
      currentTaskName,
      listTaskInactive,
    });
    if (dataSavedEl) {
      dataSavedEl.innerHTML = html;
    }

    const htmlAtDashboard = getDataSavedAtDashboardHTML({
      allGroups,
      groupsNeedPost,
      groupsPosted,
      lengthPostedInCurrentTime: length,
      isProcessing,
      isScheduler,
      lastTimePost,
      nextTimePost: nextTime,
      maxGroupPerTime,
      isSpammed,
      countCommentWalk,
      isCommentWalk,
      isCommentWalkProcessing,
      lastTimeCommentWalk,
      lengthCommented,
      maxCommentWalk,
      isStopTask,
      isPremium,
      currentTaskName,
      listTaskInactive,
      isPriorityTask,
    });
    if (dataSavedAtDashboard) {
      dataSavedAtDashboard.innerHTML = htmlAtDashboard;
    }
  } catch (error) {
    logError("Error update data saved info: ", error);
  }
}

export { updateDataSavedInfo };
