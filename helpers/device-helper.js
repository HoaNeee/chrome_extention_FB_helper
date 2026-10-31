import { KEY_TASK_NAME } from "../contants/contants.js";
import { getTextWithLanguage } from "../utils/utils.js";

const deviceHelper = {
  getTaskLabelWithName(name) {
    switch (name) {
      case KEY_TASK_NAME.POST:
        return getTextWithLanguage({
          vi: "Đăng bài",
          en: "Post",
        });
      case KEY_TASK_NAME.COMMENT_WALK:
        return getTextWithLanguage({
          vi: "Bình luận dạo",
          en: "Comment walk",
        });
      default:
        return getTextWithLanguage({
          vi: "Không xác định",
          en: "Unknown",
        });
    }
  },

  getTaskName(key) {
    for (const k in KEY_TASK_NAME) {
      if (key.includes(KEY_TASK_NAME[k])) return KEY_TASK_NAME[k];
    }
    return KEY_TASK_NAME.UNKNOWN;
  },
};

export { deviceHelper };
