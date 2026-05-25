import {
  getDataSavedInStorage,
  setDataSavedInStorage,
} from "../services/dataSavedService.js";
import {
  fileToBase64,
  getTextWithLanguage,
  parseBase64ToBlob,
  randomID,
} from "../../../utils/utils.js";
import { drawEditor } from "./editor.js";
import { addLog } from "./panel-log.js";
import { findLabelSetedUpAndAddTippy } from "../helpers/elementDom.js";

/**
 *
 * @param {File[]|FileList} files
 * @returns {HTMLElement}
 */
function drawPreviewImage(files) {
  const divPreview = document.createElement("div");
  divPreview.style.display = "flex";
  divPreview.style.flexWrap = "wrap";
  divPreview.style.gap = "8px";

  Array.from(files).forEach((file) => {
    const url = URL.createObjectURL(file);
    const img = document.createElement("img");
    img.src = url;
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "4px";
    divPreview.appendChild(img);
  });

  return divPreview;
}

/**
 *
 * @param {Object} options
 * @param {{id: string, title: string, name: string, contents: string, files: Blob[], priority: number}|null} options.initialData - The initial data to populate the panel with. If null, the panel will be empty.
 * @param {string} options.type - The type of the panel, either
 * "add" for creating a new group or "edit" for editing an existing group.
 * @param {Function} options.onDelete - A callback function that will be called when the delete button is clicked. This is only applicable when the type is "edit".
 * @param {Function} options.onSave - A callback function that will be called when the save button is clicked. It will receive the data to be saved as an argument.
 * @param {number} options.initPriority - The initial priority of the panel. This is only applicable when the type is "add".
 * @returns {HTMLElement} The DOM element representing the panel group.
 */
