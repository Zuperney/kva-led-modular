export function readFileText(file, options = {}) {
  const maxBytes = Number(options.maxBytes);
  const fileLabel = String(options.fileLabel || "arquivo");

  if (Number.isFinite(maxBytes) && maxBytes > 0 && file.size > maxBytes) {
    throw new Error(
      "O " +
        fileLabel +
        " excede o limite de " +
        formatMegabytes(maxBytes) +
        " MB (tamanho atual: " +
        formatMegabytes(file.size) +
        " MB).",
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Nao foi possivel ler o arquivo."));
    reader.readAsText(file, "utf-8");
  });
}

function formatMegabytes(bytes) {
  return (bytes / (1024 * 1024)).toFixed(1);
}
