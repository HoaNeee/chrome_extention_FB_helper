import { getIsUseLocalStorage } from "../services/storage-global-service.js";
import {
  logError,
  parseBase64ToFile,
  parseBlobToFile,
  parseUrlToBlob,
} from "../utils/utils.js";

async function initialFile(files, input, container) {
  try {
    if (!Array.isArray(files)) {
      return;
    }

    const isUseLocalStorage = getIsUseLocalStorage();

    const newDataTranfer = new DataTransfer();
    if (isUseLocalStorage) {
      const parseFiles = files.map((objectURL) => parseBase64ToFile(objectURL));
      parseFiles.forEach((file) => newDataTranfer.items.add(file));
    } else {
      for await (const url of files) {
        if (typeof url === "string") {
          const blob = await parseUrlToBlob(url);
          const fileName = url.slice(url.lastIndexOf("/") + 1);
          newDataTranfer.items.add(parseBlobToFile(blob, fileName));
        }
      }
    }

    input.files = newDataTranfer.files;
    const divPreview = drawPreviewImage(input.files);
    container.innerHTML = "";
    container.appendChild(divPreview);
  } catch (error) {
    logError("Error initialFile: " + error);
  }
}

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

export { initialFile, drawPreviewImage };
