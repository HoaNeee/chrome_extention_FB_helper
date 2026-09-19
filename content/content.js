(() => {
  // contants/constant-extention.js
  var KEY_CLOSE_THIS_TAB = "CLOSE_THIS_TAB";
  var STATUS_RESPONSE = {
    SUCCESS: "SUCCESS",
    FAIL: "FAIL",
    UNKNOWN: "UNKNOWN"
  };
  var URL_SEARCH_PAGE = "facebook.com/search/top";
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
  var MAX_LENGTH_FILE_NAME = 15;
  var KEY_GET_PARSE_FILE = "get_parse_file";
  var KEY_SET_PROCESSING_COMMENT_WALK = "set_processing_comment_walk";
  var KEY_CAN_COMMENT_WALK_THIS_TAB = "can_comment_walk_this_tab";
  var KEY_GET_ALL_METADATA_COMMENT_WALK = "get_all_metadata_comment_walk";
  var KEY_CAN_COMMENT_WALK_THIS_POST = "can_comment_this_post";
  var KEY_ADD_URL_COMMENTED = "add_url_commented";
  var KEY_COMPLETED_COMMENT_WALK_THIS_BATCH = "completed_comment_walk_this_batch";
  var KEY_COMMENT_WALK_REQUEST = {
    UPDATE_LAST_TIME_COMMENT: "update_last_time_comment",
    GET_COMMENT_WALK_NEVER_COMMENTED: "get_comment_walk_never_commented"
  };
  var KEY_STOP_TASK_REQUEST = {
    GET_IS_STOP_TASK: "get_is_stop_task"
  };
  var KEY_COMMENT_WALK_AREA = {
    SEARCH_PAGE: "SEARCH_PAGE",
    HOME: "HOME",
    RANDOM: "RANDOM"
  };
  var KEY_COMMENT_WALK_SPEED = {
    SLOW: "SLOW",
    NORMAL: "NORMAL",
    FAST: "FAST"
  };
  var KEY_REQUEST_TO_BACKGROUND = {
    GET_STRICTLY_MATCH_TITLE_GROUP: "get_strictly_match_title_group",
    CHECK_DATA_COMMENT_WALK_MATCH_AT_SEARCH_PAGE: "check_data_comment_walk_match_at_search_page",
    CHECK_MULTI_DATA_COMMENT_WALK_AT_HOME_PAGE: "check_multi_data_comment_walk_at_home_page"
  };

  // contants/contants.js
  var KEY_LANGUAGE = "language";
  var KEY_TIME_DELAY = "time_delay";
  var KEY_IS_TEST = "is_test";
  var KEY_IS_IN_PROGRESS = "is_in_progress";
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
  var KEY_COMMENT_WALK = {
    IS_ACTIVE: "is_comment_walk",
    COMMENT_WALK_SETTING_MAX_COMMENT_PER_BATCH: "max_comment_walk_per_batch",
    CURRENT_COMMENT_WALK_OBJECT: "current_comment_walk_object",
    CURRENT_COMMENT_WALK_AREA: "current_comment_walk_area",
    COMMENT_WALK_SETTING_TIME_DELAY: "comment_walk_setting_time_delay",
    LIST_ID_COMMENT_WALK_ACTIVE: "list_ids_comment_walk_active",
    IS_COMMENT_WALK_PROCESSING: "is_comment_walk_processing",
    TAB_ID_COMMENT_WALK: "tab_id_comment_walk",
    CURRENT_ID_COMMENT_WALK: "current_id_comment_walk",
    LIST_URL_COMMENT_WALK_COMMENTED: "list_url_comment_walk_commented",
    COUNT_COMMENT_WALK_POSTED_PER_BATCH: "count_comment_walk_posted_per_batch",
    CONTENT_QUERY_INCLUDES_COMMON: "content_query_includes_common",
    CONTENT_QUERY_EXCLUDES_COMMON: "content_query_excludes_common",
    MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES_COMMON: "match_rate_value_content_query_includes_common",
    LAST_TIME_COMMENT_WALK: "last_time_comment_walk",
    COMMENT_WALK_AREA: "comment_walk_area",
    KEYWORDS_CERTAIN_CHOICE_COMMENT_WALK: "keywords_certain_choice_comment_walk",
    IS_COMBINE_STRICTLY_TITLE_GROUP: "is_combine_strictly_title_group",
    IS_SKIP_POST_NOT_IN_GROUP: "is_skip_post_not_in_group",
    COMMENT_WALK_SPEED: "comment_walk_speed",
    IS_AI_HELP_COMMENT_WALK: "is_ai_help_comment_walk"
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
    time_delay_click_to_post: 4,
    time_delay_fill_content: 5,
    time_delay_fill_file: 7,
    time_delay_post: 5,
    time_delay_open_new_tab: 2
  };
  var DEFAULT_COMMENT_WALK_SETTING = {
    max_comment_walk_per_batch: 1,
    time_delay_fill_content_comment_walk_min: 100,
    time_delay_fill_content_comment_walk_max: 200,
    time_delay_fill_file_comment_walk: 5,
    time_delay_submit_comment_walk: 11,
    comment_walk_area: KEY_COMMENT_WALK_AREA.RANDOM,
    comment_walk_speed: KEY_COMMENT_WALK_SPEED.NORMAL
  };

  // utils/api-helper.js
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

  // utils/utils.js
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
    const split = name ? name?.split(".") : [];
    let fileName = genID();
    let ext = "jpg";
    if (split.length > 1) {
      fileName = split[0];
      ext = split[split.length - 1];
    }
    if (fileName.length > MAX_LENGTH_FILE_NAME) {
      fileName = fileName.slice(0, MAX_LENGTH_FILE_NAME);
    }
    const newName = fileName + "_" + genID() + "." + ext;
    const file = new File([blob], newName, { type });
    return file;
  }
  function parseBase64ToBlob(objectURL) {
    const base64Data = objectURL.base64Data?.split(",")[1];
    if (!base64Data) return null;
    const binaryData = atob(base64Data);
    const len = binaryData.length;
    const uint8Array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      uint8Array[i] = binaryData.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: objectURL.type });
    return blob;
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
  function genID(length = 10) {
    return Math.random().toString(36).substring(2, length + 2);
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
  function checkIsFacebookUrl(url) {
    if (typeof url !== "string") return false;
    return url.includes("facebook.com");
  }
  function checkIsSearchPageUrl(url) {
    if (typeof url !== "string") return false;
    return url.includes(URL_SEARCH_PAGE);
  }
  function checkIsSearchPagePostUrl(url) {
    if (typeof url !== "string") return false;
    const pattern = /^https:\/\/www\.facebook\.com\/groups\/[a-zA-Z0-9._-]+\/permalink\/[A-Za-z0-9_.-\\/]+(\/?)$/;
    return pattern.test(url);
  }
  function cvStringHigher(str) {
    return str.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^a-zA-Z0-9\s]/g, " ").replace(/\s+/g, " ").toLocaleLowerCase().trim();
  }
  function matchQueryKeywords(tokens = [], target = "") {
    if (!Array.isArray(tokens)) return [];
    const res = /* @__PURE__ */ new Set();
    let normalTarget = cvStringHigher(target);
    for (const token of tokens) {
      if (normalTarget.includes(cvStringHigher(token))) {
        res.add(token);
      }
    }
    return Array.from(res);
  }

  // content/elements/notify.js
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

  // content/utils/global.js
  var language = "vi";
  function getTextLanguageContent({ vi = "", en = "" }) {
    if (language === "vi") return vi;
    return en;
  }
  async function initLanguageWithTool() {
    try {
      const lang = await CL_getValue(KEY_LANGUAGE);
      language = lang || "vi";
    } catch (error) {
      logError("Error at initial language at content", error);
    }
  }

  // content/utils/request.js
  async function sendMessage(type, data) {
    try {
      await chrome.runtime.sendMessage({
        type,
        data
      });
    } catch (error) {
      logError("Error send message", error);
      throw error;
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
      logError("Error at sendMessageWithResponse", error);
      throw error;
    }
  }
  async function CL_addLogRequest({ vi, en, type = "info" }) {
    try {
      const languageContent = getTextLanguageContent({ vi, en });
      if (type === "error") {
        logErrorContent(languageContent);
      } else {
        logContent(languageContent);
      }
      await sendMessage(KEY_ADD_LOG, { vi, en, type });
    } catch (error) {
      logErrorContent("Error at CL_addLogRequest: " + error);
    }
  }
  async function CL_closeThisTab() {
    try {
      await sendMessage(KEY_CLOSE_THIS_TAB);
    } catch (error) {
      logErrorContent("Error at CL_closeThisTab: " + error);
    }
  }

  // content/utils/utils.js
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
      logErrorContent("Error CL_getValue: ", error);
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
      logErrorContent("Error CL_setValue: ", error);
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
      logErrorContent("Error CL_getTextWithLang: ", error);
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
      logErrorContent("Error CL_setTimeDelayCommentForScheduler: ", error);
      return false;
    }
  }
  async function updateLastTimePost(time) {
    try {
      await sendMessage(KEY_LAST_TIME_POST, {
        time
      });
      return true;
    } catch (error) {
      logErrorContent("Error at updateLastTimePost: ", error);
      return false;
    }
  }
  async function CL_getParseFileRequest(files) {
    try {
      const res = await sendMessageWithResponse(KEY_GET_PARSE_FILE, {
        files
      });
      return res?.data;
    } catch (error) {
      logErrorContent("Error CL_getFileRequest: ", error);
      throw error;
    }
  }
  async function CL_getCanCommentWalkThisTab() {
    try {
      const res = await sendMessageWithResponse(KEY_CAN_COMMENT_WALK_THIS_TAB);
      return res.data;
    } catch (error) {
      logErrorContent("error CL_getCanCommentWalk", error);
      return false;
    }
  }
  function convertArgsToString(item) {
    if (item instanceof Error) {
      return `${item.name}: ${item.message}`;
    }
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
      return String(item);
    } else {
      if (Array.isArray(item)) {
        let str = "";
        for (const subItem of item) {
          str += subItem + " ";
        }
        return str;
      }
      if (typeof item === "object" && Object.keys(item).length) {
        let str = "";
        for (const sub in item) {
          str += `${sub}: ${convertArgsToString(item[sub])}, `;
        }
        return str;
      }
    }
    return JSON.stringify(item);
  }
  function logContent(...args) {
    let str = "";
    for (const item of args) {
      str += convertArgsToString(item);
    }
    addLogEntry(str, "info");
  }
  function logErrorContent(...args) {
    console.log("[LOG_ERROR_CONTENT]: ", ...args);
    let str = "";
    for (const item of args) {
      str += convertArgsToString(item);
    }
    addLogEntry(str, "error");
  }

  // content/elements/panel-log-content.js
  function createPanelLogContent(container2 = document.body) {
    try {
      const exist = document.querySelector(".panel-log-content__container");
      if (exist) {
        return { panelEl: exist };
      }
      const panelEl = document.createElement("div");
      panelEl.classList.add("panel-log-content__container");
      Object.assign(panelEl.style, {
        position: "fixed",
        top: "120px",
        left: "30px",
        width: "300px",
        height: "300px",
        zIndex: "9999",
        boxSizing: "border-box",
        fontSize: "12px",
        background: "#1e1e2e",
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "monospace"
      });
      const headerEl = document.createElement("div");
      Object.assign(headerEl.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "6px 10px",
        background: "#2a2a3e",
        borderBottom: "1px solid #3a3a55",
        flexShrink: "0"
      });
      const titleEl = document.createElement("span");
      titleEl.textContent = "\u{1F4CB} Log";
      Object.assign(titleEl.style, {
        color: "#a0a8d0",
        fontWeight: "bold",
        fontSize: "11px",
        letterSpacing: "0.5px"
      });
      const divBtn = document.createElement("div");
      Object.assign(divBtn.style, {
        display: "flex",
        gap: "6px"
      });
      const btnHide = document.createElement("button");
      Object.assign(btnHide.style, {
        background: "transparent",
        border: "1px solid #555577",
        borderRadius: "4px",
        color: "#888aaa",
        fontSize: "10px",
        cursor: "pointer",
        padding: "2px 6px",
        transition: "all 0.15s ease"
      });
      btnHide.textContent = "Hide";
      btnHide.addEventListener("mouseenter", () => {
        btnHide.style.borderColor = "#e06c75";
        btnHide.style.color = "#e06c75";
      });
      btnHide.addEventListener("mouseleave", () => {
        btnHide.style.borderColor = "#555577";
        btnHide.style.color = "#888aaa";
      });
      let isHide = false;
      btnHide.addEventListener("click", () => {
        if (isHide) {
          logListEl.style.display = "flex";
          panelEl.style.height = "300px";
          btnHide.textContent = "Hide";
          isHide = false;
        } else {
          logListEl.style.display = "none";
          panelEl.style.height = "auto";
          btnHide.textContent = "Show";
          isHide = true;
        }
      });
      const clearBtn = document.createElement("button");
      clearBtn.textContent = "Clear";
      Object.assign(clearBtn.style, {
        background: "transparent",
        border: "1px solid #555577",
        borderRadius: "4px",
        color: "#888aaa",
        fontSize: "10px",
        cursor: "pointer",
        padding: "2px 6px",
        transition: "all 0.15s ease"
      });
      clearBtn.addEventListener("mouseenter", () => {
        clearBtn.style.borderColor = "#e06c75";
        clearBtn.style.color = "#e06c75";
      });
      clearBtn.addEventListener("mouseleave", () => {
        clearBtn.style.borderColor = "#555577";
        clearBtn.style.color = "#888aaa";
      });
      divBtn.appendChild(btnHide);
      divBtn.appendChild(clearBtn);
      headerEl.appendChild(titleEl);
      headerEl.appendChild(divBtn);
      const logListEl = document.createElement("div");
      logListEl.classList.add("panel-log-content__list");
      Object.assign(logListEl.style, {
        flex: "1",
        overflowY: "auto",
        padding: "6px 10px",
        display: "flex",
        flexDirection: "column",
        gap: "3px"
      });
      const style = document.createElement("style");
      style.textContent = `
      .panel-log-content__list::-webkit-scrollbar { width: 4px; }
      .panel-log-content__list::-webkit-scrollbar-track { background: transparent; }
      .panel-log-content__list::-webkit-scrollbar-thumb { background: #3a3a55; border-radius: 4px; }
    `;
      document.head.appendChild(style);
      clearBtn.addEventListener("click", () => clearLogPanel());
      panelEl.appendChild(headerEl);
      panelEl.appendChild(logListEl);
      container2.appendChild(panelEl);
      return { panelEl };
    } catch (error) {
      logError("error in createPanelLogContent", error);
    }
  }
  function addLogEntry(message, type = "info") {
    const colorMap = {
      info: "#61afef",
      warn: "#e5c07b",
      error: "#e06c75",
      success: "#98c379"
    };
    const prefixMap = {
      info: "\u2139",
      warn: "\u26A0",
      error: "\u2716",
      success: "\u2714"
    };
    const logListEl = document.querySelector(".panel-log-content__list");
    if (!logListEl) return;
    const now2 = /* @__PURE__ */ new Date();
    const time = now2.toLocaleTimeString("vi-VN", { hour12: false });
    const lineEl = document.createElement("div");
    Object.assign(lineEl.style, {
      display: "flex",
      gap: "6px",
      alignItems: "flex-start",
      color: colorMap[type] || colorMap.info,
      lineHeight: "1.5",
      wordBreak: "break-word"
    });
    const prefixSpan = document.createElement("span");
    prefixSpan.textContent = prefixMap[type] || prefixMap.info;
    prefixSpan.style.flexShrink = "0";
    const timeSpan = document.createElement("span");
    timeSpan.textContent = `[${time}]`;
    Object.assign(timeSpan.style, {
      color: "#555577",
      flexShrink: "0",
      fontSize: "10px",
      marginTop: "1px"
    });
    const msgSpan = document.createElement("span");
    msgSpan.textContent = message;
    msgSpan.style.color = "#cdd6f4";
    lineEl.appendChild(prefixSpan);
    lineEl.appendChild(timeSpan);
    lineEl.appendChild(msgSpan);
    logListEl.appendChild(lineEl);
    logListEl.scrollTop = logListEl.scrollHeight;
  }
  function clearLogPanel() {
    const logListEl = document.querySelector(".panel-log-content__list");
    if (!logListEl) return;
    logListEl.innerHTML = "";
  }

  // content/contants/contants.js
  var SELECTOR = {
    elementsToPost: [`.//span[contains(text(), "Write something...")]`],
    elementsPost: [`div[aria-label="Post"][role="button"]:not([aria-disabled])`],
    dialog: [`div[role="dialog"][aria-modal]`],
    elementsCloseDialog: [
      `.//div[@aria-label="Close dialog of create tool"]`,
      'div[aria-label="Close"][role="button"]'
    ],
    elementsCreatePost: [`div[aria-label="Create post"][role="dialog"]`],
    elementsTextBoxEditor: [`div[contenteditable="true"][role="textbox"]`],
    elementsSpammed: [
      `.//div[contains(text(), "To protect our community from spam, we limit how often you can post, comment, or do other things. Please try again later.")]`,
      `.//div[contains(text(), "We limit how often you can post, comment or do other things in a given amount of time in order to help protect the community from spam. You can try again later.")]`
    ],
    listElementContainers: [`div[aria-label="Preview of a group"][role="main"]`],
    waitingGroups: [`.//span[contains(text(),"Request to join group pending")]`],
    allGroupsJoinTexts: [`.//span[contains(text(),"All groups you've joined")]`],
    buttonSubmitCommentInGroup: [`div[aria-label="Post comment"][role="button"]`],
    elementsPostedPending: [
      `.//span[contains(text(), "Your post is awaiting admin approval. If the admin team approves it it will become visible in the group.")]`
    ],
    elementsPostedPendingAlert: [
      `.//span[contains(text(), "Thanks for your post! It's been submitted to the group admins for approval.")]`
    ],
    elementFeedPosts: [
      './/h3[contains(text(), "Feed posts")]',
      './/h3[contains(text(), "Feed Posts")]'
    ],
    loadingElements: [
      `div[aria-label="Loading..."][role="status"][data-visualcompletion="loading-state"]`
    ],
    searchResults: [`div[aria-label="Search results"][role="main"]`],
    btnsShowMoreContentCommentWalk: [
      `.//div[contains(text(), "See more") and @role="button"]`
    ],
    btnsWriteCommentInFeed: [
      `div[aria-label="Write a comment"][role="button"]`,
      `.//div[contains(@aria-label, 'Comment on') and @role="button"]`
    ],
    btnsExitPage: [
      `.//div[contains(@aria-label, "Leave page") and @role="button" and not(@aria-hidden)]`
    ],
    btnsRemoveImage: [
      `div[aria-label="Remove Photo"][role="button"]`,
      `div[aria-label="Remove photo"][role="button"]`
    ],
    elementLike: `div[aria-label*="React with Like to"]`
  };
  var SELECTOR_VI = {
    elementsToPost: [`.//span[contains(text(), "B\u1EA1n vi\u1EBFt g\xEC \u0111i...")]`],
    elementsPost: [`div[aria-label="\u0110\u0103ng"][role="button"]:not([aria-disabled])`],
    elementsCreatePost: [`div[aria-label="T\u1EA1o b\xE0i vi\u1EBFt"][role="dialog"]`],
    elementsTextBoxEditor: [`div[contenteditable="true"][role="textbox"]`],
    elementsCloseDialog: [
      './/div[@aria-label="\u0110\xF3ng h\u1ED9p tho\u1EA1i c\u1EE7a c\xF4ng c\u1EE5 t\u1EA1o"]',
      'div[aria-label="\u0110\xF3ng"][role="button"]'
    ],
    elementsSpammed: [
      `.//div[contains(text(), "\u0110\u1EC3 b\u1EA3o v\u1EC7 c\u1ED9ng \u0111\u1ED3ng kh\u1ECFi spam, ch\xFAng t\xF4i gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t b\u1EA1n \u0111\u0103ng b\xE0i, b\xECnh lu\u1EADn ho\u1EB7c l\xE0m c\xE1c vi\u1EC7c kh\xE1c trong kho\u1EA3ng th\u1EDDi gian nh\u1EA5t \u0111\u1ECBnh. B\u1EA1n c\xF3 th\u1EC3 th\u1EED l\u1EA1i sau")]`,
      `.//div[contains(text(), "Ch\xFAng t\xF4i gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t b\u1EA1n \u0111\u0103ng b\xE0i, b\xECnh lu\u1EADn ho\u1EB7c l\xE0m c\xE1c vi\u1EC7c kh\xE1c trong kho\u1EA3ng th\u1EDDi gian nh\u1EA5t \u0111\u1ECBnh. B\u1EA1n c\xF3 th\u1EC3 th\u1EED l\u1EA1i sau")]`
    ],
    elementFeedPosts: [
      './/h3[contains(text(), "B\xE0i vi\u1EBFt tr\xEAn B\u1EA3ng feed")]',
      './/h3[contains(text(), "B\xE0i vi\u1EBFt tr\xEAn b\u1EA3ng feed")]'
    ],
    listElementContainers: [`div[aria-label="B\u1EA3n xem tr\u01B0\u1EDBc nh\xF3m"]`],
    waitingGroups: [`.//span[contains(text(),"Y\xEAu c\u1EA7u tham gia nh\xF3m \u0111ang ch\u1EDD")]`],
    allGroupsJoinTexts: [
      `.//span[contains(text(),"T\u1EA5t c\u1EA3 c\xE1c nh\xF3m b\u1EA1n \u0111\xE3 tham gia")]`
    ],
    buttonSubmitCommentInGroup: [
      `div[aria-label="\u0110\u0103ng b\xECnh lu\u1EADn"][role="button"]`
    ],
    elementsPostedPending: [
      `.//span[contains(text(), "B\xE0i \u0111\u0103ng c\u1EE7a b\u1EA1n \u0111ang ch\u1EDD qu\u1EA3n tr\u1ECB vi\xEAn ph\xEA duy\u1EC7t. N\u1EBFu nh\xF3m qu\u1EA3n tr\u1ECB vi\xEAn ch\u1EA5p thu\u1EADn, b\xE0i \u0111\u0103ng s\u1EBD hi\u1EC3n th\u1ECB trong nh\xF3m.")]`
    ],
    elementsPostedPendingAlert: [
      `.//span[contains(text(), "C\u1EA3m \u01A1n b\u1EA1n \u0111\xE3 \u0111\u0103ng b\xE0i!")]`
    ],
    loadingElements: [
      `div[aria-label="\u0110ang t\u1EA3i..."][role="status"][data-visualcompletion="loading-state"]`
    ],
    searchResults: [`div[aria-label="K\u1EBFt qu\u1EA3 t\xECm ki\u1EBFm"][role="main"]`],
    btnsShowMoreContentCommentWalk: [
      `.//div[contains(text(), "Xem th\xEAm") and @role="button"]`
    ],
    btnsWriteCommentInFeed: [
      `div[aria-label="Vi\u1EBFt b\xECnh lu\u1EADn"][role="button"]`,
      `.//div[contains(@aria-label, 'B\xECnh lu\u1EADn') and @role="button"]`
    ],
    btnsExitPage: [
      `.//div[contains(@aria-label, "R\u1EDDi kh\u1ECFi trang") and @role="button" and not(@aria-hidden)]`,
      `.//div[contains(@aria-label, "R\u1EDDi kh\u1ECFi Trang") and @role="button" and not(@aria-hidden)]`
    ],
    btnsRemoveImage: [
      `div[aria-label="G\u1EE1 \u1EA2nh"][role="button"]`,
      `div[aria-label="G\u1EE1 \u1EA3nh"][role="button"]`
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
    ],
    feed: [`div[role="feed"]`],
    itemFeedContents: [`div[data-ad-rendering-role="story_message"]`],
    itemFeedSearchResultPreviewContents: [`div[data-ad-comet-preview="message"]`]
  };

  // content/utils/storage.js
  async function CL_getIsTest() {
    try {
      const response = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_IS_TEST
      });
      return response.data || false;
    } catch (error) {
      logErrorContent("Error at CL_getIsTest: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i test",
        en: error || "Error when getting test status"
      });
      return false;
    }
  }
  async function CL_getTimeDelayData() {
    try {
      const response = await sendMessageWithResponse(KEY_TIME_DELAY);
      return response.data || initialTimeDelay;
    } catch (error) {
      logErrorContent("Error at CL_getTimeDelayData: ", error);
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
      const response = await sendMessageWithResponse(
        KEY_STOP_TASK_REQUEST.GET_IS_STOP_TASK
      );
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
      logErrorContent("Error at CL_getAllDataGroupsOfUser: ", error);
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
      logErrorContent("Error at CL_getIsScrollDetectListGroup: ", error);
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
      if (response?.data) {
        return response.data;
      }
      return {
        contents: [],
        max_comment_per_post: 0,
        is_active: false
      };
    } catch (error) {
      logErrorContent("Error at CL_getMetadataComments: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y d\u1EEF li\u1EC7u b\xECnh lu\u1EADn",
        en: error || "Error getting comment data"
      });
      return {
        contents: [],
        is_active: false,
        max_comment_per_post: 0
      };
    }
  }
  async function CL_getMetadataInteractBeforePost() {
    try {
      const response = await sendMessageWithResponse(
        KEY_INTERACT_BEFORE_POST_REQUEST.GET_ALL_METADATA
      );
      return response.data || null;
    } catch (error) {
      logErrorContent("Error at CL_getMetadataInteractBeforePost: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i interact before post",
        en: error || "Error when getting interact before post status"
      });
      return null;
    }
  }
  async function CL_setDecidedInteractBeforePost(value) {
    try {
      await sendMessageWithResponse(KEY_SET_KEY_SAVED, {
        key: KEY_INTERACT_BEFORE_POST.DECIDED_INTERACT,
        value
      });
    } catch (error) {
      logErrorContent("Error at CL_setDecidedInteractBeforePost: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi set tr\u1EA1ng th\xE1i interact before post",
        en: error || "Error when setting interact before post status"
      });
    }
  }
  async function CL_getAllMetadataCommentWalk() {
    try {
      const res = await sendMessageWithResponse(
        KEY_GET_ALL_METADATA_COMMENT_WALK
      );
      return res.data;
    } catch (error) {
      logErrorContent("Error at CL_getAllMetadataCommentWalk: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y d\u1EEF li\u1EC7u b\xECnh lu\u1EADn",
        en: error || "Error getting comment data"
      });
      return null;
    }
  }
  async function CL_setProcessingCommentWalk(isProcessing) {
    try {
      await sendMessage(KEY_SET_PROCESSING_COMMENT_WALK, {
        isProcessing
      });
    } catch (error) {
      logErrorContent("Error at CL_setProcessingCommentWalk: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi set tr\u1EA1ng th\xE1i comment walk",
        en: error || "Error when setting comment walk status"
      });
    }
  }
  async function CL_getCountCommentWalkPostedPerBatch() {
    try {
      const countComment = await CL_getValue(
        KEY_COMMENT_WALK.COUNT_COMMENT_WALK_POSTED_PER_BATCH,
        0
      );
      return countComment;
    } catch (error) {
      logErrorContent("Error at CL_getCountCommentWalkPostedPerBatch: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y s\u1ED1 l\u01B0\u1EE3ng b\xECnh lu\u1EADn \u0111\xE3 \u0111\u0103ng",
        en: error || "Error when getting number of comments posted"
      });
      return 0;
    }
  }
  async function CL_setCountCommentWalkPostedPerBatch(countComment) {
    try {
      await CL_setValue(
        KEY_COMMENT_WALK.COUNT_COMMENT_WALK_POSTED_PER_BATCH,
        countComment
      );
    } catch (error) {
      logErrorContent("Error at CL_setCountCommentWalkPostedPerBatch: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi set s\u1ED1 l\u01B0\u1EE3ng b\xECnh lu\u1EADn \u0111\xE3 \u0111\u0103ng",
        en: error || "Error when setting number of comments posted"
      });
    }
  }
  async function CL_getCanCommentThisPost(url) {
    try {
      const response = await sendMessageWithResponse(
        KEY_CAN_COMMENT_WALK_THIS_POST,
        { url }
      );
      return response.data.can_comment_walk || false;
    } catch (error) {
      logErrorContent("Error at CL_getCanCommentThisPost: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i comment walk",
        en: error || "Error when setting comment walk status"
      });
      return false;
    }
  }
  async function CL_addUrlCommented(id, url) {
    try {
      await sendMessageWithResponse(KEY_ADD_URL_COMMENTED, { id, url });
    } catch (error) {
      logErrorContent("Error at CL_addUrlCommented: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi th\xEAm url b\xECnh lu\u1EADn",
        en: error || "Error when adding url commented"
      });
    }
  }
  async function CL_compeleteCommentWalkThisBatch() {
    try {
      await sendMessage(KEY_COMPLETED_COMMENT_WALK_THIS_BATCH);
    } catch (error) {
      logErrorContent("Error at CL_compeleteCommentWalkThisBatch: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi ho\xE0n th\xE0nh b\xECnh lu\u1EADn",
        en: error || "Error when completing comment"
      });
    }
  }
  async function CL_getIsDevMode() {
    try {
      const res = await sendMessageWithResponse(KEY_GET_KEY_SAVED, {
        key: KEY_IS_DEVELOPER_MODE
      });
      return res.data || false;
    } catch (error) {
      logErrorContent("Error at CL_getIsDevMode: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i dev mode",
        en: error || "Error when getting dev mode status"
      });
      return false;
    }
  }
  async function CL_getObjectCanPostThisTab() {
    try {
      const response = await sendMessageWithResponse(KEY_CAN_POST_THIS_TAB);
      return response.data;
    } catch (error) {
      logErrorContent("Error at CL_getObjectCanPostThisTab: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i \u0111\u0103ng b\xE0i",
        en: error || "Error when getting post status",
        type: "error"
      });
      return null;
    }
  }
  async function CL_updateLastTimeCommentWalk(time) {
    try {
      await sendMessageWithResponse(
        KEY_COMMENT_WALK_REQUEST.UPDATE_LAST_TIME_COMMENT,
        {
          time
        }
      );
    } catch (error) {
      logErrorContent("Error at CL_updateLastTimeCommentWalk: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi c\u1EADp nh\u1EADt th\u1EDDi gian b\xECnh lu\u1EADn",
        en: error || "Error when updating comment time",
        type: "error"
      });
    }
  }
  async function CL_getCommentWalkNeverCommented(ids, url) {
    try {
      const res = await sendMessageWithResponse(
        KEY_COMMENT_WALK_REQUEST.GET_COMMENT_WALK_NEVER_COMMENTED,
        {
          ids,
          url
        }
      );
      return res.data;
    } catch (error) {
      logErrorContent("Error at CL_getCommentWalkNeverCommented: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i b\xECnh lu\u1EADn",
        en: error || "Error when getting comment status",
        type: "error"
      });
      return null;
    }
  }
  async function CL_getStrictlyMatchTitleGroup() {
    try {
      const response = await sendMessageWithResponse(
        KEY_REQUEST_TO_BACKGROUND.GET_STRICTLY_MATCH_TITLE_GROUP
      );
      return response.data;
    } catch (error) {
      logErrorContent("Error at CL_getStrictlyMatchTitleGroup: ", error);
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi l\u1EA5y tr\u1EA1ng th\xE1i match title group",
        en: error || "Error when getting match title group status",
        type: "error"
      });
      return false;
    }
  }
  async function CL_checkMatchDataCommentWalkAtSearchPage(dataCommentWalk, contentPost, titlePost) {
    try {
      const response = await sendMessageWithResponse(
        KEY_REQUEST_TO_BACKGROUND.CHECK_DATA_COMMENT_WALK_MATCH_AT_SEARCH_PAGE,
        {
          dataCommentWalk,
          contentPost,
          titlePost
        }
      );
      return response.data;
    } catch (error) {
      logErrorContent(
        "Error at CL_checkMatchDataCommentWalkAtSearchPage: ",
        error
      );
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi ki\u1EC3m tra d\u1EEF li\u1EC7u comment walk",
        en: error || "Error when checking comment walk data",
        type: "error"
      });
      return false;
    }
  }
  async function CL_checkMultiMatchDataCommentWalkAtHomePage(listDataCommentWalk, contentPost, titlePost) {
    try {
      const response = await sendMessageWithResponse(
        KEY_REQUEST_TO_BACKGROUND.CHECK_MULTI_DATA_COMMENT_WALK_AT_HOME_PAGE,
        {
          listDataCommentWalk,
          contentPost,
          titlePost
        }
      );
      return response.data;
    } catch (error) {
      logErrorContent(
        "Error at CL_checkMultiMatchDataCommentWalkAtHomePage: ",
        error
      );
      CL_addLogRequest({
        vi: error || "L\u1ED7i khi ki\u1EC3m tra d\u1EEF li\u1EC7u comment walk",
        en: error || "Error when checking comment walk data",
        type: "error"
      });
      throw error;
    }
  }

  // content/helpers/dom.js
  function checkIsUseEvaluate(selector = "") {
    return selector.includes(`//`);
  }
  async function waitForElement(selector, anchorElement = document, time = 0) {
    if (time >= 50) {
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
      const el = anchorElem.querySelector(selector);
      if (el) return el;
    }
    return null;
  }
  function getIsExistDialog(label = "") {
    for (const selector of SELECTOR.dialog) {
      let newSelector = selector;
      if (label) {
        newSelector = selector + `[aria-label^="${label}"]`;
      }
      let dialog = document.querySelector(newSelector);
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
          const form = div.closest("form");
          return form;
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
          const input = await waitForElement(selector, div);
          if (input) return input;
        }
      }
      return null;
    } catch (error) {
      throw new Error("Error at findDivInputTextbox: " + error);
    }
  }
  async function checkDivInputTextboxIsEmpty() {
    try {
      const div = await findDivInputTextbox();
      return div ? div.textContent.trim() === "" : true;
    } catch (error) {
      throw new Error("Error at checkDivInputTextboxIsEmpty: " + error);
    }
  }
  async function findButtonPostAndClick() {
    try {
      const divContainer = await findDivCreatePostContainer();
      if (divContainer) {
        const lang = getLanguage();
        const selectors = lang === "vi" ? SELECTOR_VI.elementsPost : SELECTOR.elementsPost;
        for await (const selector of selectors) {
          const div = findElement(selector, divContainer);
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
    const selectorsDialog = SELECTOR.dialog;
    let isExistDialog = isExist;
    for (const selector of selectorsDialog) {
      const dialog = findElement(selector);
      if (dialog) {
        isExistDialog = true;
        break;
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
  async function mouseHoverElement(element, isDispatch = false) {
    await sleep(random(100, 500));
    await scrollElementIntoView(element);
    await sleep(random(100, 500));
    const overEvt = new MouseEvent("mouseover", {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(overEvt);
    await sleep(random(2, 4) * 200);
  }

  // content/helpers/post.js
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
        en: `Error when pasting content into the input box`,
        type: "error"
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
        let parses = await CL_getParseFileRequest(files);
        if (parses && Array.isArray(parses)) {
          for await (const item of parses) {
            const file = parseBase64ToFile(item);
            dt.items.add(file);
          }
          input.files = dt.files;
        }
        input.dispatchEvent(new Event("change", { bubbles: true }));
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch (e) {
      console.log(e);
      CL_addLogRequest({
        vi: `L\u1ED7i khi t\u1EA3i t\u1EC7p l\xEAn \xF4 nh\u1EADp: ${e?.message || e}`,
        en: `Error when uploading files to the input box: ${e?.message || e}`,
        type: "error"
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
      const timeDelay = await CL_getTimeDelayData();
      const timeClickToPost = timeDelay?.time_delay_click_to_post || initialTimeDelay.clickToPost;
      const timeFillContent = timeDelay?.time_delay_fill_content || initialTimeDelay.fillContent;
      const timeFillFile = timeDelay?.time_delay_fill_file || initialTimeDelay.fillFile;
      const timePost = timeDelay?.time_delay_post || initialTimeDelay.post;
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
            en: `Content input box not found, try again ${retryTime}`,
            type: "error"
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
            en: `Content input box not found, try again ${retryTime}`,
            type: "error"
          });
          const node2 = await findDivToPost();
          if (node2) {
            await eventClickElement(node2, true);
          }
        }
        if (!getIsExistDialog()) {
          throw new Error(
            getTextLanguageContent({
              vi: "\xD4 nh\u1EADp n\u1ED9i dung kh\xF4ng t\xECm th\u1EA5y, d\u1EEBng qu\xE1 tr\xECnh",
              en: "Content input box not found, stop process"
            })
          );
        }
        logContent(
          getTextLanguageContent({
            vi: "Nh\u1EADp n\u1ED9i dung \u0111\u0103ng b\xE0i...",
            en: "Filling content post to input..."
          })
        );
        await sleep(delayFillContent);
        task.status = STATUS_TASK.POSTING;
        sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });
        let content = contents[random(0, contents.length - 1)];
        if (checkContentIsEmpty(content)) {
          const text2 = await CL_getTextWithLang({
            viText: "N\u1ED9i dung trong b\u1ED9 d\u1EEF li\u1EC7u tr\u1ED1ng",
            enText: "Content in data group post is empty"
          });
          throw new Error(text2);
        }
        await pasteContent(content);
        logContent(
          getTextLanguageContent({
            vi: "\u0110ang t\u1EA3i \u1EA3nh v\xE0 nh\u1EADp...",
            en: "Uploading files and fill..."
          })
        );
        await sleep(delayFillFile);
        await fillFile(files);
        logContent(
          getTextLanguageContent({
            vi: "\u0110ang \u0111\u0103ng b\xE0i...",
            en: "Posting..."
          })
        );
        await sleep(delayPost);
        if (!isTest) {
          if (getIsExistDialog()) {
            const isProgress = await CL_getProgressTool();
            if (isProgress) {
              const checkFillContentSuccess = await checkDivInputTextboxIsEmpty();
              if (checkFillContentSuccess) {
                throw new Error(
                  getTextLanguageContent({
                    vi: "\xD4 nh\u1EADp n\u1ED9i dung kh\xF4ng t\xECm th\u1EA5y ho\u1EB7c n\u1ED9i dung kh\xF4ng \u0111\u01B0\u1EE3c t\u1EF1 \u0111\u1ED9ng \u0111i\u1EC1n",
                    en: "Content input box not found or content is not automatically filled"
                  })
                );
              }
              await findButtonPostAndClick();
              await updateLastTimePost(now());
            }
          } else {
            const text2 = getTextLanguageContent({
              vi: "Kh\xF4ng th\u1EC3 t\xECm \xF4 \u0111\u0103ng b\xE0i",
              en: "Not found content input box"
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
      const text = getTextLanguageContent({
        vi: "Kh\xF4ng t\xECm \u0111\u01B0\u1EE3c th\u1EBB click \u0111\u1EC3 t\u1EA1o \xF4 input",
        en: "Not found button to create input tag"
      });
      throw new Error(text);
    } catch (error) {
      CL_addLogRequest({
        vi: `L\u1ED7i khi \u0111\u0103ng b\xE0i trong nh\xF3m n\xE0y, ${error?.message || error}`,
        en: `Error when posting in this group, ${error?.message || error}`,
        type: "error"
      });
      task.status = STATUS_TASK.ERROR;
      sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });
      return false;
    }
  }
  async function simulateTyping(element, text, { minDelay = 30, maxDelay = 100 } = {}) {
    try {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      for (let char of text) {
        element.focus();
        if (char === "\n") {
          const enterLineEvt = new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            key: "Enter",
            code: "Enter",
            which: 13,
            ctrlKey: false,
            shiftKey: true,
            altKey: false,
            metaKey: false,
            repeat: false
          });
          element.dispatchEvent(enterLineEvt);
          const enterLineUpEvt = new KeyboardEvent("keyup", {
            bubbles: true,
            cancelable: true,
            key: "Enter",
            code: "Enter",
            which: 13,
            ctrlKey: false,
            shiftKey: true,
            altKey: false,
            metaKey: false,
            repeat: false
          });
          element.dispatchEvent(enterLineUpEvt);
          await sleep(random(1e3, 3e3));
          continue;
        }
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
      return true;
    } catch (error) {
      logErrorContent("Error when typing: ", error);
      return false;
    }
  }
  async function commentToJustPostedHelper() {
    try {
      const data = await CL_getMetadataComments();
      if (!data.is_active) {
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
        if (checkIsSpammed()) {
          break;
        }
        await sleep(1e3);
        ++cnt;
      }
      if (getIsExistDialog()) {
        CL_addLogRequest({
          vi: "Kh\xF4ng th\u1EC3 b\xECnh lu\u1EADn v\xE0o b\xE0i vi\u1EBFt v\u1EEBa \u0111\u0103ng, b\xE0i vi\u1EBFt v\u1EEBa \u0111\u0103ng kh\xF4ng th\xE0nh c\xF4ng",
          en: "Cannot comment on this post, the post may have failed"
        });
        return;
      }
      CL_addLogRequest({
        vi: `\u0110\xE3 quy\u1EBFt \u0111\u1ECBnh s\u1EBD b\xECnh lu\u1EADn b\xE0i vi\u1EBFt n\xE0y, s\u1ED1 b\xECnh lu\u1EADn ${data.max_comment_per_post}`,
        en: `Decided to comment on this post, number comment ${data.max_comment_per_post}`
      });
      await sleep(random(1e3, 4e3) + random(100, 1e3));
      const elementJustPosted = findElementJustPosted();
      const listContent = data.contents;
      async function typeAndSubmit(textBox, elementJustPosted2) {
        const content = listContent[random(0, listContent.length - 1)];
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
      }
      if (elementJustPosted) {
        const textBox = findTextBoxJustPosted(elementJustPosted);
        if (textBox) {
          await sleep(random(1, 2) * 1e3);
          textBox.scrollIntoView({ behavior: "smooth", block: "center" });
          await sleep(random(1, 5) * 1e3);
          textBox.focus();
          await sleep(random(1, 3) * 1e3);
          for (let i = 0; i < data.max_comment_per_post; i++) {
            await typeAndSubmit(textBox, elementJustPosted);
            await sleep(random(1e3, 2e3));
          }
        }
      }
      const timeClick = 3;
      const timeType = data.max_comment_per_post * 8;
      const timeCheckDialog = cnt * 1;
      const timeDelay = timeClick + timeType + timeCheckDialog;
      await CL_setTimeDelayForScheduler(timeDelay * 1e3);
    } catch (error) {
      CL_addLogRequest({
        vi: `L\u1ED7i khi b\xECnh lu\u1EADn v\xE0o b\xE0i vi\u1EBFt v\u1EEBa \u0111\u0103ng, ${error?.message || error}`,
        en: `Error when commenting on this post, ${error?.message || error}`
      });
    }
  }
  function checkContentIsEmpty(content) {
    return !content || !(typeof content === "string") || !content.trim().length || content === "<p></p>";
  }

  // content/helpers/comment-walk.js
  async function findDivResultSearch() {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.searchResults : SELECTOR.searchResults;
      for await (const selctor of selectors) {
        const div = await waitForElement(selctor);
        if (div) return div;
      }
      return null;
    } catch (error) {
      logErrorContent("error in findDivResultSearch", error);
      return null;
    }
  }
  async function findDivMain() {
    try {
      return await waitForElement('div[role="main"]');
    } catch (error) {
      logErrorContent("error in findDivMain", error);
      return null;
    }
  }
  function findDivFeedMainContainer(mainElement) {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.elementFeedPosts : SELECTOR.elementFeedPosts;
      for (const selector of selectors) {
        const div = findElement(selector, mainElement);
        if (div) return div.parentElement;
      }
      return null;
    } catch (error) {
      logErrorContent("error in findDivFeedMainContainer", error);
      return null;
    }
  }
  function findDivFeedFromSearchResult(divResult) {
    try {
      const selectors = SELECTOR_RAW.feed;
      for (const s of selectors) {
        const div = findElement(s, divResult);
        if (div) return div;
      }
      return null;
    } catch (error) {
      logErrorContent("error in getDivFeedFromSearchResult", error);
      return null;
    }
  }
  function findDivFeedFromMain(element) {
    try {
      const selector = ".//div[not(@dir) and .//div[@data-ad-rendering-role]]";
      const div = findElement(selector, element);
      return div;
    } catch (error) {
      logErrorContent("error in findDivFeedFromMain", error);
      return null;
    }
  }
  async function findDivItemFeedContent(divItemContainer) {
    try {
      const selectors = SELECTOR_RAW.itemFeedContents;
      for await (const s of selectors) {
        const div = await waitForElement(s, divItemContainer);
        if (div) return div;
      }
      return null;
    } catch (error) {
      logErrorContent("error in findDivItemFeedSearchReslutContent", error);
      return null;
    }
  }
  function findButtonShowMore(divItemContainer) {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.btnsShowMoreContentCommentWalk : SELECTOR.btnsShowMoreContentCommentWalk;
      for (const selector of selectors) {
        const btn = findElement(selector, divItemContainer);
        if (btn) return btn;
      }
      return null;
    } catch (error) {
      logErrorContent("error in findButtonShowMore", error);
      return null;
    }
  }
  function findButtonToPost(divItemContainer) {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.btnsWriteCommentInFeed : SELECTOR.btnsWriteCommentInFeed;
      for (const selector of selectors) {
        const btn = findElement(selector, divItemContainer);
        if (btn) return btn;
      }
      return null;
    } catch (error) {
      logErrorContent("error in findButtonToPost", error);
      return null;
    }
  }
  function findExistDialog() {
    try {
      const selectors = SELECTOR.dialog;
      for (const selector of selectors) {
        const dialog = findElement(selector);
        if (dialog) return dialog;
      }
      return null;
    } catch (error) {
      logErrorContent("error in findExistDialog", error);
      return null;
    }
  }
  async function findInputEditor(dialog) {
    try {
      if (!dialog) return null;
      const selectors = SELECTOR_RAW.textBoxToCommentInGroup;
      for (const selector of selectors) {
        const input = await waitForElement(selector, dialog);
        if (input) return input;
      }
      return null;
    } catch (error) {
      logErrorContent("error in findInputEditor", error);
      return null;
    }
  }
  function findBtnExitPageWhenExistDialog() {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.btnsExitPage : SELECTOR.btnsExitPage;
      for (const s of selectors) {
        const btn = findElement(s);
        if (btn) return btn;
      }
      return null;
    } catch (error) {
      logErrorContent("error in findBtnExitPageWhenExistDialog", error);
      return null;
    }
  }
  function findDivProfileName(divItemContainer) {
    try {
      const lang = getLanguage();
      const label = lang === "vi" ? "\u0111\xE3 \u0111\u0103ng trong" : "posted in";
      const selector = `.//div[@data-ad-rendering-role="profile_name" and not(contains(text(),'${label}'))]`;
      return findElement(selector, divItemContainer);
    } catch (error) {
      logErrorContent("error in findDivProfileName", error);
      return null;
    }
  }
  function findDivReloadPage() {
    try {
      return findElement('a[aria-label="Facebook"]');
    } catch (error) {
      logErrorContent("error in findDivReloadPage", error);
      return null;
    }
  }
  async function CL_commentWalkHelper(setting, commentWalk, listCommentWalk) {
    try {
      let checkArea = function() {
        const isHome = area === KEY_COMMENT_WALK_AREA.HOME;
        const isSearch = area === KEY_COMMENT_WALK_AREA.SEARCH_PAGE;
        return {
          isHome,
          isSearch
        };
      }, getListMatchCommentWalkHomePage = function(is_ai_help, {
        keywords_excludes = [],
        keywords_includes = [],
        keywords_certain = [],
        max_rate = 0,
        content_post = "",
        title_group = ""
      }) {
        const list = [];
        for (const comment of listCommentWalk) {
          let score = 0;
          const contentExcludeMatch = matchQueryKeywords(
            keywords_excludes,
            content_post
          );
          if (contentExcludeMatch.length) {
            continue;
          }
          const contentMatchs = matchQueryKeywords(
            keywords_includes,
            content_post
          );
          score += contentMatchs.length;
          const contentCertainChoiceMatch = matchQueryKeywords(
            keywords_certain,
            content_post
          );
          const profileNameCertainMatch = matchQueryKeywords(
            keywords_certain,
            title_group
          );
          if (is_ai_help) {
            if (contentCertainChoiceMatch.length || profileNameCertainMatch.length) {
              list.push(comment);
            }
          } else {
            score += contentCertainChoiceMatch.length * VALUE_RATE_MULTIPLY_FOR_KEYWORD_CERTAIN;
            if (!contentCertainChoiceMatch.length) {
              score += profileNameCertainMatch.length;
            }
            const isMatch = !!(contentMatchs.length >= max_rate + VALUE_RATE_ADD_FOR_HOME && (contentCertainChoiceMatch.length || profileNameCertainMatch.length));
            if (isMatch) {
              const match = Array.from(
                /* @__PURE__ */ new Set([
                  ...contentMatchs,
                  ...contentCertainChoiceMatch,
                  ...profileNameCertainMatch
                ])
              );
              list.push({
                id: comment.id,
                score,
                match
              });
            }
          }
        }
        return list;
      }, checkCanCommentInThisElement = function(element) {
        if (!(element instanceof HTMLElement)) {
          return false;
        }
        const hasRole = findElement("div[data-ad-rendering-role]", element);
        if (!hasRole) {
          return false;
        }
        return true;
      }, logExcludeKeywords = function(keywords = []) {
        logContent(
          getTextLanguageContent({
            en: "This post contains excluded keywords: " + keywords.join(", ") + ", skip it...",
            vi: "B\xE0i vi\u1EBFt n\xE0y ch\u1EE9a c\xE1c t\u1EEB kh\xF3a b\u1ECB lo\u1EA1i tr\u1EEB: " + keywords.join(", ") + ", b\u1ECF qua..."
          })
        );
      }, sleepHelper = function() {
        return {
          async fast() {
            await sleep(random(1e3, 2500));
          },
          async normal() {
            await sleep(random(2500, 5e3));
          },
          async slow() {
            await sleep(random(5500, 9e3));
          }
        };
      };
      const VALUE_RATE_ADD_FOR_HOME = 0;
      const VALUE_RATE_ADD_FOR_SEARCH_USE_AI = 1;
      const VALUE_RATE_MULTIPLY_FOR_KEYWORD_CERTAIN = 2;
      const isDevMode = await CL_getIsDevMode();
      const isTest = await CL_getIsTest();
      let flagDone = false;
      const max_comment = setting.max_comment_walk_per_batch;
      const content_query_includes_common = setting?.content_query_includes_common_comment_walk || [];
      const content_query_excludes_common = setting?.content_query_excludes_common_comment_walk || [];
      const max_rate_common = setting?.match_rate_value_content_query_includes_common_comment_walk || 0;
      const area = setting?.comment_walk_area;
      const keywords_certain_choice_common = setting?.keywords_certain_choice_comment_walk || [];
      const isSkipPostNotInGroup = setting?.is_skip_posts_not_in_group || false;
      const isCombineStrictlyTitleGroup = setting?.is_combine_strictly_title_group || false;
      const speed = setting?.comment_walk_speed;
      const isAIHelp = setting.is_ai_help_comment_walk;
      const strictlyMatchTitleGroup = await CL_getStrictlyMatchTitleGroup();
      async function getListMatchCommentWalkHomePageWithAIHelp(listComment, {
        keywords_excludes = [],
        keywords_includes = [],
        keywords_certain = [],
        max_rate = 0,
        content_post = "",
        title_group = ""
      }) {
        try {
          const listMatch = await CL_checkMultiMatchDataCommentWalkAtHomePage(
            listComment,
            content_post,
            title_group
          );
          if (listMatch && Array.isArray(listMatch) && listMatch.length)
            return listMatch;
          return [];
        } catch (error) {
          logErrorContent(
            "error in getListMatchCommentWalkHomePageWithAIHelp",
            error
          );
          return getListMatchCommentWalkHomePage(false, {
            keywords_excludes,
            keywords_includes,
            keywords_certain,
            max_rate,
            content_post,
            title_group
          });
        }
      }
      async function closeDialog() {
        await sleep(random(2e3, 4e3));
        await handleCloseIfExistDialog();
        await sleep(random(1500, 2500));
      }
      const sleepSpeedHelper = sleepHelper();
      async function calculateValueSleep(speed2 = KEY_COMMENT_WALK_SPEED.NORMAL) {
        let min = 2e3, max = 4e3;
        switch (speed2) {
          case KEY_COMMENT_WALK_SPEED.SLOW:
            return sleepSpeedHelper.slow();
          case KEY_COMMENT_WALK_SPEED.NORMAL:
            return sleepSpeedHelper.normal();
          case KEY_COMMENT_WALK_SPEED.FAST:
            return sleepSpeedHelper.fast();
          default:
            break;
        }
        await sleep(random(min, max));
      }
      const areaComment = checkArea();
      let countScroll = 0;
      const randomCountScrollHome = random(50, 70);
      const randomCountScrollSearch = random(20, 30);
      let maxCount = isDevMode ? 50 : areaComment.isHome ? randomCountScrollHome : randomCountScrollSearch;
      async function findDivFeed() {
        let divResult = null;
        if (areaComment.isHome) {
          const main2 = await findDivMain();
          divResult = findDivFeedMainContainer(main2);
        } else if (areaComment.isSearch) {
          divResult = await findDivResultSearch();
        }
        if (!divResult) {
          throw new Error("Not found div result search");
        }
        if (areaComment.isHome) {
          return findDivFeedFromMain(divResult);
        } else if (areaComment.isSearch) {
          return findDivFeedFromSearchResult(divResult);
        }
        return null;
      }
      let divFeed = await findDivFeed();
      if (!divFeed) {
        throw new Error("Not found div feed");
      }
      await sleepSpeedHelper.fast();
      let isStopTool = await CL_getStopTool();
      if (isStopTool) {
        await CL_setProcessingCommentWalk(false);
        if (!isDevMode) {
          await sleep(4e3);
          logContent(
            getTextLanguageContent({
              en: "Stop tool",
              vi: "D\u1EEBng c\xF4ng c\u1EE5"
            })
          );
          await CL_closeThisTab();
        }
        return;
      }
      let childs = divFeed.children;
      async function autoWalk(childs2, reloaded = false) {
        try {
          for await (const child of childs2) {
            let existedDialog = findExistDialog();
            if (existedDialog) {
              await closeDialog();
            }
            await sleepSpeedHelper.fast();
            if (!checkCanCommentInThisElement(child)) {
              continue;
            }
            countScroll++;
            if (isSkipPostNotInGroup) {
              const article = findElement('div[role="article"]', child);
              if (article) {
                logContent(
                  getTextLanguageContent({
                    en: "This post maybe is advertisement, skip it...",
                    vi: "B\xE0i vi\u1EBFt n\xE0y c\xF3 th\u1EC3 l\xE0 b\xE0i vi\u1EBFt \u0111\u01B0\u1EE3c qu\u1EA3ng c\xE1o, b\u1ECF qua..."
                  })
                );
                continue;
              }
            }
            let isSkipPost = false;
            const divProfileName = findDivProfileName(child);
            const contentProfileName = divProfileName?.textContent || "";
            const countComment = await CL_getCountCommentWalkPostedPerBatch();
            isStopTool = await CL_getStopTool();
            if (isStopTool) {
              await CL_setProcessingCommentWalk(false);
              logContent(
                getTextLanguageContent({
                  en: "Stop tool, closing tab after few seconds...",
                  vi: "D\u1EEBng c\xF4ng c\u1EE5, \u0111\xF3ng tab sau v\xE0i gi\xE2y..."
                })
              );
              if (!isDevMode) {
                await sleep(random(6e3, 9e3));
                await CL_compeleteCommentWalkThisBatch();
              }
              return;
            }
            if (areaComment.isHome) {
              if (!checkIsFacebookUrl(location.href)) {
                throw new Error("Not in correct page");
              }
            } else if (!checkIsSearchPageUrl(location.href) && !checkIsSearchPagePostUrl(location.href)) {
              throw new Error("Not in correct page");
            }
            logContent(
              `${getTextLanguageContent({ en: "Commenting: ", vi: "\u0110ang b\xECnh lu\u1EADn: " })}: ${countComment}/${max_comment}`
            );
            logContent(
              `${getTextLanguageContent({
                vi: `B\xE0i vi\u1EBFt b\u1ECF qua: ${countScroll}/${maxCount}`,
                en: `Number skipped posts: ${countScroll}/${maxCount}`
              })}`
            );
            if (countComment >= max_comment || countScroll >= maxCount) {
              if (countComment >= max_comment) {
                flagDone = true;
              }
              logContent(
                getTextLanguageContent({
                  en: "Max comment reached, close this tab after some seconds...",
                  vi: "\u0110\xE3 \u0111\u1EE7 s\u1ED1 b\xECnh lu\u1EADn, \u0111\xF3ng tab sau v\xE0i gi\xE2y..."
                })
              );
              await calculateValueSleep(speed);
              await CL_compeleteCommentWalkThisBatch();
              return;
            }
            if (countScroll >= maxCount / 2 && !reloaded && areaComment.isHome) {
              const reload = findDivReloadPage();
              if (reload) {
                const rd = randomRateBoolean(40);
                if (rd) {
                  reload.click();
                  await sleep(random(1e4, 15e3));
                  const newDivFeed = await findDivFeed();
                  if (newDivFeed) {
                    const newChilds = newDivFeed.children;
                    return await autoWalk(newChilds, true);
                  }
                }
              }
            }
            await calculateValueSleep(speed);
            await scrollElementIntoView(child);
            await calculateValueSleep(speed);
            const divButtonToPost = findButtonToPost(child);
            if (!divButtonToPost) {
              logContent(
                getTextLanguageContent({
                  en: "Not found button to open dialog",
                  vi: "Kh\xF4ng t\xECm th\u1EA5y n\xFAt \u0111\u1EC3 m\u1EDF h\u1ED9p tho\u1EA1i"
                })
              );
              continue;
            }
            await calculateValueSleep(speed);
            await scrollElementIntoView(divButtonToPost);
            await calculateValueSleep(speed);
            if (isSkipPostNotInGroup && !checkIsFeedItemInGroup(child)) {
              logContent(
                getTextLanguageContent({
                  vi: "B\xE0i vi\u1EBFt n\xE0y kh\xF4ng n\u1EB1m trong group, c\xF3 th\u1EC3 l\xE0 b\xE0i vi\u1EBFt c\u1EE7a ng\u01B0\u1EDDi d\xF9ng kh\xE1c, qu\u1EA3ng c\xE1o,...",
                  en: "This post is not in group, maybe is post of other user, ad,..."
                })
              );
              continue;
            }
            if (!checkPostIsFindRoom(child)) {
              logContent(
                getTextLanguageContent({
                  en: "This post is not find room, skip it...",
                  vi: "B\xE0i vi\u1EBFt n\xE0y kh\xF4ng ph\u1EA3i b\xE0i vi\u1EBFt t\xECm ph\xF2ng tr\u1ECD, b\u1ECF qua..."
                })
              );
              continue;
            }
            const divFeedContent = await findDivItemFeedContent(child);
            if (!divFeedContent) {
              logErrorContent("Not found div feed content, skip post");
              continue;
            }
            const matchContentNotShowMore = matchQueryKeywords(
              content_query_excludes_common,
              divFeedContent.textContent
            );
            if (matchContentNotShowMore.length) {
              logExcludeKeywords(matchContentNotShowMore);
              continue;
            }
            const btnShowMore = findButtonShowMore(child);
            if (btnShowMore) {
              btnShowMore.click();
              await calculateValueSleep(speed);
              await scrollElementIntoView(divButtonToPost);
              await calculateValueSleep(speed);
            }
            const contentDiv = getContentFromDivItemContent(divFeedContent);
            if (contentDiv.length >= 500) {
              logContent(
                getTextLanguageContent({
                  vi: `B\xE0i vi\u1EBFt n\u1ED9i dung qu\xE1 d\xE0i (${contentDiv.length} k\xFD t\u1EF1), b\u1ECF qua...`,
                  en: `Post content is too long (${contentDiv.length} characters), skip...`
                })
              );
              continue;
            }
            const contentNameAndDiv = contentProfileName + " " + contentDiv;
            if (!contentDiv || !contentDiv.trim()) {
              logErrorContent("Content div is empty, next post");
              continue;
            }
            if (isCombineStrictlyTitleGroup) {
              const titleMatchs = matchQueryKeywords(
                strictlyMatchTitleGroup,
                contentProfileName
              );
              if (!titleMatchs.length) {
                logContent(
                  getTextLanguageContent({
                    vi: "B\xE0i vi\u1EBFt n\xE0y kh\xF4ng ch\u1EE9a c\xE1c t\u1EEB kho\xE1 ph\xF9 h\u1EE3p trong t\xEAn, b\u1ECF qua...",
                    en: "This post does not contain keywords in the title, skip..."
                  })
                );
                continue;
              }
            }
            const listMatch = [];
            const keywordIncludeMatch = [];
            const keywordExcludeMatch = [];
            const keywordExcludeCommons = matchQueryKeywords(
              content_query_excludes_common,
              contentDiv
            );
            keywordExcludeMatch.push(...keywordExcludeCommons);
            if (keywordExcludeCommons.length) {
              logExcludeKeywords(keywordExcludeCommons);
              continue;
            }
            const keywordIncludeCommons = matchQueryKeywords(
              content_query_includes_common,
              contentDiv
            );
            keywordIncludeMatch.push(...keywordIncludeCommons);
            if (keywordIncludeCommons.length < max_rate_common) {
              if (areaComment.isHome) {
                let flag = false;
                for (const keyword of keywords_certain_choice_common) {
                  if (contentDiv.toLowerCase().includes(keyword.toLowerCase())) {
                    keywordIncludeMatch.push(keyword);
                    flag = true;
                    break;
                  }
                }
                if (!flag) {
                  isSkipPost = true;
                }
              } else {
                isSkipPost = true;
              }
            }
            if (!isSkipPost) {
              const keyword_query_exclude_comment_walk = commentWalk?.keyword_query_excludes || [];
              const keyword_query_include_comment_walk = commentWalk?.keyword_query_includes || [];
              const keyword_certain_choice = commentWalk?.keywords_certain_choice || [];
              let max_rate_comment_walk = Number(commentWalk?.match_rate_value_content_query_includes) || 0;
              if (areaComment.isSearch) {
                if (isAIHelp) {
                  max_rate_comment_walk += VALUE_RATE_ADD_FOR_SEARCH_USE_AI;
                }
                const keywordExcludeCommentWalkMatch = matchQueryKeywords(
                  keyword_query_exclude_comment_walk,
                  contentDiv
                );
                keywordExcludeMatch.push(...keywordExcludeCommentWalkMatch);
                if (keywordExcludeCommentWalkMatch.length) {
                  logExcludeKeywords(keywordExcludeCommentWalkMatch);
                  continue;
                }
                let score = 0;
                const keywordIncludeCommentWalkMatch = matchQueryKeywords(
                  keyword_query_include_comment_walk,
                  contentNameAndDiv
                );
                keywordIncludeMatch.push(...keywordIncludeCommentWalkMatch);
                const keywordCertainMatch = matchQueryKeywords(
                  keyword_certain_choice,
                  contentNameAndDiv
                );
                keywordIncludeMatch.push(...keywordCertainMatch);
                if (!keywordCertainMatch.length) {
                  logContent(
                    getTextLanguageContent({
                      vi: `B\xE0i vi\u1EBFt n\xE0y kh\xF4ng ch\u1EE9a t\u1EEB kh\xF3a b\u1EAFt bu\u1ED9c (\u0111\u1ECBa \u0111i\u1EC3m/khu v\u1EF1c), b\u1ECF qua...`,
                      en: `This post does not contain mandatory keywords (location/area), skip...`
                    })
                  );
                  continue;
                }
                score += keywordIncludeCommentWalkMatch.length;
                logContent(
                  getTextLanguageContent({
                    en: "Keyword Include: " + keywordIncludeMatch.join(", "),
                    vi: "T\u1EEB kh\xF3a bao g\u1ED3m: " + keywordIncludeMatch.join(", ")
                  })
                );
                logContent(
                  getTextLanguageContent({
                    en: `Rate: ${keywordIncludeCommons.length}/${max_rate_common}, Rate Comment Walk: ${score}/${max_rate_comment_walk}`,
                    vi: `T\u1EC9 l\u1EC7 chung: ${keywordIncludeCommons.length}/${max_rate_common}, T\u1EC9 l\u1EC7 d\u1EEF li\u1EC7u c\u1EE7a b\u1EA1n: ${score}/${max_rate_comment_walk}`
                  })
                );
                if (score < max_rate_comment_walk) {
                  if (isAIHelp) {
                    logContent(
                      getTextLanguageContent({
                        vi: "Do t\u1EC9 l\u1EC7 so kh\u1EDBp d\u1EEF li\u1EC7u kh\xF4ng ph\xF9 h\u1EE3p, \u0111ang ki\u1EC3m tra b\u1EB1ng AI...",
                        en: "Since the data matching rate is not suitable, checking by AI..."
                      })
                    );
                    const match = await CL_checkMatchDataCommentWalkAtSearchPage(
                      commentWalk,
                      contentDiv,
                      contentProfileName
                    );
                    logContent(
                      getTextLanguageContent({
                        en: "Result after AI check: " + (match ? "Match" : "Not Match"),
                        vi: "K\u1EBFt qu\u1EA3 sau khi nh\u1EDD AI ki\u1EC3m tra: " + (match ? "Ph\xF9 h\u1EE3p" : "Kh\xF4ng ph\xF9 h\u1EE3p")
                      })
                    );
                    if (!match) {
                      logContent(
                        getTextLanguageContent({
                          en: "Skip post because not match",
                          vi: "B\u1ECF qua b\xE0i vi\u1EBFt v\xEC kh\xF4ng ph\xF9 h\u1EE3p"
                        })
                      );
                      continue;
                    }
                  } else {
                    logContent(
                      getTextLanguageContent({
                        en: "Skip post because not suitable data matching rate",
                        vi: "B\u1ECF qua b\xE0i vi\u1EBFt v\xEC t\u1EC9 l\u1EC7 so kh\u1EDBp d\u1EEF li\u1EC7u kh\xF4ng ph\xF9 h\u1EE3p"
                      })
                    );
                    continue;
                  }
                }
              } else if (areaComment.isHome) {
                const list = getListMatchCommentWalkHomePage(isAIHelp, {
                  keywords_excludes: keyword_query_exclude_comment_walk,
                  keywords_includes: keyword_query_include_comment_walk,
                  keywords_certain: keyword_certain_choice,
                  content_post: contentDiv,
                  title_group: contentProfileName,
                  max_rate: max_rate_comment_walk
                });
                if (!list.length) {
                  logContent(
                    getTextLanguageContent({
                      en: "Skip post because not data comment match",
                      vi: "B\u1ECF qua b\xE0i vi\u1EBFt v\xEC kh\xF4ng c\xF3 d\u1EEF li\u1EC7u b\xECnh lu\u1EADn ph\xF9 h\u1EE3p"
                    })
                  );
                  continue;
                }
                if (isAIHelp) {
                  const listAIHelp = await getListMatchCommentWalkHomePageWithAIHelp(list, {
                    keywords_excludes: keyword_query_exclude_comment_walk,
                    keywords_includes: keyword_query_include_comment_walk,
                    keywords_certain: keyword_certain_choice,
                    max_rate: max_rate_comment_walk,
                    content_post: contentDiv,
                    title_group: contentProfileName
                  });
                  if (!listAIHelp || !listAIHelp.length) {
                    logContent(
                      getTextLanguageContent({
                        en: "Skip post because not data comment walk match",
                        vi: "B\u1ECF qua b\xE0i vi\u1EBFt v\xEC kh\xF4ng c\xF3 d\u1EEF li\u1EC7u b\xECnh lu\u1EADn d\u1EA1o ph\xF9 h\u1EE3p"
                      })
                    );
                    continue;
                  }
                  listMatch.push(...listAIHelp);
                } else {
                  listMatch.push(...list);
                }
              }
            }
            if (isSkipPost) {
              logContent(
                getTextLanguageContent({
                  en: "Keyword Exclude: " + keywordExcludeMatch.join(", "),
                  vi: "T\u1EEB kh\xF3a lo\u1EA1i tr\u1EEB: " + keywordExcludeMatch.join(", ")
                })
              );
              logContent(
                getTextLanguageContent({
                  en: "Skip post because not keyword match",
                  vi: "B\u1ECF qua b\xE0i vi\u1EBFt v\xEC kh\xF4ng \u0111\xFAng t\u1EEB kh\xF3a"
                })
              );
              continue;
            } else {
              if (areaComment.isSearch) {
                countScroll = 0;
              }
            }
            await calculateValueSleep(speed);
            divButtonToPost.click();
            await calculateValueSleep(speed);
            if (areaComment.isHome) {
              if (listMatch.length) {
                const listId = listMatch.sort((a, b) => b.score - a.score).map((i) => i.id);
                const commentWalkNeverComment = await CL_getCommentWalkNeverCommented(listId, location.href);
                if (commentWalkNeverComment) {
                  commentWalk = commentWalkNeverComment;
                  const matchOfPost = listMatch.find(
                    (i) => i.id === commentWalkNeverComment.id
                  );
                  logContent(
                    getTextLanguageContent({
                      en: "Keyword match: " + matchOfPost.match.join(", "),
                      vi: "T\u1EEB kh\xF3a kh\u1EDBp: " + matchOfPost.match.join(", ")
                    })
                  );
                  logContent(
                    getTextLanguageContent({
                      en: "Score match: " + matchOfPost.rate,
                      vi: "T\u1EF7 l\u1EC7 kh\u1EDBp: " + matchOfPost.rate
                    })
                  );
                  logContent(
                    getTextLanguageContent({
                      en: "Data match for post: " + commentWalkNeverComment.name,
                      vi: "D\u1EEF li\u1EC7u kh\u1EDBp cho b\xE0i vi\u1EBFt: " + commentWalkNeverComment.name
                    })
                  );
                } else {
                  logContent(
                    getTextLanguageContent({
                      en: "Skip post because you already commented on post",
                      vi: "B\u1ECF qua b\xE0i vi\u1EBFt v\xEC b\u1EA1n \u0111\xE3 b\xECnh lu\u1EADn v\xE0o b\xE0i vi\u1EBFt n\xE0y r\u1ED3i"
                    })
                  );
                  await closeDialog();
                  continue;
                }
              }
            }
            const dialog = findExistDialog();
            const inputEditor = await findInputEditor(dialog);
            if (!dialog || !inputEditor) {
              await sleep(2e3);
              logContent(
                getTextLanguageContent({
                  en: "Not found dialog or input editor",
                  vi: "Kh\xF4ng t\xECm th\u1EA5y h\u1ED9p tho\u1EA1i ho\u1EB7c tr\xECnh so\u1EA1n th\u1EA3o"
                })
              );
              await handleCloseIfExistDialog();
              continue;
            }
            const href = location.href;
            if (areaComment.isSearch) {
              const canComment = await CL_getCanCommentThisPost(href);
              if (!canComment) {
                logContent(
                  getTextLanguageContent({
                    en: "This post maybe can not comment because you already commented",
                    vi: "B\xE0i vi\u1EBFt n\xE0y c\xF3 th\u1EC3 kh\xF4ng b\xECnh lu\u1EADn \u0111\u01B0\u1EE3c v\xEC b\u1EA1n \u0111\xE3 b\xECnh lu\u1EADn r\u1ED3i"
                  })
                );
                await calculateValueSleep(speed);
                await handleCloseIfExistDialog();
                await calculateValueSleep(speed);
                continue;
              }
            }
            if (!checkContentInputEmpty(inputEditor)) {
              logContent(
                getTextLanguageContent({
                  en: "Input content is not empty, clear it...",
                  vi: "N\u1ED9i dung b\xECnh lu\u1EADn kh\xF4ng r\u1ED7ng, x\xF3a n\u1ED9i dung..."
                })
              );
              await clearContentFromInputEditor(inputEditor);
              await calculateValueSleep(speed);
              await clearFileFromInput(dialog);
              await calculateValueSleep(speed);
            }
            logContent(
              getTextLanguageContent({
                en: "Filling content...",
                vi: "\u0110ang nh\u1EADp n\u1ED9i dung..."
              })
            );
            const content = commentWalk?.contents?.[random(0, commentWalk.contents.length - 1)];
            if (content) {
              await calculateValueSleep(speed);
              const success = await simulateTyping(inputEditor, content, {
                minDelay: setting.time_delay_fill_content_comment_walk_min,
                maxDelay: setting.time_delay_fill_content_comment_walk_max
              });
              if (!success) {
                logContent(
                  getTextLanguageContent({
                    en: "Failed to fill content, clear it...",
                    vi: "Nh\u1EADp n\u1ED9i dung th\u1EA5t b\u1EA1i, x\xF3a n\u1ED9i dung..."
                  })
                );
                await clearContentFromInputEditor(inputEditor);
                await calculateValueSleep(speed);
                await clearFileFromInput(dialog);
                await calculateValueSleep(speed);
                logContent(
                  getTextLanguageContent({
                    en: "Close dialog...",
                    vi: "\u0110ang \u0111\xF3ng h\u1ED9p tho\u1EA1i"
                  })
                );
                await closeDialog();
                continue;
              }
              await sleepSpeedHelper.fast();
            }
            logContent(
              getTextLanguageContent({
                en: "Filling file...",
                vi: "\u0110ang t\u1EA3i file"
              })
            );
            const files = commentWalk.files;
            const parses = await CL_getParseFileRequest(files);
            if (parses && parses.length) {
              const parseRandom = parses[random(0, parses.length - 1)];
              await sleep(setting.time_delay_fill_file_comment_walk * 1e3);
              const fileParse = parseBase64ToFile(parseRandom);
              const dt = new DataTransfer();
              dt.items.add(fileParse);
              const pasteEvent = new ClipboardEvent("paste", {
                bubbles: true,
                cancelable: true,
                clipboardData: dt
              });
              inputEditor.dispatchEvent(pasteEvent);
              await sleep(
                setting.time_delay_fill_file_comment_walk * 1e3 + random(1e3, 2e3)
              );
            }
            logContent(
              getTextLanguageContent({
                en: "Submitting...",
                vi: "\u0110ang g\u1EEDi..."
              })
            );
            await calculateValueSleep(speed);
            if (!isTest) {
              await handleSubmitComment(inputEditor);
              await sleep((setting.time_delay_submit_comment_walk + 1) * 1e3);
            }
            if (!checkContentInputEmpty(inputEditor)) {
              if (!isTest) {
                logContent(
                  getTextLanguageContent({
                    en: "Input content is not empty, can not submit or submit failure, clear it...",
                    vi: "N\u1ED9i dung b\xECnh lu\u1EADn kh\xF4ng r\u1ED7ng, kh\xF4ng th\u1EC3 g\u1EEDi ho\u1EB7c g\u1EEDi th\u1EA5t b\u1EA1i, x\xF3a n\xF3..."
                  })
                );
                CL_addLogRequest({
                  vi: "B\xECnh lu\u1EADn th\u1EA5t b\u1EA1i v\xE0o b\xE0i vi\u1EBFt: " + href,
                  en: "Commented failure in this post: " + href
                });
              } else {
                logContent(
                  getTextLanguageContent({
                    en: "Test mode, skipping submit action...",
                    vi: "\u0110ang test, b\u1ECF qua h\xE0nh \u0111\u1ED9ng g\u1EEDi..."
                  })
                );
              }
              await clearContentFromInputEditor(inputEditor);
              await calculateValueSleep(speed);
              await clearFileFromInput(dialog);
              await calculateValueSleep(speed);
            } else {
              CL_addLogRequest({
                vi: "\u0110\xE3 b\xECnh lu\u1EADn th\xE0nh c\xF4ng v\xE0o b\xE0i vi\u1EBFt: " + href,
                en: "Commented successfully on post: " + href
              });
              await CL_updateLastTimeCommentWalk(Date.now());
            }
            logContent(
              getTextLanguageContent({
                en: "Closing dialog...",
                vi: "\u0110ang \u0111\xF3ng h\u1ED9p tho\u1EA1i"
              })
            );
            await calculateValueSleep(speed);
            await closeDialog();
            await CL_setCountCommentWalkPostedPerBatch(countComment + 1);
            await calculateValueSleep(speed);
            if (!isTest) {
              await CL_addUrlCommented(commentWalk.id, href);
            }
          }
        } catch (error) {
          throw error;
        }
      }
      await autoWalk(childs, false);
      if (!flagDone) {
        logContent(
          getTextLanguageContent({
            vi: "\u0110\u1EE3t b\xECnh lu\u1EADn \u0111\xE3 k\u1EBFt th\xFAc, tab n\xE0y s\u1EBD \u0111\xF3ng sau v\xE0i gi\xE2y",
            en: "This batch comment has ended, this tab will be closed after a few seconds"
          })
        );
        await sleep(random(3e3, 5e3));
        await CL_compeleteCommentWalkThisBatch();
      }
    } catch (error) {
      CL_addLogRequest({
        vi: "L\u1ED7i khi b\xECnh lu\u1EADn v\xE0o b\xE0i vi\u1EBFt, " + error?.message || error,
        en: "Error when commenting on post, " + error?.message || error,
        type: "error"
      });
      logContent("This tab maybe will be closed after some seconds...");
      await sleep(random(8e3, 12e3));
      await CL_compeleteCommentWalkThisBatch();
    }
  }
  function checkPostIsFindRoom(divItemFeed) {
    try {
      if (!divItemFeed) return false;
      const listLinks = divItemFeed.querySelectorAll("a[href]");
      if (!listLinks || !listLinks.length) return true;
      let cnt = 0;
      for (let link of listLinks) {
        const href = link.getAttribute("href");
        if (href && href.includes("/photo/")) {
          ++cnt;
          if (cnt >= 2) break;
        }
      }
      return cnt <= 1;
    } catch (error) {
      logErrorContent("error in checkPostIsFindRoom", error);
      return false;
    }
  }
  function getContentFromDivItemContent(divItemContent) {
    try {
      if (!divItemContent) {
        return "";
      }
      const hidden = divItemContent.querySelector('div[aria-hidden="true"]');
      if (hidden) {
        const content = hidden.textContent;
        if (content && content.length && content.trim().length) return content;
      }
      return divItemContent.textContent || "";
    } catch (error) {
      logErrorContent("error in getContentFromDivItemContent", error);
      return "";
    }
  }
  async function handleCloseIfExistDialog() {
    try {
      let dialog = findExistDialog();
      if (dialog) {
        clickOutSideHideDialog();
        await sleep(random(2e3, 4e3));
        dialog = findExistDialog();
        if (dialog) {
          await sleep(random(2e3, 4e3));
          logContent("dialog existed, force close");
          const btnExitPage = findBtnExitPageWhenExistDialog();
          if (btnExitPage) {
            await mouseHoverElement(btnExitPage);
            await sleep(random(1500, 2500));
            btnExitPage.click();
            await sleep(random(1500, 3e3));
          }
        }
      }
    } catch (error) {
      logErrorContent("error in handleCloseIfExistDialog", error);
    }
  }
  async function handleSubmitComment(element, type = 1) {
    try {
      if (type === 2) {
        const lang = getLanguage();
        const selectors = lang === "vi" ? SELECTOR_VI.buttonSubmitCommentInGroup : SELECTOR.buttonSubmitCommentInGroup;
        for (const selector of selectors) {
          const btnSubmit = findElement(selector);
          if (btnSubmit) {
            await mouseHoverElement(btnSubmit);
            await sleep(random(500, 1500));
            btnSubmit.click();
            await sleep(random(1e3, 2e3));
            return;
          }
        }
      }
      const evtEnterKeyDown = new KeyboardEvent("keydown", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      const evtEnterKeyUp = new KeyboardEvent("keyup", {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true
      });
      element.dispatchEvent(evtEnterKeyDown);
      element.dispatchEvent(evtEnterKeyUp);
    } catch (error) {
      logErrorContent("error in handleSubmitComment", error);
    }
  }
  function checkContentInputEmpty(element) {
    try {
      if (!element) return false;
      return element?.textContent.trim() === "";
    } catch (error) {
      logErrorContent("error in checkContentInputEmpty", error);
      return false;
    }
  }
  function checkIsFeedItemInGroup(container2) {
    try {
      if (!container2) return false;
      const div = findElement('.//a[contains(@href, "group")]', container2);
      return !!div;
    } catch (error) {
      logErrorContent("error in checkIsFeedItemInGroup", error);
      return false;
    }
  }
  async function clearContentFromInputEditor(input) {
    try {
      if (!input) return;
      input.focus();
      const evtCtrlA = new KeyboardEvent("keydown", {
        key: "a",
        code: "KeyA",
        keyCode: 65,
        which: 65,
        ctrlKey: true,
        bubbles: true
      });
      const evtCtrlADelete = new KeyboardEvent("keydown", {
        key: "Delete",
        code: "Delete",
        keyCode: 46,
        which: 46,
        ctrlKey: true,
        bubbles: true
      });
      const evtCtrlAKeyUp = new KeyboardEvent("keyup", {
        key: "a",
        code: "KeyA",
        keyCode: 65,
        which: 65,
        ctrlKey: true,
        bubbles: true
      });
      const evtCtrlADeleteKeyUp = new KeyboardEvent("keyup", {
        key: "Delete",
        code: "Delete",
        keyCode: 46,
        which: 46,
        ctrlKey: true,
        bubbles: true
      });
      input.dispatchEvent(evtCtrlA);
      await sleep(random(500, 1e3));
      input.dispatchEvent(evtCtrlAKeyUp);
      await sleep(random(1e3, 2e3));
      input.dispatchEvent(evtCtrlADelete);
      await sleep(random(500, 1e3));
      input.dispatchEvent(evtCtrlADeleteKeyUp);
    } catch (error) {
      logErrorContent("error in clearContentFromInputEditor", error);
    }
  }
  async function clearFileFromInput(container2) {
    try {
      const lang = getLanguage();
      const selectors = lang === "vi" ? SELECTOR_VI.btnsRemoveImage : SELECTOR.btnsRemoveImage;
      for (const selector of selectors) {
        const btn = findElement(selector, container2);
        if (btn) {
          await mouseHoverElement(btn);
          await sleep(random(500, 1500));
          btn.click();
          await sleep(random(1e3, 2e3));
        }
      }
    } catch (error) {
      logErrorContent("error in clearFileFromInput", error);
    }
  }

  // content/helpers/groups.js
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
        en: `Error when getting list groups of user, ${e?.message || e}`,
        type: "error"
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
          logContent(
            getTextLanguageContent({
              vi: "Ti\u1EC7n \xEDch \u0111\xE3 t\u1EAFt -> t\u1EA1m d\u1EEBng l\u1EA5y danh s\xE1ch nh\xF3m",
              en: "Stop tool -> pause getting list groups"
            })
          );
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
        logContent(
          getTextLanguageContent({
            vi: `\u0110ang cu\u1ED9n danh s\xE1ch nh\xF3m: ${currentGroup}/${maxGroup}`,
            en: `Scrolling list groups: ${currentGroup}/${maxGroup}`
          })
        );
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
      const canInteract = metadataInteractBeforePost?.can_interact || false;
      const maxPost = metadataInteractBeforePost?.max_post_interact_per_batch || 0;
      if (!canInteract) {
        return;
      }
      CL_addLogRequest({
        vi: "B\u1EAFt \u0111\u1EA7u th\u1EF1c hi\u1EC7n t\xE1c v\u1EE5 t\u01B0\u01A1ng t\xE1c b\xE0i vi\u1EBFt tr\u01B0\u1EDBc khi \u0111\u0103ng",
        en: "Started performing the task of interacting with posts before posting"
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
          vi: `S\u1ED1 b\xE0i vi\u1EBFt c\u1EA7n t\u01B0\u01A1ng t\xE1c trong \u0111\u1EE3t n\xE0y: ${arrayDivNeedReact.length}`,
          en: `Number of posts to interact in this batch: ${arrayDivNeedReact.length}`
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
          vi: `T\xE1c v\u1EE5 t\u01B0\u01A1ng t\xE1c \u0111\xE3 \u0111\u01B0\u1EE3c ho\xE0n th\xE0nh, ti\u1EBFp t\u1EE5c th\u1EF1c hi\u1EC7n \u0111\u0103ng b\xE0i`,
          en: `The interaction task has been completed, continuing to post`
        });
        await CL_setDecidedInteractBeforePost(false);
      }
    } catch (error) {
      logError("Error at interactBeforePost: ", error);
      CL_addLogRequest({
        vi: `L\u1ED7i khi t\u01B0\u01A1ng t\xE1c tr\u01B0\u1EDBc khi \u0111\u0103ng b\xE0i, ${error?.message || error}`,
        en: `Error when interacting before posting, ${error?.message || error}`,
        type: "error"
      });
    }
  }

  // content/content-src.js
  async function main() {
    try {
      console.log("content script is running...");
      const href = location.href;
      if (!checkIsFacebookUrl(href)) {
        return;
      }
      notificationContainer({});
      const isDevMode = await CL_getIsDevMode();
      if (isDevMode) {
        await initWithMyTool();
      }
      if (getIsMatchUrl(URL_LIST_GROUPS)) {
        const isGetList = await CL_getValue(KEY_IS_SCROLL_DETECT_LIST_GROUP);
        if (isGetList) {
          await initWithMyTool();
          await sleep(2e3);
          CL_addLogRequest({
            vi: `B\u1EAFt \u0111\u1EA7u l\u1EA5y danh s\xE1ch nh\xF3m...`,
            en: `Start getting list groups...`
          });
          await sleep(4e3);
          const allGroups = await getListGroups();
          await CL_setValue(KEY_ALL_GROUPS, allGroups);
          await CL_setValue(KEY_IS_SCROLL_DETECT_LIST_GROUP, false);
          logContent(
            getTextLanguageContent({
              vi: "\u0110\xE3 l\u1EA5y xong danh s\xE1ch nh\xF3m, tab n\xE0y s\u1EBD \u0111\xF3ng sau v\xE0i gi\xE2y",
              en: "List groups have been taken, this tab will close after a few seconds"
            })
          );
          await sleep(random(3e3, 5e3));
          sendMessage(KEY_CLOSE_THIS_TAB, {});
        }
        return;
      }
      if (getIsCorrectPostURL(href)) {
        try {
          const isProgress = await CL_getProgressTool();
          if (!isProgress) {
            logContent("TOOL IS NOT PROGRESS");
            return;
          }
          const object = await CL_getObjectCanPostThisTab();
          logContent("Response can post this tab", object);
          const canPost = object.can_post;
          if (canPost) {
            await initWithMyTool();
            await sleep(2e3);
            const task = object.data;
            await interactBeforePost();
            CL_addLogRequest({
              vi: `B\u1EAFt \u0111\u1EA7u \u0111\u0103ng b\xE0i trong nh\xF3m ${task?.id_href}`,
              en: `Start posting in group ${task?.id_href}`
            });
            const isSuccess = await postHelper(task);
            if (isSuccess) {
              await commentToJustPostedHelper();
            }
            const timeDelay = await CL_getTimeDelayData();
            const timeDelayNext = timeDelay.openNewTab % 2 === 0 ? timeDelay.openNewTab / 2 : (timeDelay.openNewTab + 1) / 2;
            await sleep(timeDelayNext * 1e3 + random(500, 2e3));
            sendMessage(KEY_NEXT_POST_GROUP, {});
            const isTest = await CL_getValue(KEY_IS_TEST, false);
            if (isTest) {
              logContent(
                getTextLanguageContent({
                  vi: "\u0110ang test, tab s\u1EBD \u0111\xF3ng sau 15s",
                  en: "Is test, tab will close after 15s"
                })
              );
              setTimeout(() => {
                sendMessage(KEY_CLOSE_THIS_TAB, {});
              }, 15 * 1e3);
            } else {
              const closeDelay = random(35, 55);
              logContent(
                getTextLanguageContent({
                  vi: `C\xF4ng vi\u1EC7c \u0111\xE3 ho\xE0n th\xE0nh, tab n\xE0y s\u1EBD \u0111\xF3ng sau ${closeDelay}s`,
                  en: `Task completed, this tab will close after ${closeDelay}s`
                })
              );
              setTimeout(() => {
                sendMessage(KEY_CLOSE_THIS_TAB, {});
              }, closeDelay * 1e3);
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
          logErrorContent("Error at content posting main: ", error);
        }
        return;
      }
      if (checkIsSearchPageUrl(href) || checkIsSearchPagePostUrl(href) || checkIsFacebookUrl(href)) {
        await sleep(4e3);
        const response = await CL_getCanCommentWalkThisTab();
        if (!response) return;
        await initWithMyTool();
        await sleep(2e3);
        const textLang = {
          vi: `B\u1EAFt \u0111\u1EA7u \u0111\u1EE3t b\xECnh lu\u1EADn d\u1EA1o...`,
          en: `Start comment walk...`
        };
        logContent(getTextLanguageContent(textLang));
        const metadataCommentWalk = await CL_getAllMetadataCommentWalk();
        const setting = metadataCommentWalk.setting;
        const commentWalk = metadataCommentWalk.comment_walk;
        const listCommentWalk = metadataCommentWalk.list_comment_walk;
        if (setting.comment_walk_area === KEY_COMMENT_WALK_AREA.SEARCH_PAGE) {
          logContent(
            getTextLanguageContent({
              vi: `D\u1EEF li\u1EC7u b\xECnh lu\u1EADn \u0111\u1EE3t n\xE0y: ${commentWalk?.name || commentWalk.title}`,
              en: `Comment data for this batch: ${commentWalk?.name || commentWalk.title}`
            })
          );
        }
        if (setting.comment_walk_area === KEY_COMMENT_WALK_AREA.HOME) {
          logContent(
            getTextLanguageContent({
              vi: `Khu v\u1EF1c b\xECnh lu\u1EADn l\xE0 trang ch\u1EE7, d\u1EEF li\u1EC7u s\u1EBD \u0111\u01B0\u1EE3c ch\u1ECDn ph\xF9 h\u1EE3p v\u1EDBi c\xE1c b\xE0i vi\u1EBFt`,
              en: `Comment walk area is your feed, data will be selected appropriately for posts`
            })
          );
        }
        await CL_commentWalkHelper(setting, commentWalk, listCommentWalk);
        return;
      }
    } catch (error) {
      logErrorContent("Error at content main: ", error);
    }
  }
  async function initWithMyTool() {
    try {
      createPanelLogContent(document.body);
      await initLanguageWithTool();
    } catch (error) {
      logError("Error at content initWithMyTool: ", error);
    }
  }
  main();
})();
