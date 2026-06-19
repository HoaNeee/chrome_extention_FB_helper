import { prefix } from "../../../contants/contants.js";
import { getTextWithLanguage, logError } from "../../../utils/utils.js";
import { getTheme } from "../services/storage-service.js";

function getAllFieldsSetting(root = document) {
  const inputMaxGroup = root.querySelector("#tm_input-max-group-per-time");
  const checkboxIsProcessing = root.querySelector(`#tm_checkbox-is-processing`);
  const checkboxIsTest = root.querySelector(`#tm_checkbox-is-test`);
  const checkboxIsScheduler = root.querySelector(`#tm_checkbox-is-scheduler`);
  const checkboxIsSpammed = root.querySelector(`#tm_checkbox-is-spammed`);
  const checkboxIsFixStealAllFocus = root.querySelector(
    `#tm_checkbox-is-fix-steal-all-focus`,
  );
  const checkboxIsShuffleGroupsNeedPost = root.querySelector(
    `#tm_checkbox-is-shuffle-groups-need-post`,
  );
  const checkboxIsRandomBatchPost = root.querySelector(
    `#tm_checkbox-is-random-batch-post`,
  );
  const checkboxIsRandomTimePost = root.querySelector(
    `#tm_checkbox-is-random-time-post`,
  );

  const checkboxIsFixStealFocus = root.querySelector(
    `#tm_checkbox-is-fix-steal-focus`,
  );
  const checkboxIsShuffleSchedulerTime = root.querySelector(
    `#tm_checkbox-is-shuffle-scheduler-time`,
  );
  const checkboxIsReloadDashboard = root.querySelector(
    `#tm_checkbox-is-reload-dashboard`,
  );
  const inputStrictlyMatchTitleGroup = root.querySelector(
    `#tm_input-strictly-match-title-group`,
  );

  const checkboxIsSpecialFrameHours = root.querySelector(
    `#tm_checkbox-is-special-frame-hours`,
  );

  function setIsProcessing(val) {
    if (checkboxIsProcessing) {
      checkboxIsProcessing.checked = val;
    }
  }

  function setIsReloadDashboard(val) {
    if (checkboxIsReloadDashboard) {
      checkboxIsReloadDashboard.checked = val;
    }
  }

  function setIsTest(val) {
    if (checkboxIsTest) {
      checkboxIsTest.checked = val;
    }
  }

  function setMaxGroupPerTime(val) {
    if (inputMaxGroup) {
      inputMaxGroup.value = Number(val);
    }
  }

  function setScheduler(val) {
    if (checkboxIsScheduler) {
      checkboxIsScheduler.checked = val;
    }
  }

  function setIsFixStealFocus(val) {
    if (checkboxIsFixStealFocus) {
      checkboxIsFixStealFocus.checked = val;
    }
  }

  function setStrictlyMatchTitleGroup(val) {
    if (inputStrictlyMatchTitleGroup) {
      inputStrictlyMatchTitleGroup.value = val;
    }
  }

  function setIsShuffleSchedulerTime(val) {
    if (checkboxIsShuffleSchedulerTime) {
      checkboxIsShuffleSchedulerTime.checked = val;
    }
  }

  function setIsSpammed(val) {
    if (checkboxIsSpammed) {
      checkboxIsSpammed.checked = val;
    }
  }

  function setIsFixStealAllFocus(val) {
    if (checkboxIsFixStealAllFocus) {
      checkboxIsFixStealAllFocus.checked = val;
    }
  }

  function setIsShuffleGroupsNeedPost(val) {
    if (checkboxIsShuffleGroupsNeedPost) {
      checkboxIsShuffleGroupsNeedPost.checked = val;
    }
  }

  function setIsRandomBatchPost(val) {
    if (checkboxIsRandomBatchPost) {
      checkboxIsRandomBatchPost.checked = val;
    }
  }

  function setIsRandomTimePost(val) {
    if (checkboxIsRandomTimePost) {
      checkboxIsRandomTimePost.checked = val;
    }
  }

  function setIsSpecialFrameHours(val) {
    if (checkboxIsSpecialFrameHours) {
      checkboxIsSpecialFrameHours.checked = val;
    }
  }

  return {
    getMaxGroupPerTime: () => Number(inputMaxGroup.value),
    getIsProcessing: () => checkboxIsProcessing.checked,
    getIsTest: () => checkboxIsTest.checked,
    setIsProcessing: setIsProcessing,
    setIsTest: setIsTest,
    setMaxGroupPerTime: setMaxGroupPerTime,
    getScheduler: () => checkboxIsScheduler.checked,
    setScheduler: setScheduler,
    getIsFixStealFocus: () => checkboxIsFixStealFocus.checked,
    setIsFixStealFocus: setIsFixStealFocus,
    getStrictlyMatchTitleGroup: () => inputStrictlyMatchTitleGroup.value,
    setStrictlyMatchTitleGroup: setStrictlyMatchTitleGroup,
    getIsReloadDashboard: () => checkboxIsReloadDashboard.checked,
    setIsReloadDashboard: setIsReloadDashboard,
    getIsShuffleSchedulerTime: () => checkboxIsShuffleSchedulerTime.checked,
    setIsShuffleSchedulerTime: setIsShuffleSchedulerTime,
    getIsSpammed: () => checkboxIsSpammed.checked,
    setIsSpammed: setIsSpammed,
    getIsFixStealAllFocus: () => checkboxIsFixStealAllFocus.checked,
    setIsFixStealAllFocus: setIsFixStealAllFocus,
    getIsShuffleGroupsNeedPost: () => checkboxIsShuffleGroupsNeedPost.checked,
    setIsShuffleGroupsNeedPost: setIsShuffleGroupsNeedPost,
    getIsRandomBatchPost: () => checkboxIsRandomBatchPost.checked,
    setIsRandomBatchPost: setIsRandomBatchPost,
    getIsRandomTimePost: () => checkboxIsRandomTimePost.checked,
    setIsRandomTimePost: setIsRandomTimePost,
    getIsSpecialFrameHours: () => checkboxIsSpecialFrameHours.checked,
    setIsSpecialFrameHours: setIsSpecialFrameHours,
  };
}

