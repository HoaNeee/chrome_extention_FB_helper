/**
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.titleConfirm
 * @param {function} params.onConfirm
 * @param {string} params.className
 * @param {CSSStyleDeclaration} params.style
 * @param {string} params.id
 * @returns {HTMLButtonElement}
 */
function createButtonConfirm({
  title = "Button",
  titleConfirm = "Confirm",
  onConfirm = () => {},
  className = "",
  style = {},
  id = "",
}) {
  const button = document.createElement("button");
  button.textContent = title;
  button.className = className;
  if (id && id.trim()) button.id = id.trim();

  Object.assign(button.style, style);

  let timeoutId = null;
  let isConfirm = false;
  button.addEventListener("click", () => {
    if (!isConfirm) {
      isConfirm = true;
      button.textContent = titleConfirm;
      button.style.backgroundColor = "red";
      button.style.color = "white";

      timeoutId = setTimeout(() => {
        isConfirm = false;
        button.textContent = title;
        button.style.backgroundColor = "";
        button.style.color = "";
      }, 3000);
      return;
    }
    onConfirm?.();
    clearTimeout(timeoutId);
    isConfirm = false;
    button.textContent = title;
    button.style.backgroundColor = "";
    button.style.color = "";
  });

  return button;
}

export { createButtonConfirm };
