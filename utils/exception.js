import {
  API_RESPONSE_CODE,
  ERROR_CODE,
} from "../contants/constant-extention.js";
import { showNotify } from "../dashboard/src/draw_element/notify.js";
import { logoutService } from "../services/auth-service.js";
import { getTextWithLanguage, logError } from "./utils.js";

export class CustomError extends Error {
  code;
  constructor(code = ERROR_CODE.SYSTEM, message, name = "CustomError") {
    super(message);
    this.code = code;
    this.name = name;
  }
}

export function handleErrorHelper({
  name,
  error,
  msg,
  code,
  isShowNotify = true,
  callback = () => {},
}) {
  if (!code) {
    code = error.code || ERROR_CODE.SYSTEM;
  }
  logError(name, error);
  handleCaseError(code, msg, isShowNotify);
  callback?.();
}

async function handleCaseError(code, msg, isShowNotify) {
  const defaultMsg = getTextWithLanguage({
    vi: "Đã có lỗi xảy ra!",
    en: "Something went wrong!",
  });

  switch (code) {
    case ERROR_CODE.SELF:
      if (isShowNotify) {
        showNotify({
          message: msg || defaultMsg,
          type: "error",
        });
      }
      break;
    case API_RESPONSE_CODE.INVALID_CREDENTIALS:
      if (isShowNotify) {
        showNotify({
          message: msg || defaultMsg,
          type: "error",
        });
      }
      break;

    case API_RESPONSE_CODE.TOKEN_EXPIRED:
    case API_RESPONSE_CODE.FORBIDDEN:
    case API_RESPONSE_CODE.USER_LOCKED:
    case API_RESPONSE_CODE.USER_INACTIVE:
      await logoutService();
      if (isShowNotify) {
        showNotify({
          message: msg || defaultMsg,
          type: "error",
        });
      }
      break;

    case ERROR_CODE.SYSTEM:
      if (isShowNotify) {
        showNotify({
          message: msg || defaultMsg,
          type: "error",
        });
      }
      break;
    default:
      if (isShowNotify) {
        showNotify({
          message: defaultMsg,
          type: "error",
        });
      }
      break;
  }
}
