const tasks = [];
const allFetchedTaskIDs = [];
let allFetchedTasksAreRendered = true;
const searchInputfieldRef = document.getElementById("searchInputfield");

/**
 * Initializes the board view.
 * Loads all tasks and all contacts first, then renders the tasks into their columns.
 * Contacts must be loaded before rendering, because the task avatars depend on them.
 * @returns {Promise<void>} Resolves once tasks and contacts are loaded and the tasks are rendered.
 */
async function initBoard() {
  await window.getCurrentUser();
  await fetchAllTasks();
  await fetchAllContacts();
  renderTasks(allFetchedTaskIDs, searchInput="");
}


/**
 * Fetches all tasks from tasks.json and stores them in tasks.
 * @returns {Promise<void>}
 */
async function fetchAllTasks() {
  try {
    const idToken = await window.auth.currentUser.getIdToken();
    const response = await fetch(`${window.firebaseUrl}/tasks.json?auth=${idToken}`);
    const responseToJson = await response.json();
    storeTasksInArray(responseToJson);
  } catch (error) {
    console.error(error);
  }
}


function storeTasksInArray(tasksInObject) {
  for (const [taskID, taskData] of Object.entries(tasksInObject)) {
    allFetchedTaskIDs.push(taskID);
    taskData.taskID = taskID;
    tasks.push(taskData);
  } 
  console.log("Tasks loaded:", tasks);
}


/**
 * Renders all given tasks into their corresponding columns.
 * @param {Array<Object>} tasks - The list of task objects to render.
 * @returns {void}
 */
function renderTasks(tasks, searchInput) {
  clearAllColumns();
  for (let i = 0; i < tasks.length; i++) {
    renderOneTask(tasks[i])
  }
  checkForEmptyColumn(searchInput)
}


function clearAllColumns() {
  const columns = document.querySelectorAll(".tasks-section");
  for (let i = 0; i < columns.length; i++) {
    columns[i].innerHTML = "";
  }
}


/**
 * Renders a single task card into its column, including the progress bar if subtasks exist.
 * @param {Object} task - The task object to render.
 * @returns {void}
 */
function renderOneTask(taskID) {
  const {cardPlace, category, categoryColor, title, description, priority, subtasks, assignees} = createAndReturnVariablesforTask(taskID);
  cardPlace.innerHTML += templateTaskCard(taskID, {category, categoryColor}, {title, description, priority});
  if (subtasks && subtasks.length > 0) {
    renderProgressBar(taskID, subtasks);
  } else {
    document.getElementById(`progressContainer${taskID}`).className = "task-progress d-none";
  }
  if (assignees && assignees.length > 0) {
    renderTaskAssignees(taskID, assignees);
  }
}


function createAndReturnVariablesforTask(taskID) {
  const {category, title, description, priority, assignedTo: assignees, status: columnName, subtasks} 
      = tasks[tasks.findIndex(task => task.taskID === taskID)];
  const categoryColor = (category == "User Story") ? "category-color-user-story" : "category-color-technical-task";
  const cardPlace = document.getElementById(columnName);
  return {cardPlace, category, categoryColor, title, description, priority, subtasks, assignees};
}


/**
 * Renders a progress bar for a task based on its subtasks.
 * @param {string} taskID - The ID of the task for which to render the progress bar.
 * @param {Array<Object>} taskSubtasks - The list of subtasks for the task.
 * @returns {void}
 */
function renderProgressBar(taskID, taskSubtasks) {
  const doneSubtasks = checkDoneSubtasks(taskSubtasks);
  document.getElementById(`progressContainer${taskID}`).innerHTML
    = templateProgressBar(doneSubtasks, taskSubtasks.length);
}


function checkDoneSubtasks(taskSubtasks) {
  let counter = 0;
  for (let i = 0; i < taskSubtasks.length; i++) {
    counter += taskSubtasks[i].done ? 1 : 0;
  }
  return counter;
}


function renderTaskAssignees(taskID, assignees) {
  for (let i = 0; i < assignees.length; i++) {
    const contactID = assignees[i];
    const contact = allContacts.find((c) => c.id === contactID);
    const assigneeShortcut = contact.shortcut;
    const assigneeColor = contact.shortcutColor;
    document.getElementById(`assigneesContainer${taskID}`).innerHTML 
      += templateTaskAssignees(assigneeColor, assigneeShortcut);
  }
}


function checkForEmptyColumn(searchInput) {
  const columns = document.querySelectorAll(".tasks-section");
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].innerText) {
      const emptyColumnID = columns[i].id;
      const emptyColumnName = getColumnName(emptyColumnID)
      document.getElementById(emptyColumnID).innerHTML 
        = templateEmptyColumn(searchInput, emptyColumnName);
    }
  }
}


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


function handleSearchRequest() {
  const trimmedInput = searchInputfieldRef.value.trim();
  switch (validateSearchInput(trimmedInput)) {
    case "empty":
      checkForRenderedTasksAndClearInput();
      break;
    case "too short":
      checkForRenderedTasksAndClearInput();
      renderUserFeedback(`Search input "${trimmedInput}" is too short. Minimum length is 3 characters.`);
      break;
    case "valid": 
      processSearch(trimmedInput);
  }
}


function validateSearchInput(trimmedInput) {
  switch (true) {
    case trimmedInput.length === 0:
      return "empty";
    case trimmedInput.length < 3:
      return "too short";
    case trimmedInput.length >= 3:
      return "valid";
  }
}


function checkForRenderedTasksAndClearInput() {
  if (!allFetchedTasksAreRendered) {
    renderTasks(allFetchedTaskIDs, searchInput="");
    allFetchedTasksAreRendered = true;
  }
  searchInputfieldRef.value = "";
}


function renderUserFeedback(message){
  console.error(message);
};


function processSearch(trimmedInput) {
  const matchingTasks = findMatchingTasks(trimmedInput);
  const matching = matchingTasks.length > 0 ? "found" : "not found";
  switch (matching) {
    case "not found":
      checkForRenderedTasksAndClearInput();
      renderUserFeedback(`No tasks found for input: "${trimmedInput}"`);
      break;
    case "found":
      renderTasks(matchingTasks, searchInput=`with "${trimmedInput}" `);
      allFetchedTasksAreRendered = false;
  }
}


function findMatchingTasks(trimmedInput) {
  const matchingTasks = [];
  const searchTerms = trimmedInput.toLowerCase().split(" ");
  for (let i = 0; i < tasks.length; i++) {
    const {taskID, title, description} = tasks[i];
    const sourceString = `${title} ${description}`.toLowerCase();
    if (doesTaskMatchSearchTerms(sourceString, searchTerms)) {
      matchingTasks.push(taskID);
    }
  }
  return matchingTasks;
}


function doesTaskMatchSearchTerms(sourceString, searchTerms) {
  for (let i = 0; i < searchTerms.length; i++) {
    const term = searchTerms[i];
    if (!sourceString.includes(term)) {
      return false;
    }
  }
  return true;
}