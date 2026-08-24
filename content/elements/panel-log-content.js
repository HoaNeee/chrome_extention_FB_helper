import { logError } from "../../utils/utils";
import { logErrorContent } from "../utils/utils";

/**
 * Tạo panel log nhỏ gắn vào container.
 * @param {HTMLElement} container - Phần tử cha để gắn panel vào.
 * @returns {{ panelEl: HTMLElement, addLogEntry: Function, clearLogPanel: Function }}
 */
function createPanelLogContent(container = document.body) {
  try {
    // --- Wrapper panel ---
    const exist = document.querySelector(".panel-log-content__container");
    if (exist) {
      return { panelEl: exist };
    }

    const panelEl = document.createElement("div");
    panelEl.classList.add("panel-log-content__container");
    Object.assign(panelEl.style, {
      position: "fixed",
      top: "60px",
      left: "30px",
      width: "300px",
      height: "300px",
      zIndex: "9999",
      boxSizing: "border-box",
      fontSize: "12px",
      background: "#1e1e2e",
      borderRadius: "8px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      fontFamily: "monospace",
    });

    // --- Header ---
    const headerEl = document.createElement("div");
    Object.assign(headerEl.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "6px 10px",
      background: "#2a2a3e",
      borderBottom: "1px solid #3a3a55",
      flexShrink: "0",
    });

    const titleEl = document.createElement("span");
    titleEl.textContent = "📋 Log";
    Object.assign(titleEl.style, {
      color: "#a0a8d0",
      fontWeight: "bold",
      fontSize: "11px",
      letterSpacing: "0.5px",
    });

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear";
    Object.assign(clearBtn.style, {
      background: "transparent",
      border: "1px solid #555577",
      borderRadius: "4px",
      color: "#888aaa",
      fontSize: "10px",
      cursor: "pointer",
      padding: "2px 6px",
      transition: "all 0.15s ease",
    });
    clearBtn.addEventListener("mouseenter", () => {
      clearBtn.style.borderColor = "#e06c75";
      clearBtn.style.color = "#e06c75";
    });
    clearBtn.addEventListener("mouseleave", () => {
      clearBtn.style.borderColor = "#555577";
      clearBtn.style.color = "#888aaa";
    });

    headerEl.appendChild(titleEl);
    headerEl.appendChild(clearBtn);

    // --- Log list area ---
    const logListEl = document.createElement("div");
    logListEl.classList.add("panel-log-content__list");
    Object.assign(logListEl.style, {
      flex: "1",
      overflowY: "auto",
      padding: "6px 10px",
      display: "flex",
      flexDirection: "column",
      gap: "3px",
    });

    // Scrollbar nhỏ cho log list
    const style = document.createElement("style");
    style.textContent = `
      .panel-log-content__list::-webkit-scrollbar { width: 4px; }
      .panel-log-content__list::-webkit-scrollbar-track { background: transparent; }
      .panel-log-content__list::-webkit-scrollbar-thumb { background: #3a3a55; border-radius: 4px; }
    `;
    document.head.appendChild(style);

    // --- Nút clear xóa list ---
    clearBtn.addEventListener("click", () => clearLogPanel());

    // --- Gắn vào panel ---
    panelEl.appendChild(headerEl);
    panelEl.appendChild(logListEl);

    container.appendChild(panelEl);

    return { panelEl };
  } catch (error) {
    logError("error in createPanelLogContent", error);
  }
}

// --- Helper: thêm một dòng log ---
/**
 * @param {string} message - Nội dung log.
 * @param {"info"|"warn"|"error"|"success"} [type="info"] - Loại log.
 */
function addLogEntry(message, type = "info") {
  const colorMap = {
    info: "#61afef",
    warn: "#e5c07b",
    error: "#e06c75",
    success: "#98c379",
  };
  const prefixMap = {
    info: "ℹ",
    warn: "⚠",
    error: "✖",
    success: "✔",
  };

  const logListEl = document.querySelector(".panel-log-content__list");

  if (!logListEl) return;

  const now = new Date();
  const time = now.toLocaleTimeString("vi-VN", { hour12: false });

  const lineEl = document.createElement("div");
  Object.assign(lineEl.style, {
    display: "flex",
    gap: "6px",
    alignItems: "flex-start",
    color: colorMap[type] || colorMap.info,
    lineHeight: "1.5",
    wordBreak: "break-word",
  });

  const prefixSpan = document.createElement("span");
  prefixSpan.textContent = prefixMap[type] || prefixMap.info;
  prefixSpan.style.flexShrink = "0";

  const timeSpan = document.createElement("span");
  timeSpan.textContent = `[${time}]`;
  Object.assign(timeSpan.style, {
    color: "#555577",
    flexShrink: "0",
    fontSize: "10px",
    marginTop: "1px",
  });

  const msgSpan = document.createElement("span");
  msgSpan.textContent = message;
  msgSpan.style.color = "#cdd6f4";

  lineEl.appendChild(prefixSpan);
  lineEl.appendChild(timeSpan);
  lineEl.appendChild(msgSpan);
  logListEl.appendChild(lineEl);

  // Auto-scroll xuống cuối
  logListEl.scrollTop = logListEl.scrollHeight;
}

// --- Helper: xóa toàn bộ log ---
function clearLogPanel() {
  const logListEl = document.querySelector(".panel-log-content__list");
  if (!logListEl) return;
  logListEl.innerHTML = "";
}

export { createPanelLogContent, addLogEntry, clearLogPanel };
