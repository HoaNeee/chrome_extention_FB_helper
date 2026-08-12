import { KEY_LANGUAGE, prefix } from "../../../contants/contants.js";
import {
  getProfile,
  getProfileService,
  logoutService,
} from "../../../services/auth-service.js";
import { DB_setValue } from "../../../utils/api-helper.js";
import { handleErrorHelper } from "../../../utils/exception.js";
import { getTextWithLanguage, logError, sleep } from "../../../utils/utils.js";
import {
  closeDialogLoading,
  createDialog,
  showDialogLoading,
} from "../draw_element/dialog.js";
import { createDialogLogin } from "../draw_element/login.js";
import { showNotify } from "../draw_element/notify.js";
import { createDialogInfoUser } from "../draw_element/user.js";

async function addEvtHeader() {
  try {
    async function handleLogout() {
      try {
        showDialogLoading();
        await sleep(1000);
        setIsShowDialogInfo(false);
        await logoutService();
        await updateAuthUI(null);
        showNotify({
          message: getTextWithLanguage({
            en: "Logout success",
            vi: "Đăng xuất thành công",
          }),
          type: "success",
        });
      } catch (error) {
        handleErrorHelper({ error });
      } finally {
        closeDialogLoading();
      }
    }

    const dialogLogin = createDialogLogin({
      onLoginSuccess: async () => {
        setIsShowDialogLogin(false);
        try {
          // const user = await getProfile();
          // changeContentDialogInfoUser(
          //   createDialogInfoUser({
          //     user,
          //     onLogoutSuccess: handleLogout,
          //   }),
          // );
          location.reload();
        } catch (error) {
          handleErrorHelper({ error, isShowNotify: false });
        }
      },
    });

    const { setIsShow: setIsShowDialogLogin } = createDialog({
      html: dialogLogin,
      height: "auto",
      width: 400,
      title: getTextWithLanguage({
        en: "Login",
        vi: "Đăng Nhập",
      }),
      titleAlign: "center",
    });

    let user = null;
    try {
      user = await getProfileService();
    } catch (error) {
      handleErrorHelper({ error, isShowNotify: false });
    }

    const {
      setIsShow: setIsShowDialogInfo,
      changeContent: changeContentDialogInfoUser,
    } = createDialog({
      html: createDialogInfoUser({
        user,
        onLogoutSuccess: handleLogout,
      }),
      height: "auto",
      width: 400,
      title: getTextWithLanguage({
        en: "Info User",
        vi: "Thông tin tài khoản",
      }),
      titleAlign: "center",
    });

    const selectLanguage = document.querySelector(`#${prefix}select-language`);
    if (selectLanguage) {
      selectLanguage.addEventListener("change", async (e) => {
        const lang = e.target.value;
        await DB_setValue(KEY_LANGUAGE, lang);
        location.reload();
      });
    }

    const btnLogin = document.querySelector(`#${prefix}btn-login`);
    if (btnLogin) {
      btnLogin.textContent = getTextWithLanguage({
        vi: "Đăng Nhập",
        en: "Login",
      });
      btnLogin.title = getTextWithLanguage({ vi: "Đăng Nhập", en: "Login" });

      btnLogin.addEventListener("click", async () => {
        setIsShowDialogLogin(true);
      });
    }

    const userInfoElement = document.querySelector(`#${prefix}user-info`);
    if (userInfoElement) {
      userInfoElement.addEventListener("click", async () => {
        setIsShowDialogInfo(true);
      });
    }
  } catch (error) {
    logError("Error at add event for header dashboard");
  }
}

async function updateAuthUI(user) {
  try {
    const container = document.querySelector(".auth-container");
    const btnLogin = container.querySelector(`#${prefix}btn-login`);
    const userInfoElement = container.querySelector(`#${prefix}user-info`);
    if (userInfoElement && btnLogin) {
      if (user) {
        btnLogin.style.display = "none";
        userInfoElement.style.display = "inline-block";
        userInfoElement.title = user.name || user.username;
      } else {
        btnLogin.style.display = "inline-block";
        userInfoElement.style.display = "none";
      }
    }
  } catch (error) {
    logError("Error at update auth UI");
  }
}

export { addEvtHeader, updateAuthUI };
