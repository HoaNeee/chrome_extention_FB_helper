import {
  KEY_INDEXS_GROUP_CHECKED,
  prefix,
} from "../../../contants/contants.js";
import {
  findMatch,
  getTextWithLanguage,
  logError,
  now,
  randomID,
} from "../../../utils/utils.js";
import {
  getDataSavedInStorage,
  setDataSavedInStorage,
} from "../services/dataSavedService.js";
import {
  DB_deleteValue,
  DB_getValue,
  DB_setValue,
} from "../utils/api-helper.js";
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
        <h2 style="">${getTextWithLanguage({ vi: "Nhóm", en: "Groups" })}</h2>
    </div>
    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
        <button id="${prefix}btn-add-group">${getTextWithLanguage({ vi: "Thêm nhóm", en: "Add group" })}</button>
        <button id="${prefix}btn-export-groups">${getTextWithLanguage({ vi: "Xuất danh sách", en: "Export list" })}</button>
        <button id="${prefix}btn-import-groups">${getTextWithLanguage({ vi: "Nhập danh sách", en: "Import list" })}</button>
        <button id="${prefix}btn-clear-group">${getTextWithLanguage({ vi: "Xóa tất cả nhóm", en: "Clear all groups" })}</button>
        <input type="file" id="${prefix}input-import-groups" style="display: none;" accept=".json">
    </div>
        <div style="padding: 8px;" id="${prefix}list-groups-container"></div>
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
      title: getTextWithLanguage({ vi: "Chỉnh sửa nhóm", en: "Edit group" }),
    });

    const listGroupsContainer = anchorElem.querySelector(
      `#${prefix}list-groups-container`,
    );

    const dataListDataSaved = await getDataSavedInStorage();

    async function drawListGroups(data) {
      const divs = await createDivListGroups(data);

      const innerDiv = document.createElement("div");
      innerDiv.style.display = "flex";
      innerDiv.style.flexDirection = "column";
      innerDiv.style.gap = "4px";

      if (!divs.length) {
        listGroupsContainer.innerHTML = `<div style="text-align: center; color: #666;">No groups</div>`;
        return;
      }

      async function onDeleteGroup(id) {
        try {
          const dataSaved = (await getDataSavedInStorage()) || [];
          const groupTitle =
            dataSaved.find((item) => item.id === id)?.name || "";
          const newDataSaved = dataSaved.filter((item) => item.id !== id);

          const indexsChecked =
            (await DB_getValue(KEY_INDEXS_GROUP_CHECKED)) || [];
          const set = new Set(indexsChecked);
          set.delete(id);
          DB_setValue(KEY_INDEXS_GROUP_CHECKED, Array.from(set));

          setDataSavedInStorage(newDataSaved);
          await drawListGroups(newDataSaved);
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
        const id = div.getAttribute("data-group-id");
        const btnView = div.querySelector(`#${prefix}btn-view-group`);

        const group = findMatch({
          data: data,
          key: "id",
          value: id,
        });

        if (group) {
          btnView?.addEventListener("click", () => {
            const elementPanel = drawPanelGroup({
              initialData: {
                id: id || group.id,
                title: group.title,
                contents: group.contents,
                files: group.files,
                name: group?.name || "",
                priority: group?.priority || "",
              },
              type: "edit",
              onDelete: () => {
                onDeleteGroup(id);
              },
              onSave: async () => {
                const dataSaved = (await getDataSavedInStorage()) || [];
                await drawListGroups(dataSaved);
                setIsShowDialogEditGroup(false);
                showNotify({
                  message: "Save group successfully",
                  type: "success",
                });
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
      await drawListGroups(dataListDataSaved || []);
    }
    //end work at list groups

    //dialog add group
    const panelAddGroupHTML = drawPanelGroup({
      onSave: async () => {
        const dataSaved = (await getDataSavedInStorage()) || [];
        await drawListGroups(dataSaved);
        setIsShowAddDialogGroup(false);
        showNotify({
          message: "Add new group successfully",
          type: "success",
        });
      },
      initPriority: dataListDataSaved.length + 1,
    });

    const { setIsShow: setIsShowAddDialogGroup } = createDialog({
      html: panelAddGroupHTML,
      title: getTextWithLanguage({ vi: "Thêm nhóm", en: "Add group" }),
    });

    addEvent();

    async function addEvent() {
      try {
        const btnAddGroup = document.querySelector(`#tm_btn-add-group`);
        if (btnAddGroup) {
          btnAddGroup.addEventListener("click", () => {
            setIsShowAddDialogGroup(true);
          });
        }

        //clear groups
        const btnClearGroup = document.querySelector(`#tm_btn-clear-group`);
        if (btnClearGroup) {
          let isConfirmingClearGroups = false;
          let timeOutIdClearGroups = null;
          btnClearGroup.addEventListener("click", () => {
            if (isConfirmingClearGroups) {
              if (timeOutIdClearGroups) {
                clearTimeout(timeOutIdClearGroups);
                timeOutIdClearGroups = null;
              }
              setDataSavedInStorage([]);
              DB_deleteValue(KEY_INDEXS_GROUP_CHECKED);
              drawListGroups([]);
              showNotify({
                message: "Clear groups successfully",
                type: "success",
              });
              isConfirmingClearGroups = false;
              btnClearGroup.innerText = getTextWithLanguage({
                en: "Clear groups",
                vi: "Xóa nhóm",
              });
              btnClearGroup.style.background = "";
              addLog({
                vi: "Bạn vừa xóa hết danh sách nhóm cần đăng",
                en: "You just cleared all groups need post",
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
                  en: "Clear groups",
                  vi: "Xóa nhóm",
                });
                btnClearGroup.style.background = "";
              }, 3000);
            }
          });
        }

        const btnExportGroups = document.querySelector(`#tm_btn-export-groups`);
        if (btnExportGroups) {
          btnExportGroups.addEventListener("click", exportGroupsEvent);
        }

        const btnImportGroups = document.querySelector(`#tm_btn-import-groups`);
        if (btnImportGroups) {
          btnImportGroups.addEventListener("click", async () => {
            await importGroupsEvent(async () => {
              const dataSaved = (await getDataSavedInStorage()) || [];
              await drawListGroups(dataSaved);
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

async function exportGroupsEvent() {
  try {
    const dataSaved = (await getDataSavedInStorage()) || [];
    if (!dataSaved || !dataSaved.length) {
      showNotify({
        message: "No data to export",
        type: "error",
      });
      return;
    }
    const dataStr = JSON.stringify(dataSaved);

    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;

    const timeNow = now();
    const name = `data_groups_${timeNow}.json`;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    addLog({
      vi: `Bạn vừa xuất ${dataSaved.length} nhóm vào file json ${name}`,
      en: `You just exported ${dataSaved.length} groups to a JSON file ${name}`,
    });
  } catch (error) {
    logError("Error exportGroupsEvent: ", error);
    showNotify({
      message: "Error export groups",
      type: "error",
    });
  }
}

async function importGroupsEvent(cb) {
  const inputImportGroups = document.querySelector(`#tm_input-import-groups`);
  if (inputImportGroups) {
    inputImportGroups.click();
    inputImportGroups.onchange = function (event) {
      try {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async function (e) {
          try {
            const content = e.target.result;
            const data = JSON.parse(content);
            if (data) {
              const dataSaved = (await getDataSavedInStorage()) || [];
              let prio = dataSaved.length + 1;
              if (Array.isArray(data)) {
                for (const item of data) {
                  item.id = randomID();
                  item.priority = prio;
                  ++prio;
                }
                const newDataSaved = [...dataSaved, ...data];
                setDataSavedInStorage(newDataSaved);
                showNotify({
                  message: "Import groups successfully",
                  type: "success",
                });
                // await drawListGroups(newDataSaved);
                cb?.();
                addLog({
                  vi: `Bạn vừa thêm ${data.length} nhóm vào danh sách nhóm từ file`,
                  en: `You just added ${data.length} groups to the list of groups from importing a file`,
                });
              }
              //import only one not array
              else {
                data.id = randomID();
                data.priority = prio;
                dataSaved.push(data);
                setDataSavedInStorage(dataSaved);
                showNotify({
                  message: "Import group successfully",
                  type: "success",
                });
                // await drawListGroups(dataSaved);
                cb?.();
                addLog({
                  vi: `Bạn vừa thêm 1 nhóm vào danh sách nhóm từ file`,
                  en: `You just added 1 group to the list of groups from importing a file`,
                });
              }
            }
          } catch (err) {
            showNotify({
              message: "Invalid file format",
              type: "error",
            });
            logError("Error at importGroupsEvent: ", err);
            return;
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
