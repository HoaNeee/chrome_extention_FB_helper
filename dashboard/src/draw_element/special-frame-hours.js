import { prefix } from "../../../contants/contants.js";
import {
  addSpecialFrameHoursService,
  changeStatus,
  deleteSpecialFrameHoursService,
  updateSpecialFrameHoursService,
} from "../../../services/special-frame-hours-service.js";
import {
  genIDNumber,
  getTextWithLanguage,
  logError,
} from "../../../utils/utils.js";
import { createFieldElement } from "./field.js";
import { showNotify } from "./notify.js";

function createDialogAddSpecialHours() {
  const divContainer = document.createElement("div");
  divContainer.style.paddingTop = "12px";
  divContainer.style.width = "300px";

  const { fieldElement: fieldFromTime, inputElement: inputFromTime } =
    createFieldElement({
      id: `${prefix}input-from-time`,
      label: getTextWithLanguage({
        vi: "Thời gian bắt đầu (giờ): ",
        en: "Start time (hour): ",
      }),
      inputOptions: {
        min: 0,
        max: 23,
      },
      placeholder: "EX: 2",
      typeInput: "number",
    });

  const { fieldElement: fieldToTime, inputElement: inputToTime } =
    createFieldElement({
      id: `${prefix}select-to-time`,
      label: getTextWithLanguage({
        vi: "Thời gian kết thúc (giờ): ",
        en: "End time (hour): ",
      }),
      inputOptions: {
        min: 0,
        max: 23,
      },
      placeholder: "EX: 4",
      typeInput: "number",
    });

  const { fieldElement: fieldMaxGroup, inputElement: inputMaxGroup } =
    createFieldElement({
      id: `${prefix}max-group`,
      label: getTextWithLanguage({
        vi: "Số nhóm tối đa: ",
        en: "Max groups: ",
      }),
      inputOptions: {
        min: 1,
      },
      placeholder: "EX: 10",
      typeInput: "number",
    });

  const divBtnChange = document.createElement("div");
  divBtnChange.style.marginTop = "12px";
  divBtnChange.style.marginBottom = "12px";
  divBtnChange.style.width = "100%";

  const btnChangeDayOfWeek = document.createElement("button");
  btnChangeDayOfWeek.textContent = getTextWithLanguage({
    vi: "Thay đổi ngày trong tuần",
    en: "Change day of week",
  });
  btnChangeDayOfWeek.className = `${prefix}btn-change-day-of-week not-style`;

  let listDate = LIST_DATE;
  let divListDate = getListDateElement(listDate);

  btnChangeDayOfWeek.addEventListener("click", () => {
    Swal.fire({
      title: getTextWithLanguage({
        vi: "Chọn ngày",
        en: "Select day",
      }),
      html: divListDate,
      background: "var(--tm-bg-dialog)",
      color: "var(--tm-text-primary)",
      heightAuto: false,
      showCancelButton: true,
      showCloseButton: true,
      allowOutsideClick: true,
      width: `${divContainer.offsetWidth}px`,
      customClass: {
        container: "swal-container-custom",
      },
      confirmButtonText: getTextWithLanguage({
        vi: "Đồng ý",
        en: "Confirm",
      }),
      cancelButtonText: getTextWithLanguage({
        vi: "Hủy",
        en: "Cancel",
      }),
    }).then(async (res) => {
      if (res.isConfirmed) {
        listDate = getCheckboxDateSpecial();
        changeListDateElement(listDate);
      } else {
        resetCheckboxDateSpecial(listDate);
      }
    });
  });

  divBtnChange.appendChild(btnChangeDayOfWeek);

  const fieldDayOfWeek = document.createElement("div");

  fieldDayOfWeek.style.marginTop = "12px";
  fieldDayOfWeek.style.padding = "12px 0";

  const lblDayOfWeek = document.createElement("label");
  lblDayOfWeek.textContent = getTextWithLanguage({
    vi: "Áp dụng các ngày:",
    en: "Apply dates:",
  });
  lblDayOfWeek.style.width = "100%";
  lblDayOfWeek.style.marginBottom = "6px";
  lblDayOfWeek.style.display = "inline-block";

  fieldDayOfWeek.appendChild(lblDayOfWeek);

  const listDateElement = document.createElement("div");
  listDateElement.style.minHeight = "50px";
  listDateElement.style.border = "1px solid #ddd";
  listDateElement.style.padding = "8px";
  listDateElement.style.borderRadius = "4px";
  listDateElement.style.backgroundColor = "var(--tm-bg-primary)";

  function changeListDateElement(listDate = []) {
    listDateElement.innerHTML = listDate
      .map((item) => `<span>${getTextDate(item)}</span>`)
      .join(", ");
  }

  changeListDateElement(listDate);

  fieldDayOfWeek.appendChild(listDateElement);
  fieldDayOfWeek.appendChild(divBtnChange);

  divContainer.appendChild(fieldFromTime);
  divContainer.appendChild(fieldToTime);
  divContainer.appendChild(fieldMaxGroup);

  divContainer.appendChild(fieldDayOfWeek);

  const divFooter = document.createElement("div");
  divFooter.style.display = "flex";
  divFooter.style.justifyContent = "flex-end";
  divFooter.style.marginTop = "12px";

  const btnAdd = document.createElement("button");
  btnAdd.id = `${prefix}btn-add-special-hours`;
  btnAdd.textContent = getTextWithLanguage({
    vi: "Lưu",
    en: "Save",
  });
  btnAdd.className = `${prefix}btn-add-special-hours`;

  divFooter.appendChild(btnAdd);

  const divError = document.createElement("div");
  divError.style.color = "var(--tm-text-danger)";

  function handleError(msg) {
    divError.textContent = msg || "";
  }
  divContainer.appendChild(divError);

  divContainer.appendChild(divFooter);

  btnAdd.addEventListener("click", async () => {
    try {
      const start_time = Number(inputFromTime.value);
      const end_time = Number(inputToTime.value);
      const max_group = Number(inputMaxGroup.value);

      const id = genIDNumber();

      const payload = {
        id,
        start_time,
        end_time,
        max_group,
        apply_dates: listDate,
      };

      addSpecialFrameHoursService(payload)
        .then(() => {
          showNotify({
            message: getTextWithLanguage({
              vi: "Thêm thành công khung giờ đặc biệt",
              en: "Add special frame hours success",
            }),
          });
          handleError("");
          inputFromTime.value = "";
          inputToTime.value = "";
          inputMaxGroup.value = "";
          listDate = LIST_DATE;
          changeListDateElement(listDate);
          divListDate = getListDateElement(listDate);
        })
        .catch((error) => handleError(error.message || error));
    } catch (error) {
      handleError(error.message || error);
      logError("Error at btnAdd special frame hours click: ", error);
    }
  });

  return divContainer;
}