function getAllFieldsAdvancedSetting(root = document) {
  const checkboxIsCommentWhenPostSuccess = root.querySelector(
    `#${prefix}checkbox-is-comment-when-post-success`,
  );
  const inputListCommentWhenPostSuccess = root.querySelector(
    `#${prefix}input-keyword-comment-when-post-success`,
  );
  const checkboxIsInteractBeforePost = root.querySelector(
    `#${prefix}checkbox-is-interact-before-post`,
  );
  const inputMaxCommentPerTime = root.querySelector(
    `#${prefix}input-max-comment-per-time`,
  );
  const inputMaxPostInteract = root.querySelector(
    `#${prefix}input-max-post-interact`,
  );

  function getIsCommentWhenPostSuccess() {
    return checkboxIsCommentWhenPostSuccess.checked;
  }

  function getKeyWordsComment() {
    return inputListCommentWhenPostSuccess.value;
  }

  function setIsCommentWhenPostSuccess(val) {
    checkboxIsCommentWhenPostSuccess.checked = val;
  }

  function setKeyWordsComment(val) {
    inputListCommentWhenPostSuccess.value = val;
  }

  function getIsInteractBeforePost() {
    return checkboxIsInteractBeforePost.checked;
  }

  function setIsInteractBeforePost(val) {
    checkboxIsInteractBeforePost.checked = val;
  }

  function getMaxCommentPerTime() {
    return parseInt(inputMaxCommentPerTime.value) || 1;
  }

  function setMaxCommentPerTime(val) {
    inputMaxCommentPerTime.value = val;
  }

  function getMaxPostInteract() {
    return parseInt(inputMaxPostInteract.value) || 1;
  }

  function setMaxPostInteract(val) {
    inputMaxPostInteract.value = val;
  }

  return {
    getIsCommentWhenPostSuccess: getIsCommentWhenPostSuccess,
    getKeyWordsComment: getKeyWordsComment,
    setIsCommentWhenPostSuccess: setIsCommentWhenPostSuccess,
    setKeyWordsComment: setKeyWordsComment,
    getIsInteractBeforePost: getIsInteractBeforePost,
    setIsInteractBeforePost: setIsInteractBeforePost,
    getMaxCommentPerTime: getMaxCommentPerTime,
    setMaxCommentPerTime: setMaxCommentPerTime,
    getMaxPostInteract: getMaxPostInteract,
    setMaxPostInteract: setMaxPostInteract,
  };
}

/**
 * @param {{
 * selector: string,
 * isField: boolean,
 * fieldSelector: string,
 * isCheckbox: boolean,
 * }}
 * @returns {void}
 */
