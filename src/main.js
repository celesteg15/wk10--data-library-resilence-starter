import {
  clearBtn,
  favBtn,
  favFilterBtn,
  grid,
  kindChips,
  reloadBtn,
  retryBtn,
  searchInput,
  sortSelect,
} from "./dom.js";
import { loadItems } from "./api.js";
import { render } from "./render.js";
import { clearFilters, state } from "./state.js";

/* ── card selection ───────────────────────── */

grid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest("button.card");
  if (!button) return;

  state.selectedId = button.dataset.id || null;
  render();
});

/* ── kind chips ───────────────────────────── */

kindChips.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const button = target.closest("button.chip");
  if (!button) return;

  state.activeKind = button.dataset.kind || "all";
  render();
});

/* ── filter controls ──────────────────────── */

searchInput.addEventListener("input", () => {
  state.query = searchInput.value;
  render();
});

sortSelect.addEventListener("change", () => {
  state.sortBy = sortSelect.value;
  render();
});

favFilterBtn.addEventListener("click", () => {
  state.showFavoritesOnly = !state.showFavoritesOnly;
  render();
});

clearBtn.addEventListener("click", () => {
  clearFilters();
  render();
});

/* ── data loading ─────────────────────────── */

reloadBtn.addEventListener("click", () => {
  loadItems(render);
});

retryBtn.addEventListener("click", () => {
  loadItems(render);
});

/* ── favorites ────────────────────────────── */

favBtn.addEventListener("click", () => {
  if (!state.selectedId) return;

  if (state.favorites.has(state.selectedId)) {
    state.favorites.delete(state.selectedId);
  } else {
    state.favorites.add(state.selectedId);
  }

  render();
});

/* ── bootstrap ────────────────────────────── */

render();
loadItems(render);
