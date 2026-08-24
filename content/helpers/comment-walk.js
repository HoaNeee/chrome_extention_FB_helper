import {
  checkIsSearchPagePostUrl,
  checkIsSearchPageUrl,
  cvStringHigher,
  getLanguage,
  parseBase64ToFile,
  random,
  sleep,
} from "../../utils/utils";
import { SELECTOR, SELECTOR_RAW, SELECTOR_VI } from "../contants/contants";
import { getTextLanguageContent } from "../utils/global";
import { CL_addLogRequest, CL_closeThisTab } from "../utils/request";
import {
  CL_addUrlCommented,
  CL_compeleteCommentWalkThisBatch,
  CL_getCanCommentThisPost,
  CL_getCountCommentWalkPostedPerBatch,
  CL_getIsDevMode,
  CL_getIsTest,
  CL_getStopTool,
  CL_setCountCommentWalkPostedPerBatch,
  CL_setProcessingCommentWalk,
  CL_updateLastTimeCommentWalk,
} from "../utils/storage";
import {
  CL_getParseFileRequest,
  logContent,
  logErrorContent,
} from "../utils/utils";
import {
  clickOutSideHideDialog,
  findElement,
  getIsExistDialog,
  mouseHoverElement,
  scrollElementIntoView,
  waitForElement,
} from "./dom";
import { simulateTyping } from "./post";

/**
 * @typedef {import('../../services/comment-walk-service').CommentWalkType} CommentWalkType
 */

/**
 * @typedef {import('../../services/comment-walk-service').CommentWalkSetting} CommentWalkSetting
 */

