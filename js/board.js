/**
 * JavaScript file for the initialization of the board page, loading the contacts
 * and rendering the task cards and columns.
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
 * Waits for the current user, loads all tasks and all contacts, then renders the tasks into their columns.
 * Contacts must be loaded before rendering, because the task assignees depend on them.
 * The loading animation is removed even if an error occurs.
 * @returns {Promise<void>} Resolves once loading is finished and the tasks are rendered.
 */
async function initBoard() {
  try {
    await window.getCurrentUser();
    await fetchAllTasks();
    await fetchAllContacts();
    renderTasks(Object.keys(allTasks));
    allFetchedTasksAreRendered = true;
  } finally {
    document.body.classList.remove("is-loading");
  }
}


/**
 * Fetches all contacts from the Firebase database and merges them into allContacts.
 * Opens the connection error dialog on failure and never throws.
 * @returns {Promise<void>} Resolves once the contacts are stored or the error dialog is opened.
 */
async function fetchAllContacts() {
  try {
    const idToken = await window.auth.currentUser.getIdToken();
    const response = await fetch(`${window.firebaseUrl}/contacts.json?auth=${idToken}`);
    throwIfResponseNotOk(response, "Failed to load contacts");
    Object.assign(allContacts, await response.json());
  } catch (error) {
    openDialogConnectionErrorDatabase();
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
    renderTaskCountForStatus(currentTaskIDs, column.id);
  }
  const sortedTaskIDs = currentTaskIDs.toSorted((a, b) => allTasks[a].position - allTasks[b].position);
  sortedTaskIDs.forEach(renderOneTaskCard);
  renderEmptyColumnMessages();
}


/**
 * Renders a single task card into its column,
 * including the description, progress bar and assignees if this information exists.
 * @param {string} taskID - The ID of the task to render.
 * @returns {void} Nothing; the task card is added to its column in the DOM.
 */
function renderOneTaskCard(taskID) {
  const column = document.getElementById(allTasks[taskID].status);
  column.innerHTML += templateTaskCard(taskID, getCategoryColorClass(taskID));
  renderTaskCardDetails(taskID);
}


/**
 * Fills the details of a rendered task card: description, progress bar and assignees.
 * The card with its empty containers has to be in the DOM already.
 * @param {string} taskID - The ID of the task.
 * @returns {void} Nothing; the containers of the task card are filled, hidden or removed.
 */
function renderTaskCardDetails(taskID) {
  renderDescription(taskID, `description${taskID}`);
  renderProgressBar(taskID);
  const assignees = allTasks[taskID].assignedTo;
  if (hasTaskAssignees(assignees)) renderTaskAssignees(taskID, assignees, "board");
}

// #endregion

// #region TASK DETAILS

/**
 * Returns the CSS class for the color of the category label of a task.
 * @param {string} taskID - The ID of the task.
 * @returns {string} The class for "User Story" tasks, otherwise the class for technical tasks.
 */
function getCategoryColorClass(taskID) {
  return (allTasks[taskID].category === "User Story") ? "category-color-user-story" : "category-color-technical-task";
}


/**
 * Renders the description of a task into the given element, or removes the element if there is no description.
 * Used for the task card and for the overlay.
 * @param {string} taskID - The ID of the task for which to render the description.
 * @param {string} containerID - The ID of the element that shows the description.
 * @returns {void} Nothing; the description is written into the element or the element is removed.
 */
function renderDescription(taskID, containerID) {
  const descriptionRef = document.getElementById(containerID);
  const description = allTasks[taskID].description;
  if (!description || description.trim() === "") {
    descriptionRef.remove();
  } else {
    descriptionRef.textContent = description;
  }
}

// #endregion

// #region SUBTASK PROGRESS

/**
 * Renders a progress bar for a task based on its subtasks if they exist.
 * @param {string} taskID - The ID of the task for which to render the progress bar.
 * @returns {void} Nothing; the progress bar is written into the task card, or its container is hidden if there are no subtasks.
 */
function renderProgressBar(taskID) {
  const progressContainerRef = document.getElementById(`progressContainer${taskID}`);
  const subtasks = allTasks[taskID].subtasks;
  if (hasTaskSubtasks(subtasks)) {
    const doneSubtasks = countDoneSubtasks(subtasks);
    progressContainerRef.innerHTML = templateProgressBar(doneSubtasks, subtasks.length);
  } else {
    progressContainerRef.classList.add("d-none");
  }
}


