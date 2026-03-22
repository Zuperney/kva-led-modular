function inferToastVariant(message) {
  const text = String(message || "").toLowerCase();
  if (/nao foi possivel|erro|falha|indisponivel|bloqueio|invalido/.test(text)) {
    return "error";
  }
  if (/aviso|atencao|compatibilidade|mobile|popup/.test(text)) {
    return "warning";
  }
  if (/ok|sucesso|salvo|exportado|gerado/.test(text)) {
    return "success";
  }
  return "info";
}

function createToastContainer() {
  let container = document.getElementById("toastStack");
  if (container) return container;

  container = document.createElement("div");
  container.id = "toastStack";
  container.className = "toast-stack";
  container.setAttribute("aria-live", "polite");
  container.setAttribute("aria-label", "Notificacoes");
  document.body.appendChild(container);
  return container;
}

export function showToast(message, options = {}) {
  const text = String(message || "").trim();
  if (!text) return;

  const { variant = inferToastVariant(text), timeout = 4800 } = options;
  const container = createToastContainer();

  const toast = document.createElement("article");
  toast.className = "toast-card toast-card--" + variant;
  toast.setAttribute("role", variant === "error" ? "alert" : "status");

  const title = document.createElement("strong");
  title.className = "toast-title";
  title.textContent =
    variant === "error"
      ? "Falha"
      : variant === "warning"
        ? "Atencao"
        : variant === "success"
          ? "Concluido"
          : "Info";

  const body = document.createElement("div");
  body.className = "toast-body";
  body.textContent = text;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.textContent = "Fechar";
  close.setAttribute("aria-label", "Fechar notificacao");
  close.addEventListener("click", () => {
    toast.classList.add("is-exit");
    window.setTimeout(() => toast.remove(), 180);
  });

  toast.appendChild(title);
  toast.appendChild(body);
  toast.appendChild(close);
  container.appendChild(toast);

  window.setTimeout(
    () => {
      if (!toast.isConnected) return;
      toast.classList.add("is-exit");
      window.setTimeout(() => toast.remove(), 180);
    },
    Math.max(1800, timeout),
  );
}

export function setupStatusToastBridge(statusNode) {
  if (!(statusNode instanceof HTMLElement)) return;

  statusNode.style.display = "none";

  function flushStatus() {
    const text = String(statusNode.textContent || "").trim();
    if (!text) return;
    showToast(text);
    statusNode.textContent = "";
  }

  const observer = new MutationObserver(flushStatus);
  observer.observe(statusNode, {
    childList: true,
    characterData: true,
    subtree: true,
  });

  flushStatus();
}
