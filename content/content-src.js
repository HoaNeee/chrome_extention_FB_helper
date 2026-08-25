import {
  KEY_CLOSE_THIS_TAB,
  KEY_NEXT_POST_GROUP,
  KEY_UPDATE_IS_SPAMMED,
} from "../contants/constant-extention.js";
import {
  KEY_ALL_GROUPS,
  KEY_CAN_POST_THIS_TAB,
  KEY_IS_DEVELOPER_MODE,
  KEY_IS_SCROLL_DETECT_LIST_GROUP,
  KEY_IS_TEST,
  URL_LIST_GROUPS,
} from "../contants/contants.js";
import {
  checkIsFacebookUrl,
  checkIsSearchPagePostUrl,
  checkIsSearchPageUrl,
  getIsCorrectPostURL,
  logError,
  random,
  sleep,
} from "../utils/utils.js";
import { notificationContainer } from "./elements/notify.js";
import { createPanelLogContent } from "./elements/panel-log-content.js";
import { CL_commentWalkHelper } from "./helpers/comment-walk.js";
import {
  checkIsSpammed,
  clickOutSideHideDialog,
  getIsExistDialog,
} from "./helpers/dom.js";
import { getListGroups, interactBeforePost } from "./helpers/groups.js";
import { commentToJustPostedHelper, postHelper } from "./helpers/post.js";
import {
  getTextLanguageContent,
  initLanguageWithTool,
} from "./utils/global.js";
import {
  CL_addLogRequest,
  sendMessage,
  sendMessageWithResponse,
} from "./utils/request.js";
import {
  CL_getAllMetadataCommentWalk,
  CL_getIsDevMode,
  CL_getObjectCanPostThisTab,
  CL_getProgressTool,
  CL_getTimeDelayData,
} from "./utils/storage.js";
import {
  CL_getCanCommentWalkThisTab,
  CL_getValue,
  CL_setValue,
  getIsMatchUrl,
  logContent,
  logErrorContent,
} from "./utils/utils.js";

async function main() {
  try {
    console.log("content script is running...");

    const href = location.href;

    if (!checkIsFacebookUrl(href)) {
      return;
    }

    notificationContainer({});

    //test
    // test();
    const isDevMode = await CL_getIsDevMode();
    if (isDevMode) {
      await initWithMyTool();
    }

    if (checkIsSearchPageUrl(href) || checkIsSearchPagePostUrl(href)) {
      await sleep(4000);
      const response = await CL_getCanCommentWalkThisTab();
      if (!response) return;
      await initWithMyTool();

      await sleep(2000);

      const textLang = {
        vi: `Bắt đầu đợt bình luận dạo...`,
        en: `Start comment walk...`,
      };
      logContent(getTextLanguageContent(textLang));

      const commentWalk = response.data;

      const metadataSettingCommentWalk = await CL_getAllMetadataCommentWalk();

      logContent(
        getTextLanguageContent({
          vi: `Dữ liệu bình luận đợt này: ${commentWalk?.name || commentWalk.title}`,
          en: `Comment data for this batch: ${commentWalk?.name || commentWalk.title}`,
        }),
      );

      await CL_commentWalkHelper(metadataSettingCommentWalk, commentWalk);

      return;
    }

    //GET LIST GROUPS
    if (getIsMatchUrl(URL_LIST_GROUPS)) {
      const isGetList = await CL_getValue(KEY_IS_SCROLL_DETECT_LIST_GROUP);
      if (isGetList) {
        await initWithMyTool();
        await sleep(2000);

        CL_addLogRequest({
          vi: `Bắt đầu lấy danh sách nhóm...`,
          en: `Start getting list groups...`,
        });

        await sleep(4000);
        const allGroups = await getListGroups();
        await CL_setValue(KEY_ALL_GROUPS, allGroups);
        await CL_setValue(KEY_IS_SCROLL_DETECT_LIST_GROUP, false);
        logContent(
          getTextLanguageContent({
            vi: "Đã lấy xong danh sách nhóm, tab này sẽ đóng sau vài giây",
            en: "List groups have been taken, this tab will close after a few seconds",
          }),
        );
        await sleep(random(3000, 5000));
        sendMessage(KEY_CLOSE_THIS_TAB, {});
      }
      return;
    }

    //POSTING AUTO
    if (!getIsCorrectPostURL(href)) {
      return;
    }

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

        await sleep(2000);

        const task = object.data;

        await interactBeforePost();

        CL_addLogRequest({
          vi: `Bắt đầu đăng bài trong nhóm ${task?.id_href}`,
          en: `Start posting in group ${task?.id_href}`,
        });

        const isSuccess = await postHelper(task);

        if (isSuccess) {
          await commentToJustPostedHelper();
        }

        const timeDelay = await CL_getTimeDelayData();
        const timeDelayNext =
          timeDelay.openNewTab % 2 === 0
            ? timeDelay.openNewTab / 2
            : (timeDelay.openNewTab + 1) / 2;

        await sleep(timeDelayNext * 1000 + random(500, 2000));
        sendMessage(KEY_NEXT_POST_GROUP, {});

        //close this tab
        const isTest = await CL_getValue(KEY_IS_TEST, false);
        if (isTest) {
          logContent(
            getTextLanguageContent({
              vi: "Đang test, tab sẽ đóng sau 15s",
              en: "Is test, tab will close after 15s",
            }),
          );
          setTimeout(() => {
            sendMessage(KEY_CLOSE_THIS_TAB, {});
          }, 15 * 1000);
        } else {
          const closeDelay = random(35, 55);
          logContent(
            getTextLanguageContent({
              vi: `Công việc đã hoàn thành, tab này sẽ đóng sau ${closeDelay}s`,
              en: `Task completed, this tab will close after ${closeDelay}s`,
            }),
          );
          setTimeout(() => {
            sendMessage(KEY_CLOSE_THIS_TAB, {});
          }, closeDelay * 1000);

          //check spam
          setTimeout(
            async () => {
              if (getIsExistDialog()) {
                const isSpammed = checkIsSpammed();
                if (isSpammed) {
                  sendMessage(KEY_UPDATE_IS_SPAMMED, {
                    isSpammed,
                  });
                  await sleep(2000);
                }
                clickOutSideHideDialog();
              }
            },
            random(10, 20) * 1000,
          );
        }
      }
    } catch (error) {
      logErrorContent("Error at content posting main: ", error);
    }
  } catch (error) {
    logErrorContent("Error at content main: ", error);
  }
}

async function test() {
  try {
    const isDevMode = await CL_getValue(KEY_IS_DEVELOPER_MODE);
    if (!isDevMode) return;
    const divBtn = document.createElement("div");

    const btnTest = document.createElement("button");
    btnTest.textContent = "test";
    btnTest.addEventListener("click", handleClick);
    btnTest.style.padding = "10px";
    btnTest.style.cursor = "pointer";

    const btnTest2 = document.createElement("button");
    btnTest2.textContent = "test2";
    btnTest2.addEventListener("click", handleClick2);
    btnTest2.style.padding = "10px";
    btnTest2.style.cursor = "pointer";

    divBtn.style.position = "fixed";
    divBtn.style.top = "60px";
    divBtn.style.right = "60px";
    divBtn.style.zIndex = "1000";
    divBtn.style.padding = "10px";
    divBtn.style.display = "flex";
    divBtn.style.gap = "10px";

    divBtn.appendChild(btnTest);
    divBtn.appendChild(btnTest2);

    async function handleClick() {}

    async function handleClick2() {}

    document.body.appendChild(divBtn);
  } catch (error) {
    logError("Error at content test: ", error);
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
