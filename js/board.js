let tasksData = [];

/**
 * Initializes the board view.
 * Loads all tasks and all contacts first, then renders the tasks into their columns.
 * Contacts must be loaded before rendering, because the task avatars depend on them.
 * @returns {Promise<void>} Resolves once tasks and contacts are loaded and the tasks are rendered.
 */
async function initBoard() {
  await fetchAllTasks();
  await fetchAllContacts();
  renderTasks(tasksData);
}


/**
 * Fetches all tasks from tasks.json and stores them in tasksData.
 * @returns {Promise<void>}
 */
async function fetchAllTasks() {
  try {
    const response = await fetch("../js/tasks.json");
    const responseToJson = await response.json();
    tasksData = responseToJson;
  } catch (error) {
    console.error(error);
  }
}


/**
 * Renders all given tasks into their corresponding columns.
 * @param {Array<Object>} tasksData - The list of task objects to render.
 * @returns {void}
 */
function renderTasks(tasksData) {
  for (let i = 0; i < tasksData.length; i++) {
    const taskID = tasksData[i].id;
    renderOneTask(taskID)
  }
  checkForEmptyColumn()
}


/**
 * Renders a single task card into its column, including the progress bar if subtasks exist.
 * @param {string} taskID - The ID of the task to render.
 * @returns {void}
 */
function renderOneTask(taskID) {
  const {category, title, description, priority, assignedTo, status: columnName, subtasks} 
      = tasksData[tasksData.findIndex(task => task.id === taskID)];
  const colorLabel = (category == "User Story") ? "color-label-user-story" : "color-label-technical-task";
  document.getElementById(columnName).innerHTML 
    += templateTaskCard({taskID, category, colorLabel, title, description, priority});
  if (subtasks && subtasks.length > 0) {
    renderProgressBar(taskID, subtasks);
  } else {
    document.getElementById(`progressContainer${taskID}`).className = "task-progress d-none";
  }
  renderTaskAvatars(taskID, assignedTo);
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


function renderTaskAvatars(taskID, taskAvatars) {
  for (let i = 0; i < taskAvatars.length; i++) {
    const contactID = taskAvatars[i];
    const contact = allContacts.find((c) => c.id === contactID);
    const avatarShortcut = contact.shortcut;
    const avatarColor = contact.shortcutColor;
    document.getElementById(`avatarsContainer${taskID}`).innerHTML 
      += templateTaskAvatar(avatarColor, avatarShortcut);
  }
}


function checkForEmptyColumn() {
  const columns = document.querySelectorAll(".tasks-section");
  for (let i = 0; i < columns.length; i++) {
    if (!columns[i].innerText) {
      const emptyColumnID = columns[i].id;
      const emptyColumnName = getColumnName(emptyColumnID)
      document.getElementById(emptyColumnID).innerHTML = templateEmptyColumn(emptyColumnName);
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
      break;
  }
  return columnName;
}
