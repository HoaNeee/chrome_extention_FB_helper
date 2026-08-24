import { KEY_LANGUAGE } from "../../contants/contants";
import { logError } from "../../utils/utils";
import { CL_getValue } from "./utils";

let language = "vi";

function getTextLanguageContent({ vi = "", en = "" }) {
  if (language === "vi") return vi;
  return en;
}

async function initLanguageWithTool() {
  try {
    const lang = await CL_getValue(KEY_LANGUAGE);
    language = lang || "vi";
  } catch (error) {
    logError("Error at initial language at content", error);
  }
}

export { initLanguageWithTool, getTextLanguageContent };
