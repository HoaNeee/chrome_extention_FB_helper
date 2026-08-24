import { STATUS_TASK } from "../../contants/contants.js";
import {
  KEY_GET_CURRENT_DATA_GROUP_SAVED_NEED_POST,
  KEY_UPDATE_STATUS_TASK,
} from "../../contants/constant-extention.js";
import { initialTimeDelay } from "../../contants/contants.js";
import {
  CL_addLogRequest,
  sendMessage,
  sendMessageWithResponse,
} from "../utils/request.js";
import {
  CL_getIsTest,
  CL_getMetadataComments,
  CL_getProgressTool,
  CL_getTimeDelayData,
} from "../utils/storage.js";
import {
  now,
  parseBase64ToFile,
  random,
  randomRateBoolean,
  sleep,
} from "../../utils/utils.js";
import {
  checkDivInputTextboxIsEmpty,
  checkIsSpammed,
  eventClickElement,
  findButtonPostAndClick,
  findButtonPostCommentJustPosted,
  findDivInputTextbox,
  findDivToPost,
  findElementJustPosted,
  findTextBoxJustPosted,
  getIsExistDialog,
} from "./dom.js";
import {
  CL_getParseFileRequest,
  CL_getTextWithLang,
  CL_setTimeDelayForScheduler,
  logContent,
  logErrorContent,
  updateLastTimePost,
} from "../utils/utils.js";
import { SELECTOR_RAW } from "../contants/contants.js";
import { getTextLanguageContent } from "../utils/global.js";

/**
 * @param {string} content
 */
async function pasteContent(content) {
  try {
    const div = await findDivInputTextbox();
    if (div) {
      const mouseEvt = new MouseEvent("mouseover", {
        bubbles: true,
        cancelable: true,
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
        cancelable: true,
      });
      div.dispatchEvent(pasteEvent);
    }
  } catch (e) {
    CL_addLogRequest({
      vi: `Lỗi khi dán nội dung vào ô nhập`,
      en: `Error when pasting content into the input box`,
      type: "error",
    });
    throw new Error("Error at paste content: " + e);
  }
}

/**
 * @param {Array<{name: string, base64Data: string, type: string}>} files
 * @returns
 */
