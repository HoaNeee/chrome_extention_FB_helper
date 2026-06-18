import { getTextWithLanguage, randomID } from "../../../utils/utils.js";
import {
  getIndexsGroupChecked,
  setChangeGroupsCheckedFlag,
  setIndexsGroupChecked,
} from "../services/storage-service.js";

/**
 *
 * @param {Array<{id: string, title: string, name: string, contents: string[], files: Blob[]}>} groups
 * @returns {Promise<Array<HTMLDivElement>>}
 */
async function createDivListGroups(groups = []) {
  if (!groups || !Array.isArray(groups)) {
    groups = [];
  }
  try {
    const prefix = "tm_";
    const divs = [];
    const indexsChecked = await getIndexsGroupChecked();

    for (const group of groups) {
      const id = group.id || randomID();
      const div = document.createElement("div");
      div.style.display = "flex";
      div.style.gap = "4px";
      div.style.alignItems = "center";
      div.setAttribute("id", `${prefix}group-${id}`);
      div.setAttribute("data-group-id", id);

      const name = group.name || group.title || "No name";

      const convertTitle = name.replace(/\s/g, "-") + id;

      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.setAttribute("id", `${prefix}checkbox-${convertTitle}`);
      checkbox.classList.add("custom-checkbox");

      if (indexsChecked.includes(group.id)) {
        checkbox.checked = true;
      }

      const label = document.createElement("label");
      label.setAttribute("for", `${prefix}checkbox-${convertTitle}`);
      label.innerText = name;

      const btnView = document.createElement("span");
      btnView.setAttribute("id", `${prefix}btn-view-data-group`);
      btnView.classList.add(`${prefix}btn-fake`);
      btnView.classList.add("not-style");
      btnView.style.fontSize = "18px";
      btnView.style.cursor = "pointer";
      btnView.innerText = "👁";
      btnView.title = getTextWithLanguage({
        vi: "Xem dữ liệu nhóm",
        en: "View data group",
      });

      div.appendChild(checkbox);
      div.appendChild(label);
      div.appendChild(btnView);

      checkbox.addEventListener("change", async (e) => {
        const checked = e.target.checked;
        const indexs = await getIndexsGroupChecked();
        const set = new Set(indexs);
        if (checked) {
          set.add(group.id);
        } else {
          set.delete(group.id);
        }
        setIndexsGroupChecked(Array.from(set));
        setChangeGroupsCheckedFlag(true);
      });

      divs.push(div);
    }

    return divs;
  } catch (error) {
    throw new Error("Error at createDivListGroups: " + error);
  }
}

export { createDivListGroups };
