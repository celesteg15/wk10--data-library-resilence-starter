import { DATA_URL, isValidItem, state } from "./state.js";
const REQUEST_TIMEOUT_MS = 5000;
let currentController = null;
// TODO 1: Add an AbortController to cancel in-flight requests
//         and set a timeout (e.g. 5000 ms).

// TODO 2: Wrap the fetch in try / catch / finally.
//         - try: fetch, check response.ok, parse JSON, validate items
//         - catch: set state.error with a user-friendly message
//         - finally: always set isLoading = false and call render()

// TODO 3: Handle AbortError separately from other errors
//         to show a "timed out" message.
function buildHttpError(status) {
  const error = new Error(`HTTP ${status}`);
  error.code = "HTTP_ERROR";
  error.status = status;
  return error;
}

function buildInvalidDataError() {
  const error = new Error("Invalid data shape");
  error.code = "INVALID_DATA";
  return error;
}

function buildOfflineError() {
  const error = new Error("Offline");
  error.code = "OFFLINE";
  return error;
}

async function loadItems(render) {
  if (currentController) {
    currentController.abort();
  }

  const controller = new AbortController();
  currentController = controller;

  state.isLoading = true;
  state.error = null;
  render();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(DATA_URL, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw buildHttpError(response.status);
    }

    const json = await response.json();

    if (!json || !Array.isArray(json.items)) {
      throw buildInvalidDataError();
    }

    const rawItems = json.items;
    const cleanedItems = rawItems.filter(isValidItem);

    if (rawItems.length > 0 && cleanedItems.length === 0) {
      throw buildInvalidDataError();
    }

    state.items = cleanedItems;
    state.lastLoadedAt = new Date();
    state.selectedId = cleanedItems.some((item) => item.id === state.selectedId)
      ? state.selectedId
      : null;
  } catch (error) {
    if (error?.name === "AbortError") {
      state.error = error;
    } else if (!navigator.onLine) {
      state.error = buildOfflineError();
    } else {
      state.error = error;
    }
  } finally {
    window.clearTimeout(timeoutId);

    if (currentController === controller) {
      currentController = null;
    }

    state.isLoading = false;
    render();
  }
}

export { loadItems };