async function fillFile(files) {
  if (!files || !Array.isArray(files) || !files?.length) {
    return;
  }
  try {
    const div = document.querySelector(
      SELECTOR_RAW.toolbarLabel,
    )?.nextElementSibling;
    const input = div?.querySelector(SELECTOR_RAW.inputFiles);

    if (input) {
      const mouseEvt = new MouseEvent("mouseover", {
        bubbles: true,
        cancelable: true,
      });

      await sleep(random(2, 5) * 100);

      div.dispatchEvent(mouseEvt);

      await sleep(random(2, 5) * 100);

      //simulator change image event
      const dt = new DataTransfer();
      const parses = await CL_getParseFileRequest(files);

      if (parses && Array.isArray(parses)) {
        for await (const item of parses) {
          const parse = parseBase64ToFile(item);
          dt.items.add(parse);
        }
        input.files = dt.files;
      }

      input.dispatchEvent(new Event("change", { bubbles: true }));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } catch (e) {
    CL_addLogRequest({
      vi: `Lỗi khi tải tệp lên ô nhập: ${e?.message || e}`,
      en: `Error when uploading files to the input box: ${e?.message || e}`,
      type: "error",
    });
    throw new Error("Error at fill file: " + e);
  }
}

/**
 * @param {{id_href: string, status: string}} task
 * @returns
 */
async function postHelper(task) {
  try {
    const s = 1000;

    const isTest = await CL_getIsTest();

    const timeDelay = await CL_getTimeDelayData();

    const timeClickToPost =
      timeDelay?.time_delay_click_to_post || initialTimeDelay.clickToPost;
    const timeFillContent =
      timeDelay?.time_delay_fill_content || initialTimeDelay.fillContent;
    const timeFillFile =
      timeDelay?.time_delay_fill_file || initialTimeDelay.fillFile;
    const timePost = timeDelay?.time_delay_post || initialTimeDelay.post;

    /**
     * Tính thời gian delay
     * ví dụ với 100 giây thì sẽ random từ 80s đến 120s
     * với 10 giây thì sẽ là từ 8 đến 12
     * @param {number} time
     * @param {number} lower
     * @param {number} upper
     * @returns {number}
     */
    function calculateTimeDelay(time, lower = 1, upper = 3) {
      const space = 20;
      const diff = time / space;
      if (diff === 0) {
        return random(Math.max(time - lower, 1), Math.max(time + upper, 3)) * s;
      }
      const fixed_value = 5;
      return (
        random(
          Math.max(time - fixed_value * diff, 1),
          Math.max(time + fixed_value * diff, 3),
        ) * s
      );
    }

    let delayClickToPost = calculateTimeDelay(timeClickToPost);

    let delayFillContent = calculateTimeDelay(timeFillContent);

    let delayFillFile = calculateTimeDelay(timeFillFile);

    let delayPost = calculateTimeDelay(timePost, 1, 4);

    if (isTest) {
      delayClickToPost = delayFillContent = delayFillFile = delayPost = s;
    }

    const responeDataContent = await sendMessageWithResponse(
      KEY_GET_CURRENT_DATA_GROUP_SAVED_NEED_POST,
    );
    const dataContent = responeDataContent.data;
    const contents = dataContent?.contents || [];

    const files = dataContent?.files || [];

    await sleep(delayClickToPost);

    const div = await findDivToPost();
    if (div) {
      await eventClickElement(div);

      //double check exist dialog, try 2 times
      await sleep(500);
      let retryTime = 1;
      while (retryTime < 2 && !getIsExistDialog()) {
        CL_addLogRequest({
          vi: `Ô nhập nội dung không tìm thấy, đang thử lại lần ${retryTime}`,
          en: `Content input box not found, try again ${retryTime}`,
          type: "error",
        });

        const node = await findDivToPost();
        if (node) {
          await eventClickElement(node);
        }
        await sleep(random(1, 4) * 1000);
        retryTime++;
      }
      if (!getIsExistDialog()) {
        CL_addLogRequest({
          vi: `Ô nhập nội dung không tìm thấy, đang thử lại lần ${retryTime}`,
          en: `Content input box not found, try again ${retryTime}`,
          type: "error",
        });

        const node2 = await findDivToPost();
        if (node2) {
          await eventClickElement(node2, true);
        }
      }

      if (!getIsExistDialog()) {
        throw new Error(
          getTextLanguageContent({
            vi: "Ô nhập nội dung không tìm thấy, dừng quá trình",
            en: "Content input box not found, stop process",
          }),
        );
      }

      logContent(
        getTextLanguageContent({
          vi: "Nhập nội dung đăng bài...",
          en: "Filling content post to input...",
        }),
      );

      await sleep(delayFillContent);
      task.status = STATUS_TASK.POSTING;
      sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });

      //content
      let content = contents[random(0, contents.length - 1)];

      if (checkContentIsEmpty(content)) {
        const text = await CL_getTextWithLang({
          viText: "Nội dung trong bộ dữ liệu trống",
          enText: "Content in data group post is empty",
        });

        throw new Error(text);
      }

      await pasteContent(content);

      //file
      logContent(
        getTextLanguageContent({
          vi: "Đang tải ảnh và nhập...",
          en: "Uploading files and fill...",
        }),
      );

      await sleep(delayFillFile);
      await fillFile(files);

      //post
      logContent(
        getTextLanguageContent({
          vi: "Đang đăng bài...",
          en: "Posting...",
        }),
      );

      await sleep(delayPost);
      if (!isTest) {
        //exist dialog -> post success
        if (getIsExistDialog()) {
          const isProgress = await CL_getProgressTool();
          if (isProgress) {
            const checkFillContentSuccess = await checkDivInputTextboxIsEmpty();
            if (checkFillContentSuccess) {
              throw new Error(
                getTextLanguageContent({
                  vi: "Ô nhập nội dung không tìm thấy hoặc nội dung không được tự động điền",
                  en: "Content input box not found or content is not automatically filled",
                }),
              );
            }
            await findButtonPostAndClick();
            await updateLastTimePost(now());
          }
        } else {
          const text = await CL_getTextWithLang({
            viText: "Không thể tìm ô đăng bài",
            enText: "Not found content input box",
          });
          throw new Error(text);
        }
      }

      //complete task
      task.status = STATUS_TASK.DONE;
      sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });

      CL_addLogRequest({
        vi: "Đã thực hiện xong việc đăng bài trong nhóm, chuyển sang nhóm tiếp theo.",
        en: "Done posting in this group, switch to next group.",
      });
      return true;
    }

    const text = await CL_getTextWithLang({
      viText: "Không tìm được thẻ click để tạo ô input",
      enText: "Not found button to create input tag",
    });
    throw new Error(text);
  } catch (error) {
    CL_addLogRequest({
      vi: `Lỗi khi đăng bài trong nhóm này, ${error?.message || error}`,
      en: `Error when posting in this group, ${error?.message || error}`,
      type: "error",
    });
    task.status = STATUS_TASK.ERROR;
    sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });
    return false;
  }
}

