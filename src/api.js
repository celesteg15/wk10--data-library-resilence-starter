import { DATA_URL, isValidItem, state } from "./state.js";

// TODO 1: Add an AbortController to cancel in-flight requests
//         and set a timeout (e.g. 5000 ms).

// TODO 2: Wrap the fetch in try / catch / finally.
//         - try: fetch, check response.ok, parse JSON, validate items
//         - catch: set state.error with a user-friendly message
//         - finally: always set isLoading = false and call render()

// TODO 3: Handle AbortError separately from other errors
//         to show a "timed out" message.

async function loadItems(render) {
  state.isLoading = true;
  state.error = null;
  render();

  // ── Current (fragile) implementation ──
  // This works on the happy path but has no timeout,
  // no response.ok check, and no finally block.

  const response = await fetch(DATA_URL, { cache: "no-store" });
  const json = await response.json();

  const rawItems = Array.isArray(json.items) ? json.items : [];
  const cleanedItems = rawItems.filter(isValidItem);

  state.items = cleanedItems;
  state.lastLoadedAt = new Date();
  state.selectedId = cleanedItems.some((item) => item.id === state.selectedId)
    ? state.selectedId
    : null;

  state.isLoading = false;
  render();
}

export { loadItems };
