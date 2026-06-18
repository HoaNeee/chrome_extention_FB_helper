import { KEY_LAST_TIME_POST, STATUS_TASK } from "../../contants/contants.js";
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
  CL_getTimeDelayInStorage,
} from "../utils/storage.js";
import {
  logError,
  now,
  parseBase64ToFile,
  random,
  randomRateBoolean,
  sleep,
} from "../../utils/utils.js";
import {
  eventClickElement,
  findButtonPostAndClick,
  findButtonPostCommentJustPosted,
  findDivInputTextbox,
  findDivToPost,
  findElementJustPosted,
  findTextBoxJustPosted,
  getIsExistDialog,
} from "./dom.js";
import { CL_getTextWithLang, CL_setValue } from "../utils/utils.js";
import { SELECTOR_RAW } from "../contants/contants.js";

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
      vi: `Lỗi khi tải tệp lên ô nhập`,
      en: `Error when uploading files to the input box`,
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

    const timeDelay = await CL_getTimeDelayInStorage();

    const timeClickToPost =
      timeDelay?.clickToPost || initialTimeDelay.clickToPost;
    const timeFillContent =
      timeDelay?.fillContent || initialTimeDelay.fillContent;
    const timeFillFile = timeDelay?.fillFile || initialTimeDelay.fillFile;
    const timePost = timeDelay?.post || initialTimeDelay.post;

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
        });

        const node2 = await findDivToPost();
        if (node2) {
          await eventClickElement(node2, true);
        }
      }

      if (!getIsExistDialog()) {
        const text = await CL_getTextWithLang({
          viText: "Không tìm thấy ô nhập nội dung",
          enText: "Not found content input box",
        });
        throw new Error(text);
      }

      await sleep(delayFillContent);
      task.status = STATUS_TASK.POSTING;
      sendMessage(KEY_UPDATE_STATUS_TASK, { status: task.status });

      //content
      let content = contents[random(0, contents.length - 1)];

      await pasteContent(content);

      //file
      await sleep(delayFillFile);
      fillFile(files);

      //post
      await sleep(delayPost);
      if (!isTest) {
        //exist dialog -> post success
        if (getIsExistDialog()) {
          const isProgress = await CL_getProgressTool();
          if (isProgress) {
            await findButtonPostAndClick();
            CL_setValue(KEY_LAST_TIME_POST, now());
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
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false); // false = về cuối
  selection.removeAllRanges();
  selection.addRange(range);

  for (let char of text) {
    element.focus();

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
}

async function commentToJustPostedHelper() {
  try {
    const data = await CL_getMetadataComments();

    if (!data.isActive) {
      return;
    }

    //random rate
    if (!randomRateBoolean(35)) {
      CL_addLogRequest({
        vi: "Đã quyết định sẽ bỏ qua bình luận, chuyển sang công việc tiếp theo",
        en: "Decided to skip comment, switch to next task.",
      });
      return;
    }

    let cnt = 0;
    while (getIsExistDialog() && cnt < 30) {
      await sleep(1000);
      ++cnt;
    }

    if (getIsExistDialog()) {
      CL_addLogRequest({
        vi: "Không thể bình luận vào bài viết vừa đăng, bài viết vừa đăng có thể đã bị thất bại",
        en: "Cannot comment on this post, the post may have failed",
      });
      return;
    }

    CL_addLogRequest({
      vi: "Đã quyết định sẽ bình luận bài viết này.",
      en: "Decided to comment on this post.",
    });

    await sleep(random(1, 4) * 1000);

    const elementJustPosted = findElementJustPosted();
    if (elementJustPosted) {
      const textBox = findTextBoxJustPosted(elementJustPosted);

      await sleep(1000);

      textBox.scrollIntoView({ behavior: "smooth", block: "center" });

      await sleep(random(1, 5) * 1000);

      textBox.focus();

      await sleep(random(1, 3) * 1000);

      const content = data.listContent[random(0, data.listContent.length - 1)];

      if (textBox) {
        await simulateTyping(textBox, content, {
          minDelay: 200,
          maxDelay: 1000,
        });
        const btn = findButtonPostCommentJustPosted(elementJustPosted);
        if (btn) {
          await sleep(random(1, 3) * 1000);
          btn.click();
        } else {
          textBox.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
          );
          textBox.dispatchEvent(
            new KeyboardEvent("keyup", { key: "Enter", bubbles: true }),
          );
          await sleep(random(2, 3) * 1000);
        }
      }
    }
  } catch (error) {
    logError("Error at commentToJustPostedHelper: ", error);
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
    logError("Error at findLinkJustPosted", error);
    return null;
  }
}

export {
  pasteContent,
  fillFile,
  postHelper,
  findLinkJustPosted,
  commentToJustPostedHelper,
};
