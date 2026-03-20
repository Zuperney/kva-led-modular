export function bindProjectEvents(params) {
  const {
    refs,
    getState,
    getUi,
    setState,
    exportProjectJson,
    importProjectJson,
    readFileText,
    mergeCatalog,
    collectCabinetsFromScreens,
    persistCabinets,
    normalizeScreensWithCatalog,
  } = params;

  refs.btnSaveProject?.addEventListener("click", () => {
    setState({ ...getState() });
    if (refs.migrationStatus) {
      refs.migrationStatus.textContent =
        "Projeto salvo com sucesso no schema project.v1.";
    }
  });

  refs.btnExportProject?.addEventListener("click", () => {
    const current = getState();
    const json = exportProjectJson(current);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "projeto-kva-modular.json";
    link.click();
    URL.revokeObjectURL(url);

    if (refs.migrationStatus) {
      refs.migrationStatus.textContent =
        "Projeto exportado em JSON (project.v1).";
    }
  });

  refs.btnImportProject?.addEventListener("click", () => {
    refs.importProjectInput?.click();
  });

  refs.importProjectInput?.addEventListener("change", async (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.files?.[0]) return;

    try {
      const text = await readFileText(input.files[0]);
      const ui = getUi();
      const imported = importProjectJson(text, { catalog: ui.cabinets });
      ui.cabinets = mergeCatalog(
        ui.cabinets,
        collectCabinetsFromScreens(imported.screens),
      );
      persistCabinets(ui.cabinets);
      setState(normalizeScreensWithCatalog(imported, ui.cabinets));

      if (refs.migrationStatus) {
        refs.migrationStatus.textContent = "Projeto importado com sucesso.";
      }
    } catch (error) {
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "Falha ao importar projeto: " +
          (error?.message || "erro desconhecido");
      }
    } finally {
      input.value = "";
    }
  });
}
