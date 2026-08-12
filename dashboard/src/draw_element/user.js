import { getTextWithLanguage, logError } from "../../../utils/utils.js";

function createDialogInfoUser(
  { user, onLogoutSuccess } = { user: null, onLogoutSuccess: () => {} },
) {
  const html = document.createElement("div");
  html.className = "info-user-container";
  try {
    if (user) {
      html.innerHTML = `
    <div class="info-user-item">
        <p class="info-user-label">${getTextWithLanguage({
          vi: "Tên tài khoản: ",
          en: "Username: ",
        })}</p>
        <p class="info-user-value">${user.username}</p>
    </div>
    <div class="info-user-item">
        <p class="info-user-label">${getTextWithLanguage({
          vi: "Tên: ",
          en: "Name: ",
        })}</p>
        <p class="info-user-value">${user.name || "Available"}</p>
    </div>
    <div class="info-user-item">
        <p class="info-user-label">${getTextWithLanguage({
          vi: "Email: ",
          en: "Email: ",
        })}</p>
        <p class="info-user-value">${user.email}</p>
    </div>
    <div class="info-user-item">
        <p class="info-user-label">${getTextWithLanguage({
          vi: "Vai trò: ",
          en: "Role: ",
        })}</p>
        <p>${user.role}</p>
    </div>
    <div class="info-user-item">
        <p class="info-user-label">${getTextWithLanguage({
          vi: "Trạng thái: ",
          en: "Status: ",
        })}</p>
        <p>${user.status}</p>
    </div>
    `;
    } else {
      html.innerHTML = `<p>${getTextWithLanguage({
        vi: "Tài khoản không có quyền",
        en: "Unauthorized",
      })}</p>`;
    }

    const btnLogout = document.createElement("button");
    if (user) {
      btnLogout.textContent = getTextWithLanguage({
        vi: "Đăng xuất",
        en: "Logout",
      });
      btnLogout.onclick = async () => {
        onLogoutSuccess?.();
      };
      html.appendChild(btnLogout);
    }
  } catch (error) {
    logError("Error at create dialog info user", error);
  }
  return html;
}

export { createDialogInfoUser };