function drawPanelGroup({
  initialData = null,
  type = "add",
  onDelete,
  onSave,
  initPriority = 1,
}) {
  try {
    const id = initialData?.id || randomID();

    const prefix = "tm_";
    const divContainer = document.createElement("div");
    divContainer.style.display = "flex";
    divContainer.style.flexDirection = "column";
    divContainer.style.gap = "8px";
    divContainer.style.padding = "8px";
    divContainer.style.paddingTop = "12px";
    divContainer.style.height = "100%";
    divContainer.style.overflow = "hidden";

    const divInner = document.createElement("div");
    divInner.style.overflow = "hidden";
    divInner.style.overflowY = "auto";
    divInner.style.scrollbarWidth = "thin";
    divInner.style.scrollbarColor = "#ccc transparent";
    divInner.style.display = "flex";
    divInner.style.flexDirection = "column";
    divInner.style.gap = "8px";
    divInner.style.minWidth = "350px";

    divContainer.appendChild(divInner);

    divContainer.setAttribute("id", `${prefix}div-panel-group-${id}`);

    const divFieldTitle = document.createElement("div");
    divFieldTitle.classList.add(`${prefix}field-container`);
    const labelTitle = document.createElement("label");
    labelTitle.setAttribute("for", `${prefix}input-title`);
    labelTitle.innerText = getTextWithLanguage({
      vi: "Nhập tiêu đề trùng khớp (bắt buộc nhập) :",
      en: "Enter title match (Required) :",
    });

    findLabelSetedUpAndAddTippy({
      selector: labelTitle,
      content: getTextWithLanguage({
        vi: 'Tiêu đề dùng để lọc các nhóm trùng khớp với các từ mà bạn đã nhập, sẽ được phân tách thành nhiều từ bằng dấu phẩy (,), nếu nhiều nhóm trùng nhau thì sẽ ưu tiên từ được gõ trước. Ví dụ: "Bán nhà, Cho thuê nhà" sẽ ưu tiên nhóm có tiêu đề hoặc tên chứa "Bán nhà" trước',
        en: 'Title is used to filter groups that match the words you have entered, will be split into multiple words by comma (,), if multiple groups match, the word typed first will be prioritized. Example: "Sell house, Rent house" will prioritize groups with titles or names containing "Sell house" first',
      }),
    });

    const inputTitle = document.createElement("input");
    inputTitle.required = true;
    inputTitle.setAttribute("type", "text");
    inputTitle.setAttribute("id", `${prefix}input-title`);
    inputTitle.classList.add(`${prefix}input-outline`);
    inputTitle.placeholder = "Example: Group 1, Group 2, ...";
    if (initialData) {
      inputTitle.value = initialData.title;
    }

    divFieldTitle.appendChild(labelTitle);
    divFieldTitle.appendChild(inputTitle);

    const divFieldName = document.createElement("div");
    divFieldName.classList.add(`${prefix}field-container`);
    const labelName = document.createElement("label");
    labelName.setAttribute("for", `${prefix}input-name`);
    labelName.innerText = getTextWithLanguage({
      vi: "Nhập tên (không bắt buộc) :",
      en: "Enter name (Not required) :",
    });

    findLabelSetedUpAndAddTippy({
      selector: labelName,
      content: getTextWithLanguage({
        vi: "Tên dùng để tham khảo, ghi nhớ, hiển thị trên giao diện, không liên quan đến nội dung bài viết, nếu để trống sẽ lấy trường tiêu đề để hiển thị thay thế.",
        en: "Name is used for reference, not related to post content, if left empty, the title field will be used for display",
      }),
    });

    const inputName = document.createElement("input");
    inputName.setAttribute("type", "text");
    inputName.setAttribute("id", `${prefix}input-name`);
    inputName.classList.add(`${prefix}input-outline`);
    inputName.placeholder = "Example: Name 1, Name 2, ...";
    if (initialData) {
      inputName.value = initialData?.name || "";
    }

    divFieldName.appendChild(labelName);
    divFieldName.appendChild(inputName);

    const divFieldPriority = document.createElement("div");
    divFieldPriority.classList.add(`${prefix}field-container`);
    const labelPriority = document.createElement("label");
    labelPriority.innerText = getTextWithLanguage({
      vi: "Nhập độ ưu tiên (Không bắt buộc):",
      en: "Enter priority (Not required):",
    });

    findLabelSetedUpAndAddTippy({
      selector: labelPriority,
      content: getTextWithLanguage({
        vi: "Độ ưu tiên dùng để đăng bài theo thứ tự khi chức năng trộn nhóm cần đăng được tắt, số càng nhỏ thì sẽ càng ưu tiên, tự động tăng, nếu để trống thì hệ thống sẽ tự tính toán số thứ tự hợp lý",
        en: "Priority is used to sort the order of posts when the function of mixing groups to be posted is turned off. The smaller the number, the higher the priority. It will automatically increase. If left empty, the system will automatically calculate a reasonable sequence number",
      }),
    });

    const inputPriority = document.createElement("input");
    inputPriority.setAttribute("type", "number");
    inputPriority.setAttribute("id", `${prefix}input-priority`);
    inputPriority.setAttribute("min", "1");
    inputPriority.setAttribute("max", "99");
    inputPriority.classList.add(`${prefix}input-outline`);
    inputPriority.placeholder = "Example: 1, 2, 3, ...";
    if (initialData) {
      inputPriority.value = Number(initialData?.priority) || "";
    } else {
      inputPriority.value = initPriority;
    }

    divFieldPriority.appendChild(labelPriority);
    divFieldPriority.appendChild(inputPriority);

    const divFieldContent = document.createElement("div");
    divFieldContent.classList.add(`${prefix}field-container`);
    const labelContent = document.createElement("label");
    labelContent.innerText = getTextWithLanguage({
      vi: "Nhập nội dung :",
      en: "Enter content :",
    });

    findLabelSetedUpAndAddTippy({
      selector: labelContent,
      content: getTextWithLanguage({
        vi: "Nội dung dùng để đăng bài, hãy cố gắng thêm nhiều nội dung khác nhau cùng chủ đề hoặc tương tự, tiện ích sẽ chọn ngẫu nhiên một trong các nội dung để tránh bị phát hiện",
        en: "Content used to post, try to add many different contents on the same or similar topic, the tool will randomly select one of the contents to avoid detection",
      }),
    });

    const divContentContainer = document.createElement("div");
    divContentContainer.setAttribute("id", `${prefix}editor-content-container`);
    divContentContainer.style.maxHeight = "400px";
    divContentContainer.style.overflowY = "auto";
    divContentContainer.style.display = "flex";
    divContentContainer.style.flexDirection = "column";
    divContentContainer.style.gap = "8px";
    divContentContainer.style.scrollbarWidth = "thin";
    divContentContainer.style.scrollbarColor = "#ccc transparent";

    const divBtnAddContent = document.createElement("div");
    const btnAddContent = document.createElement("button");
    btnAddContent.setAttribute("id", `${prefix}btn-add-content`);
    btnAddContent.classList.add("not-style");
    btnAddContent.innerText = getTextWithLanguage({
      vi: "Thêm nội dung",
      en: "Add Content",
    });

    divBtnAddContent.appendChild(btnAddContent);
    divFieldContent.appendChild(labelContent);

    divFieldContent.appendChild(divContentContainer);
    divFieldContent.appendChild(divBtnAddContent);

    const divFieldFile = document.createElement("div");
    divFieldFile.classList.add(`${prefix}field-container`);
    const labelFile = document.createElement("label");
    labelFile.setAttribute("for", `${prefix}upload-multiple-image`);

    const inputFile = document.createElement("input");
    labelFile.innerText = getTextWithLanguage({
      vi: "Chọn file :",
      en: "Choose file :",
    });

    findLabelSetedUpAndAddTippy({
      selector: labelFile,
      content: getTextWithLanguage({
        vi: "File được chọn để đính kèm vào bài viết, có thể chọn nhiều file",
        en: "File selected to attach to post, can select multiple files",
      }),
    });

    inputFile.setAttribute("type", "file");
    inputFile.setAttribute("multiple", "");
    inputFile.setAttribute("id", `${prefix}upload-multiple-image`);

    const divContainerPreviewImage = document.createElement("div");
    divContainerPreviewImage.setAttribute(
      "id",
      `${prefix}container-preview-image`,
    );

    inputFile.addEventListener("change", (e) => {
      const files = e.target.files;
      const divPreview = drawPreviewImage(files);
      divContainerPreviewImage.innerHTML = "";
      divContainerPreviewImage.appendChild(divPreview);
    });

    //File initial
    if (initialData && initialData.files && Array.isArray(initialData.files)) {
      if (initialData.files && Array.isArray(initialData.files) && inputFile) {
        const parseFiles = initialData.files.map((objectURL) =>
          parseBase64ToBlob(objectURL),
        );

        const newDataTranfer = new DataTransfer();
        parseFiles.forEach((file) => newDataTranfer.items.add(file));
        inputFile.files = newDataTranfer.files;
        const divPreview = drawPreviewImage(inputFile.files);
        divContainerPreviewImage.innerHTML = "";
        divContainerPreviewImage.appendChild(divPreview);
      }
    }

    divFieldFile.appendChild(labelFile);
    divFieldFile.appendChild(inputFile);

    divInner.appendChild(divFieldTitle);
    divInner.appendChild(divFieldName);
    divInner.appendChild(divFieldPriority);
    divInner.appendChild(divFieldContent);
    divInner.appendChild(divFieldFile);
    divInner.appendChild(divContainerPreviewImage);

    const divError = document.createElement("div");
    divError.classList.add("error");
    divError.style.padding = "8px";
    divError.style.color = "red";
    divError.style.fontSize = "12px";
    divError.style.fontWeight = "bold";
    divError.style.display = "none";
    divInner.appendChild(divError);

    function handleError(message) {
      if (!message) {
        divError.style.display = "none";
        return;
      }
      divError.textContent = message;
      divError.style.display = "block";
      divError.scrollIntoView({ block: "center" });
    }

    let quillEditors = [];

    let length = 1;
    if (
      initialData &&
      initialData.contents &&
      Array.isArray(initialData.contents)
    ) {
      length = initialData.contents.length;
      initialData.contents.forEach((content, index) => {
        const quill = drawEditor({
          id: index + 1,
          anchorElement: divContentContainer,
          onRemove: () => {
            quillEditors = quillEditors.filter((_, i) => i !== index);
          },
        });
        quill.root.innerHTML = content;
        quillEditors.push(quill);
      });
    } else {
      const quillDefault = drawEditor({
        id: length,
        anchorElement: divContentContainer,
      });
      quillEditors.push(quillDefault);
    }

    btnAddContent.addEventListener("click", () => {
      length++;
      const quill = drawEditor({
        id: length,
        anchorElement: divContentContainer,
        onRemove: () => {
          quillEditors = quillEditors.filter((_, i) => i !== length - 1);
          length--;
        },
      });
      quillEditors.push(quill);
    });

    const divBtn = document.createElement("div");
    divBtn.style.display = "flex";
    divBtn.style.justifyContent = "flex-end";

    const btnSave = document.createElement("button");
    btnSave.innerText = getTextWithLanguage({
      vi: "Lưu",
      en: "Save",
    });

    divBtn.appendChild(btnSave);

    btnSave.addEventListener("click", async () => {
      let blobs = await Promise.all(
        Array.from(inputFile?.files || []).map(async (file) => ({
          name: file.name,
          type: file.type,
          base64Data: await fileToBase64(file),
        })),
      );
      const dataSave = {
        id: initialData?.id || randomID(),
        title: inputTitle.value,
        name: inputName.value,
        contents: quillEditors.map((quill) => quill.root.innerHTML),
        files: blobs,
        priority: Number(inputPriority.value || 1),
      };

      if (!dataSave.title) {
        handleError(
          getTextWithLanguage({
            vi: "Vui lòng nhập tiêu đề",
            en: "Please enter title",
          }),
        );
        return;
      }
      handleError(null);

      const dataSaveds = (await getDataSavedInStorage()) || [];

      //Add new
      if (type === "add") {
        dataSaveds.push(dataSave);
        setDataSavedInStorage(dataSaveds);
        onSave?.();
        addLog({
          vi: `Bạn vừa thêm dữ liệu nhóm "${dataSave.name || dataSave.title}"`,
          en: `You just added data of group "${dataSave.name || dataSave.title}"`,
        });
      }

      //Edit
      if (type === "edit") {
        const index = dataSaveds.findIndex((item) => item.id === dataSave.id);
        if (index !== -1) {
          dataSaveds[index] = dataSave;
        }
        setDataSavedInStorage(dataSaveds);
        onSave?.();
      }
    });

    if (type === "edit") {
      const btnDelete = document.createElement("button");
      btnDelete.innerText = getTextWithLanguage({
        vi: "Xóa",
        en: "Delete",
      });
      btnDelete.style.marginRight = "8px";

      divBtn.insertBefore(btnDelete, btnSave);

      let isConfirmingDelete = false;
      let timeoutId = null;
      btnDelete.addEventListener("click", () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        if (isConfirmingDelete) {
          onDelete?.();
        } else {
          btnDelete.innerText = getTextWithLanguage({
            vi: "Xác nhận",
            en: "Confirm",
          });
          isConfirmingDelete = true;
          btnDelete.style.backgroundColor = "red";
          timeoutId = setTimeout(() => {
            btnDelete.innerText = getTextWithLanguage({
              vi: "Xóa",
              en: "Delete",
            });
            btnDelete.style.backgroundColor = "";
            isConfirmingDelete = false;
          }, 3000);
        }
      });

      const btnExport = document.createElement("button");
      btnExport.innerText = getTextWithLanguage({
        vi: "Xuất",
        en: "Export",
      });
      btnExport.style.marginRight = "8px";

      divBtn.insertBefore(btnExport, btnDelete);

      btnExport.addEventListener("click", () => {
        const dataStr = JSON.stringify(initialData);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `group_for_${initialData.name}.json`;
        a.click();
        URL.revokeObjectURL(url); // Clean up the URL object
      });
    }

    if (type === "add") {
      const btnReset = document.createElement("button");
      btnReset.innerText = getTextWithLanguage({
        vi: "Đặt lại",
        en: "Reset",
      });
      btnReset.style.marginRight = "8px";
      divBtn.insertBefore(btnReset, btnSave);

      btnReset.addEventListener("click", () => {
        inputTitle.value = "";
        length = 1;
        divContentContainer.innerHTML = "";
        const quill = drawEditor({
          id: length,
          anchorElement: divContentContainer,
        });
        quillEditors = [quill];
        inputFile.value = "";
        inputName.value = "";
        divContainerPreviewImage.innerHTML = "";
        handleError(null);
      });
    }

    divContainer.appendChild(divBtn);

    return divContainer;
  } catch (error) {
    throw new Error("Error drawPanelGroup: " + error);
  }
}

export { drawPanelGroup };
