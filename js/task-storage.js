/**
 * JavaScript file for the shared task data (allTasks): loading it, saving changes via PATCH
 * and calculating the task positions. Also contains the helper for checking HTTP responses.
 * Used by the board page and the add task page.
 */

// #region VARIABLES

/** All tasks loaded from the database, keyed by task ID. */
const allTasks = {};
/** Chain of pending PATCH requests; ensures they are sent one after another. */
let patchQueue = Promise.resolve();

// #endregion

// #region HELPERS

/**
 * Builds the Firebase URL for the tasks, including the auth token of the current user.
 * @returns {Promise<string>} The URL to the tasks.json with the auth query parameter.
 */
async function getAuthTasksUrl() {
  const idToken = await window.auth.currentUser.getIdToken();
  const tasksUrl = `${window.firebaseUrl}/tasks.json?auth=${encodeURIComponent(idToken)}`;

  return tasksUrl;
}


/**
 * Throws an error if the HTTP response was not successful, because fetch itself only throws on network errors.
 * @param {Response} response - The response of a fetch request.
 * @param {string} message - The error message; the HTTP status is appended to it.
 * @returns {void} Nothing; throws if response.ok is false.
 * @throws {Error} If the response status is not in the range 200-299.
 */
function throwIfResponseNotOk(response, message) {
  if (!response.ok) {
    throw new Error(`${message}: ${response.status}`);
  }
}

// #endregion

// #region LOAD

/**
 * Loads all tasks from the database and replaces the content of allTasks.
 * Opens the connection error dialog on failure and never throws.
 * @returns {Promise<boolean>} True if the tasks were loaded, false if loading failed.
 */
async function fetchAllTasks() {
  try {
    const tasksUrl = await getAuthTasksUrl();
    const response = await fetch(tasksUrl);
    throwIfResponseNotOk(response, "Failed to load tasks");
    replaceAllTasks(await response.json());
    return true;
  } catch (error) {
    openDialogConnectionErrorDatabase();
    return false;
  }
}


/**
 * Replaces the content of allTasks, so tasks deleted in the meantime do not stay in it.
 * @param {Object<string, Object>|null} tasks - The loaded tasks keyed by task ID; null if there are none.
 * @returns {void} Nothing; allTasks is emptied and refilled.
 */
function replaceAllTasks(tasks) {
  Object.keys(allTasks).forEach((taskId) => delete allTasks[taskId]);
  Object.assign(allTasks, tasks);
}

// #endregion

// #region PATCH

/**
 * Queues a PATCH request so that updates are sent one after another in the order they were made.
 * @param {Object<string, *>} updates - The changes, keyed by path, e.g. "<taskID>/status" or "<taskID>" (null deletes the task).
 * @returns {Promise<boolean>} Resolves to true if the PATCH succeeded, false if it failed.
 */
function patchTasks(updates) {
  patchQueue = patchQueue.then(() => sendPatch(updates));
  return patchQueue;
}


/**
 * Sends the updates to the Firebase database.
 * Opens the connection error dialog on failure and never throws, so the queue keeps running.
 * @param {Object<string, *>} updates - The changes, keyed by path, e.g. "<taskID>/status" or "<taskID>" (null deletes the task).
 * @returns {Promise<boolean>} True on success, false on failure. Resolves once the request is finished or failed.
 */
async function sendPatch(updates) {
  try {
    const tasksUrl = await getAuthTasksUrl();
    const response = await requestTaskPatch(tasksUrl, updates);
    throwIfResponseNotOk(response, "Failed to save tasks");
    return true;
  } catch (error) {
    openDialogConnectionErrorDatabase();
    return false;
  }
}


/**
 * Sends a PATCH request with the updates to the given tasks URL.
 * Does not check the response status; the caller has to do that.
 * @param {string} tasksUrl - The Firebase URL of the tasks, including the auth token.
 * @param {Object<string, *>} updates - The changes, keyed by path, e.g. "<taskID>/status" or "<taskID>" (null deletes the task).
 * @returns {Promise<Response>} The response of the PATCH request.
 */
async function requestTaskPatch(tasksUrl, updates) {
  return fetch(tasksUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

// #endregion

// #region POSITION

/**
 * Inserts a task into a column behind the given task and renumbers the positions of the whole column.
 * If the task is already in the column, it is moved instead.
 * @param {Object<string, string|number>} updates - The collected changes; extended by this function.
 * @param {string} status - The status (column ID) of the column the task is inserted into.
 * @param {Object} taskIDs - The IDs needed for the insertion.
 * @param {string} taskIDs.insertedTaskID - The ID of the task to insert.
 * @param {string|null} taskIDs.previousTaskID - The ID of the task it follows, or null for position 0.
 * @returns {void} Nothing; allTasks and the updates object are changed.
 */
function insertTaskIntoColumn(
  updates,
  status,
  { insertedTaskID, previousTaskID },
) {
  const sortedTasks = getSortedTaskIds(status);
  removeIdFromList(sortedTasks, insertedTaskID);

  const newPosition = previousTaskID
    ? sortedTasks.indexOf(previousTaskID) + 1
    : 0;
  sortedTasks.splice(newPosition, 0, insertedTaskID);
  renumberPositions(updates, sortedTasks);
}


/**
 * Removes a task from the order of a column and renumbers the positions of the remaining tasks.
 * @param {Object<string, string|number>} updates - The collected changes; extended by this function.
 * @param {string} status - The status (column ID) of the column the task is removed from.
 * @param {string} removedTaskID - The ID of the task to remove.
 * @returns {void} Nothing; allTasks and the updates object are changed.
 */
function removeTaskFromColumn(updates, status, removedTaskID) {
  const sortedTasks = getSortedTaskIds(status);
  removeIdFromList(sortedTasks, removedTaskID);
  renumberPositions(updates, sortedTasks);
}


/**
 * Returns the IDs of all tasks with the given status, sorted by position.
 * @param {string} status - The status (column ID).
 * @returns {string[]} The sorted task IDs.
 */
function getSortedTaskIds(status) {
  const tasksPerStatus = Object.keys(allTasks).filter(
    (taskID) => allTasks[taskID].status === status,
  );
  return tasksPerStatus.sort(
    (a, b) => allTasks[a].position - allTasks[b].position,
  );
}


/**
 * Removes a task ID from a list of sorted IDs. Does nothing if the ID is not in the list.
 * @param {string[]} sortedTasks - The sorted task IDs; changed by this function.
 * @param {string} removedTaskID - The ID to remove.
 * @returns {void} Nothing; the array is changed in place.
 */
function removeIdFromList(sortedTasks, removedTaskID) {
  const removedTaskIndex = sortedTasks.indexOf(removedTaskID);
  if (removedTaskIndex === -1) return;
  sortedTasks.splice(removedTaskIndex, 1);
}


/**
 * Sets the position of every task to its index in the list and adds it to the updates.
 * @param {Object<string, string|number>} updates - The collected changes; extended by this function.
 * @param {string[]} sortedIDs - The task IDs in their new order; all of them must exist in allTasks.
 * @returns {void} Nothing; allTasks and the updates object are changed.
 */
function renumberPositions(updates, sortedIDs) {
  sortedIDs.forEach((taskID, index) => {
    allTasks[taskID].position = index;
    Object.assign(updates, { [`${taskID}/position`]: index });
  });
}

// #endregion