function createDialogViewSpecialFrameHours(framesHours = []) {
  try {
    const divContainer = document.createElement("div");
    divContainer.style.paddingTop = "12px";
    divContainer.style.display = "flex";
    divContainer.style.flexDirection = "column";
    divContainer.style.gap = "12px";
    divContainer.style.height = "100%";
    divContainer.style.overflow = "hidden";
    divContainer.style.overflowY = "auto";
    divContainer.className = "custom-scrollbar";
    divContainer.style.paddingRight = "14px";
    divContainer.style.paddingBottom = "16px";

    if (!framesHours.length) {
      const divEmpty = document.createElement("div");
      divEmpty.style.padding = "12px";
      divEmpty.textContent = "Chưa có khung giờ nào";
      divEmpty.style.textAlign = "center";
      divContainer.appendChild(divEmpty);
      return divContainer;
    }

    framesHours.forEach((item) => {
      const key = item.id;

      const divItem = document.createElement("div");
      divItem.style.display = "flex";
      divItem.style.gap = "12px";
      divItem.style.padding = "6px";
      divItem.style.border = "1px solid var(--tm-border-color)";
      divItem.style.borderRadius = "4px";
      divItem.style.flexDirection = "column";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "custom-checkbox";
      checkbox.checked = item.is_active;

      checkbox.addEventListener("change", async (e) => {
        const checked = e.target.checked;
        try {
          await changeStatus(key, checked);
        } catch (error) {
          logError("Error at btnChangeSpecialHours status click: ", error);
          showNotify({
            message: getTextWithLanguage({
              vi: "Đã có lỗi xảy ra",
              en: "Something went wrong",
            }),
          });
          checkbox.checked = !checked;
        }
      });

      const divInfo = document.createElement("div");
      divInfo.style.display = "flex";

      const divCoverInfoAndCheckbox = document.createElement("div");
      divCoverInfoAndCheckbox.style.display = "flex";
      divCoverInfoAndCheckbox.style.alignItems = "center";
      divCoverInfoAndCheckbox.style.gap = "12px";

      divCoverInfoAndCheckbox.appendChild(checkbox);
      divCoverInfoAndCheckbox.appendChild(divInfo);

      const divAction = document.createElement("div");
      divAction.style.display = "flex";
      divAction.style.gap = "12px";
      divAction.style.alignItems = "center";
      divAction.style.paddingLeft = "30px";

      const btnEdit = document.createElement("button");
      btnEdit.className = `${prefix}btn-edit-special-hours not-style`;

      const btnDelete = document.createElement("button");
      btnDelete.className = `${prefix}btn-delete-special-hours not-style`;

      const btnEditDates = document.createElement("button");
      btnEditDates.textContent = getTextWithLanguage({
        vi: "Sửa ngày",
        en: "Edit dates",
      });
      btnEditDates.className = "not-style";

      let isEditMode = false;

      divAction.appendChild(btnEdit);
      divAction.appendChild(btnDelete);

      function changeMode(mode = "view") {
        if (mode === "view") {
          const dates = item.apply_dates || [];
          isEditMode = false;
          btnEdit.textContent = getTextWithLanguage({
            vi: "Sửa",
            en: "Edit",
          });
          btnDelete.textContent = getTextWithLanguage({
            vi: "Xóa",
            en: "Delete",
          });
          divInfo.style.gap = "2px";
          divInfo.style.flexDirection = "column";
          divInfo.style.alignItems = "start";
          divInfo.innerHTML = `
          <div style="display: flex; gap: 12px; align-items: center;">
            <p>${getTextWithLanguage({
              vi: "Giờ bắt đầu",
              en: "Start time",
            })}: ${item.start_time}:00</p>
            <p>${getTextWithLanguage({
              vi: "Giờ kết thúc",
              en: "End time",
            })}: ${item.end_time}:00</p>
            <p>${getTextWithLanguage({
              vi: "Số nhóm tối đa",
              en: "Max group",
            })}: ${item.max_group}</p>
          </div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <p>${getTextWithLanguage({
              vi: "Ngày áp dụng",
              en: "Dates",
            })}: ${
              dates.length
                ? dates.map((date) => getTextDate(date)).join(", ")
                : getTextWithLanguage({
                    vi: "Không áp dụng",
                    en: "Not apply",
                  })
            }</p>
          </div>
          `;
          divAction.insertBefore(btnEditDates, btnDelete);
          return;
        }

        if (mode === "edit") {
          divAction.removeChild(btnEditDates);
          isEditMode = true;
          btnEdit.textContent = getTextWithLanguage({
            vi: "Lưu",
            en: "Save",
          });
          btnDelete.textContent = getTextWithLanguage({
            vi: "Hủy",
            en: "Cancel",
          });
          const { fieldElement: fieldFromTime } = createFieldElement({
            id: `${prefix}from-time-${key}`,
            label: getTextWithLanguage({
              vi: "Bắt đầu: ",
              en: "Start: ",
            }),
            placeholder: "EX: 9",
            typeInput: "number",
            inputOptions: {
              min: 0,
              max: 23,
            },
            isRow: true,
            isSmaller: true,
            initialValue: item.start_time,
          });

          const { fieldElement: fieldToTime } = createFieldElement({
            id: `${prefix}to-time-${key}`,
            label: getTextWithLanguage({
              vi: "Kết thúc: ",
              en: "End: ",
            }),
            placeholder: "EX: 17",
            typeInput: "number",
            inputOptions: {
              min: 0,
              max: 23,
            },
            isRow: true,
            isSmaller: true,
            initialValue: item.end_time,
          });

          const { fieldElement: fieldMaxGroup } = createFieldElement({
            id: `${prefix}max-group-${key}`,
            label: getTextWithLanguage({
              vi: "Nhóm: ",
              en: "Group: ",
            }),
            placeholder: "EX: 5",
            typeInput: "number",
            inputOptions: {
              min: 1,
              max: 100,
            },
            isRow: true,
            isSmaller: true,
            initialValue: item.max_group,
          });

          divInfo.innerHTML = "";
          divInfo.style.gap = "0px";
          divInfo.style.flexDirection = "row";
          divInfo.style.alignItems = "center";
          divInfo.appendChild(fieldFromTime);
          divInfo.appendChild(fieldToTime);
          divInfo.appendChild(fieldMaxGroup);
        }
      }

      changeMode("view");

      btnEdit.addEventListener("click", () => {
        if (isEditMode) {
          const fromTime = document.getElementById(
            `${prefix}from-time-${key}`,
          ).value;
          const toTime = document.getElementById(
            `${prefix}to-time-${key}`,
          ).value;
          const maxGroup = document.getElementById(
            `${prefix}max-group-${key}`,
          ).value;

          console.log(toTime);
          //   return;

          const payload = {
            ...item,
            start_time: fromTime,
            end_time: toTime,
            max_group: maxGroup,
            is_active: checkbox.checked,
          };

          updateSpecialFrameHoursService(payload)
            .then(() => {
              showNotify({
                message: getTextWithLanguage({
                  vi: "Cập nhật thành công",
                  en: "Update success!",
                }),
              });
              item = { ...payload };
              changeMode("view");
            })
            .catch((error) => {
              logError(error);
              showNotify({
                message: getTextWithLanguage({
                  vi: "Đã có lỗi xảy ra",
                  en: "Something went wrong!",
                }),
                type: "error",
              });
            });
          return;
        }
        changeMode("edit");
      });

      btnEditDates.addEventListener("click", () => {
        let listDates = item.apply_dates || [];
        const elements = getListDateElement(listDates);
        Swal.fire({
          title: getTextWithLanguage({
            vi: "Sửa ngày",
            en: "Edit dates",
          }),
          color: "var(--tm-text-primary)",
          html: elements,
          heightAuto: false,
          customClass: {
            container: "swal-container-custom",
          },
          width: 260,
          showCloseButton: true,
          showCancelButton: true,
          cancelButtonText: getTextWithLanguage({
            vi: "Hủy",
            en: "Cancel",
          }),
          showConfirmButton: true,
          confirmButtonText: getTextWithLanguage({
            vi: "Lưu",
            en: "Save",
          }),
          background: "var(--tm-bg-dialog)",
          preConfirm: () => {
            try {
              listDates = getCheckboxDateSpecial();
              updateSpecialFrameHoursService({
                ...item,
                apply_dates: listDates,
              })
                .then(() => {
                  item.apply_dates = listDates;
                  changeMode("view");
                  showNotify({
                    message: getTextWithLanguage({
                      vi: "Cập nhật thành công",
                      en: "Update success!",
                    }),
                  });
                  return true;
                })
                .catch((error) => {
                  logError(error);
                  showNotify({
                    message: getTextWithLanguage({
                      vi: "Đã có lỗi xảy ra",
                      en: "Something went wrong!",
                    }),
                    type: "error",
                  });
                  return false;
                });
            } catch (error) {
              logError(error);
              showNotify({
                message: getTextWithLanguage({
                  vi: "Đã có lỗi xảy ra",
                  en: "Something went wrong!",
                }),
                type: "error",
              });
              return false;
            }
          },
        });
      });

      let isConfrimDelete = false;
      let timerDelete = null;
      btnDelete.addEventListener("click", () => {
        if (isEditMode) {
          changeMode("view");
          return;
        }

        if (isConfrimDelete) {
          clearTimeout(timerDelete);
          deleteSpecialFrameHoursService(key)
            .then(() => {
              showNotify({
                message: getTextWithLanguage({
                  vi: "Xóa thành công",
                  en: "Delete success!",
                }),
                duration: 2000,
              });

              divItem.remove();
            })
            .catch((error) => {
              logError("Error at btn delete special hours: ", error);
              isConfrimDelete = false;
              btnDelete.textContent = getTextWithLanguage({
                vi: "Xóa",
                en: "Delete",
              });
              btnDelete.style.background = "";
              showNotify({
                message: getTextWithLanguage({
                  vi: "Đã có lỗi xảy ra",
                  en: "Something went wrong!",
                }),
                type: "error",
              });
            });

          return;
        }

        isConfrimDelete = true;
        btnDelete.textContent = getTextWithLanguage({
          vi: "Xác nhận",
          en: "Confirm",
        });
        btnDelete.style.background = "var(--tm-text-danger)";

        timerDelete = setTimeout(() => {
          isConfrimDelete = false;
          btnDelete.textContent = getTextWithLanguage({
            vi: "Xóa",
            en: "Delete",
          });
          btnDelete.style.background = "";
        }, 2000);
      });

      divItem.appendChild(divCoverInfoAndCheckbox);
      divItem.appendChild(divAction);

      divContainer.appendChild(divItem);
    });

    return divContainer;
  } catch (error) {
    logError("Error at createDialogViewSpecialFrameHours: ", error);
  }
}

