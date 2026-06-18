import { SELECTOR, SELECTOR_RAW, SELECTOR_VI } from "../contants/contants.js";
import { getLanguage, logError, random, sleep } from "../../utils/utils.js";
import { CL_getStopTool } from "../utils/storage.js";

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
      null,
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

/**
 * Find element by selector with evaluate or querySelector
 * @param {string} selector
 * @returns {HTMLElement|null}
 */
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
      null,
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
    const selectors =
      lang === "vi" ? SELECTOR_VI.elementsToPost : SELECTOR.elementsToPost;

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
    const selectors =
      lang === "vi"
        ? SELECTOR_VI.elementsCreatePost
        : SELECTOR.elementsCreatePost;

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
          div.children?.[1] ||
            div?.children?.[0] ||
            div?.firstElementChild ||
            div,
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

      const selectors =
        lang === "vi" ? SELECTOR_VI.elementsPost : SELECTOR.elementsPost;

      for await (const selector of selectors) {
        const div = await waitForElement(
          selector,
          divContainer.lastElementChild,
        );
        if (div) {
          await sleep(random(2, 5) * 100);

          const evt = new MouseEvent("mouseover", {
            bubbles: true,
            cancelable: true,
          });
          div.dispatchEvent(evt);
          await sleep(random(2, 3) * 100);

          //MAYBE better than dispatchEvent
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
  const selectors =
    lang === "vi"
      ? SELECTOR_VI.elementsCloseDialog
      : SELECTOR.elementsCloseDialog;

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

    const selectors =
      lang === "vi" ? SELECTOR_VI.elementsSpammed : SELECTOR.elementsSpammed;

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

function findElementJustPosted() {
  try {
    const lang = getLanguage();

    const selectorsAlertPending =
      lang === "vi"
        ? SELECTOR_VI.elementsPostedPendingAlert
        : SELECTOR.elementsPostedPendingAlert;
    const selectorsPostedPending =
      lang === "vi"
        ? SELECTOR_VI.elementsPostedPending
        : SELECTOR.elementsPostedPending;

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
    const selectors =
      lang === "vi"
        ? SELECTOR_VI.buttonSubmitCommentInGroup
        : SELECTOR.buttonSubmitCommentInGroup;
    for (const selector of selectors) {
      const button = findElement(selector, anchorElem);
      return button;
    }
  } catch (error) {
    logError("Error at findButtonPostCommentJustPosted: ", error);
    return null;
  }
}

/**
 * Get feed element
 * @param {number} time
 * @returns {Promise<HTMLElement>}
 */
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

/**
 * Scroll element into view
 * @param {string|HTMLElement} selector
 */
async function scrollElementIntoView(selector) {
  if (selector instanceof HTMLElement || selector instanceof Node) {
    selector.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  await sleep(1000 + random(100, 500));
}

/**
 * Click element
 * @param {HTMLElement} element
 * @param {object} options
 */
async function eventClickElement(element, isDispatch = false) {
  await sleep(random(1, 2) * 1000 + random(100, 1000));

  await scrollElementIntoView(element);

  await sleep(random(1, 2) * 1000 + random(100, 1000));

  const overEvt = new MouseEvent("mouseover", {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(overEvt);

  await sleep(random(2, 4) * 200);

  if (isDispatch) {
    element.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
  } else {
    element.click();
  }
}

export {
  waitForElement,
  findDivToPost,
  findDivCreatePostContainer,
  findDivInputTextbox,
  findButtonPostAndClick,
  getIsExistDialog,
  clickOutSideHideDialog,
  disabledElement,
  enabledElement,
  hideElement,
  showElement,
  findElement,
  checkIsSpammed,
  findElementJustPosted,
  findTextBoxJustPosted,
  findButtonPostCommentJustPosted,
  findElementFeedInGroup,
  scrollElementIntoView,
  eventClickElement,
};
