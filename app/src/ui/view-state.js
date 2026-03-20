export function renderViewState(refs, activeView) {
  refs.navButtons.forEach((button) => {
    const isActive = button.dataset.view === activeView;
    button.classList.toggle("active", isActive);
  });

  refs.viewPanes.forEach((pane) => {
    const isActive = pane.dataset.viewPane === activeView;
    pane.classList.toggle("active", isActive);
  });
}