function getCheckboxDateSpecial(anchorElem = document.body) {
  const listDate = [];
  const checkboxChecked = anchorElem.querySelectorAll(".checkbox-special-date");

  for (const ch of checkboxChecked) {
    const val = ch.getAttribute("data-value");
    if (ch.checked) {
      listDate.push(Number(val));
    }
  }

  return listDate;
}

const LIST_DATE = [0, 1, 2, 3, 4, 5, 6];

function getTextDate(date) {
  if (date == 0)
    return getTextWithLanguage({
      vi: "Chủ nhật",
      en: "Sunday",
    });
  if (date == 1)
    return getTextWithLanguage({
      vi: "Thứ 2",
      en: "Monday",
    });
  if (date == 2)
    return getTextWithLanguage({
      vi: "Thứ 3",
      en: "Tuesday",
    });
  if (date == 3)
    return getTextWithLanguage({
      vi: "Thứ 4",
      en: "Wednesday",
    });
  if (date == 4)
    return getTextWithLanguage({
      vi: "Thứ 5",
      en: "Thursday",
    });
  if (date == 5)
    return getTextWithLanguage({
      vi: "Thứ 6",
      en: "Friday",
    });
  if (date == 6)
    return getTextWithLanguage({
      vi: "Thứ 7",
      en: "Saturday",
    });
  return "";
}

function getListDateElement(list = []) {
  const listElement = document.createElement("div");
  listElement.style.display = "flex";
  listElement.style.flexDirection = "column";
  listElement.style.gap = "4px";

  LIST_DATE.forEach((item) => {
    const divItem = document.createElement("div");
    divItem.style.display = "flex";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = list.includes(item);
    checkbox.className = "checkbox-special-date custom-checkbox";
    checkbox.setAttribute("data-value", item);

    const id = `${prefix}checkbox-special-date-${item}`;
    checkbox.id = id;

    const text = getTextDate(item);
    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = text;
    label.style.fontSize = "14px";

    divItem.appendChild(checkbox);
    divItem.appendChild(label);
    listElement.appendChild(divItem);
  });

  return listElement;
}

function resetCheckboxDateSpecial(listDate = [], anchorElem = document.body) {
  const checkboxChecked = anchorElem.querySelectorAll(".checkbox-special-date");

  for (const ch of checkboxChecked) {
    const val = ch.getAttribute("data-value");
    ch.checked = listDate.includes(Number(val));
  }
}

export { createDialogAddSpecialHours, createDialogViewSpecialFrameHours };