/**
 * Checks whether a task has at least one subtask.
 * @param {{text: string, done: boolean}[]|undefined} subtasks - The subtasks of a task; missing if the task has none.
 * @returns {boolean} True if there is at least one subtask, otherwise false.
 */
function hasTaskSubtasks(subtasks) {
  if (subtasks && subtasks.length > 0) {
    return true;
  }
  return false;
}


/**
 * Counts the completed subtasks.
 * @param {{text: string, done: boolean}[]} subtasks - The array of subtasks for a task.
 * @returns {number} The number of subtasks marked as done.
 */
function countDoneSubtasks(subtasks) {
  let counter = 0;
  subtasks.forEach((subtask) => { counter += subtask.done ? 1 : 0; });
  return counter;
}

// #endregion

// #region ASSIGNEES

/**
 * Checks whether a task has at least one assignee.
 * @param {string[]|undefined} assignees - The assignee IDs of a task; missing if the task has none.
 * @returns {boolean} True if there is at least one assignee, otherwise false.
 */
function hasTaskAssignees(assignees) {
  if (assignees && assignees.length > 0) {
    return true;
  }
  return false;
}


/**
 * Renders all assignees of a task in the task card or in the overlay.
 * Assignees without data (neither a contact nor a badge in the task) are skipped.
 * @param {string} taskID - The ID of the task.
 * @param {string[]} assignees - The IDs of the assignees.
 * @param {"board"|"overlay"} view - Where to render: "board" for the task card, "overlay" for the overlay.
 * @returns {void} Nothing; the assignees are written into the DOM.
 */
function renderTaskAssignees(taskID, assignees, view) {
  for (let i = 0; i < assignees.length; i++) {
    const assignee = getAssignee(taskID, assignees[i]);
    if (!assignee) continue;

    if (view === "board") renderOneCardAssignee(taskID, assignee);
    if (view === "overlay") renderOneOverlayAssignee(taskID, assignee);
  }
}


/**
 * Returns the data of an assignee of a task.
 * Looks in allContacts first and falls back to the badges stored in the task (e.g. for the logged-in user).
 * @param {string} taskID - The ID of the task.
 * @param {string} assigneeID - The ID of the assignee.
 * @returns {{name?: string, shortcut: string, shortcutColor: string}|undefined} The contact or badge, or undefined if none exists.
 */
function getAssignee(taskID, assigneeID) {
  return allContacts[assigneeID] ?? allTasks[taskID].assignedUserBadges?.[assigneeID];
}


/**
 * Appends one assignee avatar to the assignees of a task card.
 * @param {string} taskID - The ID of the task.
 * @param {{shortcut: string, shortcutColor: string}} assignee - The assignee to show.
 * @returns {void} Nothing; the avatar is added to the task card.
 */
function renderOneCardAssignee(taskID, assignee) {
  const assigneesRef = document.getElementById(`assigneesContainer${taskID}`);
  assigneesRef.innerHTML += templateCardAssignee(assignee.shortcutColor, assignee.shortcut);
}

// #endregion

// #region COLUMNS

/**
 * Counts the given tasks per status and renders the amount in the column header.
 * @param {string[]} currentTaskIDs - The task IDs to count.
 * @param {string} status - The status (column ID) to count the tasks for.
 * @returns {void} Nothing; the amount is written into the column header.
 */
function renderTaskCountForStatus(currentTaskIDs, status) {
  const amount = currentTaskIDs.filter((taskId) => allTasks[taskId].status === status).length;
  renderTaskCount(status, amount);
}


/**
 * Writes the amount of tasks into the header of a column.
 * @param {string} status - The status (column ID) of the column.
 * @param {number} amount - The amount of tasks to display.
 * @returns {void} Nothing; the counter element is updated.
 */
function renderTaskCount(status, amount) {
  document.getElementById(`${status}Amount`).innerHTML = amount;
}


/**
 * Empties all task columns.
 * @returns {void} Nothing; the content of every column is removed from the DOM.
 */
function clearAllColumns() {
  columns.forEach((column) => { column.innerHTML = "" });
}


/**
 * Renders a message into every empty column. Also called after tasks were moved or deleted.
 * @returns {void} Nothing; the message is written into each empty column.
 */
function renderEmptyColumnMessages() {
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].innerText) {
      const emptyColumnID = columns[i].id;
      const emptyColumnName = getColumnName(emptyColumnID);
      document.getElementById(emptyColumnID).innerHTML
        = templateEmptyColumnMessage(emptyColumnName);
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
