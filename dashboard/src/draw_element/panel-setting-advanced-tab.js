import { prefix } from "../../../contants/contants.js";
import { getTextWithLanguage, logError } from "../../../utils/utils.js";
import {
  setIsCommentWhenPostSuccessService,
  setListCommentWhenPostSuccessService,
} from "../services/comment-service.js";
import {
  getProgress,
  setIsInteractBeforePostInStorage,
} from "../services/storage-service.js";
import { showNotify } from "./notify.js";
import { addLog } from "./panel-log.js";

async function createPanelAdvancedSetting(anchorElem = document.body) {
  try {
    const rootAdvancedSetting = document.createElement("div");
    rootAdvancedSetting.className = `${prefix}tab-setting`;
    rootAdvancedSetting.setAttribute("data-tab-value", "settings-advanced");

    const advancedSettingHTML = `
        <div class="${prefix}advanced-setting">
            <div class="${prefix}section">
                <h2 class="${prefix}title-section">${getTextWithLanguage({ vi: "Cài đặt nâng cao", en: "Advanced Setting" })}</h2>
                <div class="${prefix}field-container field-checkbox">
                    <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-comment-when-post-success">
                    <label for="${prefix}checkbox-is-comment-when-post-success" style="user-select: none;">${getTextWithLanguage({ vi: "Bình luận tương tác khi đăng bài thành công", en: "Comment interact when post success" })}</label>
                </div>
                <div style="margin-left: 48px;">
                  <div class="${prefix}field-container">
                      <label for="${prefix}input-keyword-comment-when-post-success">${getTextWithLanguage({ vi: `Nhập nội dung bình luận (cách nhau bằng cách xuống dòng)`, en: "Enter comment content (separate by newline)" })}:
                      </label>
                      <div style="display: flex; gap: 4px;">
                          <textarea placeholder="Ex: Hay quá!\nIb mình\nGiá nhiêu shop ơi?" id="${prefix}input-keyword-comment-when-post-success" class="${prefix}input-outline" style="flex: 1; height: 70px; padding: 8px 4px"></textarea>
                      </div>
                      <div style="text-align: end; margin-top: 4px;">
                          <button id="${prefix}btn-save-keyword-comment-when-post-success" class="not-style">${getTextWithLanguage({ vi: "Lưu bình luận", en: "Save comment" })}</button>
                      </div>
                  </div>  
                </div>
                <div class="${prefix}field-container field-checkbox">
                    <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-interact-before-post">
                    <label for="${prefix}checkbox-is-interact-before-post" style="user-select: none;">${getTextWithLanguage({ vi: "Tự động tương tác trước khi đăng bài", en: "Auto interact before post" })}</label>
                </div>
        </div>
    `;

    rootAdvancedSetting.innerHTML = advancedSettingHTML;
    const root = anchorElem.querySelector("#tm_root");
    if (root) {
      root.appendChild(rootAdvancedSetting);
    }

    // const { setIsShow: setIsShowDialogViewCommentContent } = createDialog({
    //   html: "View comment content",
    // });

    function addBtnEvent() {
      try {
        // const buttonViewContentComments = document.getElementById(
        //   `${prefix}btn-view-content-comments`,
        // );
        // buttonViewContentComments.addEventListener("click", () => {
        //   setIsShowDialogViewCommentContent(true);
        // });
        const buttonSaveKeywordCommentWhenPostSuccess = document.getElementById(
          `${prefix}btn-save-keyword-comment-when-post-success`,
        );
        buttonSaveKeywordCommentWhenPostSuccess.addEventListener(
          "click",
          () => {
            try {
              const inputKeyword = anchorElem.querySelector(
                `#${prefix}input-keyword-comment-when-post-success`,
              );
              const keyword = inputKeyword.value?.trim();
              setListCommentWhenPostSuccessService(keyword);
              showNotify({
                message: getTextWithLanguage({
                  vi: "Lưu bình luận thành công",
                  en: "Save comment success",
                }),
                type: "success",
              });
            } catch (error) {
              logError(
                "Error at buttonSaveKeywordCommentWhenPostSuccess",
                error,
              );
              showNotify({
                message: getTextWithLanguage({
                  vi: "Lưu bình luận thất bại",
                  en: "Save comment failed",
                }),
                type: "error",
              });
            }
          },
        );
      } catch (error) {
        logError("Error at addEvent", error);
      }
    }

    function addFieldEvent() {
      const checkboxIsCommentWhenPostSuccess = document.getElementById(
        `${prefix}checkbox-is-comment-when-post-success`,
      );
      checkboxIsCommentWhenPostSuccess.addEventListener("change", async (e) => {
        const isComment = e.target.checked;
        setIsCommentWhenPostSuccessService(isComment);
        const isProgress = await getProgress();
        if (isProgress) {
          addLog({
            vi: `Tính năng bình luận sau khi đăng bài đã được ${isComment ? "bật" : "tắt"}`,
            en: `The function of commenting after posting has been ${isComment ? "enabled" : "disabled"}`,
          });
        }
      });

      const checkboxIsInteractBeforePost = document.getElementById(
        `${prefix}checkbox-is-interact-before-post`,
      );
      checkboxIsInteractBeforePost.addEventListener("change", (e) => {
        const isInteract = e.target.checked;
        setIsInteractBeforePostInStorage(isInteract);
      });
    }

    addBtnEvent();
    addFieldEvent();
  } catch (error) {
    logError("Error at createPanelAdvancedSetting", error);
  }
}

export { createPanelAdvancedSetting };
