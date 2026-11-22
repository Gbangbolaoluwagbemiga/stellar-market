// Background sync handlers for pending applications and messages
// This file is imported by the main service worker

// Maximum number of failed sync attempts before an action is dropped from the
// pending store. Prevents permanently un-syncable actions (e.g. the target was
// deleted server-side) from being retried forever.
const MAX_RETRIES = 5;

self.addEventListener("sync", async (event) => {
  console.log("[SW] Sync event:", event.tag);

  if (event.tag === "pending-application") {
    event.waitUntil(syncPendingActions("application"));
  } else if (event.tag === "pending-message") {
    event.waitUntil(syncPendingActions("message"));
  }
});

async function syncPendingActions(type) {
  console.log("[SW] Syncing pending actions:", type);

  try {
    const db = await openDB();
    const actions = await getActionsByType(db, type);

    for (const action of actions) {
      // Guard: drop actions already at or over the cap before retrying them
      if ((action.retries || 0) >= MAX_RETRIES) {
        console.warn(
          `[SW] Dropping action ${action.id} after ${action.retries} retries`,
        );
        await deleteAction(db, action.id);
        continue;
      }

      try {
        const response = await fetch(action.endpoint, {
          method: action.method,
          headers: {
            "Content-Type": "application/json",
            ...action.headers,
          },
          body: JSON.stringify(action.body),
        });

        if (response.ok) {
          await deleteAction(db, action.id);
          const title =
            type === "application" ? "Application Submitted" : "Message Sent";
          const body =
            type === "application"
              ? "Your job application has been submitted successfully."
              : "Your message has been sent successfully.";

          await self.registration.showNotification(title, {
            body,
            icon: "/icon-192.png",
            badge: "/favicon.svg",
          });
        } else if (response.status >= 400 && response.status < 500) {
          // Client error - don't retry
          await deleteAction(db, action.id);
        } else {
          // Server error - increment retry
          await recordFailure(db, action);
        }
      } catch (error) {
        console.error("[SW] Error syncing action:", error);
        await recordFailure(db, action);
      }
    }
  } catch (error) {
    console.error("[SW] Error in syncPendingActions:", error);
  }
}

// Increments the retry count and drops the action once MAX_RETRIES is reached
async function recordFailure(db, action) {
  const retries = await incrementRetry(db, action.id);
  if (retries !== null && retries >= MAX_RETRIES) {
    console.warn(
      `[SW] Dropping action ${action.id} after ${retries} failed retries`,
    );
    await deleteAction(db, action.id);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("stellarmarket-sync", 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getActionsByType(db, type) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending", "readonly");
    const store = tx.objectStore("pending");
    const index = store.index("by-type");
    const request = index.getAll(type);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function deleteAction(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending", "readwrite");
    const store = tx.objectStore("pending");
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Resolves with the updated retry count, or null if the action no longer exists
function incrementRetry(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("pending", "readwrite");
    const store = tx.objectStore("pending");
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const action = getRequest.result;
      if (action) {
        action.retries = (action.retries || 0) + 1;
        const putRequest = store.put(action);
        putRequest.onsuccess = () => resolve(action.retries);
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve(null);
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}