function disabledElement({
  selector = "",
  isField = false,
  fieldSelector = "",
  isCheckbox = false,
} = {}) {
  if (!selector) {
    return;
  }
  if (isField) {
    const field = document.querySelector(selector);
    if (field) {
      const container = field.closest(fieldSelector);
      if (container) {
        if (isCheckbox) {
          const checkbox = document.querySelector(selector);
          if (checkbox) {
            checkbox.checked = false;
          }
        }
        container.setAttribute("disabled", "");
        return;
      }
    }
    return;
  }
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute("disabled", "");
  }
}

/**
 * @param {{
 * selector: string,
 * isField: boolean,
 * fieldSelector: string
 * }}
 * @returns {void}
 */
function enabledElement(
  { selector = "", isField = false, fieldSelector = "" } = "",
) {
  if (isField) {
    const field = document.querySelector(selector);
    if (field) {
      const container = field.closest(fieldSelector);
      if (container) {
        container.removeAttribute("disabled");
        return;
      }
    }
    return;
  }
  const element = document.querySelector(selector);
  if (element) {
    element.removeAttribute("disabled");
  }
}

/**
 * Hide element
 * @param {string} selector
 * @param {HTMLElement} anchorElem
 */
function hideElement(selector = "", anchorElem = document) {
  const element = anchorElem.querySelector(selector);
  if (element) {
    element.style.display = "none";
    element.style.pointerEvents = "none";
  }
}

/**
 * Show element
 * @param {string} selector
 * @param {HTMLElement} anchorElem
 */
function showElement(selector = "", anchorElem = document) {
  const element = anchorElem.querySelector(selector);
  if (element) {
    element.style.display = "block";
    element.style.pointerEvents = "auto";
  }
}

/**
 * Hide field
 * @param {{
 * selector: string,
 * anchorElem: HTMLElement,
 * fieldSelector: string
 * }}
 * @returns {void}
 */
function hideField({
  selector = "",
  anchorElem = document,
  fieldSelector = "",
} = {}) {
  const element = anchorElem.querySelector(selector);
  if (element) {
    element.style.display = "none";
    element.style.pointerEvents = "none";

    const fieldContainer = element.closest(fieldSelector);
    if (fieldContainer) {
      fieldContainer.style.display = "none";
      fieldContainer.style.pointerEvents = "none";
    }
  }
}

/**
 * Show field
 * @param {{
 * selector: string,
 * anchorElem: HTMLElement,
 * fieldSelector: string
 * }}
 * @returns {void}
 */
function showField({
  selector = "",
  anchorElem = document,
  fieldSelector = "",
  display = "flex",
} = {}) {
  const element = anchorElem.querySelector(selector);
  if (element) {
    element.style.display = "block";
    element.style.pointerEvents = "auto";

    const fieldContainer = element.closest(fieldSelector);
    if (fieldContainer) {
      fieldContainer.style.display = display;
      fieldContainer.style.pointerEvents = "auto";
    }
  }
}

function createInfoIcon() {
  const span = document.createElement("span");
  span.style.display = "inline-flex";
  span.style.alignItems = "center";
  span.style.justifyContent = "center";
  span.style.marginLeft = "6px";

  const theme = getTheme();

  span.innerHTML = `<svg
      style="cursor: help; width: 12px"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      class="tm_svg"
      fill="${theme === "dark" ? "white" : "black"}"
    ><path d="M256 512a256 256 0 1 0 0-512 256 256 0 1 0 0 512zM224 160a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm-8 64l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24z"/></svg>`;
  return span;
}

