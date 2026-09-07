import CommentWalk from "../../class/CommentWalk";
import { KEY_COMMENT_WALK_AREA } from "../../contants/constant-extention";
import {
  checkIsFacebookUrl,
  checkIsSearchPagePostUrl,
  checkIsSearchPageUrl,
  getLanguage,
  matchQueryKeywords,
  parseBase64ToFile,
  random,
  randomRateBoolean,
  sleep,
} from "../../utils/utils";
import { SELECTOR, SELECTOR_RAW, SELECTOR_VI } from "../contants/contants";
import { getTextLanguageContent } from "../utils/global";
import { CL_addLogRequest, CL_closeThisTab } from "../utils/request";
import {
  CL_addUrlCommented,
  CL_compeleteCommentWalkThisBatch,
  CL_getCanCommentThisPost,
  CL_getCommentWalkNeverCommented,
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
  mouseHoverElement,
  scrollElementIntoView,
  waitForElement,
} from "./dom";
import { simulateTyping } from "./post";

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
    const selectors =
      lang === "vi" ? SELECTOR_VI.elementFeedPosts : SELECTOR.elementFeedPosts;
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
    const lang = getLanguage();

    const label = lang === "vi" ? "đã đăng trong" : "posted in";
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

/**
 * @param {CommentWalkSetting} setting
 * @param {CommentWalk} commentWalk
 * @param {CommentWalk[]} listCommentWalk
 */
