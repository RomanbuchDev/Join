/**
 * JavaScript file for the initiation (fetch and tasks rendering) of the board page.
 */

// #region VARIABLES
/** All loaded contacts, keyed by contact ID. */
const allContacts = {};
/** All task columns (lists) of the board. */
const columns = document.querySelectorAll(".tasks-list");
/** True while all tasks are rendered, false while a search result is shown. */
let allFetchedTasksAreRendered = false;
// #endregion


// #region INIT
/**
 * Initializes the board view.
 * Initializes the header, then loads all tasks and all contacts first, then renders the tasks into their columns.
 * Contacts must be loaded before rendering, because the task assignees depend on them.
 * @returns {Promise<void>} Resolves once tasks and contacts are loaded and the tasks are rendered.
 */
async function initBoard() {
  await initHeader();
  await fetchAllData("tasks");
  await fetchAllData("contacts");
  renderTasks(Object.keys(allTasks));
  allFetchedTasksAreRendered = true;
}
// #endregion


// #region FETCH
/**
 * Fetches all data of a specific category from the Firebase database.
 * @param {string} dataCategory - The category of data to fetch ("tasks", "contacts").
 * @returns {Promise<void>} Resolves once the data is fetched and stored; on errors the connection error dialog opens and nothing is thrown.
 */
async function fetchAllData(dataCategory) {
  try {
    const idToken = await window.auth.currentUser.getIdToken();
    const response = await fetch(`${window.firebaseUrl}/${dataCategory}.json?auth=${idToken}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${dataCategory}: ${response.status}`);
    }
    const responseToJson = await response.json();
    storeData(dataCategory, responseToJson);
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}


/**
 * Stores fetched data in the objects matching its category.
 * @param {string} dataCategory - The data category ("tasks" or "contacts").
 * @param {Object<string, Object>} dataObject - The fetched data, keyed by ID.
 * @returns {void} Nothing; the data is merged into allTasks or allContacts.
 */
function storeData(dataCategory, dataObject) {
  switch (dataCategory) {
    case "tasks":
      Object.assign(allTasks, dataObject);
      break;
    case "contacts":
      Object.assign(allContacts, dataObject);
      break;
  }
}
// #endregion


// #region RENDER TASK
/**
 * Renders the given tasks into their columns, sorted by position.
 * Clears all columns first and updates the column counters and the empty-column messages.
 * @param {string[]} currentTaskIDs - The task IDs to render.
 * @returns {void} Nothing; the columns are cleared and filled with the given tasks.
 */
function renderTasks(currentTaskIDs) {
  clearAllColumns();
  for (const column of columns) {
    renderAmountForStatus(currentTaskIDs, column.id)
  }
  const sortedTaskIDs = currentTaskIDs.toSorted((a, b) => allTasks[a].position - allTasks[b].position);
  sortedTaskIDs.forEach(renderOneTask);
  checkForEmptyColumn();
}


/**
 * Counts the given tasks per status and renders the amount in the column header.
 * @param {string[]} currentTaskIDs - The task IDs to count.
 * @param {string} status - The status (column ID) to count the tasks for.
 * @returns {void} Nothing; the amount is written into the column header.
 */
function renderAmountForStatus(currentTaskIDs, status) {
  const amount = currentTaskIDs.filter((taskId) => allTasks[taskId].status === status).length;
  renderAmountOfTasks(status, amount)
}


/**
 * Writes the amount of tasks into the header of a column.
 * @param {string} status - The status (column ID) of the column.
 * @param {number} amount - The amount of tasks to display.
 * @returns {void} Nothing; the counter element is updated.
 */
function renderAmountOfTasks(status, amount) {
  document.getElementById(`${status}Amount`).innerHTML = amount;
}


/**
 * Renders a single task card into its column,
 * including the description, progress bar and assignees if this information exists.
 * @param {string} taskID - The ID of the task to render.
 * @returns {void} Nothing; the task card is added to its column in the DOM.
 */
function renderOneTask(taskID) {
  const categoryColor = (allTasks[taskID].category == "User Story") ? "category-color-user-story" : "category-color-technical-task";
  const column = document.getElementById(allTasks[taskID].status);
  column.innerHTML += templateTaskCard(taskID, categoryColor);
  renderDescription(taskID);
  renderProgressBar(taskID);
  renderTaskAssignees(taskID);
}
// #endregion


