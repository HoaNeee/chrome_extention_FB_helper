import { prefix } from "../../../contants/contants.js";
import { commentWalkHelper } from "../../../helpers/comment-walk.js";
import { commentWalkService } from "../../../services/comment-walk-service.js";
import {
  getTextWithLanguage,
  logError,
  parseFileToObjectBase64,
} from "../../../utils/utils.js";
import { createButtonConfirm } from "./button.js";
import { drawDataCommentWalkElement } from "./dialog-add-or-edit-comment-walk-html.js";
import { createDialog } from "./dialog.js";
import { createDivItemListDataCommentWalk } from "./list-data-comment-walk.js";
import { showNotify } from "./notify.js";
import { addLog } from "./panel-log.js";

async function createPanelCommentWalkTab(anchorElem = document.body) {
  try {
    const container = document.createElement("div");
    container.className = `${prefix}comment-walk-tab`;
    container.setAttribute("data-tab-value", "comment-walk");

    const inner = document.createElement("div");
    inner.className = `${prefix}comment-walk-tab-inner`;

    inner.innerHTML = `
        <div id="${prefix}div-panel-comment-walk" style="padding: 0 24px;">
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
                <h2 style="">${getTextWithLanguage({ vi: "Dữ liệu bình luận dạo", en: "Data Comment Walk" })}</h2>
            </div>
            <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;" class="data-comment-walk-btn-action">
                <button id="${prefix}btn-add-data-comment">${getTextWithLanguage({ vi: "Thêm dữ liệu bình luận", en: "Add data comment" })}</button>
                <button id="${prefix}btn-export-data-comments">${getTextWithLanguage({ vi: "Xuất dữ liệu bình luận", en: "Export data comment" })}</button>
                <button id="${prefix}btn-import-data-comments">${getTextWithLanguage({ vi: "Nhập dữ liệu bình luận", en: "Import data comment" })}</button>
                <input type="file" id="${prefix}input-import-data-comments" style="display: none;" accept=".json">
            </div>
            <div style="padding: 8px; overflow-y: scroll" id="${prefix}list-data-comments-container"></div>
        </div>
    `;

    container.appendChild(inner);

    let listDataCommentWalk = await commentWalkService.getListCommentWalk();

    const listDataCommentWalkElementContainer = container.querySelector(
      `#${prefix}list-data-comments-container`,
    );

    await drawListCommentWalk(listDataCommentWalk);

    const root = anchorElem.querySelector("#tm_root");
    if (root) {
      root.appendChild(container);
    }

    async function cleanFiles(files) {
      if (Array.isArray(files) && files.length) {
        return await Promise.all(
          files.map(async (file) => {
            return await parseFileToObjectBase64(file);
          }),
        );
      }
      return [];
    }

    const { setIsShow: setIsShowDialogAddComment } = createDialog({
      html: drawDataCommentWalkElement({
        onSave: async (payload) => {
          const files = await cleanFiles(payload.files);
          payload.files = files;

          const newData = await commentWalkService.addNewCommentWalk(payload);
          listDataCommentWalk.push(newData);
          await drawListCommentWalk(listDataCommentWalk);
          setIsShowDialogAddComment(false);

          showNotify({
            message: getTextWithLanguage({
              vi: "Thêm dữ liệu bình luận thành công",
              en: "Add data comment walk success",
            }),
            type: "success",
          });

          addLog({
            vi: `Đã thêm dữ liệu "${payload.name || payload.title_query_search}" vào danh sách bình luận dạo`,
            en: `Add "${payload.name || payload.title_query_search}" data comment walk success`,
          });
        },
        type: "add",
      }),
      title: getTextWithLanguage({
        vi: "Thêm dữ liệu bình luận",
        en: "Add data comment",
      }),
    });

    const {
      setIsShow: setIsShowDialogEditComment,
      changeContent: changeContentDialogEditComment,
    } = createDialog({
      html: ``,
      title: getTextWithLanguage({
        vi: "Chỉnh sửa dữ liệu bình luận",
        en: "Edit data comment",
      }),
    });

    async function drawListCommentWalk(data) {
      const divs = await createDivItemListDataCommentWalk(data);

      const innerDiv = document.createElement("div");
      innerDiv.style.display = "flex";
      innerDiv.style.flexDirection = "column";
      innerDiv.style.gap = "4px";

      if (!divs.length) {
        listDataCommentWalkElementContainer.innerHTML = `<div style="text-align: center; color: #666;">No data comment walk</div>`;
        return;
      }

      async function onDelete(id) {
        try {
          const commentWalk = await commentWalkService.getCommentWalkById(id);
          const sucess = await commentWalkService.deleteDataCommentWalk(id);
          if (sucess) {
            const newList = listDataCommentWalk.filter(
              (item) => item.id !== id,
            );
            listDataCommentWalk = [...newList];
            await drawListCommentWalk(listDataCommentWalk);
            setIsShowDialogEditComment(false);
            showNotify({
              message: getTextWithLanguage({
                vi: "Xóa dữ liệu bình luận thành công",
                en: "Delete data comment walk success",
              }),
              type: "success",
            });
            addLog({
              vi: `Đã xóa dữ liệu "${commentWalk.name || commentWalk.title_query_search}" ra khỏi danh sách bình luận dạo`,
              en: `Delete "${commentWalk.name || commentWalk.title_query_search}" data comment walk success`,
            });
          }
        } catch (error) {
          logError("Error at onDeleteGroup: ", error);
        }
      }

      for (const div of divs) {
        let id = div.getAttribute("data-comment-walk-id");
        const btnView = div.querySelector(
          `.${prefix}btn-view-data-comment-walk`,
        );

        const dataPost = data.find((item) => item.id === id);

        if (dataPost) {
          btnView?.addEventListener("click", async () => {
            const dataComment = await commentWalkService.getCommentWalkById(id);

            if (!dataComment) {
              return;
            }
            const element = drawDataCommentWalkElement({
              initialData: dataComment,
              type: "edit",
              onDelete: onDelete,
              onSave: async (payload, isEditFile) => {
                if (isEditFile) {
                  payload.files = await cleanFiles(payload.files);
                }

                const newData = await commentWalkService.updateDataCommentWalk(
                  payload.id,
                  payload,
                );

                listDataCommentWalk = listDataCommentWalk.map((item) => {
                  if (item.id === payload.id) {
                    return newData;
                  }
                  return item;
                });
                await drawListCommentWalk(listDataCommentWalk);
                setIsShowDialogEditComment(false);

                showNotify({
                  message: getTextWithLanguage({
                    vi: "Cập nhật dữ liệu bình luận thành công",
                    en: "Update data comment walk success",
                  }),
                  type: "success",
                });

                addLog({
                  vi: `Đã cập nhật dữ liệu "${payload.name || payload.title_query_search}" trong danh sách bình luận dạo`,
                  en: `Update "${payload.name || payload.title_query_search}" data comment walk success`,
                });
              },
            });

            changeContentDialogEditComment(element);
            setIsShowDialogEditComment(true);
          });
        }
        innerDiv.appendChild(div);
      }
      listDataCommentWalkElementContainer.innerHTML = "";
      listDataCommentWalkElementContainer.appendChild(innerDiv);
    }

    async function addEvent() {
      const divDataCommentWalkBtnAction = document.querySelector(
        ".data-comment-walk-btn-action",
      );
      const btnAddDataComment = document.getElementById(
        `${prefix}btn-add-data-comment`,
      );
      const btnExportDataComments = document.getElementById(
        `${prefix}btn-export-data-comments`,
      );
      const btnImportDataComments = document.getElementById(
        `${prefix}btn-import-data-comments`,
      );

      if (divDataCommentWalkBtnAction) {
        const btnConfirm = createButtonConfirm({
          title: getTextWithLanguage({
            vi: "Xóa tất cả dữ liệu bình luận",
            en: "Clear all data comment",
          }),
          titleConfirm: "Xác nhận xóa",
          onConfirm: async () => {
            const success = await commentWalkService.clearAllDataCommentWalk();
            if (success) {
              showNotify({
                message: getTextWithLanguage({
                  vi: "Xóa toàn bộ dữ liệu bình luận thành công",
                  en: "Clear all data comment walk success",
                }),
                type: "success",
              });
              listDataCommentWalk = [];
              await drawListCommentWalk(listDataCommentWalk);
            }
          },
        });
        divDataCommentWalkBtnAction.appendChild(btnConfirm);
      }

      if (btnAddDataComment) {
        btnAddDataComment.addEventListener("click", async () => {
          setIsShowDialogAddComment(true);
        });
      }

      if (btnExportDataComments) {
        btnExportDataComments.addEventListener("click", async () => {
          await commentWalkHelper.exportDataCommentWalk(listDataCommentWalk);
        });
      }

      if (btnImportDataComments) {
        btnImportDataComments.addEventListener("click", async () => {
          await commentWalkHelper.importDataCommentWalk(async (data) => {
            listDataCommentWalk.push(...data);
            await drawListCommentWalk(listDataCommentWalk);
          });
        });
      }
    }

    addEvent();
  } catch (error) {
    console.log("Error at pancel tab comment walk", error);
  }
}

export { createPanelCommentWalkTab };
