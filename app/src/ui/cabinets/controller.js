export function bindCabinetEvents(params) {
  const {
    refs,
    getState,
    getUi,
    setState,
    setUi,
    parseCatalogInput,
    readFileText,
    mergeCatalog,
    persistCabinets,
    normalizeScreensWithCatalog,
    readCabinetForm,
    clearCabinetForm,
  } = params;

  refs.btnImportCabinets?.addEventListener("click", () => {
    refs.importCabinetInput?.click();
  });

  refs.importCabinetInput?.addEventListener("change", async (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !input.files?.[0]) return;

    try {
      const text = await readFileText(input.files[0]);
      const parsed = parseCatalogInput(text);
      const importedCatalog = parsed.cabinets.map((cabinet, index) => ({
        ...cabinet,
        id: "imp-" + Date.now() + "-" + index,
      }));

      const ui = getUi();
      const merged = mergeCatalog(ui.cabinets, importedCatalog);
      persistCabinets(merged);
      setUi({ cabinets: merged });
      setState(normalizeScreensWithCatalog(getState(), merged));

      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "Catalogo importado: " +
          parsed.parsedCount +
          " itens validos" +
          (parsed.skipped.length
            ? " | " + parsed.skipped.length + " linhas ignoradas"
            : "");
      }
    } catch (error) {
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "Falha no import de gabinetes: " +
          (error?.message || "erro desconhecido");
      }
    } finally {
      input.value = "";
    }
  });

  refs.btnAddCabinet?.addEventListener("click", () => {
    const cabinet = readCabinetForm(refs);
    if (!cabinet) {
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "Preencha os campos do gabinete com valores validos.";
      }
      return;
    }

    const ui = getUi();
    const merged = mergeCatalog(ui.cabinets, [cabinet]);
    persistCabinets(merged);
    clearCabinetForm(refs);
    setUi({ cabinets: merged });
    setState(normalizeScreensWithCatalog(getState(), merged));

    if (refs.migrationStatus) {
      refs.migrationStatus.textContent = "Gabinete cadastrado no catalogo local.";
    }
  });

  refs.cabinetsList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.action !== "delete-cabinet") return;

    const cabinetId = target.dataset.cabinetId;
    const ui = getUi();
    const nextCatalog = ui.cabinets.filter((cab) => cab.id !== cabinetId);

    if (!nextCatalog.length) {
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "O catalogo precisa ter ao menos um gabinete.";
      }
      return;
    }

    persistCabinets(nextCatalog);
    setUi({ cabinets: nextCatalog });
    setState(normalizeScreensWithCatalog(getState(), nextCatalog));
  });
}