async function simulateTyping(
  element,
  text,
  { minDelay = 30, maxDelay = 100 } = {},
) {
  // Đảm bảo có caret trong element (đặt ở cuối nội dung hiện có)
  try {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false); // false = về cuối
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
          repeat: false,
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
          repeat: false,
        });

        element.dispatchEvent(enterLineUpEvt);

        await sleep(random(1000, 3000));
        continue;
      }

      const keyDown = new KeyboardEvent("keydown", {
        key: char,
        bubbles: true,
      });
      element.dispatchEvent(keyDown);

      document.execCommand("insertText", false, char);

      const keyUp = new KeyboardEvent("keyup", {
        key: char,
        bubbles: true,
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

    //random rate
    if (!randomRateBoolean(28)) {
      CL_addLogRequest({
        vi: "Đã quyết định sẽ bỏ qua bình luận, chuyển sang công việc tiếp theo",
        en: "Decided to skip comment, switch to next task.",
      });
      return;
    }

    let cnt = 0;
    while (getIsExistDialog() && cnt < 30) {
      if (checkIsSpammed()) {
        break;
      }
      await sleep(1000);
      ++cnt;
    }

    if (getIsExistDialog()) {
      CL_addLogRequest({
        vi: "Không thể bình luận vào bài viết vừa đăng, bài viết vừa đăng không thành công",
        en: "Cannot comment on this post, the post may have failed",
      });
      return;
    }

    CL_addLogRequest({
      vi: `Đã quyết định sẽ bình luận bài viết này, số bình luận ${data.max_comment_per_post}`,
      en: `Decided to comment on this post, number comment ${data.max_comment_per_post}`,
    });

    await sleep(random(1000, 4000) + random(100, 1000));

    const elementJustPosted = findElementJustPosted();

    const listContent = data.contents;

    async function typeAndSubmit(textBox, elementJustPosted) {
      const content = listContent[random(0, listContent.length - 1)];

      if (textBox) {
        await simulateTyping(textBox, content, {
          minDelay: 200,
          maxDelay: 1000,
        });
        const btn = findButtonPostCommentJustPosted(elementJustPosted);
        await sleep(random(1000, 3000) + random(100, 1000));
        if (btn) {
          btn.click();
        } else {
          textBox.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
          );
          textBox.dispatchEvent(
            new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
          );
        }
        await sleep(random(2000, 4000) + random(100, 1000));
      }
    }

    if (elementJustPosted) {
      const textBox = findTextBoxJustPosted(elementJustPosted);
      if (textBox) {
        await sleep(random(1, 2) * 1000);

        textBox.scrollIntoView({ behavior: "smooth", block: "center" });

        await sleep(random(1, 5) * 1000);

        textBox.focus();

        await sleep(random(1, 3) * 1000);

        for (let i = 0; i < data.max_comment_per_post; i++) {
          await typeAndSubmit(textBox, elementJustPosted);
          await sleep(random(1000, 2000));
        }
      }
    }

    const timeClick = 3;
    const timeType = data.max_comment_per_post * 8;
    const timeCheckDialog = cnt * 1;

    const timeDelay = timeClick + timeType + timeCheckDialog;

    await CL_setTimeDelayForScheduler(timeDelay * 1000);
  } catch (error) {
    CL_addLogRequest({
      vi: `Lỗi khi bình luận vào bài viết vừa đăng, ${error?.message || error}`,
      en: `Error when commenting on this post, ${error?.message || error}`,
    });
  }
}

//DO LATER
//because: Link cua bai viet vua dang thi can nguoi dung hover, mouseenter thi moi hien link chinh xac
/**
 * Find link post when posted success
 * @returns {string} link post
 */
function findLinkJustPosted(elementContainerPosted) {
  try {
    if (elementContainerPosted) {
      const links = elementContainerPosted.querySelectorAll("a[href]");
      //link example correct: https://www.facebook.com/groups/addouseguebrasilexterior/posts/4412524755681916/?__cft__[0]=AZYu-0HvP74UCpo2b8RmFzTDA9nAu8sjlkBwSW3NYBwkBdt45wpQMikvzXgm2uP3mwfhDa5rKA7XuF0LSWd8YCdwdziIU7a7I4Wfi8T89wuVpZkYOYk743q2tMUWXuZNbs3A8QbUJAyc6BEq8ESLKAo_&__tn__=%2CO%2CP-R

      console.log(links);

      const pattern =
        /^https:\/\/www.facebook.com\/groups\/[0-9a-zA-z_.-]+\/posts\/[0-9a-zA-z._-]+\/(.*)?$/;

      for (const link of links) {
        const href = link.getAttribute("href");
        console.log(href);
        if (pattern.test(href)) {
          return href;
        }
      }

      return null;
    }
  } catch (error) {
    logErrorContent("Error at findLinkJustPosted", error);
    return null;
  }
}

function checkContentIsEmpty(content) {
  return (
    !content ||
    !(typeof content === "string") ||
    !content.trim().length ||
    content === "<p></p>"
  );
}

export {
  pasteContent,
  fillFile,
  postHelper,
  findLinkJustPosted,
  commentToJustPostedHelper,
  simulateTyping,
};
