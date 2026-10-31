import { prefix } from "../../../contants/contants.js";

/**
 * Create field element helper
 * @param {{
 *   id: string,
 *   label: string,
 *   placeholder: string,
 *   typeInput: string,
 *   inputOptions: HTMLInputElement,
 *   isRow: boolean,
 *   isSmaller: boolean,
 *   initialValue: string | number | boolean,
 * }} object
 * @returns {{fieldElement: HTMLElement, inputElement: HTMLInputElement}} - Object chứa field
 */
function createFieldElement({
  id = "",
  label = "",
  placeholder,
  typeInput = "text",
  inputOptions = {},
  className = `${prefix}input-outline not-style`,
  isRow = false,
  isSmaller = false,
  initialValue = null,
} = {}) {
  const divContainer = document.createElement("div");
  divContainer.className = `${prefix}field-container ${isRow ? "field-row" : ""} ${isSmaller ? "field-smaller" : ""}`;

  const labelElement = document.createElement("label");
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const inputElement = document.createElement("input");
  inputElement.id = id;
  inputElement.className = className || `${prefix}input-outline not-style`;
  inputElement.placeholder = placeholder;
  inputElement.type = typeInput;
  if (initialValue !== null && initialValue !== undefined) {
    inputElement.value = initialValue;
  }

  if (inputOptions) {
    Object.keys(inputOptions).forEach((key) => {
      inputElement.setAttribute(key, inputOptions[key]);
    });
  }

  divContainer.appendChild(labelElement);
  divContainer.appendChild(inputElement);

  return { fieldElement: divContainer, inputElement };
}

export { createFieldElement };
