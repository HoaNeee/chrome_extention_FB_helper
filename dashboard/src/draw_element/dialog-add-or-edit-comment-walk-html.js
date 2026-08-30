import CommentWalk from "../../../class/CommentWalk.js";
import { KEY_DEFAULT_VALUE, prefix } from "../../../contants/contants.js";
import { commentWalkHelper } from "../../../helpers/comment-walk.js";
import { drawPreviewImage, initialFile } from "../../../helpers/file.js";
import {
	genID,
	getTextWithLanguage,
	logError,
	splitString,
} from "../../../utils/utils.js";
import { createButtonConfirm } from "./button.js";

/**
 *
 * @param {Object} options
 * @param {CommentWalk|null} options.initialData - The initial data to populate the panel with. If null, the panel will be empty.
 * @param {string} options.type - The type of the panel, either
 * "add" for creating a new group or "edit" for editing an existing group.
 * @param {Function} options.onDelete - A callback function that will be called when the delete button is clicked. This is only applicable when the type is "edit".
 * @param {Function} options.onSave - A callback function that will be called when the save button is clicked. It will receive the data to be saved as an argument.
 * @returns {HTMLElement} The DOM element representing the panel group.
 */
function drawDataCommentWalkElement({
	initialData = null,
	type = "add",
	onDelete,
	onSave,
}) {
	try {
		const id = initialData?.id || genID();

		let isEditFile = false;

		let contents = initialData?.contents || [];

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

		divContainer.setAttribute("id", `${prefix}div-data-comment-walk-${id}`);

		const divFieldTitle = document.createElement("div");
		divFieldTitle.classList.add(`${prefix}field-container`);
		const labelTitle = document.createElement("label");
		labelTitle.setAttribute("for", `${prefix}input-title-query-search`);
		labelTitle.innerText = getTextWithLanguage({
			vi: "Nhập tiêu đề tìm kiếm (Các cụm từ cách nhau bằng cách xuống dòng) :",
			en: "Enter title search (Each phrase is separated by a line break) :",
		});

		const inputTitle = document.createElement("textarea");
		inputTitle.required = true;
		inputTitle.setAttribute("id", `${prefix}input-title-query-search`);
		inputTitle.classList.add(`${prefix}input-outline`);
		inputTitle.placeholder = "Example: tim phong tro, tai chinh,...";
		inputTitle.rows = 3;
		if (initialData) {
			inputTitle.value =
				(initialData.title_query_searchs || []).join("\n") || "";
		}

		divFieldTitle.appendChild(labelTitle);
		divFieldTitle.appendChild(inputTitle);

		const divFieldName = document.createElement("div");
		divFieldName.classList.add(`${prefix}field-container`);
		const labelName = document.createElement("label");
		labelName.setAttribute("for", `${prefix}input-name-comment-walk`);
		labelName.innerText = getTextWithLanguage({
			vi: "Nhập tên mong muốn:",
			en: "Enter desired name:",
		});

		const inputName = document.createElement("input");
		inputName.required = true;
		inputName.setAttribute("type", "text");
		inputName.setAttribute("id", `${prefix}input-name-comment-walk`);
		inputName.classList.add(`${prefix}input-outline`);
		inputName.placeholder = "Example: Nhom comment 1,...";
		if (initialData) {
			inputName.value = initialData.name || "";
		}

		divFieldName.appendChild(labelName);
		divFieldName.appendChild(inputName);

		const divManagerContent = document.createElement("div");
		divManagerContent.style.margin = "12px 0";
		divManagerContent.style.display = "flex";
		divManagerContent.style.flexDirection = "column";
		divManagerContent.style.gap = "12px";

		const labelManagerContent = document.createElement("label");
		labelManagerContent.innerText = getTextWithLanguage({
			vi: `Quản lý nội dung: ${contents?.length || 0} nội dung`,
			en: `Content management: ${contents?.length || 0} contents`,
		});

		function changeLabelContents(length = contents.length) {
			labelManagerContent.innerText = getTextWithLanguage({
				vi: `Quản lý nội dung: ${length} nội dung`,
				en: `Content management: ${length} contents`,
			});
		}

		const divBtnManagerContent = document.createElement("div");

		const btnManagerContent = document.createElement("button");
		btnManagerContent.innerText = getTextWithLanguage({
			vi: "Quản lý nội dung",
			en: "Content management",
		});
		btnManagerContent.classList.add(`${prefix}btn-outline`, "not-style");

		const containerListContent = drawListContentComments(
			initialData?.contents,
			changeLabelContents,
		);

		btnManagerContent.addEventListener("click", () => {
			Swal.fire({
				title: getTextWithLanguage({
					vi: "Quản lý nội dung",
					en: "Content management",
				}),
				html: containerListContent,
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
					vi: "Lưu",
					en: "Save",
				}),
				cancelButtonText: getTextWithLanguage({
					vi: "Hủy",
					en: "Cancel",
				}),
			}).then(async (res) => {
				if (res.isConfirmed) {
					const listContentElement = containerListContent.querySelectorAll(
						"div[data-comment-walk-content-id]",
					);
					const data = Array.from(listContentElement).map(
						(el) => el.querySelector("textarea").value,
					);
					contents = [...data];
				}
			});
		});

		divBtnManagerContent.appendChild(btnManagerContent);

		divManagerContent.appendChild(labelManagerContent);
		divManagerContent.appendChild(divBtnManagerContent);

		const divFieldKeywordCertainChoice = document.createElement("div");
		divFieldKeywordCertainChoice.classList.add(`${prefix}field-container`);

		const labelKeywordCertainChoice = document.createElement("label");
		labelKeywordCertainChoice.innerText = getTextWithLanguage({
			vi: "Từ khoá chắc chắn được chọn khi xuất hiện (Mỗi từ cách nhau bằng dấu phẩy ',') :",
			en: "Keyword certain choice when appear (Each word is separated by a comma ','):",
		});

		const inputKeywordCertainChoice = document.createElement("textarea");
		inputKeywordCertainChoice.setAttribute(
			"id",
			`${prefix}input-keyword-certain-choice-comment-walk`,
		);
		inputKeywordCertainChoice.classList.add(`${prefix}input-outline`);
		inputKeywordCertainChoice.placeholder =
			"Example: tim phong tro, can nha, can dat... (Mỗi từ cách nhau bằng dấu phẩy ',')";
		if (initialData) {
			inputKeywordCertainChoice.value =
				(initialData.keywords_certain_choice || []).join(",") || "";
		}

		divFieldKeywordCertainChoice.appendChild(labelKeywordCertainChoice);
		divFieldKeywordCertainChoice.appendChild(inputKeywordCertainChoice);

		const divFieldContentInclude = document.createElement("div");
		divFieldContentInclude.classList.add(`${prefix}field-container`);
		const labelContentInclude = document.createElement("label");
		labelContentInclude.innerText = getTextWithLanguage({
			vi: "Từ khóa lọc bao gồm (Mỗi từ cách nhau bằng dấu phẩy ',') :",
			en: "Keyword filter include (Each word is separated by a comma ','):",
		});

		const inputContentInclude = document.createElement("textarea");
		inputContentInclude.setAttribute(
			"id",
			`${prefix}input-content-include-comment-walk`,
		);
		inputContentInclude.classList.add(`${prefix}input-outline`);
		inputContentInclude.placeholder = "Example: tim phong tro, tai chinh,...";
		if (initialData) {
			inputContentInclude.value = (
				initialData.keyword_query_includes || []
			).join(", ");
		}

		divFieldContentInclude.appendChild(labelContentInclude);
		divFieldContentInclude.appendChild(inputContentInclude);

		const divFieldContentExclude = document.createElement("div");
		divFieldContentExclude.classList.add(`${prefix}field-container`);
		const labelContentExclude = document.createElement("label");
		labelContentExclude.innerText = getTextWithLanguage({
			vi: "Từ khóa lọc loại trừ (Mỗi từ cách nhau bằng dấu phẩy ',') :",
			en: "Keyword filter exclude (Each word is separated by a comma ','):",
		});

		const inputContentExclude = document.createElement("textarea");
		inputContentExclude.setAttribute(
			"id",
			`${prefix}input-content-exclude-comment-walk`,
		);
		inputContentExclude.classList.add(`${prefix}input-outline`);
		inputContentExclude.placeholder = "Example: tim phong tro, tai chinh,...";
		if (initialData) {
			inputContentExclude.value = (
				initialData.keyword_query_excludes || []
			).join(", ");
		}

		divFieldContentExclude.appendChild(labelContentExclude);
		divFieldContentExclude.appendChild(inputContentExclude);

		const divFieldMatchRate = document.createElement("div");
		divFieldMatchRate.classList.add(`${prefix}field-container`);
		const labelMatchRate = document.createElement("label");
		labelMatchRate.innerText = getTextWithLanguage({
			vi: `Giá trị tỷ lệ đánh giá các từ khóa bao gồm có thể phù hợp (Khuyến nghị tối thiểu: ${KEY_DEFAULT_VALUE.DEFAULT_MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES})`,
			en: `Match rate value for keywords includes (Recommended minimum: ${KEY_DEFAULT_VALUE.DEFAULT_MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES})`,
		});

		const inputMatchRate = document.createElement("input");
		inputMatchRate.setAttribute("id", `${prefix}input-match-rate-comment-walk`);
		inputMatchRate.classList.add(`${prefix}input-outline`);
		inputMatchRate.placeholder = "Example: 1,2,3...";
		inputMatchRate.type = "number";
		inputMatchRate.min = 0;

		inputMatchRate.defaultValue =
			KEY_DEFAULT_VALUE.DEFAULT_MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES;

		if (initialData) {
			inputMatchRate.value =
				initialData.match_rate_value_content_query_includes || "";
		}

		divFieldMatchRate.appendChild(labelMatchRate);
		divFieldMatchRate.appendChild(inputMatchRate);

		const divFieldFile = document.createElement("div");
		divFieldFile.classList.add(`${prefix}field-container`);
		const labelFile = document.createElement("label");
		labelFile.setAttribute(
			"for",
			`${prefix}upload-multiple-image-comment-walk`,
		);

		const inputFile = document.createElement("input");
		labelFile.innerText = getTextWithLanguage({
			vi: "Chọn file :",
			en: "Choose file :",
		});

		inputFile.setAttribute("type", "file");
		inputFile.setAttribute("multiple", "");
		inputFile.setAttribute("id", `${prefix}upload-multiple-image-comment-walk`);
		inputFile.setAttribute("accept", "image/*");

		const divContainerPreviewImage = document.createElement("div");
		divContainerPreviewImage.setAttribute(
			"id",
			`${prefix}container-preview-image`,
		);

		inputFile.addEventListener("change", (e) => {
			const files = e.target.files;
			if (files && files.length) {
				const divPreview = drawPreviewImage(files);
				divContainerPreviewImage.innerHTML = "";
				divContainerPreviewImage.appendChild(divPreview);
				isEditFile = true;
			}
		});

		//File initial
		if (initialData) {
			initialFile(initialData.files, inputFile, divContainerPreviewImage);
		}

		divFieldFile.appendChild(labelFile);
		divFieldFile.appendChild(inputFile);

		divInner.appendChild(divFieldTitle);
		divInner.appendChild(divFieldName);
		divInner.appendChild(divManagerContent);

		divInner.appendChild(divFieldKeywordCertainChoice);
		divInner.appendChild(divFieldContentInclude);
		divInner.appendChild(divFieldMatchRate);
		divInner.appendChild(divFieldContentExclude);

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

		const divBtn = document.createElement("div");
		divBtn.style.display = "flex";
		divBtn.style.justifyContent = "flex-end";
		divBtn.style.gap = "8px";

		const btnSave = document.createElement("button");
		btnSave.innerText = getTextWithLanguage({
			vi: "Lưu",
			en: "Save",
		});

		divBtn.appendChild(btnSave);

		btnSave.addEventListener("click", async () => {
			try {
				const files = Array.from(inputFile.files);

				const payload = {
					title_query_searchs: splitString(inputTitle.value, "\n"),
					contents: contents,
					files: files,
					keyword_query_includes: splitString(inputContentInclude.value),
					keyword_query_excludes: splitString(inputContentExclude.value),
					name: inputName.value,
					match_rate_value_content_query_includes: inputMatchRate.value,
					keywords_certain_choice: splitString(inputKeywordCertainChoice.value),
				};

				if (type === "add") {
					payload.id = genID();
				} else {
					payload.id = id;
				}

				if (!payload.title_query_searchs.length) {
					handleError(
						getTextWithLanguage({
							vi: "Vui lòng nhập tiêu đề",
							en: "Please enter title",
						}),
					);
					return;
				}
				handleError(null);

				//Add new
				if (type === "add") {
					onSave?.(payload);
				}

				//Edit
				if (type === "edit") {
					payload.files = initialData.files;
					if (isEditFile) {
						payload.files = files;
					}

					onSave?.(payload, isEditFile);
				}
			} catch (error) {
				handleError(
					getTextWithLanguage({
						vi: "Lỗi: " + error,
						en: "Error: " + error,
					}),
				);
			}
		});

		if (type === "edit") {
			const btnDelete = createButtonConfirm({
				title: getTextWithLanguage({
					vi: "Xóa",
					en: "Delete",
				}),
				titleConfirm: getTextWithLanguage({
					vi: "Xác nhận",
					en: "Confirm",
				}),
				onConfirm: () => {
					onDelete?.(id);
				},
			});

			divBtn.insertBefore(btnDelete, btnSave);

			const btnExport = document.createElement("button");
			btnExport.innerText = getTextWithLanguage({
				vi: "Xuất",
				en: "Export",
			});

			divBtn.insertBefore(btnExport, btnDelete);

			btnExport.addEventListener("click", async () => {
				await commentWalkHelper.exportDataCommentWalk(initialData);
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
				contents = [];
				containerListContent.innerHTML = "";
				containerListContent.appendChild(
					drawListContentComments(contents, changeLabelContents),
				);
				inputFile.value = "";
				divContainerPreviewImage.innerHTML = "";
				inputContentExclude.value = "";
				inputContentInclude.value = "";
				inputName.value = "";
				inputMatchRate.value =
					KEY_DEFAULT_VALUE.DEFAULT_MATCH_RATE_VALUE_CONTENT_QUERY_INCLUDES;

				handleError(null);
			});
		}

		divContainer.appendChild(divBtn);

		return divContainer;
	} catch (error) {
		logError(error);
	}
}

