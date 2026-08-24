import CommentWalk from "../../../class/CommentWalk.js";
import { prefix } from "../../../contants/contants.js";
import { commentWalkService } from "../../../services/comment-walk-service.js";
import { genID, getTextWithLanguage } from "../../../utils/utils.js";

/**
 * @typedef {import("../../../services/comment-walk-service.js").CommentWalkType} CommentWalkType
 */

/**
 *
 * @param {Array<CommentWalk>} comments
 * @returns {Promise<Array<HTMLDivElement>>}
 */
async function createDivItemListDataCommentWalk(comments = []) {
  if (!comments || !Array.isArray(comments)) {
    comments = [];
  }

  try {
    const divs = [];

    for (const comment of comments) {
      const id = comment?.id || genID();

      const listIdCommentWalkActives =
        await commentWalkService.getListIdCommentWalkActive();

      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.gap = "4px";
      div.style.alignItems = "center";
      div.setAttribute("id", `${prefix}comment-walk-${id}`);
      div.setAttribute("data-comment-walk-id", id);

      const name = comment?.name || comment?.title_query_search || "No name";

      const convertTitle = name.replace(/\s/g, "-") + id;

      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.setAttribute("id", `${prefix}checkbox-${convertTitle}`);
      checkbox.classList.add("custom-checkbox");

      if (listIdCommentWalkActives.includes(id)) {
        checkbox.checked = true;
      }

      const label = document.createElement("label");
      label.setAttribute("for", `${prefix}checkbox-${convertTitle}`);
      label.innerText = name;

      const btnView = document.createElement("span");
      btnView.classList.add(`${prefix}btn-view-data-comment-walk`);
      btnView.classList.add(`${prefix}btn-fake`);
      btnView.classList.add("not-style");
      btnView.style.fontSize = "18px";
      btnView.style.cursor = "pointer";
      btnView.innerText = "👁";
      btnView.title = getTextWithLanguage({
        vi: "Xem dữ liệu bình luận",
        en: "View data comment",
      });

      div.appendChild(checkbox);
      div.appendChild(label);
      div.appendChild(btnView);

      checkbox.addEventListener("change", async (e) => {
        const checked = e.target.checked;
        await commentWalkService.updateStatusCommentWalk(id, checked);
      });

      divs.push(div);
    }

    return divs;
  } catch (error) {
    throw new Error("Error at createDivListGroups: " + error);
  }
}

export { createDivItemListDataCommentWalk };
