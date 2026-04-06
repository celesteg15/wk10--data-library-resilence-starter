import {
  clearBtn,
  countsEl,
  detailDesc,
  detailHint,
  detailMeta,
  detailTitle,
  emptyEl,
  emptyMsgEl,
  errorEl,
  errorMsgEl,
  favBtn,
  favFilterBtn,
  grid,
  kindChips,
  reloadBtn,
  retryBtn,
  searchInput,
  sortSelect,
  statusEl,
  summaryEl,
  loadingEl,
  staleBannerEl,
} from "./dom.js";
import {
  formatTime,
  getActiveSummary,
  getKindCounts,
  getSelectedVisibleItem,
  getVisibleItems,
  state,
  getErrorDisplay,
  isStale,
} from "./state.js";

/* ── status bar ───────────────────────────── */

function renderStatus() {
  if (state.isLoading && state.items.length > 0) {
    statusEl.textContent = "Refreshing data…";
    return;
  }

  if (state.isLoading) {
    statusEl.textContent = "Loading data…";
    return;
  }

  if (state.error && state.items.length > 0 && state.lastLoadedAt) {
    statusEl.textContent = `Refresh failed. Showing data from ${formatTime(state.lastLoadedAt)}.`;
    return;
  }

  if (state.lastLoadedAt) {
    statusEl.textContent = `Loaded ${state.items.length} items at ${formatTime(state.lastLoadedAt)}.`;
    return;
  }

  statusEl.textContent = "";
}

// TODO: add renderLoading() to show/hide a loading spinner.
function renderLoading() {
  loadingEl.hidden = !state.isLoading;
}
// TODO: add renderStaleBanner() to warn when data is older
//       than the stale threshold.
function renderStaleBanner() {
  const showPreservedDataBanner =
    Boolean(state.error && state.items.length > 0 && state.lastLoadedAt);

  const showStaleAgeBanner =
    !state.isLoading && !state.error && state.items.length > 0 && isStale();

  const shouldShow = showPreservedDataBanner || showStaleAgeBanner;

  staleBannerEl.hidden = !shouldShow;

  if (!shouldShow) {
    staleBannerEl.textContent = "";
    return;
  }

  if (showPreservedDataBanner) {
    staleBannerEl.textContent =
      `Showing previously loaded data from ${formatTime(state.lastLoadedAt)} while the refresh is unavailable.`;
    return;
  }

  staleBannerEl.textContent =
    `This data may be stale. It was last loaded at ${formatTime(state.lastLoadedAt)}.`;
}
/* ── error panel ──────────────────────────── */

function renderError() {
  if (!state.error || state.isLoading) {
    errorEl.hidden = true;
    errorMsgEl.textContent = "—";
    retryBtn.hidden = true;
    return;
  }

  const display = getErrorDisplay(state.error);
  errorEl.hidden = false;
  errorMsgEl.textContent = display.message;
  retryBtn.hidden = !display.showRetry;
}
/* ── controls (chips, inputs) ─────────────── */

function renderControls(kindCounts) {
  searchInput.value = state.query;
  sortSelect.value = state.sortBy;
  favFilterBtn.setAttribute("aria-pressed", state.showFavoritesOnly ? "true" : "false");
  clearBtn.disabled = !state.query && state.activeKind === "all" && !state.showFavoritesOnly && state.sortBy === "title-asc";

  kindChips.replaceChildren();

  const allButton = document.createElement("button");
  allButton.type = "button";
  allButton.className = "chip";
  if (state.activeKind === "all") allButton.classList.add("is-active");
  allButton.dataset.kind = "all";

  const allLabel = document.createElement("span");
  allLabel.textContent = "All";
  const allCount = document.createElement("span");
  allCount.className = "chip-count";
  allCount.textContent = state.items.length;
  allButton.append(allLabel, allCount);
  kindChips.appendChild(allButton);

  for (const [kind, count] of Object.entries(kindCounts).sort((a, b) => a[0].localeCompare(b[0]))) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    if (state.activeKind === kind) button.classList.add("is-active");
    button.dataset.kind = kind;

    const label = document.createElement("span");
    label.textContent = kind;
    const countBadge = document.createElement("span");
    countBadge.className = "chip-count";
    countBadge.textContent = count;
    button.append(label, countBadge);
    kindChips.appendChild(button);
  }
}

/* ── card grid ────────────────────────────── */

function renderList(visibleItems) {
  grid.replaceChildren();

  for (const item of visibleItems) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "card";
    button.dataset.id = item.id;
    if (item.id === state.selectedId) button.classList.add("is-selected");
    if (state.favorites.has(item.id)) button.classList.add("is-fav");

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = item.title;

    const meta = document.createElement("div");
    meta.className = "card-meta";
    meta.textContent = `${item.kind} • ${item.minutes} min • ${item.tags.join(", ")}`;

    button.append(title, meta);
    grid.appendChild(button);
  }
}

/* ── detail panel ─────────────────────────── */

function renderDetail(selectedItem, visibleItems) {
  if (!state.selectedId) {
    detailHint.textContent = "Select an item to show detail.";
    detailTitle.textContent = "Nothing selected";
    detailMeta.textContent = "—";
    detailDesc.textContent = "The detail view updates from the same state model as the list and chips.";
    favBtn.disabled = true;
    favBtn.setAttribute("aria-pressed", "false");
    favBtn.textContent = "Favorite";
    return;
  }

  if (!selectedItem) {
    detailHint.textContent = "Current filters hide the selected item.";
    detailTitle.textContent = "Selected item hidden";
    detailMeta.textContent = `${visibleItems.length} visible result${visibleItems.length === 1 ? "" : "s"}`;
    detailDesc.textContent = "Clear filters or choose another item from the visible results.";
    favBtn.disabled = true;
    favBtn.setAttribute("aria-pressed", "false");
    favBtn.textContent = "Favorite";
    return;
  }

  detailHint.textContent = "";
  detailTitle.textContent = selectedItem.title;
  detailMeta.textContent = `${selectedItem.kind} • ${selectedItem.minutes} min`;
  detailDesc.textContent = selectedItem.desc;

  const isFavorite = state.favorites.has(selectedItem.id);
  favBtn.disabled = false;
  favBtn.setAttribute("aria-pressed", isFavorite ? "true" : "false");
  favBtn.textContent = isFavorite ? "Unfavorite" : "Favorite";
}

/* ── empty state ──────────────────────────── */

function renderEmptyState(visibleItems) {
  const isEmpty = !state.error && !state.isLoading && visibleItems.length === 0;
  emptyEl.hidden = !isEmpty;
  emptyMsgEl.textContent = state.query || state.activeKind !== "all" || state.showFavoritesOnly
    ? "No items match the current search and filter combination."
    : "No items are available right now.";
}

/* ── main render ──────────────────────────── */

function render() {
  const visibleItems = getVisibleItems();
  const selectedItem = getSelectedVisibleItem(visibleItems);

  renderStatus();
  renderLoading();
  renderStaleBanner();
  renderError();
  renderControls(getKindCounts(state.items));
  renderList(visibleItems);
  renderDetail(selectedItem, visibleItems);
  renderEmptyState(visibleItems);

  countsEl.textContent = `${visibleItems.length} shown • ${state.items.length} total • ${state.favorites.size} favorite${state.favorites.size === 1 ? "" : "s"}`;
  summaryEl.textContent = getActiveSummary(visibleItems);

  reloadBtn.disabled = state.isLoading;
  retryBtn.disabled = state.isLoading;
}

export { render };
