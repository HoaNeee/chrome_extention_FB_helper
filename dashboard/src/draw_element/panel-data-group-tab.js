import { prefix } from "../../../contants/contants.js";
import { handleErrorHelper } from "../../../utils/exception.js";
import {
  cloneData,
  getTextWithLanguage,
  logError,
} from "../../../utils/utils.js";
import {
  clearDataGroupPost,
  deleteDataGroupPost,
  exportDataGroupPost,
  getListDataGroupPost,
  importDataGroupPosts,
} from "../../../services/data-group-post-service.js";
import { createDialog } from "./dialog.js";
import { createDivListGroups } from "./listGroup.js";
import { showNotify } from "./notify.js";
import { addLog } from "./panel-log.js";
import { drawPanelGroup } from "./panelGroup.js";

async function createPanelTabGroup(anchorElem = document.body) {
  try {
    const rootGroupTab = document.createElement("div");
    rootGroupTab.className = "tm_tab-group";
    rootGroupTab.setAttribute("data-tab-value", "groups");

    const groupHTML = `
    <div id="${prefix}div-panel-group" style="padding: 0 24px;">
				<div style="display: flex; gap: 8px; align-items: center; margin-bottom: 12px;">
        <h2 style="">${getTextWithLanguage({ vi: "Dữ liệu nhóm", en: "Data Groups" })}</h2>
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
        <button id="${prefix}btn-add-data-group">${getTextWithLanguage({ vi: "Thêm dữ liệu nhóm", en: "Add data group" })}</button>
        <button id="${prefix}btn-export-data-groups">${getTextWithLanguage({ vi: "Xuất dữ liệu nhóm", en: "Export data group" })}</button>
        <button id="${prefix}btn-import-data-groups">${getTextWithLanguage({ vi: "Nhập dữ liệu nhóm", en: "Import data group" })}</button>
        <button id="${prefix}btn-clear-data-groups">${getTextWithLanguage({ vi: "Xóa tất cả dữ liệu nhóm", en: "Clear all data group" })}</button>
        <input type="file" id="${prefix}input-import-data-groups" style="display: none;" accept=".json">
    </div>
        <div style="padding: 8px;" id="${prefix}list-data-groups-container"></div>
    </div>
  `;

    rootGroupTab.innerHTML = groupHTML;

    const root = anchorElem.querySelector("#tm_root");
    if (root) {
      root.appendChild(rootGroupTab);
    }

    //work at list groups
    //dialog edit group
    const {
      setIsShow: setIsShowDialogEditGroup,
      changeContent: changeContentDialogEditGroup,
    } = createDialog({
      html: ``,
      title: getTextWithLanguage({
        vi: "Chỉnh sửa dữ liệu nhóm",
        en: "Edit data group",
      }),
    });

    const listGroupsContainer = anchorElem.querySelector(
      `#${prefix}list-data-groups-container`,
    );

    let listDataGroupPost = await getListDataGroupPost();

    async function drawListGroups(data) {
      const divs = await createDivListGroups(data);

      const innerDiv = document.createElement("div");
      innerDiv.style.display = "flex";
      innerDiv.style.flexDirection = "column";
      innerDiv.style.gap = "4px";

      if (!divs.length) {
        listGroupsContainer.innerHTML = `<div style="text-align: center; color: #666;">No data groups</div>`;
        return;
      }

      async function onDeleteGroup(id) {
        try {
          await deleteDataGroupPost(id);

          const groupTitle =
            listDataGroupPost.find((item) => item.id === id)?.name || "";
          listDataGroupPost = listDataGroupPost.filter(
            (item) => item.id !== id,
          );

          await drawListGroups(listDataGroupPost);
          setIsShowDialogEditGroup(false);
          showNotify({
            message: "Delete group successfully",
            type: "success",
          });

          addLog({
            vi: `Bạn vừa xóa dữ liệu nhóm: ${groupTitle}`,
            en: `You just deleted data of group: ${groupTitle}`,
          });
        } catch (error) {
          addLog({
            vi: `Không thể xóa dữ liệu nhóm`,
            en: `Cannot delete data of group`,
          });
          showNotify({
            message: "Error occurred while deleting group",
            type: "error",
          });
          logError("Error at onDeleteGroup: ", error);
        }
      }

      for (const div of divs) {
        let id = div.getAttribute("data-group-id");
        const btnView = div.querySelector(`.${prefix}btn-view-data-group`);

        const dataPost = data.find((item) => item.id === id);

        if (dataPost) {
          btnView?.addEventListener("click", () => {
            const elementPanel = drawPanelGroup({
              initialData: {
                id: id || dataPost.id,
                title: dataPost.title,
                contents: dataPost.contents,
                files: dataPost.files,
                name: dataPost?.name || "",
                priority: dataPost?.priority || "",
              },
              type: "edit",
              onDelete: async () => {
                await onDeleteGroup(id);
              },
              onSave: async (data) => {
                const index = listDataGroupPost.findIndex(
                  (item) => item.id === data?.id,
                );
                if (index !== -1) {
                  listDataGroupPost[index] = data;

                  await drawListGroups(listDataGroupPost);
                  setIsShowDialogEditGroup(false);
                  showNotify({
                    message: getTextWithLanguage({
                      vi: "Chỉnh sửa dữ liệu nhóm thành công",
                      en: "Edit data group successfully",
                    }),
                    type: "success",
                  });
                }
              },
            });
            changeContentDialogEditGroup(elementPanel);
            setIsShowDialogEditGroup(true);
          });
        }
        innerDiv.appendChild(div);
      }
      listGroupsContainer.innerHTML = "";
      listGroupsContainer.appendChild(innerDiv);
    }

    if (listGroupsContainer) {
      await drawListGroups(listDataGroupPost || []);
    }
    //end work at list groups

    //dialog add group
    const panelAddGroupHTML = drawPanelGroup({
      onSave: async (dataPost) => {
        // const dataSaved = (await getDataSavedInStorage()) || [];
        listDataGroupPost.push(dataPost);
        await drawListGroups(listDataGroupPost);
        setIsShowAddDialogGroup(false);
        showNotify({
          message: getTextWithLanguage({
            vi: "Thêm dữ liệu nhóm thành công",
            en: "Add data group successfully",
          }),
          type: "success",
        });
      },
      initPriority: listDataGroupPost.length + 1,
    });

    const { setIsShow: setIsShowAddDialogGroup } = createDialog({
      html: panelAddGroupHTML,
      title: getTextWithLanguage({
        vi: "Thêm dữ liệu nhóm",
        en: "Add data group",
      }),
    });

    addEvent();

    async function addEvent() {
      try {
        const btnAddGroup = document.querySelector(`#tm_btn-add-data-group`);
        if (btnAddGroup) {
          btnAddGroup.addEventListener("click", () => {
            setIsShowAddDialogGroup(true);
          });
        }

        //clear groups
        const btnClearGroup = document.querySelector(
          `#tm_btn-clear-data-groups`,
        );
        if (btnClearGroup) {
          let isConfirmingClearGroups = false;
          let timeOutIdClearGroups = null;
          btnClearGroup.addEventListener("click", async () => {
            if (isConfirmingClearGroups) {
              if (timeOutIdClearGroups) {
                clearTimeout(timeOutIdClearGroups);
                timeOutIdClearGroups = null;
              }
              try {
                await clearDataGroupPost();
                drawListGroups([]);
                showNotify({
                  message: getTextWithLanguage({
                    vi: "Đã dọn sạch dữ liệu nhóm",
                    en: "Cleaned all data group successfully",
                  }),
                  type: "success",
                });
              } catch (error) {
                logError("Error at clearDataGroupPost in addEvent: " + error);
                showNotify({
                  message: getTextWithLanguage({
                    vi: "Không thể dọn sạch dữ liệu nhóm",
                    en: "Cannot clean all data group",
                  }),
                  type: "error",
                });
              }
              isConfirmingClearGroups = false;
              btnClearGroup.innerText = getTextWithLanguage({
                en: "Clear data group",
                vi: "Xóa dữ liệu nhóm",
              });
              btnClearGroup.style.background = "";
              addLog({
                vi: "Bạn vừa xóa hết danh sách dữ liệu nhóm",
                en: "You just cleared all data group",
              });
            } else {
              isConfirmingClearGroups = true;
              btnClearGroup.innerText = getTextWithLanguage({
                en: "Click again to confirm",
                vi: "Xác nhận lại",
              });
              btnClearGroup.style.background = "var(--tm-text-danger)";
              timeOutIdClearGroups = setTimeout(() => {
                isConfirmingClearGroups = false;
                btnClearGroup.innerText = getTextWithLanguage({
                  en: "Clear data groups",
                  vi: "Xóa dữ liệu nhóm",
                });
                btnClearGroup.style.background = "";
              }, 3000);
            }
          });
        }

        const btnExportGroups = document.querySelector(
          `#tm_btn-export-data-groups`,
        );
        if (btnExportGroups) {
          btnExportGroups.addEventListener("click", () => {
            exportGroupsEvent(listDataGroupPost);
          });
        }

        const btnImportGroups = document.querySelector(
          `#tm_btn-import-data-groups`,
        );
        if (btnImportGroups) {
          btnImportGroups.addEventListener("click", async () => {
            await importGroupsEvent(async (listDataGroupImported) => {
              listDataGroupPost = listDataGroupImported;
              await drawListGroups(listDataGroupPost);
            });
          });
        }
      } catch (error) {
        logError("Error at addEvent: ", error);
      }
    }
  } catch (error) {
    logError("Error at CreatePanelGroups", error);
  }
}