function addAllEvtTooltipForElement() {
  try {
    const prefix = "tm_";

    findLabelSetedUpAndAddTippy({
      selector: prefix + "input-strictly-match-title-group",
      content: getTextWithLanguage({
        vi: `Các từ khóa mà bạn nghĩ sẽ luôn có trong tên hoặc tiêu đề của nhóm cần đăng, tránh trường hợp đăng bài vào các nhóm không mong muốn. Ví dụ tiêu đề bạn cài đặt: 'lang van loi' các nhóm có từ 'lang', 'van', 'loi' sẽ được chọn`,
        en: `Strictly match title keywords group (separate by comma ','). For example setting title: 'lang van loi' will be matched with 'lang', 'van', 'loi' groups`,
      }),
    });

    findLabelSetedUpAndAddTippy({
      selector: "tm_checkbox-is-processing",
      content: getTextWithLanguage({
        vi: `Đánh dấu rằng tiện ích đang thực hiện công việc nào đó, hãy cố gắng đừng tắt nó khi công việc chưa hoàn thành (tắt nếu vừa mở tiện ích mà vẫn thấy được đánh dấu)`,
        en: `Indicates that the utility is performing some work, try not to turn it off when the work is not completed (turn it off if you just open the utility and still see it checked)`,
      }),
    });

    findLabelSetedUpAndAddTippy({
      selector: "tm_checkbox-is-fix-steal-focus",
      content: getTextWithLanguage({
        vi: "Tùy chọn này sẽ giúp bạn có thể làm một việc khác mà không bị hệ thống của hệ điều hành làm cho nhảy cửa sổ, tránh được việc các cửa sổ đang bật bị nhảy loạn, nhưng vẫn cần focus vào tab đăng bài vừa mở để việc đăng bài không bị gián đoạn (tùy chọn này nên được bật)",
        en: "This option will help you to do another thing without being interrupted by the operating system making the window jump, avoiding the case where the windows being opened are disordered, but still need to focus on the newly opened posting tab so that the posting process is not interrupted (this option should be enabled)",
      }),
    });

    findLabelSetedUpAndAddTippy({
      selector: "tm_checkbox-is-shuffle-groups-need-post",
      content: getTextWithLanguage({
        vi: "Khi bật tùy chọn này, nhóm cần đăng trong danh sách bạn đã thêm sẽ được xáo trộn ngẫu nhiên. Ngược lại, nếu không bật, bạn sẽ cần cài đặt thứ tự ưu tiên để tiện ích có thể chọn dữ liệu nào sẽ cần được ưu tiên chọn trước (mặc định sẽ là nhỏ hơn)",
        en: "When this option is enabled, the group to be posted will be randomly shuffled. If not enabled, you will need to set the priority order for the utility to select data that needs to be prioritized (default is smaller)",
      }),
    });

    findLabelSetedUpAndAddTippy({
      selector: "tm_checkbox-is-scheduler",
      content: getTextWithLanguage({
        vi: `Tùy chọn này sẽ giúp bạn đăng bài tự động theo lịch mà bạn đã cài trước đó (nếu chưa cài đặt lịch thì bạn hãy cài đặt lịch trước khi bật). Gợi ý khi cài đặt nên chọn kiểu lịch là phút để tiện ích có thể hoạt động ổn định và bạn có thể đạt được kết quả tốt nhất. Hãy xóa các khung thời gian mà bạn không muốn đăng trong danh sách (click vào "Xem lịch" và bấm vào biểu tượng x)`,
        en: `When this option is enabled, the utility will automatically post at the set times. If not enabled, you will need to set it manually. Hint: When setting up, it is recommended to choose the time interval in minutes for the utility to operate stably and you to achieve the best results. Please remove the time frames that you do not want to post in the list (click on "View schedule" and click on the x icon)`,
      }),
    });

    findLabelSetedUpAndAddTippy({
      selector: "tm_input-delay-click-to-post",
      content: getTextWithLanguage({
        vi: "Chỉ hoạt động khi đăng bài, là độ trễ khi mà vừa mở tab mới và chuẩn bị nhấn vào nút để hiển thị hộp thoại nội dung và file/ảnh,...",
        en: "Only active when posting, it is the delay time when a new tab is opened and about to click the button to display the content and file/image dialog, etc.",
      }),
    });
    findLabelSetedUpAndAddTippy({
      selector: "tm_input-delay-fill-content",
      content: getTextWithLanguage({
        vi: "Chỉ hoạt động khi đăng bài, là khoảng thời gian chờ khi mà hộp thoại điền nội dung đã được nhấn hoặc mở và khi chuẩn bị điền nội dung mà bạn đã cài đặt khi thêm nhóm",
        en: "Only active when posting, it is the delay time when the content dialog has been clicked or opened and when preparing to fill in the content that you set when adding the group",
      }),
    });
    findLabelSetedUpAndAddTippy({
      selector: "tm_input-delay-fill-file",
      content: getTextWithLanguage({
        vi: "Chỉ hoạt động khi đăng bài, là khoảng thời gian chờ khi mà hộp thoại điền nội dung đã được nhấn hoặc mở và khi chuẩn bị chọn file/ảnh,...",
        en: "Only active when posting, it is the delay time when the content dialog has been clicked or opened and when preparing to select files/images, etc.",
      }),
    });
    findLabelSetedUpAndAddTippy({
      selector: "tm_input-delay-post",
      content: getTextWithLanguage({
        vi: "Chỉ hoạt động khi đăng bài, là khoảng thời gian chờ sau khi mà nội dung và file/ảnh đã được điền đầy đủ và chuẩn bị nhấn vào nút để đăng bài,",
        en: "Only active when posting, it is the delay time after the content and file/image have been filled completely and when preparing to click the button to post the article.",
      }),
    });
    findLabelSetedUpAndAddTippy({
      selector: "tm_input-delay-open-new-tab",
      content: getTextWithLanguage({
        vi: "Chỉ hoạt động khi đăng bài, là khoảng thời gian chờ sau khi đã đăng bài xong và chuẩn bị mở tab mới, trước khi chuẩn bị tương tác với tab đó (nếu cần)",
        en: "Only active when posting, it is the delay time after posting the article and before preparing to open a new tab, before preparing to interact with that tab (if needed)",
      }),
    });

    findLabelSetedUpAndAddTippy({
      selector: "tm_checkbox-is-comment-when-post-success",
      content: getTextWithLanguage({
        vi: "Khi bật tùy chọn này, tiện ích sẽ tự động bình luận vào bài viết của chính bạn sau khi đăng bài thành công (ngẫu nhiên bài viết), hãy cài đặt số bình luận tối đa, và các nội dung cần bình luận vào viết, tiện ích sẽ chọn ngẫu nhiên nội mỗi lần bình luận. Hãy chú ý thời gian trễ với bộ lịch",
        en: "When this option is enabled, the utility will automatically comment on your own post after successfully posting (random post). Please set the maximum number of comments and the content to be commented on. The utility will randomly select the content each time it comments. Please pay attention to the time delay with the schedule",
      }),
    });
    findLabelSetedUpAndAddTippy({
      selector: "tm_checkbox-is-interact-before-post",
      content: getTextWithLanguage({
        vi: "Khi bật tùy chọn này, tiện ích sẽ tự động tương tác (Thích) trước khi đợt đăng diễn ra để tránh bị phát hiện là máy, ngẫu nhiên đợt đăng sẽ tương tác, hãy cài đặt số bài viết tối đa cần tương tác",
        en: "When this option is enabled, the utility will automatically interact (like) before the posting batch takes place to avoid being detected as a machine, randomly the posting batch will interact. Please set the maximum number of posts to interact.",
      }),
    });
  } catch (error) {
    logError("Error at addAllTooltipForElement", error);
  }
}

