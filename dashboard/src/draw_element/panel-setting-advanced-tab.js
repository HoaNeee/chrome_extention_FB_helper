import { prefix } from "../../../contants/contants.js";
import { getTextWithLanguage, logError } from "../../../utils/utils.js";
import {
  setIsCommentWhenPostSuccessService,
  setListCommentWhenPostSuccessService,
  setMaxCommentPerTimeService,
} from "../services/comment-service.js";
import {
  getProgress,
  setIsInteractBeforePostInStorage,
  setMaxPostInteractInStorage,
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
                    <label for="${prefix}checkbox-is-comment-when-post-success" style="user-select: none;">${getTextWithLanguage({ vi: "Bình luận tương tác khi đăng bài thành công (Thử nghiệm)", en: "Comment interact when post success (Beta)" })}</label>
                </div>
                <div style="margin-left: 48px; display: flex; flex-direction: column; gap: 12px">
                  <div class="${prefix}field-container">
                    <label for="${prefix}input-max-comment-per-time">${getTextWithLanguage({ vi: "Số lượng bình luận tối đa mỗi lần", en: "Max comment per time" })}</label>
                    <div style="display: flex; gap: 4px;">
                      <input min="1" type="number" id="${prefix}input-max-comment-per-time" class="${prefix}input-outline" style="display: inline-block; flex: 1;" placeholder="EX: 1,2,3,...">
                      <button id="${prefix}btn-save-max-comment-per-time" class="not-style">${getTextWithLanguage({ vi: "Lưu", en: "Save" })}</button>
                    </div>
                  </div>
                  <div class="${prefix}field-container">
                      <label for="${prefix}input-keyword-comment-when-post-success">${getTextWithLanguage({ vi: `Nhập nội dung bình luận (nhiều bình luận cách nhau bằng cách xuống dòng)`, en: "Enter comment content (multiple comments separated by newline)" })}:
                      </label>
                      <div style="display: flex; gap: 4px;">
                          <textarea placeholder="Ex: Hay quá!\nIb mình\nGiá nhiêu shop ơi?" id="${prefix}input-keyword-comment-when-post-success" class="${prefix}input-outline auto-stretch"></textarea>
                      </div>
                      <div style="text-align: end; margin-top: 4px;">
                          <button id="${prefix}btn-save-keyword-comment-when-post-success" class="not-style">${getTextWithLanguage({ vi: "Lưu bình luận", en: "Save comment" })}</button>
                      </div>
                  </div>  
                </div>
                <div class="${prefix}field-container field-checkbox">
                    <input class="custom-checkbox" type="checkbox" id="${prefix}checkbox-is-interact-before-post">
                    <label for="${prefix}checkbox-is-interact-before-post" style="user-select: none;">${getTextWithLanguage({ vi: "Tự động tương tác trước khi đăng bài (Thử nghiệm)", en: "Auto interact before post (Beta)" })}</label>
                </div> 
                <div style="margin-left: 48px; display: flex; flex-direction: column; gap: 12px">
                    <div class="${prefix}field-container">
                      <label for="${prefix}input-max-post-interact">${getTextWithLanguage({ vi: "Số lượng bài viết tối đa cần tương tác", en: "Max post interact" })}</label>
                      <div style="display: flex; gap: 4px;">
                        <input min="1" type="number" id="${prefix}input-max-post-interact" class="${prefix}input-outline" style="display: inline-block; flex: 1;" placeholder="EX: 1,2,3,...">
                        <button id="${prefix}btn-save-max-post-interact" class="not-style">${getTextWithLanguage({ vi: "Lưu", en: "Save" })}</button>
                      </div>
                    </div>
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
      const buttonSaveKeywordCommentWhenPostSuccess = document.getElementById(
        `${prefix}btn-save-keyword-comment-when-post-success`,
      );
      buttonSaveKeywordCommentWhenPostSuccess.addEventListener("click", () => {
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
          logError("Error at buttonSaveKeywordCommentWhenPostSuccess", error);
          showNotify({
            message: getTextWithLanguage({
              vi: "Lưu bình luận thất bại",
              en: "Save comment failed",
            }),
            type: "error",
          });
        }
      });

      const buttonSaveMaxCommentPerTime = document.getElementById(
        `${prefix}btn-save-max-comment-per-time`,
      );
      buttonSaveMaxCommentPerTime.addEventListener("click", () => {
        try {
          const inputMaxCommentPerTime = anchorElem.querySelector(
            `#${prefix}input-max-comment-per-time`,
          );
          const maxCommentPerTime = inputMaxCommentPerTime.value?.trim();
          if (maxCommentPerTime) {
            setMaxCommentPerTimeService(Number(maxCommentPerTime));
          } else {
            showNotify({
              message: getTextWithLanguage({
                vi: "Không hợp lệ, vui lòng thử lại",
                en: "Invalid, please try again",
              }),
              type: "error",
            });
            return;
          }
          showNotify({
            message: getTextWithLanguage({
              vi: "Lưu số lượng bình luận tối đa mỗi lần thành công",
              en: "Save max comment per time success",
            }),
            type: "success",
          });
        } catch (error) {
          logError("Error at buttonSaveMaxCommentPerTime", error);
          showNotify({
            message: getTextWithLanguage({
              vi: "Lưu số lượng bình luận tối đa mỗi lần thất bại",
              en: "Save max comment per time failed",
            }),
            type: "error",
          });
        }
      });

      const buttonSaveMaxPostInteract = document.getElementById(
        `${prefix}btn-save-max-post-interact`,
      );
      buttonSaveMaxPostInteract.addEventListener("click", () => {
        try {
          const inputMaxPostInteract = anchorElem.querySelector(
            `#${prefix}input-max-post-interact`,
          );
          const maxPostInteract = inputMaxPostInteract.value?.trim();
          if (maxPostInteract) {
            setMaxPostInteractInStorage(Number(maxPostInteract));
          } else {
            showNotify({
              message: getTextWithLanguage({
                vi: "Không hợp lệ, vui lòng thử lại",
                en: "Invalid, please try again",
              }),
              type: "error",
            });
            return;
          }
          showNotify({
            message: getTextWithLanguage({
              vi: "Lưu số lượng bài viết tối đa cần tương tác thành công",
              en: "Save max post interact success",
            }),
            type: "success",
          });
        } catch (error) {
          logError("Error at buttonSaveMaxPostInteract", error);
          showNotify({
            message: getTextWithLanguage({
              vi: "Lưu số lượng bài viết tối đa cần tương tác thất bại",
              en: "Save max post interact failed",
            }),
            type: "error",
          });
        }
      });
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
