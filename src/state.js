const DATA_URL = "./assets/items.json";

const state = {
  // ── filters (from Week 9) ──
  query: "",
  sortBy: "title-asc",
  activeKind: "all",
  showFavoritesOnly: false,
  selectedId: null,
  favorites: new Set(["echo"]),

  // ── async / reliability (Week 10 — TODO) ──
  items: [],
  isLoading: false,
  error: null,
  lastLoadedAt: null,
};

/* ── helpers ──────────────────────────────── */

function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isValidItem(item) {
  return (
    item
    && typeof item === "object"
    && typeof item.id === "string"
    && typeof item.title === "string"
    && typeof item.kind === "string"
    && typeof item.minutes === "number"
    && typeof item.desc === "string"
    && Array.isArray(item.tags)
  );
}

// TODO: add an isStale() function that checks if lastLoadedAt
// is older than a threshold (e.g. 5 minutes).

/* ── selectors ────────────────────────────── */

function compareBy(sortBy) {
  if (sortBy === "minutes-desc") {
    return (a, b) => b.minutes - a.minutes;
  }

  if (sortBy === "kind-asc") {
    return (a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title);
  }

  return (a, b) => a.title.localeCompare(b.title);
}

function getFilteredItems() {
  const normalizedQuery = state.query.trim().toLowerCase();

  return state.items.filter((item) => {
    const matchesQuery = normalizedQuery === ""
      || item.title.toLowerCase().includes(normalizedQuery)
      || item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    const matchesKind = state.activeKind === "all" || item.kind === state.activeKind;
    const matchesFavorites = !state.showFavoritesOnly || state.favorites.has(item.id);

    return matchesQuery && matchesKind && matchesFavorites;
  });
}

function getSortedItems(filteredItems) {
  return [...filteredItems].sort(compareBy(state.sortBy));
}

function getVisibleItems() {
  return getSortedItems(getFilteredItems());
}

function getKindCounts(items) {
  return items.reduce((acc, item) => {
    acc[item.kind] = (acc[item.kind] || 0) + 1;
    return acc;
  }, {});
}

function getSelectedVisibleItem(visibleItems) {
  return visibleItems.find((item) => item.id === state.selectedId) ?? null;
}

function getActiveSummary(visibleItems) {
  const parts = [];

  if (state.query.trim() !== "") parts.push(`matching "${state.query.trim()}"`);
  if (state.activeKind !== "all") parts.push(`in ${state.activeKind}`);
  if (state.showFavoritesOnly) parts.push("favorites only");

  const sortLabel = {
    "title-asc": "title",
    "minutes-desc": "minutes",
    "kind-asc": "kind",
  }[state.sortBy] || state.sortBy;

  const prefix = `${visibleItems.length} result${visibleItems.length === 1 ? "" : "s"}`;
  if (parts.length === 0) return `${prefix}, sorted by ${sortLabel}.`;
  return `${prefix} ${parts.join(" • ")}, sorted by ${sortLabel}.`;
}

function clearFilters() {
  state.query = "";
  state.sortBy = "title-asc";
  state.activeKind = "all";
  state.showFavoritesOnly = false;
}

export {
  DATA_URL,
  clearFilters,
  formatTime,
  getActiveSummary,
  getFilteredItems,
  getKindCounts,
  getSelectedVisibleItem,
  getVisibleItems,
  isValidItem,
  state,
};
