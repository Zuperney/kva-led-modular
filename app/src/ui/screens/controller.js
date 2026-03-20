export function bindScreenEvents(params) {
  const {
    refs,
    getState,
    getUi,
    setState,
    setUi,
    createDefaultScreen,
    clampPositiveInt,
    toScreenCabinet,
  } = params;

  refs.btnAddScreen?.addEventListener("click", () => {
    const current = getState();
    const ui = getUi();
    const nextIndex = current.screens.length + 1;

    const selectedCabinet =
      ui.cabinets.find((cab) => cab.id === ui.cabinets[0]?.id) ||
      ui.cabinets[0] ||
      createDefaultScreen("tmp").gabinete;

    const newScreen = createDefaultScreen("Tela " + nextIndex, selectedCabinet);

    const next = {
      ...current,
      screens: [newScreen].concat(current.screens),
    };

    setState(next);
    setUi({
      selectedScreenId: newScreen.id,
      screenEditorId: newScreen.id,
    });
  });

  refs.screensList?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    if (!action) return;

    if (action === "toggle-edit") {
      const screenId = target.dataset.screenId;
      const ui = getUi();
      const isOpen = String(ui.screenEditorId || "") === String(screenId || "");
      setUi({
        selectedScreenId: screenId || null,
        screenEditorId: isOpen ? null : screenId || null,
      });
      return;
    }

    if (action !== "delete") return;

    const screenId = target.dataset.screenId;
    const current = getState();
    const ui = getUi();
    const filtered = current.screens.filter(
      (screen) => String(screen.id) !== String(screenId),
    );

    if (!filtered.length) {
      if (refs.migrationStatus) {
        refs.migrationStatus.textContent =
          "O projeto precisa ter ao menos uma tela.";
      }
      return;
    }

    setState({ ...current, screens: filtered });
    setUi({
      selectedScreenId: filtered[0]?.id || null,
      screenEditorId:
        String(ui.screenEditorId || "") === String(screenId || "")
          ? null
          : ui.screenEditorId || null,
    });
  });

  refs.screensList?.addEventListener("change", (event) => {
    const target = event.target;
    if (
      !(
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement
      )
    ) {
      return;
    }

    const screenId = target.dataset.screenId;
    const action = target.dataset.action;
    if (!screenId || !action) return;

    const current = getState();
    const ui = getUi();

    const screens = current.screens.map((screen) => {
      if (String(screen.id) !== String(screenId)) return screen;

      if (action === "rename") {
        return { ...screen, nome: target.value || screen.nome };
      }

      if (action === "cols") {
        return {
          ...screen,
          quantidade_colunas: clampPositiveInt(
            target.value,
            screen.quantidade_colunas,
          ),
        };
      }

      if (action === "rows") {
        return {
          ...screen,
          quantidade_linhas: clampPositiveInt(
            target.value,
            screen.quantidade_linhas,
          ),
        };
      }

      if (action === "cabinet") {
        const selected = ui.cabinets.find((cab) => cab.id === target.value);
        if (!selected) return screen;
        return {
          ...screen,
          gabinete: toScreenCabinet(selected),
        };
      }

      return screen;
    });

    setState({ ...current, screens });
    setUi({ selectedScreenId: screenId });
  });
}
