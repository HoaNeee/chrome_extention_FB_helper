import { prefix } from "../../../contants/contants.js";
import {
  loginService,
  setAuthInStorage,
} from "../../../services/auth-service.js";
import {
  createNewDevice,
  createNewDeviceRequest,
  getDeviceFromStorage,
  getUsedToLoginedThisDevice,
  setDeviceInStorage,
  setUsedToLoginedThisDevice,
} from "../../../services/device-service.js";
import { setIsUseLocalStorage } from "../../../services/storage-global-service.js";
import { handleErrorHelper } from "../../../utils/exception.js";
import { getTextWithLanguage, logError, sleep } from "../../../utils/utils.js";
import { closeDialogLoading, showDialogLoading } from "./dialog.js";
import { createFieldElement } from "./field.js";
import { showNotify } from "./notify.js";

/**
 *
 * @returns {Promise<HTMLFormElement>}
 */
function createDialogLogin({ onLoginSuccess = () => {} }) {
  try {
    const form = document.createElement("form");
    form.style.width = "100%";
    form.name = "login-form";

    const divContainer = document.createElement("div");
    divContainer.style.width = "100%";
    divContainer.style.padding = "30px 0";

    const { fieldElement: fieldUsername, inputElement: inputUserName } =
      createFieldElement({
        label: getTextWithLanguage({
          vi: "Tên đăng nhập",
          en: "Username",
        }),
        placeholder: getTextWithLanguage({
          vi: "Nhập tên đăng nhập",
          en: "Enter username",
        }),
        id: "username",
      });

    const { fieldElement: fieldPassword, inputElement: inputPassword } =
      createFieldElement({
        typeInput: "password",
        label: getTextWithLanguage({
          vi: "Mật khẩu",
          en: "Password",
        }),
        placeholder: getTextWithLanguage({
          vi: "Nhập mật khẩu",
          en: "Enter password",
        }),
        id: "password",
      });

    const pError = document.createElement("p");
    pError.style.color = "red";
    pError.style.fontSize = "12px";
    pError.style.textAlign = "left";
    pError.style.display = "none";
    pError.style.padding = "6px 0";
    pError.style.marginLeft = "12px";

    const btnLogin = document.createElement("button");
    btnLogin.innerText = getTextWithLanguage({
      vi: "Đăng nhập",
      en: "Login",
    });

    btnLogin.style.width = "100%";
    btnLogin.style.marginTop = "12px";
    btnLogin.style.padding = "8px";
    btnLogin.style.fontSize = "16px";
    btnLogin.style.textAlign = "center";

    function handleError(msg) {
      if (!msg || !msg?.trim()) {
        pError.style.display = "none";
        pError.textContent = "";
      } else {
        pError.style.display = "block";
        pError.textContent = msg;
      }
    }

    function validateForm() {
      const username = inputUserName.value.trim();
      const password = inputPassword.value.trim();

      if (username === "" || password === "") {
        return false;
      }

      return true;
    }

    divContainer.appendChild(fieldUsername);
    divContainer.appendChild(fieldPassword);
    divContainer.appendChild(pError);
    divContainer.appendChild(btnLogin);

    form.appendChild(divContainer);

    form.addEventListener("input", (e) => {
      handleError();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        handleError("Please enter username and password");
        return;
      }

      const data = {
        username: inputUserName.value.trim(),
        password: inputPassword.value.trim(),
      };

      try {
        showDialogLoading();
        // await sleep(5000);
        const auth = await loginService(data.username, data.password);
        if (auth) {
          await setAuthInStorage(auth);
          await setIsUseLocalStorage(false);

          const isUsedToLogined = await getUsedToLoginedThisDevice();
          if (!isUsedToLogined) {
            const device = await getDeviceFromStorage();
            await createNewDeviceRequest(device);
            await setUsedToLoginedThisDevice(true);
          }

          showNotify({
            message: getTextWithLanguage({
              vi: "Đăng nhập thành công",
              en: "Login success",
            }),
            type: "success",
          });

          onLoginSuccess?.();
        }
      } catch (error) {
        handleError(error.message);
        showNotify({
          message: getTextWithLanguage({
            vi: "Đăng nhập thất bại",
            en: "Login failed",
          }),
          type: "error",
        });
      } finally {
        closeDialogLoading();
      }
    });

    return form;
  } catch (error) {
    logError("Error at createDialogLogin: ", error);
  }
}

export { createDialogLogin };