async function exportGroupsEvent(listDataGroupPost) {
  try {
    const list = cloneData(listDataGroupPost);
    await exportDataGroupPost(list);
    addLog({
      vi: `Bạn vừa xuất ${listDataGroupPost.length} dữ liệu nhóm vào file JSON`,
      en: `You just exported ${listDataGroupPost.length} data groups to a JSON file`,
    });
  } catch (error) {
    handleErrorHelper({
      error,
      code: error.code,
      msg: getTextWithLanguage({
        vi: "Không thể xuất dữ liệu nhóm",
        en: "Cannot export data group",
      }),
    });
  }
}

async function importGroupsEvent(cb) {
  const inputImportGroups = document.querySelector(
    `#${prefix}input-import-data-groups`,
  );
  if (inputImportGroups) {
    inputImportGroups.value = "";
    inputImportGroups.click();
    inputImportGroups.onchange = function (event) {
      try {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async function (e) {
          try {
            const content = e.target.result;
            const data = JSON.parse(content);
            const listDataGroupImported = await importDataGroupPosts(data);
            cb?.(listDataGroupImported);
            if (listDataGroupImported.length) {
              showNotify({
                message: getTextWithLanguage({
                  vi: "Nhập dữ liệu nhóm thành công",
                  en: "Import data group successfully",
                }),
                type: "success",
              });
              addLog({
                vi: `Bạn vừa thêm ${listDataGroupImported.length} nhóm vào danh sách nhóm từ file`,
                en: `You just added ${listDataGroupImported.length} groups to the list of groups from importing a file`,
              });
            }
          } catch (err) {
            handleErrorHelper({ name: "importDataGroupPost", error: err });
          }
        };
        reader.readAsText(file);
      } catch (error) {
        logError("Error at importGroupsEvent: ", error);
      }
    };
  }
}

export { createPanelTabGroup };
