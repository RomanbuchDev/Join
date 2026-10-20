// #region variables
const allContacts = {};
const allTasks = {};
let allFetchedTasksAreRendered = false;
// #endregion


// #region init
/**
 * Initializes the board view.
 * Loads all tasks and all contacts first, then renders the tasks into their columns.
 * Contacts must be loaded before rendering, because the task assignees depend on them.
 * @returns {Promise<void>} Resolves once tasks and contacts are loaded and the tasks are rendered.
 */
async function initBoard() {
  await window.getCurrentUser();
  renderAddTaskButtons();
  await fetchAllData("tasks");
  await fetchAllData("contacts");
  renderTasks(Object.keys(allTasks));
  allFetchedTasksAreRendered = true;
}


/**
 * Renders the Add Task Buttons.
 * Each button is only rendered if its container exists on the current page.
 * @returns {void} Nothing; the button SVGs are written into their containers, missing containers are skipped.
 */
function renderAddTaskButtons() {
  try {
    document.getElementById("addTaskButtonH1").innerHTML = templateAddTaskH1SVG();
  } catch {}
  const columnButtons = ["addTaskButtonToDo", "addTaskButtonInProgress", "addTaskButtonAwaitFeedback"]
  for (const button of columnButtons) {
    try {
      document.getElementById(button).innerHTML = templateAddTaskColumnSVG();
    } catch {}
  }
}


// #endregion


// #region data loading
/**
 * Fetches all data of a specific category from the Firebase database.
 * @param {string} dataCategory - The category of data to fetch ("tasks", "contacts").
 * @returns {Promise<void>} Resolves once the data is fetched and stored; errors are logged and not thrown.
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
    console.error(error);
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


// #region task rendering
/**
 * Renders all given tasks into their corresponding columns.
 * @param {string[]} currentTasksArrayIDs - The array of task IDs to render.
 * @param {string} [activeSearch=""] - The active search text, used in the placeholder for empty columns.
 * @returns {void} Nothing; the columns are cleared and filled with the given tasks.
 */
function renderTasks(currentTasksArrayIDs, activeSearch="") {
  clearAllColumns();
  for (let i = 0; i < currentTasksArrayIDs.length; i++) {
    renderOneTask(currentTasksArrayIDs[i]);
  }
  checkForEmptyColumn(activeSearch);
}


/**
 * Renders a single task card into its column, 
 * including the description, progress bar and assignees if this information exists.
 * @param {string} taskID - The ID of the task to render.
 * @returns {void} Nothing; the task card is added to its column in the DOM.
 */
function renderOneTask(taskID) {
  const {cardPlace, category, categoryColor, title, priority, description, subtasks, assignees} 
    = createAndReturnVariablesForTask(taskID);
  cardPlace.innerHTML += templateTaskCard(taskID, {category, categoryColor}, {title, priority});
  renderDescription(taskID, description);
  renderProgressBar(taskID, subtasks);
  renderTaskAssignees(taskID, assignees)
}


/**
 * Collects the data needed to render a task card.
 * @param {string} taskID - The ID of the task to render.
 * @returns {{cardPlace: (HTMLElement), category: string, categoryColor: string, title: string, priority: string, description: (string|undefined), subtasks: (Object[]|undefined), assignees: (string[]|undefined)}}
 * The target column element, category and its color class, title, priority, description, subtasks and assignees.
 */
function createAndReturnVariablesForTask(taskID) {
  const {category, title, description, priority, assignedTo: assignees, status: columnName, subtasks} 
    = allTasks[taskID];
  const categoryColor = (category == "User Story") ? "category-color-user-story" : "category-color-technical-task";
  const cardPlace = document.getElementById(columnName);
  return {cardPlace, category, categoryColor, title, priority, description, subtasks, assignees};
}


// #endregion


// #region task card details
/**
 * Renders the description for a task card if it exists.
 * @param {string} taskID - The ID of the task for which to render the description.
 * @param {(string|undefined)} description - The description text to render.
 * @returns {void} Nothing; the description is written into the task card, or the card stays unchanged if there is none.
 */
function renderDescription(taskID, description) {
  if (!description || description.trim() === "") {
    return
  }
  const descriptionRef = document.getElementById(`description${taskID}`);
  descriptionRef.textContent = description;
}


/**
 * Renders a progress bar for a task based on its subtasks if they exist.
 * @param {string} taskID - The ID of the task for which to render the progress bar.
 * @param {(Object[]|undefined)} subtasks - The array of subtasks for the task.
 * @returns {void} Nothing; the progress bar is written into the task card, or its container is hidden if there are no subtasks.
 */
function renderProgressBar(taskID, subtasks) {
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
  for (let i = 0; i < subtasks.length; i++) {
    counter += subtasks[i].done ? 1 : 0;
  }
  return counter;
}


/**
 * Renders the avatars of all assignees on a task card if they exist.
 * @param {string} taskID - The ID of the task for which to render the assignees.
 * @param {(string[]|undefined)} assignees - The array of contact IDs of the assignees.
 * @returns {void} Nothing; the avatars are added to the task card, unknown contacts are skipped.
 */
function renderTaskAssignees(taskID, assignees) {
  if (!assignees || assignees.length === 0) {
    return;
  }
  const assigneesContainerRef = document.getElementById(`assigneesContainer${taskID}`);
  for (let i = 0; i < assignees.length; i++) {
    const contactID = assignees[i];
    const contact = allContacts[contactID];
    if (!contact) continue;
    const assigneeShortcut = contact.shortcut;
    const assigneeColor = contact.shortcutColor;
    assigneesContainerRef.innerHTML += templateTaskAssignees(assigneeColor, assigneeShortcut);
  }
}


// #endregion


// #region columns
/**
 * Empties all task columns.
 * @returns {void} Nothing; the content of every column is removed from the DOM.
 */
function clearAllColumns() {
  const columns = document.querySelectorAll(".tasks-section");
  for (let i = 0; i < columns.length; i++) {
    columns[i].innerHTML = "";
  }
}


/**
 * Renders a placeholder into every empty column.
 * @param {string} activeSearch - The active search text, used in the placeholder for empty columns.
 * @returns {void} Nothing; the placeholder is written into each empty column.
 */
function checkForEmptyColumn(activeSearch) {
  const columns = document.querySelectorAll(".tasks-section");
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].innerText) {
      const emptyColumnID = columns[i].id;
      const emptyColumnName = getColumnName(emptyColumnID);
      document.getElementById(emptyColumnID).innerHTML 
        = templateEmptyColumn(activeSearch, emptyColumnName);
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