async function findDivResultSearch() {
  try {
    const lang = getLanguage();
    const selectors =
      lang === "vi" ? SELECTOR_VI.searchResults : SELECTOR.searchResults;

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

async function findDivItemFeedSearchResultContent(divItemContainer) {
  try {
    const selectors = SELECTOR_RAW.itemFeedSearchResults;
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

function findDivItemPreview(divItemContainer) {
  try {
    const selectors = SELECTOR_RAW.itemFeedSearchResultPreviewContents;
    for (const s of selectors) {
      const div = findElement(s, divItemContainer);
      if (div) return div;
    }
    return null;
  } catch (error) {
    logErrorContent("error in findDivItemPreview", error);
    return null;
  }
}

function findButtonShowMore(divItemContainer) {
  try {
    const lang = getLanguage();
    const selectors =
      lang === "vi"
        ? SELECTOR_VI.btnsShowMoreContentCommentWalk
        : SELECTOR.btnsShowMoreContentCommentWalk;

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
    const selectors =
      lang === "vi"
        ? SELECTOR_VI.btnsWriteCommentInFeed
        : SELECTOR.btnsWriteCommentInFeed;

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
    const selectors =
      lang === "vi" ? SELECTOR_VI.btnsExitPage : SELECTOR.btnsExitPage;
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
    const selector = 'div[data-ad-rendering-role="profile_name"]';
    return findElement(selector, divItemContainer);
  } catch (error) {
    logErrorContent("error in findDivProfileName", error);
    return null;
  }
}

/**
 * @param {CommentWalkSetting} setting
 * @param {CommentWalk} commentWalk
 */
async function CL_commentWalkHelper(setting, commentWalk) {
  try {
    const divResult = await findDivResultSearch();
    let countScroll = 0;
    let maxCount = 20;

    const isDevMode = await CL_getIsDevMode();
    const isTest = await CL_getIsTest();

    if (!divResult) {
      throw new Error("Not found div result search");
    }

    const divFeed = findDivFeedFromSearchResult(divResult);

    if (!divFeed) {
      throw new Error("Not found div feed");
    }

    await sleep(random(2000, 4000));

    const childs = divFeed.children;

    const max_comment = setting.max_comment_walk_per_batch;
    const content_query_includes_common =
      setting?.content_query_includes_common_comment_walk || [];
    const content_query_excludes_common =
      setting?.content_query_excludes_common_comment_walk || [];
    const keyword_query_include_comment_walk =
      commentWalk?.keyword_query_includes || [];
    const keyword_query_exclude_comment_walk =
      commentWalk?.keyword_query_excludes || [];
    const max_rate_common =
      setting?.match_rate_value_content_query_includes_common_comment_walk || 0;
    const max_rate_comment_walk =
      commentWalk?.match_rate_value_content_query_includes || 0;

    let isStopTool = await CL_getStopTool();
    if (isStopTool) {
      await CL_setProcessingCommentWalk(false);
      if (!isDevMode) {
        await sleep(4000);
        logContent(
          getTextLanguageContent({
            en: "Stop tool",
            vi: "Dừng công cụ",
          }),
        );
        await CL_closeThisTab();
      }
      return;
    }

    for await (const child of childs) {
      countScroll++;

      const article = findElement('div[role="article"]', child);

      if (article) {
        logContent(
          getTextLanguageContent({
            en: "This post maybe is advertisement, skip it...",
            vi: "Bài viết này có thể là bài viết được quảng cáo, bỏ qua...",
          }),
        );
        continue;
      }

      let isSkipPost = false;

      const divProfileName = findDivProfileName(child);
      const contentProfileName = divProfileName?.textContent || "";
      // logContent("Content profile name: " + contentProfileName);

      const countComment = await CL_getCountCommentWalkPostedPerBatch();

      isStopTool = await CL_getStopTool();
      if (isStopTool) {
        await CL_setProcessingCommentWalk(false);
        if (!isDevMode) {
          await sleep(2000);
          await CL_compeleteCommentWalkThisBatch();
        }
        return;
      }

      if (
        !checkIsSearchPageUrl(location.href) &&
        !checkIsSearchPagePostUrl(location.href)
      ) {
        throw new Error("Not in search page");
      }

      logContent(
        `${getTextLanguageContent({ en: "Commenting: ", vi: "Đang bình luận: " })}: ${countComment}/${max_comment}`,
      );

      logContent(
        `${getTextLanguageContent({
          vi: `Bài viết bỏ qua: ${countScroll}/${maxCount}`,
          en: `Number skipped posts: ${countScroll}/${maxCount}`,
        })}`,
      );

      if (countComment >= max_comment || countScroll >= maxCount) {
        logContent(
          getTextLanguageContent({
            en: "Max comment reached, close this tab after some seconds...",
            vi: "Đã đủ số bình luận, đóng tab sau vài giây...",
          }),
        );
        await sleep(random(4000, 6000));
        await CL_compeleteCommentWalkThisBatch();
        return;
      }

      await sleep(random(1000, 1500));
      scrollElementIntoView(child);
      await sleep(random(2000, 3000));

      const divFeedContent = await findDivItemFeedSearchResultContent(child);
      const divPreview = findDivItemPreview(child);

      if (!divFeedContent) {
        logErrorContent("Not found div feed content, skip post");
        continue;
      }

      if (divPreview) {
        const btnShowMore = findButtonShowMore(divPreview);
        if (btnShowMore) {
          btnShowMore.click();
          await sleep(random(2000, 4000));
        }
      }

      const contentDiv = divFeedContent?.textContent || "";
      if (!contentDiv || !contentDiv.trim()) {
        logErrorContent("Content div is empty, next post");
        continue;
      }

      let rate = 0;
      let rate_comment_walk = 0;
      const cvContent = cvStringHigher(contentDiv);

      const keywordIncludeMatch = [];
      const keywordExcludeMatch = [];

      for (const keyword of content_query_excludes_common) {
        const cvKey = cvStringHigher(keyword);
        if (cvContent.includes(cvKey)) {
          keywordExcludeMatch.push(keyword);
          isSkipPost = true;
          break;
        }
      }

      for (const keyword of keyword_query_exclude_comment_walk) {
        const cvKey = cvStringHigher(keyword);
        if (cvContent.includes(cvKey)) {
          keywordExcludeMatch.push(keyword);
          isSkipPost = true;
          break;
        }
      }

      const includeCommonSet = new Set();
      const includeCommentWalkSet = new Set();

      const cvContentProfileName = cvStringHigher(contentProfileName);

      for (const keyword of content_query_includes_common) {
        const cvKey = cvStringHigher(keyword);
        if (includeCommonSet.has(cvKey)) continue;
        if (cvContent.includes(cvKey)) {
          keywordIncludeMatch.push;
          rate++;
          includeCommonSet.add(cvKey);
        }
      }

      for (const keyword of keyword_query_include_comment_walk) {
        const cvKey = cvStringHigher(keyword);
        if (includeCommentWalkSet.has(cvKey)) continue;
        if (cvContent.includes(cvKey) || cvContentProfileName.includes(cvKey)) {
          keywordIncludeMatch.push(keyword);
          rate_comment_walk++;
          includeCommentWalkSet.add(cvKey);
        }
      }

      if (rate < max_rate_common) {
        isSkipPost = true;
      }

      if (rate_comment_walk < max_rate_comment_walk) {
        isSkipPost = true;
      }

      logContent(
        getTextLanguageContent({
          en: "Keyword Include: " + keywordIncludeMatch.join(", "),
          vi: "Từ khóa bao gồm: " + keywordIncludeMatch.join(", "),
        }),
      );

      logContent(
        getTextLanguageContent({
          en: "Keyword Exclude: " + keywordExcludeMatch.join(", "),
          vi: "Từ khóa loại trừ: " + keywordExcludeMatch.join(", "),
        }),
      );

      logContent(
        getTextLanguageContent({
          en: `Rate: ${rate}/${max_rate_common}, Rate Comment Walk: ${rate_comment_walk}/${max_rate_comment_walk}`,
          vi: `Tỉ lệ chung: ${rate}/${max_rate_common}, Tỉ lệ dữ liệu của bạn: ${rate_comment_walk}/${max_rate_comment_walk}`,
        }),
      );

      if (isSkipPost) {
        logContent(
          getTextLanguageContent({
            en: "Skip post because not match rate or keyword",
            vi: "Bỏ qua bài viết vì không đúng tỉ lệ hoặc từ khóa",
          }),
        );
        continue;
      } else {
        countScroll = 0;
      }

      const divButtonToPost = findButtonToPost(child);
      if (!divButtonToPost) {
        logContent(
          getTextLanguageContent({
            en: "Not found button to open dialog",
            vi: "Không tìm thấy nút để mở hộp thoại",
          }),
        );
        continue;
      }

      await scrollElementIntoView(divButtonToPost);
      await sleep(random(1000, 2500));

      divButtonToPost.click();
      await sleep(random(2000, 3000));

      const dialog = findExistDialog();
      const inputEditor = await findInputEditor(dialog);

      if (!dialog || !inputEditor) {
        await sleep(2000);
        logContent(
          getTextLanguageContent({
            en: "Not found dialog or input editor",
            vi: "Không tìm thấy hộp thoại hoặc trình soạn thảo",
          }),
        );
        await handleCloseIfExistDialog();
        continue;
      }

      const href = location.href;
      const canComment = await CL_getCanCommentThisPost(href);

      if (!canComment) {
        logContent(
          getTextLanguageContent({
            en: "This post maybe can not comment because you already commented",
            vi: "Bài viết này có thể không bình luận được vì bạn đã bình luận rồi",
          }),
        );
        await sleep(2000);
        await handleCloseIfExistDialog();
        continue;
      }

      if (!checkContentInputEmpty(inputEditor)) {
        logContent(
          getTextLanguageContent({
            en: "Input content is not empty, clear it...",
            vi: "Nội dung bình luận không rỗng, xóa nội dung...",
          }),
        );
        await clearContentFromInputEditor(inputEditor);
        await sleep(random(1000, 2000));
        await clearFileFromInput(dialog);
        await sleep(random(1500, 3000));
      }

      logContent(
        getTextLanguageContent({
          en: "Filling content...",
          vi: "Đang nhập nội dung...",
        }),
      );

      const content =
        commentWalk.contents[random(0, commentWalk.contents.length - 1)];

      if (content) {
        await sleep(random(1500, 3000));

        const success = await simulateTyping(inputEditor, content, {
          minDelay: setting.time_delay_fill_content_comment_walk_min,
          maxDelay: setting.time_delay_fill_content_comment_walk_max,
        });

        if (!success) {
          logContent(
            getTextLanguageContent({
              en: "Failed to fill content, clear it...",
              vi: "Nhập nội dung thất bại, xóa nội dung...",
            }),
          );
          await clearContentFromInputEditor(inputEditor);
          await sleep(random(1000, 2000));
          await clearFileFromInput(dialog);
          await sleep(random(1500, 3000));

          logContent(
            getTextLanguageContent({
              en: "Close dialog...",
              vi: "Đang đóng hộp thoại",
            }),
          );

          await handleCloseIfExistDialog();
          continue;
        }

        await sleep(random(1000, 2000));
      }

      logContent(
        getTextLanguageContent({
          en: "Filling file...",
          vi: "Đang tải file",
        }),
      );

      const files = commentWalk.files;
      const parses = await CL_getParseFileRequest(files);
      if (parses && parses.length) {
        const parseRandom = parses[random(0, parses.length - 1)];

        await sleep(setting.time_delay_fill_file_comment_walk * 1000);
        const fileParse = parseBase64ToFile(parseRandom);

        const dt = new DataTransfer();
        dt.items.add(fileParse);
        const pasteEvent = new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        });
        inputEditor.dispatchEvent(pasteEvent);

        await sleep(random(2000, 4000));
      }

      //handleSubmit here
      logContent(
        getTextLanguageContent({
          en: "Submitting...",
          vi: "Đang gửi...",
        }),
      );

      await sleep(random(2000, 4000));

      if (!isTest) {
        await handleSubmitComment(inputEditor);

        // wait for comment submit success or fail
        await sleep((setting.time_delay_submit_comment_walk + 1) * 1000);
      }

      if (!checkContentInputEmpty(inputEditor)) {
        if (!isTest) {
          logContent(
            getTextLanguageContent({
              en: "Input content is not empty, can not submit or submit failure, clear it...",
              vi: "Nội dung bình luận không rỗng, không thể gửi hoặc gửi thất bại, xóa nó...",
            }),
          );
          CL_addLogRequest({
            vi: "Bình luận thất bại vào bài viết: " + href,
            en: "Commented failure in this post: " + href,
          });
        } else {
          logContent(
            getTextLanguageContent({
              en: "Test mode, skipping submit action...",
              vi: "Đang test, bỏ qua hành động gửi...",
            }),
          );
        }

        await clearContentFromInputEditor(inputEditor);
        await sleep(random(1000, 2000));
        await clearFileFromInput(dialog);
        await sleep(random(1500, 3000));
      } else {
        CL_addLogRequest({
          vi: "Đã bình luận thành công vào bài viết: " + href,
          en: "Commented successfully on post: " + href,
        });
        await CL_updateLastTimeCommentWalk(Date.now());
      }

      await CL_addUrlCommented(href);

      logContent(
        getTextLanguageContent({
          en: "Closing dialog...",
          vi: "Đang đóng hộp thoại",
        }),
      );

      await sleep(random(1000, 3000));

      await handleCloseIfExistDialog();

      await CL_setCountCommentWalkPostedPerBatch(countComment + 1);

      await sleep(random(2000, 3000));

      await CL_addUrlCommented(href);
    }

    logContent(
      getTextLanguageContent({
        vi: "Đợt bình luận đã kết thúc, tab này sẽ đóng sau vài giây",
        en: "This batch comment has ended, this tab will be closed after a few seconds",
      }),
    );
    await sleep(random(3000, 5000));

    await CL_compeleteCommentWalkThisBatch();
  } catch (error) {
    CL_addLogRequest({
      vi: "Lỗi khi bình luận vào bài viết, " + error?.message || error,
      en: "Error when commenting on post, " + error?.message || error,
      type: "error",
    });
    logContent("This tab maybe will be closed after some seconds...");
    await sleep(random(3000, 5000));
    await CL_compeleteCommentWalkThisBatch();
  }
}

async function handleCloseIfExistDialog() {
  try {
    const dialog = findExistDialog();
    if (dialog) {
      clickOutSideHideDialog();
      await sleep(1000);
      if (getIsExistDialog()) {
        await sleep(3000);
        logContent("dialog existed, force close");
        const btnExitPage = findBtnExitPageWhenExistDialog();
        if (btnExitPage) {
          await mouseHoverElement(btnExitPage);
          await sleep(random(1500, 2500));
          btnExitPage.click();
          await sleep(random(1500, 3000));
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
      const selectors =
        lang === "vi"
          ? SELECTOR_VI.buttonSubmitCommentInGroup
          : SELECTOR.buttonSubmitCommentInGroup;
      for (const selector of selectors) {
        const btnSubmit = findElement(selector);
        if (btnSubmit) {
          await mouseHoverElement(btnSubmit);
          await sleep(random(500, 1500));
          btnSubmit.click();
          await sleep(random(1000, 2000));
          return;
        }
      }
    }
    const evtEnterKeyDown = new KeyboardEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
    });

    const evtEnterKeyUp = new KeyboardEvent("keyup", {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
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

/**
 *
 * @param {HTMLDivElement|HTMLElement} input
 * @returns
 */
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
      bubbles: true,
    });

    const evtCtrlADelete = new KeyboardEvent("keydown", {
      key: "Delete",
      code: "Delete",
      keyCode: 46,
      which: 46,
      ctrlKey: true,
      bubbles: true,
    });

    const evtCtrlAKeyUp = new KeyboardEvent("keyup", {
      key: "a",
      code: "KeyA",
      keyCode: 65,
      which: 65,
      ctrlKey: true,
      bubbles: true,
    });

    const evtCtrlADeleteKeyUp = new KeyboardEvent("keyup", {
      key: "Delete",
      code: "Delete",
      keyCode: 46,
      which: 46,
      ctrlKey: true,
      bubbles: true,
    });

    input.dispatchEvent(evtCtrlA);
    await sleep(random(500, 1000));
    input.dispatchEvent(evtCtrlAKeyUp);
    await sleep(random(1000, 2000));
    input.dispatchEvent(evtCtrlADelete);
    await sleep(random(500, 1000));
    input.dispatchEvent(evtCtrlADeleteKeyUp);
  } catch (error) {
    logErrorContent("error in clearContentFromInputEditor", error);
  }
}

/**
 *
 * @param {HTMLDivElement|HTMLElement} container
 */
async function clearFileFromInput(container) {
  try {
    const lang = getLanguage();

    const selectors =
      lang === "vi" ? SELECTOR_VI.btnsRemoveImage : SELECTOR.btnsRemoveImage;
    for (const selector of selectors) {
      const btn = findElement(selector, container);
      if (btn) {
        await mouseHoverElement(btn);
        await sleep(random(500, 1500));
        btn.click();
        await sleep(random(1000, 2000));
      }
    }
  } catch (error) {
    logErrorContent("error in clearFileFromInput", error);
  }
}

export { CL_commentWalkHelper };