async function CL_commentWalkHelper(setting, commentWalk, listCommentWalk) {
  try {
    /**
     * tính toán chút
     * 1. Khu vực trang tìm kiếm: Với khu vực là trang tìm kiếm thì các bài viết có thể sẽ luôn phù hợp với dữ liệu đã được chọn
     * nên các từ khoá sẽ thả lỏng hơn
     * 2. Khu vực trang chủ thì các bài viết có thể là quảng cáo, bài viết của 1 cá nhân, tổ chức, trong nhóm,... Nên các từ khoá
     * sẽ cần nghiêm ngặt hơn
     *
     * 3. có thể dựa vào đó mà xử lý từ khoá sao cho hợp lý ở 2 khu vực
     */

    const VALUE_RATE_ADD_FOR_HOME = 0;
    const VALUE_RATE_MULTIPLY_FOR_KEYWORD_CERTAIN = 2;

    const isDevMode = await CL_getIsDevMode();
    const isTest = await CL_getIsTest();

    let flagDone = false;

    //common
    const max_comment = setting.max_comment_walk_per_batch;
    const content_query_includes_common =
      setting?.content_query_includes_common_comment_walk || [];
    const content_query_excludes_common =
      setting?.content_query_excludes_common_comment_walk || [];
    const max_rate_common =
      setting?.match_rate_value_content_query_includes_common_comment_walk || 0;
    const area = setting?.comment_walk_area;
    const keywords_certain_choice =
      setting?.keywords_certain_choice_comment_walk || [];
    const isSkipPostNotInGroup = setting?.is_skip_post_not_in_group || false;
    const isCombineStrictlyTitleGroup =
      setting?.is_combine_strictly_title_group || false;
    const strictlyMatchTitleGroup = setting?.strictly_match_title_group || [];

    function checkArea() {
      const isHome = area === KEY_COMMENT_WALK_AREA.HOME;
      const isSearch = area === KEY_COMMENT_WALK_AREA.SEARCH_PAGE;

      return {
        isHome,
        isSearch,
      };
    }

    function checkCanCommentInThisElement(element) {
      if (!(element instanceof HTMLElement)) {
        return false;
      }
      const hasRole = findElement("div[data-ad-rendering-role]", element);
      if (!hasRole) {
        return false;
      }
      return true;
    }

    function logExcludeKeywords(keywords = []) {
      logContent(
        getTextLanguageContent({
          en:
            "This post contains excluded keywords: " +
            keywords.join(", ") +
            ", skip it...",
          vi:
            "Bài viết này chứa các từ khóa bị loại trừ: " +
            keywords.join(", ") +
            ", bỏ qua...",
        }),
      );
    }

    async function closeDialog() {
      await sleep(random(2000, 4000));
      await handleCloseIfExistDialog();
      await sleep(random(1500, 2500));
    }

    const areaComment = checkArea();

    let countScroll = 0;
    let maxCount = isDevMode ? 50 : areaComment.isHome ? 50 : 20;

    async function findDivFeed() {
      let divResult = null;

      //type home
      if (areaComment.isHome) {
        const main = await findDivMain();
        divResult = findDivFeedMainContainer(main);
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

    await sleep(random(2000, 4000));

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

    let childs = divFeed.children;

    async function autoWalk(childs, reloaded = false) {
      try {
        for await (const child of childs) {
          let existedDialog = findExistDialog();
          if (existedDialog) {
            await closeDialog();
          }

          await sleep(random(2000, 4000));

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
                  vi: "Bài viết này có thể là bài viết được quảng cáo, bỏ qua...",
                }),
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
                vi: "Dừng công cụ, đóng tab sau vài giây...",
              }),
            );
            if (!isDevMode) {
              await sleep(random(6000, 9000));
              await CL_compeleteCommentWalkThisBatch();
            }
            return;
          }

          //correct href
          if (areaComment.isHome) {
            if (!checkIsFacebookUrl(location.href)) {
              throw new Error("Not in correct page");
            }
          } else if (
            !checkIsSearchPageUrl(location.href) &&
            !checkIsSearchPagePostUrl(location.href)
          ) {
            throw new Error("Not in correct page");
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

          //end tasks
          if (countComment >= max_comment || countScroll >= maxCount) {
            if (countComment >= max_comment) {
              flagDone = true;
            }
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

          if (countScroll >= maxCount / 2 && !reloaded) {
            //try reload
            const reload = findDivReloadPage();
            if (reload) {
              const rd = randomRateBoolean(50);
              if (rd) {
                reload.click();
                await sleep(random(10000, 15000));
                const newDivFeed = await findDivFeed();
                if (newDivFeed) {
                  const newChilds = newDivFeed.children;
                  return await autoWalk(newChilds, true);
                }
              }
            }
          }

          await sleep(random(3000, 5000));
          scrollElementIntoView(child);
          await sleep(random(3000, 5000));

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

          await sleep(random(2000, 4000));

          await scrollElementIntoView(divButtonToPost);

          await sleep(random(3000, 5000));

          if (isSkipPostNotInGroup && !checkIsFeedItemInGroup(child)) {
            logContent(
              getTextLanguageContent({
                vi: "Bài viết này không nằm trong group, có thể là bài viết của người dùng khác, quảng cáo,...",
                en: "This post is not in group, maybe is post of other user, ad,...",
              }),
            );
            continue;
          }

          const divFeedContent = await findDivItemFeedContent(child);

          if (!divFeedContent) {
            logErrorContent("Not found div feed content, skip post");
            continue;
          }
          const btnShowMore = findButtonShowMore(child);
          if (btnShowMore) {
            btnShowMore.click();
            await sleep(random(3000, 8000));

            await scrollElementIntoView(divButtonToPost);

            await sleep(random(3000, 5000));
          }

          const contentDiv = divFeedContent?.textContent || "";
          if (contentDiv.length >= 500) {
            logContent(
              getTextLanguageContent({
                vi: `Bài viết nội dung quá dài (${contentDiv.length} ký tự), bỏ qua...`,
                en: `Post content is too long (${contentDiv.length} characters), skip...`,
              }),
            );
            continue;
          }
          const contentNameAndDiv = contentProfileName + " " + contentDiv;

          // console.log("content: ", contentNameAndDiv);

          if (!contentDiv || !contentDiv.trim()) {
            logErrorContent("Content div is empty, next post");
            continue;
          }

          if (isCombineStrictlyTitleGroup) {
            const titleMatchs = matchQueryKeywords(
              strictlyMatchTitleGroup,
              contentProfileName,
            );
            if (!titleMatchs.length) {
              logContent(
                getTextLanguageContent({
                  vi: "Bài viết này không chứa các từ khoá phù hợp trong tên, bỏ qua...",
                  en: "This post does not contain keywords in the title, skip...",
                }),
              );
              continue;
            }
          }

          const listMatch = [];

          const keywordIncludeMatch = [];
          const keywordExcludeMatch = [];

          const keywordExcludeCommons = matchQueryKeywords(
            content_query_excludes_common,
            contentDiv,
          );
          keywordExcludeMatch.push(...keywordExcludeCommons);
          if (keywordExcludeCommons.length) {
            logExcludeKeywords(keywordExcludeCommons);
            continue;
          }

          const keywordIncludeCommons = matchQueryKeywords(
            content_query_includes_common,
            contentDiv,
          );
          keywordIncludeMatch.push(...keywordIncludeCommons);

          if (keywordIncludeCommons.length < max_rate_common) {
            //check certain_choice_keywords with lowercase
            if (areaComment.isHome) {
              let flag = false;
              for (const keyword of keywords_certain_choice) {
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
            const keyword_query_exclude_comment_walk =
              commentWalk?.keyword_query_excludes || [];
            const keyword_query_include_comment_walk =
              commentWalk?.keyword_query_includes || [];
            const keyword_certain_choice =
              commentWalk?.keywords_certain_choice || [];
            const max_rate_comment_walk =
              commentWalk?.match_rate_value_content_query_includes || 0;

            if (areaComment.isSearch) {
              const keywordExcludeCommentWalkMatch = matchQueryKeywords(
                keyword_query_exclude_comment_walk,
                contentDiv,
              );
              keywordExcludeMatch.push(...keywordExcludeCommentWalkMatch);
              if (keywordExcludeCommentWalkMatch.length) {
                logExcludeKeywords(keywordExcludeCommentWalkMatch);
                continue;
              }

              let score = 0;

              const keywordIncludeCommentWalkMatch = matchQueryKeywords(
                keyword_query_include_comment_walk,
                contentNameAndDiv,
              );
              keywordIncludeMatch.push(...keywordIncludeCommentWalkMatch);

              const keywordCertainMatch = matchQueryKeywords(
                keyword_certain_choice,
                contentNameAndDiv,
              );
              keywordIncludeMatch.push(...keywordCertainMatch);

              //strictly
              if (!keywordCertainMatch.length) {
                isSkipPost = true;
              }

              score += keywordIncludeCommentWalkMatch.length;
              // keywordCertainMatch.length; (nếu cần)

              if (score < max_rate_comment_walk) {
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
                  en: `Rate: ${keywordIncludeCommons.length}/${max_rate_common}, Rate Comment Walk: ${score}/${max_rate_comment_walk}`,
                  vi: `Tỉ lệ chung: ${keywordIncludeCommons.length}/${max_rate_common}, Tỉ lệ dữ liệu của bạn: ${score}/${max_rate_comment_walk}`,
                }),
              );
            } else if (areaComment.isHome) {
              for (const comment of listCommentWalk) {
                let score = 0;

                const contentExcludeMatch = matchQueryKeywords(
                  keyword_query_exclude_comment_walk,
                  contentDiv,
                );
                if (contentExcludeMatch.length) {
                  continue;
                }

                const contentMatchs = matchQueryKeywords(
                  keyword_query_include_comment_walk,
                  contentDiv,
                );

                score += contentMatchs.length;

                //add score content more than profile name (title group)
                const contentCertainChoiceMatch = matchQueryKeywords(
                  keyword_certain_choice,
                  contentDiv,
                );
                const profileNameCertainMatch = matchQueryKeywords(
                  keyword_certain_choice,
                  contentProfileName,
                );

                score +=
                  contentCertainChoiceMatch.length *
                  VALUE_RATE_MULTIPLY_FOR_KEYWORD_CERTAIN;

                if (!contentCertainChoiceMatch.length) {
                  score += profileNameCertainMatch.length;
                }

                const isMatch = !!(
                  contentMatchs.length >= max_rate_comment_walk &&
                  (contentCertainChoiceMatch.length ||
                    profileNameCertainMatch.length)
                );

                if (isMatch) {
                  const match = Array.from(
                    new Set([
                      ...contentMatchs,
                      ...contentCertainChoiceMatch,
                      ...profileNameCertainMatch,
                    ]),
                  );
                  listMatch.push({
                    id: comment.id,
                    rate: score,
                    match,
                  });
                }
              }

              if (!listMatch.length) {
                logContent(
                  getTextLanguageContent({
                    en: "Skip post because not data comment match",
                    vi: "Bỏ qua bài viết vì không có dữ liệu bình luận phù hợp",
                  }),
                );
                continue;
              }
            }
          }

          if (isSkipPost) {
            logContent(
              getTextLanguageContent({
                en: "Keyword Exclude: " + keywordExcludeMatch.join(", "),
                vi: "Từ khóa loại trừ: " + keywordExcludeMatch.join(", "),
              }),
            );
            logContent(
              getTextLanguageContent({
                en: "Skip post because not keyword match",
                vi: "Bỏ qua bài viết vì không đúng từ khóa",
              }),
            );
            continue;
          } else {
            if (areaComment.isSearch) {
              countScroll = 0;
            }
          }

          await sleep(random(2000, 5000));

          divButtonToPost.click();
          await sleep(random(3000, 4000));

          if (areaComment.isHome) {
            if (listMatch.length) {
              const listId = listMatch
                .sort((a, b) => b.rate - a.rate)
                .map((i) => i.id);

              const commentWalkNeverComment =
                await CL_getCommentWalkNeverCommented(listId, location.href);
              if (commentWalkNeverComment) {
                commentWalk = commentWalkNeverComment;

                const matchOfPost = listMatch.find(
                  (i) => i.id === commentWalkNeverComment.id,
                );
                logContent(
                  getTextLanguageContent({
                    en: "Keyword match: " + matchOfPost.match.join(", "),
                    vi: "Từ khóa khớp: " + matchOfPost.match.join(", "),
                  }),
                );
                logContent(
                  getTextLanguageContent({
                    en: "Score match: " + matchOfPost.rate,
                    vi: "Tỷ lệ khớp: " + matchOfPost.rate,
                  }),
                );
                logContent(
                  getTextLanguageContent({
                    en: "Data match for post: " + commentWalkNeverComment.name,
                    vi:
                      "Dữ liệu khớp cho bài viết: " +
                      commentWalkNeverComment.name,
                  }),
                );
              } else {
                logContent(
                  getTextLanguageContent({
                    en: "Skip post because you already commented on post",
                    vi: "Bỏ qua bài viết vì bạn đã bình luận vào bài viết này rồi",
                  }),
                );
                await closeDialog();
                continue;
              }
            }
          }

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
          if (areaComment.isSearch) {
            const canComment = await CL_getCanCommentThisPost(href);

            if (!canComment) {
              logContent(
                getTextLanguageContent({
                  en: "This post maybe can not comment because you already commented",
                  vi: "Bài viết này có thể không bình luận được vì bạn đã bình luận rồi",
                }),
              );
              await sleep(random(2000, 4000));
              await handleCloseIfExistDialog();
              await sleep(random(3000, 5000));
              continue;
            }
          }

          if (!checkContentInputEmpty(inputEditor)) {
            logContent(
              getTextLanguageContent({
                en: "Input content is not empty, clear it...",
                vi: "Nội dung bình luận không rỗng, xóa nội dung...",
              }),
            );
            await clearContentFromInputEditor(inputEditor);
            await sleep(random(2000, 4000));
            await clearFileFromInput(dialog);
            await sleep(random(3000, 5000));
          }

          logContent(
            getTextLanguageContent({
              en: "Filling content...",
              vi: "Đang nhập nội dung...",
            }),
          );

          const content =
            commentWalk?.contents?.[random(0, commentWalk.contents.length - 1)];

          if (content) {
            await sleep(random(3000, 5000));

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

              await closeDialog();
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

            await sleep(
              setting.time_delay_fill_file_comment_walk * 1000 +
                random(1000, 2000),
            );
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
            await sleep(random(2000, 4000));
            await clearFileFromInput(dialog);
            await sleep(random(3000, 5000));
          } else {
            CL_addLogRequest({
              vi: "Đã bình luận thành công vào bài viết: " + href,
              en: "Commented successfully on post: " + href,
            });
            await CL_updateLastTimeCommentWalk(Date.now());
          }

          logContent(
            getTextLanguageContent({
              en: "Closing dialog...",
              vi: "Đang đóng hộp thoại",
            }),
          );

          await sleep(random(2000, 6000));

          await closeDialog();

          await CL_setCountCommentWalkPostedPerBatch(countComment + 1);

          await sleep(random(2000, 3000));

          if (!isTest) {
            await CL_addUrlCommented(commentWalk.id, href);
          }
        }
      } catch (error) {
        throw error;
      }
    }

    //walk comments on this post
    await autoWalk(childs, false);

    if (!flagDone) {
      logContent(
        getTextLanguageContent({
          vi: "Đợt bình luận đã kết thúc, tab này sẽ đóng sau vài giây",
          en: "This batch comment has ended, this tab will be closed after a few seconds",
        }),
      );
      await sleep(random(3000, 5000));

      await CL_compeleteCommentWalkThisBatch();
    }
  } catch (error) {
    CL_addLogRequest({
      vi: "Lỗi khi bình luận vào bài viết, " + error?.message || error,
      en: "Error when commenting on post, " + error?.message || error,
      type: "error",
    });
    logContent("This tab maybe will be closed after some seconds...");
    await sleep(random(8000, 12000));
    await CL_compeleteCommentWalkThisBatch();
  }
}

async function handleCloseIfExistDialog() {
  try {
    let dialog = findExistDialog();
    if (dialog) {
      clickOutSideHideDialog();
      await sleep(random(2000, 4000));
      dialog = findExistDialog();
      if (dialog) {
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
 * @param {HTMLDivElement|HTMLElement} container
 */
function checkIsFeedItemInGroup(container) {
  try {
    if (!container) return false;

    const div = findElement('.//a[contains(@href, "group")]', container);
    return !!div;
  } catch (error) {
    logErrorContent("error in checkIsFeedItemInGroup", error);
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

export {
  CL_commentWalkHelper,
  clearContentFromInputEditor,
  clearFileFromInput,
  findButtonToPost,
  findExistDialog,
  findInputEditor,
  handleCloseIfExistDialog,
  handleSubmitComment,
};
