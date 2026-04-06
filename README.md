# A7 — Resilience improvements (failure modes)

## How to run
1. Open the project folder in a terminal.
2. Start a local HTTP server:

   ```bash
   python3 -m http.server 5500

then open:
    http://127.0.0.1:5500/ 

## Failure modes identified

I identified these failure modes for the app:

- **Offline**
  - Trigger: the user loses internet connection or DevTools Network is set to Offline.

- **Request timeout**
  - Trigger: the network is very slow or the request takes too long to finish.

- **HTTP/server error**
  - Trigger: the fetch URL is broken or the server returns an error such as 404 or 500.

- **Malformed data**
  - Trigger: the JSON response is missing the `items` array or item data has the wrong structure.

- **Stale data**
  - Trigger: previously loaded data has not been refreshed for longer than the stale threshold.

## Failure modes handled

I implemented visible handling for these failure modes:

- Offline
- Request timeout
- HTTP/server error
- Malformed data
- Stale data

## What I tested

I tested the app in these ways:

- Loaded the app normally and confirmed items displayed correctly.
- Verified the loading indicator appears while data is being fetched.
- Set DevTools Network to **Offline** and confirmed a visible offline error message appeared.
- Restored the network and clicked **Retry** to confirm the app could recover.
- Simulated a slow request and confirmed the timeout handling appeared.
- Broke the fetch URL to trigger a **404** and confirmed a visible server error message appeared.
- Tested malformed data by changing the JSON structure and confirmed the invalid-data error appeared.
- Confirmed that previously loaded data stayed visible when a refresh failed.
- Confirmed the stale-data banner appeared when old data remained after a failed refresh.
- Verified reload and retry controls were disabled while loading.

## Debugging steps used

I debugged the app by testing one failure mode at a time in the browser and checking the UI after each change. I used DevTools to simulate offline mode, slow requests, and broken fetches, and I checked that `response.ok`, error handling, and the `finally` block all worked correctly. I also verified that old data was preserved when refreshes failed.