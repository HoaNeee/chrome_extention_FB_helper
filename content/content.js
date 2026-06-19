(() => {
  // dist/contants/constant-extention.js
  var KEY_CLOSE_THIS_TAB = "CLOSE_THIS_TAB";
  var STATUS_RESPONSE = {
    SUCCESS: "SUCCESS",
    FAIL: "FAIL",
    UNKNOWN: "UNKNOWN"
  };
  var KEY_GET_CURRENT_DATA_GROUP_SAVED_NEED_POST = "get_current_data_group_saved_need_post";
  var KEY_UPDATE_STATUS_TASK = "update_status_task_posting";
  var KEY_NEXT_POST_GROUP = "next_post_group";
  var KEY_UPDATE_IS_SPAMMED = "update_is_spammed";
  var KEY_ADD_LOG = "add_log";
  var KEY_GET_KEY_SAVED = "get_key_saved";
  var KEY_SET_KEY_SAVED = "set_key_saved";
  var KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST = {
    GET_ALL_METADATA: "get_all_metadata_comment_when_post_success"
  };
  var KEY_INTERACT_BEFORE_POST_REQUEST = {
    GET_ALL_METADATA: "get_all_metadata_interact_before_post"
  };
  var KEY_ADD_TIME_DELAY_FOR_SCHEDULER = "update_time_delay_for_scheduler";

  // dist/contants/contants.js
  var KEY_LANGUAGE = "language";
  var KEY_TIME_DELAY = "time_delay";
  var KEY_IS_TEST = "is_test";
  var KEY_IS_IN_PROGRESS = "is_in_progress";
  var KEY_STOP_TASK = "is_stop_task";
  var KEY_IS_DEVELOPER_MODE = "is_developer_mode";
  var KEY_IS_SCROLL_DETECT_LIST_GROUP = "is_scroll_detect_list_group";
  var KEY_LAST_TIME_POST = "last_time_post";
  var KEY_ALL_GROUPS = "all_groups";
  var KEY_CAN_POST_THIS_TAB = "can_post_this_tab";
  var KEY_INTERACT_BEFORE_POST = {
    IS_ACTIVE: "is_interact_before_post",
    MAX_POST_INTERACT: "max_post_interact",
    DECIDED_INTERACT: "decided_interact_before_post"
  };
  var STATUS_TASK = {
    PENDING: "pending",
    SELECTING: "selecting",
    DONE: "done",
    POSTING: "posting",
    ERROR: "error"
  };
  var URL_LIST_GROUPS = "https://www.facebook.com/groups/joins/?nav_source=tab";
  var MAX_Z_INDEX = 99;
  var initialTimeDelay = {
    clickToPost: 4,
    fillContent: 5,
    fillFile: 7,
    post: 5,
    openNewTab: 2
  };

  // dist/dashboard/src/utils/api-helper.js
  async function DB_getValue(key, defaultValue) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] !== void 0 ? result[key] : defaultValue;
    } catch (e) {
      console.log("[DB Compat] DB_getValue error:", e);
      return defaultValue;
    }
  }
  var _menuCommands = /* @__PURE__ */ new Map();
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "menuCommandClicked" && _menuCommands.has(msg.id)) {
      _menuCommands.get(msg.id)();
    }
  });
  var DB_info = (() => {
    try {
      const manifest = chrome.runtime.getManifest();
      return {
        script: {
          name: manifest.name,
          version: manifest.version,
          description: manifest.description,
          author: manifest.author || ""
        },
        scriptHandler: "Chrome Extension",
        version: manifest.version
      };
    } catch (e) {
      return {
        script: { name: "FB Auto Post", version: "1.1.0" },
        scriptHandler: "Chrome Extension"
      };
    }
  })();

  // dist/dashboard/src/services/storage-service.js
  async function getIsDeveloperModeInStorage() {
    return await DB_getValue(KEY_IS_DEVELOPER_MODE) || false;
  }

  // dist/utils/utils.js
  async function sleep(duration) {
    return await new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randomRateBoolean(win = 0, total = 100) {
    const randomNumber = Math.random() * total;
    return randomNumber <= win;
  }
  function now() {
    return Date.now();
  }
  function parseBase64ToFile({ name, base64Data, type }) {
    const blob = parseBase64ToBlob({ name, base64Data, type });
    return new File([blob], name, { type: blob.type });
  }
  function parseBase64ToBlob(objectURL) {
    const base64Data = objectURL.base64Data.split(",")[1];
    const binaryData = atob(base64Data);
    const len = binaryData.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: objectURL.type });
    const split = objectURL.name.split(".");
    const name = randomID() + "." + split[split.length - 1];
    const file = new File([blob], name, { type: objectURL.type });
    return file;
  }
  function getLanguage() {
    try {
      const html = document.documentElement;
      const lang = html.getAttribute("lang");
      return lang;
    } catch (e) {
      console.log("Error getlanguage: " + e);
    }
  }
  function convertCorrectHref(href) {
    if (href && typeof href === "string" && href.charAt(href.length - 1) !== "/") {
      return href + "/";
    }
    return href;
  }
  function randomID() {
    return Math.random().toString(36).substring(2, 10);
  }
  async function logActions(...args) {
    const isDevMode = await getIsDeveloperModeInStorage();
    if (isDevMode) {
      console.log(...args);
    }
  }
  function logError(...args) {
    console.log(...args);
  }
  function shuffleArray(array = []) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      let temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
    return shuffled;
  }
  function getIsCorrectPostURL(href) {
    if (!href || typeof href !== "string") {
      return false;
    }
    const pattern = /^https:\/\/www\.facebook\.com\/groups\/[a-zA-Z0-9.]+\/?$/;
    return pattern.test(href);
  }

  // dist/content/elements/notify.js
  var timeoutNotifyId = null;
  var container = document.createElement("div");
  var innerDiv = document.createElement("div");
  function hideNotification() {
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
  }
  function clearExistingTimeout() {
    if (timeoutNotifyId) {
      clearTimeout(timeoutNotifyId);
      timeoutNotifyId = null;
    }
  }
  function notificationContainer({ anchorElem = document.body } = {}) {
    container.style.position = "absolute";
    container.style.top = "60px";
    container.style.left = "10px";
    container.style.zIndex = MAX_Z_INDEX + 1;
    container.style.background = "white";
    container.style.padding = "8px";
    container.style.boxShadow = "0 2px 10px rgba(0,0,0,0.7)";
    container.style.borderRadius = "3px";
    container.style.transition = "opacity 0.5s ease";
    container.setAttribute("id", "tm_notification_container");
    innerDiv.style.position = "relative";
    innerDiv.textContent = "This is a notification";
    innerDiv.setAttribute("id", "tm_notification_inner");
    hideNotification();
    container.appendChild(innerDiv);
    anchorElem.appendChild(container);
    return {
      clearExistingTimeout
    };
  }

  // dist/content/contants/contants.js
  var SELECTOR = {
    elementsToPost: [`//span[contains(text(), "Write something...")]`],
    elementsPost: [`div[aria-label="Post"][role="button"]`],
    dialog: [`div[role="dialog"][aria-modal]`],
    elementsCloseDialog: [`//div[@aria-label="Close dialog of create tool"]`],
    elementsCreatePost: [`div[aria-label="Create post"][role="dialog"]`],
    elementsTextBoxEditor: [`div[contenteditable="true"][role="textbox"]`],
    elementsSpammed: [
      `//div[contains(text(), "To protect our community from spam, we limit how often you can post, comment, or do other things. Please try again later.")]`
    ],
    listElementContainers: [`div[aria-label="Preview of a group"][role="main"]`],
    waitingGroups: [`//span[contains(text(),"Request to join group pending")]`],
    allGroupsJoinTexts: [`//span[contains(text(),"All groups you've joined")]`],
    buttonSubmitCommentInGroup: [`div[aria-label="Post comment"][role="button"]`],
    elementsPostedPending: [
      `//span[contains(text(), "Your post is awaiting admin approval. If the admin team approves it it will become visible in the group.")]`
    ],
    elementsPostedPendingAlert: [
      `//span[contains(text(), "Thanks for your post! It's been submitted to the group admins for approval.")]`
    ],
    elementLike: `div[aria-label*="React with Like to"]`
  };
  var SELECTOR_VI = {
    elementsToPost: [`//span[contains(text(), "B\u1EA1n vi\u1EBFt g\xEC \u0111i...")]`],
    elementsPost: [`div[aria-label="\u0110\u0103ng"][role="button"]`],
    elementsCreatePost: [`div[aria-label="T\u1EA1o b\xE0i vi\u1EBFt"][role="dialog"]`],
    elementsTextBoxEditor: [`div[contenteditable="true"][role="textbox"]`],
    elementsCloseDialog: ['//div[@aria-label="\u0110\xF3ng h\u1ED9p tho\u1EA1i c\u1EE7a c\xF4ng c\u1EE5 t\u1EA1o"]'],
    elementsSpammed: [
      `//div[contains(text(), "\u0110\u1EC3 b\u1EA3o v\u1EC7 c\u1ED9ng \u0111\u1ED3ng kh\u1ECFi spam, ch\xFAng t\xF4i gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t b\u1EA1n \u0111\u0103ng b\xE0i, b\xECnh lu\u1EADn ho\u1EB7c l\xE0m c\xE1c vi\u1EC7c kh\xE1c trong kho\u1EA3ng th\u1EDDi gian nh\u1EA5t \u0111\u1ECBnh. B\u1EA1n c\xF3 th\u1EC3 th\u1EED l\u1EA1i sau")]`
    ],
    listElementContainers: [`div[aria-label="B\u1EA3n xem tr\u01B0\u1EDBc nh\xF3m"]`],
    waitingGroups: [`//span[contains(text(),"Y\xEAu c\u1EA7u tham gia nh\xF3m \u0111ang ch\u1EDD")]`],
    allGroupsJoinTexts: [
      `//span[contains(text(),"T\u1EA5t c\u1EA3 c\xE1c nh\xF3m b\u1EA1n \u0111\xE3 tham gia")]`
    ],
    buttonSubmitCommentInGroup: [
      `div[aria-label="\u0110\u0103ng b\xECnh lu\u1EADn"][role="button"]`
    ],
    elementsPostedPending: [
      `//span[contains(text(), "B\xE0i \u0111\u0103ng c\u1EE7a b\u1EA1n \u0111ang ch\u1EDD qu\u1EA3n tr\u1ECB vi\xEAn ph\xEA duy\u1EC7t. N\u1EBFu nh\xF3m qu\u1EA3n tr\u1ECB vi\xEAn ch\u1EA5p thu\u1EADn, b\xE0i \u0111\u0103ng s\u1EBD hi\u1EC3n th\u1ECB trong nh\xF3m.")]`
    ],
    elementsPostedPendingAlert: [
      `//span[contains(text(), "C\u1EA3m \u01A1n b\u1EA1n \u0111\xE3 \u0111\u0103ng b\xE0i!")]`
    ],
    elementLike: `div[aria-label*="B\xE0y t\u1ECF c\u1EA3m x\xFAc Th\xEDch v\u1EC1 b\xE0i vi\u1EBFt"]`
  };
  var SELECTOR_RAW = {
    listItems: `div[role="listitem"]`,
    toolbarLabel: `div#toolbarLabel`,
    inputFiles: `input[accept][multiple][type="file"]`,
    formToCommentInGroup: [`form[role="presentation"]`],
    textBoxToCommentInGroup: [
      `div[contenteditable="true"][role="textbox"][aria-label][data-lexical-editor=true][spellcheck="true"]`
    ]
  };

  // dist/content/utils/request.js
  async function sendMessage(type, data) {
    try {
      await chrome.runtime.sendMessage({
        type,
        data
      });
    } catch (error) {
      throw new Error("Error at sendMessage: " + error);
    }
  }
  async function sendMessageWithResponse(type, data) {
    try {
      const res = await chrome.runtime.sendMessage({
        type,
        data
      });
      if (res?.status === STATUS_RESPONSE.FAIL) {
        throw new Error(
          res?.msg || res?.message || "Error at sendMessageWithResponse"
        );
      }
      return res;
    } catch (error) {
      throw new Error("Error at sendMessageWithResponse: " + error);
    }
  }
  async function CL_addLogRequest({ vi, en }) {
    try {
      await sendMessage(KEY_ADD_LOG, { vi, en });
    } catch (error) {
      logError("Error at CL_addLogRequest: " + error);
    }
  }

  // dist/content/utils/storage.js
  async function CL_getIsTest() {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_IS_TEST
      });
      return response.data || false;
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i test",
        en: error || "Error when getting test status"
      });
      return false;
    }
  }
  async function CL_getTimeDelayInStorage() {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_TIME_DELAY
      });
      return response.data || initialTimeDelay;
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y th\u1EDDi gian delay",
        en: error || "Error when getting delay time"
      });
      return initialTimeDelay;
    }
  }
  async function CL_getProgressTool() {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_IS_IN_PROGRESS
      });
      return response.data || false;
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i tool",
        en: error || "Error when getting tool status"
      });
      return false;
    }
  }
  async function CL_getStopTool() {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_STOP_TASK
      });
      return response.data || false;
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i d\u1EEBng tool",
        en: error || "Error when getting stop tool status"
      });
      return true;
    }
  }
  async function CL_getAllDataGroupsOfUser() {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_ALL_GROUPS
      });
      return response.data || [];
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y danh s\xE1ch nh\xF3m",
        en: error || "Error when getting list groups"
      });
      return [];
    }
  }
  async function CL_getIsScrollDetectListGroup() {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_IS_SCROLL_DETECT_LIST_GROUP
      });
      return response.data || false;
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i scroll detect list group",
        en: error || "Error when getting scroll detect list group status"
      });
      return false;
    }
  }
  async function CL_getMetadataComments() {
    try {
      const response = await sendMessageWithResponse(
        KEY_COMMENT_WHEN_POST_SUCCESS_REQUEST.GET_ALL_METADATA
      );
      return response.data || { listContent: [], isActive: false, numberComment: 0 };
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y d\u1EEF li\u1EC7u b\xECnh lu\u1EADn",
        en: error || "Error getting comment data"
      });
      return { listContent: [], isActive: false };
    }
  }
  async function CL_getMetadataInteractBeforePost() {
    try {
      const response = await sendMessageWithResponse(
        KEY_INTERACT_BEFORE_POST_REQUEST.GET_ALL_METADATA
      );
      return response.data || false;
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i interact before post",
        en: error || "Error when getting interact before post status"
      });
      return false;
    }
  }
  async function CL_setDecidedInteractBeforePost(value) {
    try {
      await sendMessageWithResponse(KEY_SET_KEY_SAVED, {
        key: KEY_INTERACT_BEFORE_POST.DECIDED_INTERACT,
        value
      });
    } catch (error) {
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi set tr\u1EA1ng th\xE1i interact before post",
        en: error || "Error when setting interact before post status"
      });
    }
  }

  // dist/content/helpers/dom.js
  function checkIsUseEvaluate(selector = "") {
    return selector.includes(`//`);
  }
  async function waitForElement(selector, anchorElement = document, time = 0) {
    const isStopTask = await CL_getStopTool();
    if (time >= 50 || isStopTask) {
      return null;
    }
    if (checkIsUseEvaluate(selector)) {
      const node = document.evaluate(
        selector,
        anchorElement,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      )?.singleNodeValue;
      if (node) return node;
    } else {
      const el = anchorElement.querySelector(selector);
      if (el) {
        return el;
      }
    }
    await sleep(200);
    return await waitForElement(selector, anchorElement, time + 1);
  }
  function findElement(selector, anchorElem = document) {
    if (!selector) {
      return null;
    }
    if (checkIsUseEvaluate(selector)) {
      const node = document.evaluate(
        selector,
        anchorElem,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      )?.singleNodeValue;
      if (node) return node;
    } else {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }
  function getIsExistDialog() {
    for (const selector of SELECTOR.dialog) {
      const dialog = document.querySelector(selector);
      if (dialog) return true;
    }
    return false;
  }
  async function findDivToPost(time = 0) {
    try {
      if (time >= 50) {
        return null;
      }
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.elementsToPost : SELECTOR.elementsToPost;
      for (const selector of selectors) {
        const el = findElement(selector);
        if (el) {
          return el;
        }
      }
      await sleep(200);
      return await findDivToPost(time + 1);
    } catch (error) {
      logError("Error at findDivToPost: ", error);
      throw new Error("Error at findDivToPost: " + error);
    }
  }
  async function findDivCreatePostContainer() {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.elementsCreatePost : SELECTOR.elementsCreatePost;
      for (const selector of selectors) {
        const div = await waitForElement(selector);
        if (div) {
          return div?.parentElement?.parentElement || div?.parentElement || div;
        }
      }
      return null;
    } catch (error) {
      logError("Error at findDivCreatePostContainer: ", error);
      throw new Error("Error at findDivCreatePostContainer: " + error);
    }
  }
  async function findDivInputTextbox() {
    try {
      const div = await findDivCreatePostContainer();
      if (div) {
        const selectorEditors = SELECTOR.elementsTextBoxEditor;
        for await (const selector of selectorEditors) {
          const input = await waitForElement(
            selector,
            div.children?.[1] || div?.children?.[0] || div?.firstElementChild || div
          );
          if (input) return input;
        }
      }
      return null;
    } catch (error) {
      throw new Error("Error at findDivInputTextbox: " + error);
    }
  }
  async function findButtonPostAndClick() {
    try {
      const divContainer = await findDivCreatePostContainer();
      if (divContainer) {
        const lang = getLanguage();
        const selectors = lang === "vi" ? SELECTOR_VI.elementsPost : SELECTOR.elementsPost;
        for await (const selector of selectors) {
          const div = await waitForElement(
            selector,
            divContainer.lastElementChild
          );
          if (div) {
            await sleep(random(2, 5) * 100);
            const evt = new MouseEvent("mouseover", {
              bubbles: true,
              cancelable: true
            });
            div.dispatchEvent(evt);
            await sleep(random(2, 3) * 100);
            div.click();
            return true;
          }
        }
        return false;
      }
    } catch (e) {
      logError("Error at findButtonPostAndClick: ", e);
      return false;
    }
  }
  function clickOutSideHideDialog() {
    const isExist = getIsExistDialog();
    if (!isExist) return;
    const selectorsDialog = SELECTOR.dialog;
    let isExistDialog = isExist;
    for (const selector of selectorsDialog) {
      if (isExistDialog) break;
      const dialog = findElement(selector);
      if (dialog) {
        isExistDialog = true;
      }
    }
    if (!isExistDialog) {
      return;
    }
    const lang = getLanguage();
    const selectors = lang === "vi" ? SELECTOR_VI.elementsCloseDialog : SELECTOR.elementsCloseDialog;
    for (const selector of selectors) {
      const closeElement = findElement(selector);
      if (closeElement) {
        closeElement.click();
        return;
      }
    }
  }
  function checkIsSpammed() {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.elementsSpammed : SELECTOR.elementsSpammed;
      for (const selector of selectors) {
        const node = findElement(selector);
        if (node) {
          return true;
        }
      }
      return false;
    } catch (error) {
      logError("Error at checkWasBeSpam: ", error);
      return false;
    }
  }
  function findElementJustPosted() {
    try {
      const lang = getLanguage();
      const selectorsAlertPending = lang === "vi" ? SELECTOR_VI.elementsPostedPendingAlert : SELECTOR.elementsPostedPendingAlert;
      const selectorsPostedPending = lang === "vi" ? SELECTOR_VI.elementsPostedPending : SELECTOR.elementsPostedPending;
      for (const selector of selectorsAlertPending) {
        const nodeAlert = findElement(selector);
        if (nodeAlert) {
          return null;
        }
      }
      const divFeed = document.querySelector('div[role="feed"]');
      if (divFeed) {
        const parentDiv = divFeed.parentElement?.parentElement;
        for (const selector of selectorsPostedPending) {
          const node = findElement(selector, parentDiv);
          if (node) {
            return null;
          }
        }
        const childrenOfParentDivFeed = divFeed.parentElement.children;
        if (childrenOfParentDivFeed.length >= 3) {
          return childrenOfParentDivFeed[1];
        }
        if (childrenOfParentDivFeed.length >= 2) {
          return childrenOfParentDivFeed[0];
        }
      }
      return null;
    } catch (error) {
      logError("Error at find link post success:", error);
      return null;
    }
  }
  function findTextBoxJustPosted(anchorElem = document) {
    try {
      for (const selector of SELECTOR_RAW.formToCommentInGroup) {
        const form = findElement(selector, anchorElem);
        if (form) {
          for (const selectorTextBox of SELECTOR_RAW.textBoxToCommentInGroup) {
            const textBox = findElement(selectorTextBox, form);
            if (textBox) {
              return textBox;
            }
          }
        }
      }
    } catch (error) {
      logError("Error at findTextBoxJustPosted: ", error);
      return null;
    }
  }
  function findButtonPostCommentJustPosted(anchorElem = document) {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.buttonSubmitCommentInGroup : SELECTOR.buttonSubmitCommentInGroup;
      for (const selector of selectors) {
        const button = findElement(selector, anchorElem);
        return button;
      }
    } catch (error) {
      logError("Error at findButtonPostCommentJustPosted: ", error);
      return null;
    }
  }
  async function findElementFeedInGroup(time = 0) {
    try {
      const div = document.querySelector('div[role="feed"]');
      if (div) return div;
      if (time > 10) return null;
      await sleep(200);
      return await findElementFeedInGroup(time + 1);
    } catch (error) {
      logError("Error at getElementFeedInGroup: ", error);
      return null;
    }
  }
  async function scrollElementIntoView(selector) {
    if (selector instanceof HTMLElement || selector instanceof Node) {
      selector.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    await sleep(1e3 + random(100, 500));
  }
  async function eventClickElement(element, isDispatch = false) {
    await sleep(random(1, 2) * 1e3 + random(100, 1e3));
    await scrollElementIntoView(element);
    await sleep(random(1, 2) * 1e3 + random(100, 1e3));
    const overEvt = new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(overEvt);
    await sleep(random(2, 4) * 200);
    if (isDispatch) {
      element.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        })
      );
    } else {
      element.click();
    }
  }

  // dist/content/helpers/groups.js
  async function getListElementContainer() {
    try {
      const lang = getLanguage();
      let divContainerList = null;
      const selectorsContainerList = lang === "vi" ? SELECTOR_VI.listElementContainers : SELECTOR.listElementContainers;
      for (const selector of selectorsContainerList) {
        divContainerList = await waitForElement(selector);
        if (divContainerList) break;
      }
      let selectorGroupWaitingTexts = SELECTOR_VI.allGroupsJoinTexts;
      let spanExistGroupWaiting = null;
      for (const selector of selectorGroupWaitingTexts) {
        spanExistGroupWaiting = findElement(selector);
        if (spanExistGroupWaiting) break;
      }
      const listItem = await waitForElement(`div[role="listitem"]:last-child`);
      let listElement = null;
      if (spanExistGroupWaiting) {
        const parentEl = listItem?.parentElement?.parentElement?.parentElement;
        listElement = parentEl?.children?.[1] || parentEl?.children?.[0] || parentEl;
      } else {
        listElement = listItem?.parentElement;
      }
      return listElement;
    } catch (error) {
      throw new Error("Error get list element container: " + error);
    }
  }
  function getLastItemElementListGroup(list) {
    try {
      if (list instanceof HTMLElement) {
        return list.children?.[list.children.length - 1];
      }
      if (list && Array.isArray(list) && list.length) {
        return list[list.length - 1];
      }
      return null;
    } catch (error) {
      throw new Error("Error get last item element in list group: " + error);
    }
  }
  function getAllListItemElement(list) {
    try {
      if (list instanceof HTMLElement) {
        return list.querySelectorAll(SELECTOR_RAW.listItems);
      }
      if (list && Array.isArray(list) && list.length) {
        return list;
      }
      return [];
    } catch (error) {
      throw new Error("Error get all list item elements: " + error);
    }
  }
  async function getListGroups() {
    try {
      const listElement = await getListElementContainer();
      const isScroll = await CL_getIsScrollDetectListGroup();
      if (isScroll) {
        await scrollDetectListGroups(listElement);
      } else {
        const allGroup = await CL_getAllDataGroupsOfUser();
        return allGroup || [];
      }
      const childs = getAllListItemElement(listElement);
      const list = [];
      for (const child of childs) {
        const as = child.querySelectorAll(`a[href][role="link"]`);
        const a = as[1];
        if (a) {
          const title = a.textContent;
          let href = a.getAttribute("href");
          href = convertCorrectHref(href);
          if (getIsCorrectPostURL(href)) {
            list.push({ title, href });
          }
        }
      }
      CL_addLogRequest({
        vi: `L\u1EA5y danh s\xE1ch nh\xF3m c\u1EE7a ng\u01B0\u1EDDi d\xF9ng th\xE0nh c\xF4ng, t\u1ED5ng ${list.length} nh\xF3m`,
        en: `Got ${list.length} groups of user successfully`
      });
      return list;
    } catch (e) {
      CL_addLogRequest({
        vi: `L\u1ED7i khi l\u1EA5y danh s\xE1ch nh\xF3m c\u1EE7a ng\u01B0\u1EDDi d\xF9ng, ${e?.message || e}`,
        en: `Error when getting list groups of user, ${e?.message || e}`
      });
      throw new Error("Error get list group: " + e);
    }
  }
  async function scrollDetectListGroups(listContainer) {
    try {
      const lang = getLanguage();
      const selectorsContainerList = lang === "vi" ? SELECTOR_VI.listElementContainers : SELECTOR.listElementContainers;
      let listElement = null;
      for (const selector of selectorsContainerList) {
        listElement = await waitForElement(selector);
        if (listElement) break;
      }
      let selectorGroupWaitingTexts = lang === "vi" ? SELECTOR_VI.allGroupsJoinTexts : SELECTOR.allGroupsJoinTexts;
      let h2ExistGroupWaiting = null;
      for (const selector of selectorGroupWaitingTexts) {
        h2ExistGroupWaiting = findElement(selector, listElement);
        if (h2ExistGroupWaiting) break;
      }
      let maxGroup = 50;
      if (h2ExistGroupWaiting) {
        const text = h2ExistGroupWaiting.textContent;
        const pt = new RegExp(`\\d+`, "i");
        const match = text.match(pt);
        if (match) {
          maxGroup = Number(match[0]);
        }
      }
      let i = 0;
      const duration = 3e3;
      let currentGroup = 0;
      let lastCountGroup = currentGroup;
      while (i < 10 && currentGroup < maxGroup - 10) {
        let isStopTask = await CL_getStopTool();
        if (isStopTask) {
          logActions("Stop task -> stop scroll detect list groups");
          break;
        }
        const lastItem = getLastItemElementListGroup(listContainer);
        if (lastItem) {
          lastItem.scrollIntoView({ behavior: "smooth", block: "end" });
        }
        lastCountGroup = currentGroup;
        currentGroup = getAllListItemElement(listContainer)?.length || 0;
        if (lastCountGroup !== currentGroup) {
          i = 0;
        }
        await sleep(duration + random(100, 1e3));
        logActions(currentGroup, maxGroup);
        window.dispatchEvent(new Event("scroll"));
        ++i;
      }
    } catch (error) {
      throw new Error("Error scroll detect list groups: " + error);
    }
  }
  async function interactBeforePost() {
    try {
      const metadataInteractBeforePost = await CL_getMetadataInteractBeforePost();
      const canInteract = metadataInteractBeforePost?.canInteract || false;
      const maxPost = metadataInteractBeforePost?.maxPost || 0;
      if (!canInteract) {
        return;
      }
      CL_addLogRequest({
        vi: "B\u1EAFt \u0111\u1EA7u t\u01B0\u01A1ng t\xE1c b\xE0i vi\u1EBFt tr\u01B0\u1EDBc khi \u0111\u0103ng",
        en: "Started interacting with posts before posting"
      });
      let divFeed = await findElementFeedInGroup();
      if (divFeed) {
        const randomLengthReact = random(1, maxPost);
        let numberScroll = randomLengthReact * 2;
        while (numberScroll > 0) {
          divFeed?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
          await sleep(random(2, 4) * 1e3);
          numberScroll--;
        }
        divFeed = await findElementFeedInGroup();
        const lang = getLanguage();
        const selector = lang === "vi" ? SELECTOR_VI.elementLike : SELECTOR.elementLike;
        let allDivToLikes = document.querySelectorAll(selector);
        allDivToLikes = shuffleArray(allDivToLikes);
        const arrayDivNeedReact = [];
        for (const divReact of allDivToLikes) {
          if (arrayDivNeedReact.length < randomLengthReact) {
            if (randomRateBoolean(50, 100)) {
              arrayDivNeedReact.push(divReact);
            }
          }
        }
        CL_addLogRequest({
          vi: `S\u1ED1 b\xE0i vi\u1EBFt c\u1EA7n t\u01B0\u01A1ng t\xE1c: ${arrayDivNeedReact.length}`,
          en: `Number of posts to interact: ${arrayDivNeedReact.length}`
        });
        for (const divReact of arrayDivNeedReact) {
          await sleep(random(1, 3) * 1234);
          divReact.scrollIntoView({ behavior: "smooth", block: "center" });
          await sleep(1e3);
          divReact.focus();
          await sleep(random(1, 3) * 1234);
          divReact.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window
            })
          );
          await sleep(random(2, 4) * 1234);
        }
        CL_addLogRequest({
          vi: `\u0110\xE3 t\u01B0\u01A1ng t\xE1c xong, ti\u1EBFp t\u1EE5c th\u1EF1c hi\u1EC7n \u0111\u0103ng b\xE0i`,
          en: `Already interacted, continuing to post`
        });
        await CL_setDecidedInteractBeforePost(false);
      }
    } catch (error) {
      logError("Error at interactBeforePost: ", error);
      CL_addLogRequest({
        vi: `L\u1ED7i khi t\u01B0\u01A1ng t\xE1c tr\u01B0\u1EDBc khi \u0111\u0103ng b\xE0i, ${error?.message || error}`,
        en: `Error when interacting before posting, ${error?.message || error}`
      });
    }
  }

  // dist/content/utils/utils.js
  function getIsMatchUrl(url) {
    if (!url) return false;
    return location.href === url;
  }
  async function CL_getValue(key, defaultValue = null) {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key
      });
      const value = response?.data;
      if (value === void 0 || value === null) {
        return defaultValue;
      }
      return value;
    } catch (error) {
      logError("Error CL_getValue: ", error);
      return defaultValue;
    }
  }
  async function CL_setValue(key, value) {
    try {
      await sendMessageWithResponse(KEY_SET_KEY_SAVED, {
        key,
        value
      });
      return true;
    } catch (error) {
      logError("Error CL_setValue: ", error);
      return false;
    }
  }
  async function CL_getTextWithLang({ viText, enText } = {}) {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_LANGUAGE
      });
      const lang = response?.data || "vi";
      return lang === "vi" ? viText : enText;
    } catch (error) {
      logError("Error CL_getTextWithLang: ", error);
      return viText;
    }
  }
  async function CL_setTimeDelayForScheduler(timeDelay) {
    try {
      await sendMessage(KEY_ADD_TIME_DELAY_FOR_SCHEDULER, {
        timeDelay
      });
      return true;
    } catch (error) {
      logError("Error CL_setTimeDelayCommentForScheduler: ", error);
      return false;
    }
  }

  // dist/content/helpers/post.js
  async function pasteContent(content) {
    try {
      const div = await findDivInputTextbox();
      if (div) {
        const mouseEvt = new MouseEvent("mouseover", {
          bubbles: true,
          cancelable: true
        });
        await sleep(random(2, 5) * 100);
        div.dispatchEvent(mouseEvt);
        await sleep(random(2, 5) * 100);
        div.focus();
        let htmlContent = content || `<p></p>`;
        if (htmlContent.includes(`data-list="bullet"`)) {
          htmlContent = htmlContent.replaceAll(`ol`, `ul`);
        }
        const clipboardData = new DataTransfer();
        clipboardData.setData("text/html", htmlContent);
        const pasteEvent = new ClipboardEvent("paste", {
          clipboardData,
          bubbles: true,
          cancelable: true
        });
        div.dispatchEvent(pasteEvent);
      }
    } catch (e) {
      CL_addLogRequest({
        vi: `L\u1ED7i khi d\xE1n n\u1ED9i dung v\xE0o \xF4 nh\u1EADp`,
        en: `Error when pasting content into the input box`
      });
      throw new Error("Error at paste content: " + e);
    }
  }
  async function fillFile(files) {
    if (!files || !Array.isArray(files) || !files?.length) {
      return;
    }
    try {
      const div = document.querySelector(
        SELECTOR_RAW.toolbarLabel
      )?.nextElementSibling;
      const input = div?.querySelector(SELECTOR_RAW.inputFiles);
      if (input) {
        const mouseEvt = new MouseEvent("mouseover", {
          bubbles: true,
          cancelable: true
        });
        await sleep(random(2, 5) * 100);
        div.dispatchEvent(mouseEvt);
        await sleep(random(2, 5) * 100);
        const dt = new DataTransfer();
        for (const file of files) {
          const parseFile = parseBase64ToFile(file);
          dt.items.add(parseFile);
        }
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch (e) {
      CL_addLogRequest({
        vi: `L\u1ED7i khi t\u1EA3i t\u1EC7p l\xEAn \xF4 nh\u1EADp`,
        en: `Error when uploading files to the input box`
      });
      throw new Error("Error at fill file: " + e);
    }
  }
  async function postHelper(task) {
    try {
      let calculateTimeDelay = function(time, lower = 1, upper = 3) {
        const space = 20;
        const diff = time / space;
        if (diff === 0) {
          return random(Math.max(time - lower, 1), Math.max(time + upper, 3)) * s;
        }
        const fixed_value = 5;
        return random(
          Math.max(time - fixed_value * diff, 1),
          Math.max(time + fixed_value * diff, 3)
        ) * s;
      };
      const s = 1e3;
      const isTest = await CL_getIsTest();
      const timeDelay = await CL_getTimeDelayInStorage();
      const timeClickToPost = timeDelay?.clickToPost || initialTimeDelay.clickToPost;
      const timeFillContent = timeDelay?.fillContent || initialTimeDelay.fillContent;
      const timeFillFile = timeDelay?.fillFile || initialTimeDelay.fillFile;
      const timePost = timeDelay?.post || initialTimeDelay.post;
      let delayClickToPost = calculateTimeDelay(timeClickToPost);
      let delayFillContent = calculateTimeDelay(timeFillContent);
      let delayFillFile = calculateTimeDelay(timeFillFile);
      let delayPost = calculateTimeDelay(timePost, 1, 4);
      if (isTest) {
        delayClickToPost = delayFillContent = delayFillFile = delayPost = s;
      }
      const responeDataContent = await sendMessageWithResponse(
        KEY_GET_CURRENT_DATA_GROUP_SAVED_NEED_POST
      );
      const dataContent = responeDataContent.data;
      const contents = dataContent?.contents || [];
      const files = dataContent?.files || [];
      await sleep(delayClickToPost);
      const div = await findDivToPost();
      if (div) {
        await eventClickElement(div);
        await sleep(500);
        let retryTime = 1;
        while (retryTime < 2 && !getIsExistDialog()) {
          CL_addLogRequest({
            vi: `\xD4 nh\u1EADp n\u1ED9i dung kh\xF4ng t\xECm th\u1EA5y, \u0111ang th\u1EED l\u1EA1i l\u1EA7n ${retryTime}`,
            en: `Content input box not found, try again ${retryTime}`
          });
          const node = await findDivToPost();
          if (node) {
            await eventClickElement(node);
          }
          await sleep(random(1, 4) * 1e3);
          retryTime++;
        }
        if (!getIsExistDialog()) {
          CL_addLogRequest({
            vi: `\xD4 nh\u1EADp n\u1ED9i dung kh\xF4ng t\xECm th\u1EA5y, \u0111ang th\u1EED l\u1EA1i l\u1EA7n ${retryTime}`,
            en: `Content input box not found, try again ${retryTime}`
          });
          const node2 = await findDivToPost();
          if (node2) {
            await eventClickElement(node2, true);
          }
        }
        if (!getIsExistDialog()) {
          const text2 = await CL_getTextWithLang({
            viText: "Kh\xF4ng t\xECm th\u1EA5y \xF4 nh\u1EADp n\u1ED9i dung",
            enText: "Not found content input box"
          });
          throw new Error(text2);
        }
        await sleep(delayFillContent);
        task.status = STATUS_TASK.POSTING;
        sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });
        let content = contents[random(0, contents.length - 1)];
        await pasteContent(content);
        await sleep(delayFillFile);
        fillFile(files);
        await sleep(delayPost);
        if (!isTest) {
          if (getIsExistDialog()) {
            const isProgress = await CL_getProgressTool();
            if (isProgress) {
              await findButtonPostAndClick();
              CL_setValue(KEY_LAST_TIME_POST, now());
            }
          } else {
            const text2 = await CL_getTextWithLang({
              viText: "Kh\xF4ng th\u1EC3 t\xECm \xF4 \u0111\u0103ng b\xE0i",
              enText: "Not found content input box"
            });
            throw new Error(text2);
          }
        }
        task.status = STATUS_TASK.DONE;
        sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });
        CL_addLogRequest({
          vi: "\u0110\xE3 th\u1EF1c hi\u1EC7n xong vi\u1EC7c \u0111\u0103ng b\xE0i trong nh\xF3m, chuy\u1EC3n sang nh\xF3m ti\u1EBFp theo.",
          en: "Done posting in this group, switch to next group."
        });
        return true;
      }
      const text = await CL_getTextWithLang({
        viText: "Kh\xF4ng t\xECm \u0111\u01B0\u1EE3c th\u1EBB click \u0111\u1EC3 t\u1EA1o \xF4 input",
        enText: "Not found button to create input tag"
      });
      throw new Error(text);
    } catch (error) {
      CL_addLogRequest({
        vi: `L\u1ED7i khi \u0111\u0103ng b\xE0i trong nh\xF3m n\xE0y, ${error?.message || error}`,
        en: `Error when posting in this group, ${error?.message || error}`
      });
      task.status = STATUS_TASK.ERROR;
      sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });
      return false;
    }
  }
  async function simulateTyping(element, text, { minDelay = 30, maxDelay = 100 } = {}) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    for (let char of text) {
      element.focus();
      const keyDown = new KeyboardEvent("keydown", {
        key: char,
        bubbles: true
      });
      element.dispatchEvent(keyDown);
      document.execCommand("insertText", false, char);
      const keyUp = new KeyboardEvent("keyup", {
        key: char,
        bubbles: true
      });
      element.dispatchEvent(keyUp);
      await sleep(minDelay + Math.random() * (maxDelay - minDelay));
    }
  }
  async function commentToJustPostedHelper() {
    try {
      const data = await CL_getMetadataComments();
      if (!data.isActive) {
        return;
      }
      if (!randomRateBoolean(28)) {
        CL_addLogRequest({
          vi: "\u0110\xE3 quy\u1EBFt \u0111\u1ECBnh s\u1EBD b\u1ECF qua b\xECnh lu\u1EADn, chuy\u1EC3n sang c\xF4ng vi\u1EC7c ti\u1EBFp theo",
          en: "Decided to skip comment, switch to next task."
        });
        return;
      }
      let cnt = 0;
      while (getIsExistDialog() && cnt < 30) {
        await sleep(1e3);
        ++cnt;
      }
      if (getIsExistDialog()) {
        CL_addLogRequest({
          vi: "Kh\xF4ng th\u1EC3 b\xECnh lu\u1EADn v\xE0o b\xE0i vi\u1EBFt v\u1EEBa \u0111\u0103ng, b\xE0i vi\u1EBFt v\u1EEBa \u0111\u0103ng c\xF3 th\u1EC3 \u0111\xE3 b\u1ECB th\u1EA5t b\u1EA1i",
          en: "Cannot comment on this post, the post may have failed"
        });
        return;
      }
      CL_addLogRequest({
        vi: `\u0110\xE3 quy\u1EBFt \u0111\u1ECBnh s\u1EBD b\xECnh lu\u1EADn b\xE0i vi\u1EBFt n\xE0y, s\u1ED1 b\xECnh lu\u1EADn ${data.numberComment}`,
        en: `Decided to comment on this post, number comment ${data.numberComment}`
      });
      await sleep(random(1e3, 4e3) + random(100, 1e3));
      const elementJustPosted = findElementJustPosted();
      async function typeAndSubmit(textBox, elementJustPosted2) {
        try {
          const content = data.listContent[random(0, data.listContent.length - 1)];
          if (textBox) {
            await simulateTyping(textBox, content, {
              minDelay: 200,
              maxDelay: 1e3
            });
            const btn = findButtonPostCommentJustPosted(elementJustPosted2);
            await sleep(random(1e3, 3e3) + random(100, 1e3));
            if (btn) {
              btn.click();
            } else {
              textBox.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
              );
              textBox.dispatchEvent(
                new KeyboardEvent("keyup", { key: "Enter", bubbles: true })
              );
            }
            await sleep(random(2e3, 4e3) + random(100, 1e3));
          }
        } catch (error) {
          throw error;
        }
      }
      if (elementJustPosted) {
        const textBox = findTextBoxJustPosted(elementJustPosted);
        if (textBox) {
          await sleep(random(1, 2) * 1e3);
          textBox.scrollIntoView({ behavior: "smooth", block: "center" });
          await sleep(random(1, 5) * 1e3);
          textBox.focus();
          await sleep(random(1, 3) * 1e3);
          for (let i = 0; i < data.numberComment; i++) {
            await typeAndSubmit(textBox, elementJustPosted);
            await sleep(random(1e3, 2e3));
          }
        }
      }
      const timeClick = 3;
      const timeType = data.numberComment * 8;
      const timeCheckDialog = cnt * 1;
      const timeDelay = timeClick + timeType + timeCheckDialog;
      await CL_setTimeDelayForScheduler(timeDelay * 1e3);
    } catch (error) {
      logError("Error at commentToJustPostedHelper: ", error);
      CL_addLogRequest({
        vi: `L\u1ED7i khi b\xECnh lu\u1EADn v\xE0o b\xE0i vi\u1EBFt v\u1EEBa \u0111\u0103ng, ${error?.message || error}`,
        en: `Error when commenting on this post, ${error?.message || error}`
      });
    }
  }

  // dist/content/content-src.js
  async function main() {
    try {
      console.log("content script is running...");
      notificationContainer({});
      if (getIsMatchUrl(URL_LIST_GROUPS)) {
        const isGetList = await CL_getValue(KEY_IS_SCROLL_DETECT_LIST_GROUP);
        if (isGetList) {
          sendMessage(KEY_ADD_LOG, {
            vi: `B\u1EAFt \u0111\u1EA7u l\u1EA5y danh s\xE1ch nh\xF3m...`,
            en: `Start getting list groups...`
          });
          await sleep(4e3);
          const allGroups = await getListGroups();
          CL_setValue(KEY_ALL_GROUPS, allGroups);
          CL_setValue(KEY_IS_SCROLL_DETECT_LIST_GROUP, false);
          await sleep(2e3);
          sendMessage(KEY_CLOSE_THIS_TAB, {});
        }
        return;
      }
      try {
        const isProgress = await CL_getProgressTool();
        if (!isProgress) {
          return;
        }
        const responeCanPost = await sendMessageWithResponse(
          KEY_CAN_POST_THIS_TAB
        );
        console.log("Respone can post", responeCanPost);
        const canPost = responeCanPost.data.canPost;
        const task = responeCanPost.data.task;
        if (canPost) {
          await interactBeforePost();
          CL_addLogRequest({
            vi: `B\u1EAFt \u0111\u1EA7u \u0111\u0103ng b\xE0i trong nh\xF3m ${task?.id_href}`,
            en: `Start posting in group ${task?.id_href}`
          });
          const isSuccess = await postHelper(task);
          if (isSuccess) {
            await commentToJustPostedHelper();
          }
          const timeDelay = await CL_getTimeDelayInStorage();
          const timeDelayNext = timeDelay.openNewTab % 2 === 0 ? timeDelay.openNewTab / 2 : (timeDelay.openNewTab + 1) / 2;
          await sleep(timeDelayNext * 1e3 + random(500, 2e3));
          sendMessage(KEY_NEXT_POST_GROUP, {});
          const isTest = await CL_getValue(KEY_IS_TEST, false);
          if (isTest) {
            setTimeout(() => {
              sendMessage(KEY_CLOSE_THIS_TAB, {});
            }, 15 * 1e3);
          } else {
            setTimeout(
              () => {
                sendMessage(KEY_CLOSE_THIS_TAB, {});
              },
              random(35, 55) * 1e3
            );
            setTimeout(
              async () => {
                if (getIsExistDialog()) {
                  const isSpammed = checkIsSpammed();
                  if (isSpammed) {
                    sendMessage(KEY_UPDATE_IS_SPAMMED, {
                      isSpammed
                    });
                    await sleep(2e3);
                  }
                  clickOutSideHideDialog();
                }
              },
              random(10, 20) * 1e3
            );
          }
        }
      } catch (error) {
        logError("Error at content posting main: ", error);
      }
    } catch (error) {
      logError("Error at content main: ", error);
    }
  }
  main();
})();
