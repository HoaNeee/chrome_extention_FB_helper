import { SELECTOR, SELECTOR_RAW, SELECTOR_VI } from "../contants/contants";
import {
  convertCorrectHref,
  getIsCorrectPostURL,
  getLanguage,
  logActions,
  logError,
  random,
  randomRateBoolean,
  shuffleArray,
  sleep,
} from "../../utils/utils";
import { CL_addLogRequest } from "../utils/request";
import { findElement, findElementFeedInGroup, waitForElement } from "./dom";
import {
  CL_getAllDataGroupsOfUser,
  CL_getIsScrollDetectListGroup,
  CL_getMetadataInteractBeforePost,
  CL_getStopTool,
  CL_setDecidedInteractBeforePost,
} from "../utils/storage";

async function getListElementContainer() {
  try {
    const lang = getLanguage();

    let divContainerList = null;

    const selectorsContainerList =
      lang === "vi"
        ? SELECTOR_VI.listElementContainers
        : SELECTOR.listElementContainers;

    for (const selector of selectorsContainerList) {
      divContainerList = await waitForElement(selector);
      if (divContainerList) break;
    }

    let selectorGroupWaitingTexts = SELECTOR_VI.allGroupsJoinTexts;
    let spanExistGroupWaiting = null;
    //check have group waiting
    for (const selector of selectorGroupWaitingTexts) {
      spanExistGroupWaiting = findElement(selector);
      if (spanExistGroupWaiting) break;
    }

    const listItem = await waitForElement(`div[role="listitem"]:last-child`);
    let listElement = null;

    if (spanExistGroupWaiting) {
      const parentEl = listItem?.parentElement?.parentElement?.parentElement;
      listElement =
        parentEl?.children?.[1] || parentEl?.children?.[0] || parentEl;
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

/**
 * @returns {Promise<Array<{title: string, href: string}>>}
 */
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

        //convert correct href (maybe have case href end not with / but correct url)
        href = convertCorrectHref(href);

        if (getIsCorrectPostURL(href)) {
          list.push({ title, href });
        }
      }
    }
    CL_addLogRequest({
      vi: `Lấy danh sách nhóm của người dùng thành công, tổng ${list.length} nhóm`,
      en: `Got ${list.length} groups of user successfully`,
    });
    return list;
  } catch (e) {
    CL_addLogRequest({
      vi: `Lỗi khi lấy danh sách nhóm của người dùng, ${e?.message || e}`,
      en: `Error when getting list groups of user, ${e?.message || e}`,
    });
    throw new Error("Error get list group: " + e);
  }
}

async function scrollDetectListGroups(listContainer) {
  try {
    const lang = getLanguage();
    const selectorsContainerList =
      lang === "vi"
        ? SELECTOR_VI.listElementContainers
        : SELECTOR.listElementContainers;

    let listElement = null;
    for (const selector of selectorsContainerList) {
      listElement = await waitForElement(selector);
      if (listElement) break;
    }

    let selectorGroupWaitingTexts =
      lang === "vi"
        ? SELECTOR_VI.allGroupsJoinTexts
        : SELECTOR.allGroupsJoinTexts;

    let h2ExistGroupWaiting = null;
    //check have group waiting
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
    const duration = 3000;
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

      await sleep(duration + random(100, 1000));

      //log
      logActions(currentGroup, maxGroup);
      window.dispatchEvent(new Event("scroll"));
      ++i;
    }
  } catch (error) {
    throw new Error("Error scroll detect list groups: " + error);
  }
}

/**
 * Random reaction, like, haha, love
 * @description id = 1: Thích
 * @description id = 2: Yêu thích
 * @description id = 3: Thương thương
 * @description id = 4: Haha
 * @description id = 5: Ngạc nhiên
 * @description id = 6: Buồn
 * @description id = 7: Phẫn nộ
 * @returns {{id: number, ariaLabel: {vi: string, en: string}}}
 */
function getRandomReaction(ignoreIds = []) {
  let reactions = [
    { id: 1, ariaLabel: { vi: "Thích", en: "Like" } },
    { id: 2, ariaLabel: { vi: "Yêu thích", en: "Love" } },
    {
      id: 3,
      ariaLabel: { vi: "Thương thương", en: "Care" },
    },
    { id: 4, ariaLabel: { vi: "Haha", en: "Haha" } },
    { id: 5, ariaLabel: { vi: "Ngạc nhiên", en: "Wow" } },
    { id: 6, ariaLabel: { vi: "Buồn", en: "Sad" } },
    { id: 7, ariaLabel: { vi: "Phẫn nộ", en: "Angry" } },
  ];

  if (ignoreIds?.length) {
    reactions = reactions.filter(
      (reaction) => !ignoreIds.includes(reaction.id),
    );
  }

  const reaction = reactions[random(0, reactions.length - 1)];
  return reaction;
}

function findPopupAndReact() {
  const popupReact = document.querySelector(
    'div[data-visualcompletion][aria-label="Cảm xúc"][role="dialog"]',
  );

  const buttons = popupReact.querySelectorAll('div[role="button"][aria-label]');
  if (buttons.length) {
    const randomReact = getRandomReaction([5, 6, 7]);

    console.log("randomReact", randomReact);

    console.log(buttons[randomReact.id - 1]);

    buttons[3].dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
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
      vi: "Bắt đầu tương tác bài viết trước khi đăng",
      en: "Started interacting with posts before posting",
    });

    let divFeed = await findElementFeedInGroup();
    if (divFeed) {
      const randomLengthReact = random(1, maxPost);
      let numberScroll = randomLengthReact * 2;

      while (numberScroll > 0) {
        divFeed?.lastElementChild?.scrollIntoView({ behavior: "smooth" });
        await sleep(random(2, 4) * 1000);
        numberScroll--;
      }

      divFeed = await findElementFeedInGroup();

      // const allDivToReacts = document.querySelectorAll(
      //   'div[aria-label*="Bày tỏ cảm xúc về bài viết"]',
      // );

      // Current just like, cannot other reaction
      const lang = getLanguage();
      const selector =
        lang === "vi" ? SELECTOR_VI.elementLike : SELECTOR.elementLike;
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
        vi: `Số bài viết cần tương tác: ${arrayDivNeedReact.length}`,
        en: `Number of posts to interact: ${arrayDivNeedReact.length}`,
      });

      for (const divReact of arrayDivNeedReact) {
        await sleep(random(1, 3) * 1234);

        divReact.scrollIntoView({ behavior: "smooth", block: "center" });

        await sleep(1000);

        divReact.focus();

        await sleep(random(1, 3) * 1234);
        divReact.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          }),
        );

        await sleep(random(2, 4) * 1234);
      }

      CL_addLogRequest({
        vi: `Đã tương tác xong, tiếp tục thực hiện đăng bài`,
        en: `Already interacted, continuing to post`,
      });
      await CL_setDecidedInteractBeforePost(false);
    }
  } catch (error) {
    logError("Error at interactBeforePost: ", error);
    CL_addLogRequest({
      vi: `Lỗi khi tương tác trước khi đăng bài, ${error?.message || error}`,
      en: `Error when interacting before posting, ${error?.message || error}`,
    });
  }
}

export {
  getListElementContainer,
  getLastItemElementListGroup,
  getAllListItemElement,
  getListGroups,
  interactBeforePost,
};