/**
 *
 * @param {Array<string>} initContents
 * @param {Function} onAddNew
 * @param {Function} onDelete
 * @returns {HTMLDivElement}
 */
function drawListContentComments(initContents = [], onChange = () => {}) {
	const container = document.createElement("div");
	container.classList.add("w-full");

	const inner = document.createElement("div");
	inner.classList.add("flex", "flex-col");
	inner.style.maxHeight = "250px";
	inner.style.overflowY = "auto";
	inner.style.gap = "16px";

	let countLength = 1;

	function createTextarea(id) {
		const div = document.createElement("div");
		div.classList.add("w-full");
		div.style.position = "relative";
		div.style.paddingRight = "16px";
		div.style.border = "1px solid var(--tm-border-color)";
		div.style.borderRadius = "4px";
		div.setAttribute("data-comment-walk-content-id", id);

		const textarea = document.createElement("textarea");
		textarea.classList.add(`${prefix}input-outline`, "not-style", "w-full");
		textarea.placeholder = "Example: tim phong tro, tai chinh,...";
		textarea.style.border = "none";
		textarea.style.outline = "none";
		textarea.style.backgroundColor = "transparent";
		textarea.style.resize = "none";
		textarea.rows = 4;
		textarea.style.scrollbarWidth = "thin";

		const divRemove = document.createElement("div");
		divRemove.innerText = "X";
		divRemove.style.position = "absolute";
		divRemove.style.right = "0px";
		divRemove.style.top = "0px";
		divRemove.style.cursor = "pointer";
		divRemove.style.width = "20px";
		divRemove.style.height = "20px";
		divRemove.style.backgroundColor = "gray";
		divRemove.style.color = "white";
		divRemove.style.borderRadius = "50%";
		divRemove.style.display = "flex";
		divRemove.style.justifyContent = "center";
		divRemove.style.alignItems = "center";

		divRemove.addEventListener("click", () => {
			if (countLength === 1) return;
			div.remove();
			--countLength;
			onChange(countLength);
		});

		div.appendChild(textarea);
		div.appendChild(divRemove);
		return div;
	}

	if (!initContents.length) {
		const divTextArea1 = createTextarea(countLength);
		inner.appendChild(divTextArea1);
		onChange(countLength);
	} else {
		for (const content of initContents) {
			const divTextAreaNew = createTextarea(countLength);
			divTextAreaNew.querySelector("textarea").value = content;
			inner.appendChild(divTextAreaNew);
			countLength++;
		}
	}

	const btnAddNewContent = document.createElement("button");
	btnAddNewContent.innerText = getTextWithLanguage({
		vi: "Thêm nội dung mới",
		en: "Add new content",
	});

	const divBtn = document.createElement("div");
	divBtn.style.textAlign = "left";
	divBtn.style.marginTop = "8px";

	btnAddNewContent.classList.add("not-style");
	btnAddNewContent.innerText = getTextWithLanguage({
		vi: "Thêm nội dung",
		en: "Add new content",
	});
	btnAddNewContent.type = "button";

	divBtn.appendChild(btnAddNewContent);

	container.appendChild(inner);

	container.appendChild(divBtn);

	btnAddNewContent.addEventListener("click", () => {
		countLength++;
		const divTextAreaNew = createTextarea(countLength);
		inner.appendChild(divTextAreaNew);
		onChange(countLength);
	});

	return container;
}

export { drawDataCommentWalkElement };