// #region T. DETAILS
/**
 * Renders the description for a task card if it exists.
 * @param {string} taskID - The ID of the task for which to render the description.
 * @returns {void} Nothing; the description is written into the task card, or the card stays unchanged if there is none.
 */
function renderDescription(taskID) {
  const description = allTasks[taskID].description;
  if (!description || description.trim() === "") {
    return
  }
  const descriptionRef = document.getElementById(`description${taskID}`);
  descriptionRef.textContent = description;
}


/**
 * Renders a progress bar for a task based on its subtasks if they exist.
 * @param {string} taskID - The ID of the task for which to render the progress bar.
 * @returns {void} Nothing; the progress bar is written into the task card, or its container is hidden if there are no subtasks.
 */
function renderProgressBar(taskID) {
  const subtasks = allTasks[taskID].subtasks;
  const progressContainerRef = document.getElementById(`progressContainer${taskID}`);
  if (subtasks && subtasks.length > 0) {
    const doneSubtasks = checkDoneSubtasks(subtasks);
    progressContainerRef.innerHTML = templateProgressBar(doneSubtasks, subtasks.length);
  } else {
    progressContainerRef.classList.add("d-none");
  }
}


/**
 * Counts the completed subtasks.
 * @param {Object[]} subtasks - The array of subtasks for a task.
 * @returns {number} The number of subtasks marked as done.
 */
function checkDoneSubtasks(subtasks) {
  let counter = 0;
  subtasks.forEach((subtask) => {counter += subtask.done ? 1 : 0;})
  return counter;
}


/**
 * Renders the avatars of all assignees on a task card if they exist.
 * @param {string} taskID - The ID of the task for which to render the assignees.
 * @returns {void} Nothing; the avatars are added to the task card, unknown contacts are skipped.
 */
function renderTaskAssignees(taskID) {
  const assignees = allTasks[taskID].assignedTo;
  if (!assignees || assignees.length === 0) {
    return;
  }
  const assigneesContainerRef = document.getElementById(`assigneesContainer${taskID}`);
  for (let i = 0; i < assignees.length; i++) {
    const assignee = getTaskAssignee(taskID, assignees[i]);
    if (!assignee) continue;

    assigneesContainerRef.innerHTML += templateTaskAssignee(assignee.shortcutColor, assignee.shortcut);
  }
}


/**
 * Returns the data of an assignee of a task.
 * Looks in allContacts first and falls back to the badges stored in the task (e.g. for the logged-in user).
 * @param {string} taskID - The ID of the task.
 * @param {string} assigneeID - The ID of the assignee.
 * @returns {Object|undefined} The contact or badge with shortcut and shortcutColor, or undefined if none exists.
 */
function getTaskAssignee(taskID, assigneeID) {
  return allContacts[assigneeID] ?? allTasks[taskID].assignedUserBadges?.[assigneeID];
}
// #endregion


// #region COLUMNS
/**
 * Empties all task columns.
 * @returns {void} Nothing; the content of every column is removed from the DOM.
 */
function clearAllColumns() {
  columns.forEach((column) => {column.innerHTML = ""})
}


/**
 * Renders a placeholder into every empty column. Also called after tasks were moved.
 * @returns {void} Nothing; the placeholder is written into each empty column.
 */
function checkForEmptyColumn() {
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].innerText) {
      const emptyColumnID = columns[i].id;
      const emptyColumnName = getColumnName(emptyColumnID);
      document.getElementById(emptyColumnID).innerHTML 
        = templateEmptyColumn(emptyColumnName);
    }
  }
}


/**
 * Returns the display name of a column.
 * @param {string} columnID - The ID of the column.
 * @returns {string} The column name, or an empty string if the ID is unknown.
 */
function getColumnName(columnID) {
  let columnName = "";
  switch (columnID) {
    case "toDo": columnName = "To do";
      break;
    case "inProgress": columnName = "In progress";
      break; 
    case "awaitFeedback": columnName = "Await feedback";
      break;
    case "done": columnName = "Done";
  }
  return columnName;
}
// #endregion