/**
 * Find label seted up and add tippy to element
 * @param {{selector: string|HTMLElement, content: string, appendTo: HTMLElement}} object
 */
function findLabelSetedUpAndAddTippy({
  selector = "",
  content = "",
  appendTo = document.body,
} = {}) {
  let lbl = selector;
  if (typeof selector === "string") {
    lbl = document.querySelector(`label[for="${selector}"]`);
  }

  if (lbl) {
    const svg = createInfoIcon();
    lbl.appendChild(svg);
    addTippy(svg, content, appendTo);
  }
}

/**
 * Add tippy to element
 * @param {string|HTMLElement} selector
 * @param {string} content
 */
function addTippy(selector, content, appendTo = document.body) {
  const element =
    typeof selector === "string" ? document.querySelector(selector) : selector;
  if (element) {
    tippy(element, {
      content,
      animation: "fade",
      appendTo,
    });
  }
}

function addCssForTextarea() {
  const textareaElements = document.querySelectorAll("textarea.auto-stretch");

  textareaElements.forEach((textarea) => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + 2 + "px";

    const MAX_HEIGHT = 200;

    if (textarea.scrollHeight >= MAX_HEIGHT) {
      textarea.style.overflowY = "auto";
    } else {
      textarea.style.overflowY = "hidden";
    }

    textarea.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + 2 + "px";
      if (this.scrollHeight >= MAX_HEIGHT) {
        this.style.overflowY = "auto";
      } else {
        this.style.overflowY = "hidden";
      }
    });
  });
}

export {
  getAllFieldsSetting,
  disabledElement,
  enabledElement,
  hideElement,
  showElement,
  hideField,
  showField,
  createInfoIcon,
  addAllEvtTooltipForElement,
  findLabelSetedUpAndAddTippy,
  getAllFieldsAdvancedSetting,
  addCssForTextarea,
};
