const allContacts = {};
// const allContactsArray = [];
// const allFetchedContactsIDs = [];
const allTasks = {};
// const allTasksArray = [];
// const allFetchedTasksIDs = [];
let allFetchedTasksAreRendered = false;
const searchInputfieldRef = document.getElementById("searchInputfield");

/**
 * Initializes the board view.
 * Loads all tasks and all contacts first, then renders the tasks into their columns.
 * Contacts must be loaded before rendering, because the task assignees depend on them.
 * @returns {Promise<void>} Resolves once tasks and contacts are loaded and the tasks are rendered.
 */
async function initBoard() {
  await window.getCurrentUser();
  await fetchAllData("tasks");
  await fetchAllData("contacts");
  // renderTasks(allFetchedTasksIDs);
  renderTasks(Object.keys(allTasks));
  allFetchedTasksAreRendered = true;
}


/**
 * Fetches all data of a specific category from the Firebase database.
 * @param {string} dataCategory - The category of data to fetch ("tasks", "contacts").
 * @returns {Promise<void>}
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
 * Stores fetched data in the arrays matching its category.
 * @param {string} dataCategory - The data category ("tasks" or "contacts").
 * @param {Object} dataObject - The fetched data, keyed by ID.
 * @returns {void}
 */
function storeData(dataCategory, dataObject) {
  switch (dataCategory) {
    case "tasks":
      Object.assign(allTasks, dataObject);
      console.log("tasks loaded:", allTasks);
      // storeDataInArray(dataObject, allFetchedTasksIDs, allTasksArray);
      // console.log("tasks loaded:", allTasksArray);
      break;
    case "contacts":
      Object.assign(allContacts, dataObject);
      console.log("contacts loaded:", allContacts);
      // storeDataInArray(dataObject, allFetchedContactsIDs, allContactsArray);
      // console.log("contacts loaded:", allContactsArray);
      break;
    default:
      console.error(`Unknown data category: ${dataCategory}`);
  }
}


// /**
//  * Adds each entry of the data object, with its ID, to the target arrays.
//  * @param {Object} dataObject - The fetched data, keyed by ID.
//  * @param {string[]} targetArrayIDs - The array collecting the IDs.
//  * @param {Object[]} targetArray - The array collecting the entries.
//  * @returns {void}
//  */
// function storeDataInArray(dataObject, targetArrayIDs, targetArray) {
//   if (!dataObject) return;
//   for (const [id, data] of Object.entries(dataObject)) {
//     targetArrayIDs.push(id);
//     data.id = id;
//     targetArray.push(data);
//   }
// }


/**
 * Renders all given tasks into their corresponding columns.
 * @param {string[]} currentTasksArrayIDs - The array of task IDs to render.
 * @param {string} [activeSearch=""] - The active search text, used in the placeholder for empty columns.
 * @returns {void}
 */
function renderTasks(currentTasksArrayIDs, activeSearch="") {
  clearAllColumns();
  for (let i = 0; i < currentTasksArrayIDs.length; i++) {
    renderOneTask(currentTasksArrayIDs[i]);
  }
  checkForEmptyColumn(activeSearch);
}


/**
 * Empties all task columns.
 * @returns {void}
 */
function clearAllColumns() {
  const columns = document.querySelectorAll(".tasks-section");
  for (let i = 0; i < columns.length; i++) {
    columns[i].innerHTML = "";
  }
}


/**
 * Renders a single task card into its column, 
 * including the progress bar and assignees if subtasks / assignees exist.
 * @param {string} taskID - The ID of the task to render.
 * @returns {void}
 */
function renderOneTask(taskID) {
  const {cardPlace, category, categoryColor, title, description, priority, subtasks, assignees} 
    = createAndReturnVariablesforTask(taskID);
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


/**
 * Collects the data needed to render a task card.
 * @param {string} taskID - The ID of the task to render.
 * @returns {Object} The target column element, category data, texts, priority, subtasks and assignees.
 */
function createAndReturnVariablesforTask(taskID) {
  const {category, title, description, priority, assignedTo: assignees, status: columnName, subtasks} 
    = allTasks[taskID];
    // = allTasksArray[allTasksArray.findIndex(task => task.id === taskID)];
  const categoryColor = (category == "User Story") ? "category-color-user-story" : "category-color-technical-task";
  const cardPlace = document.getElementById(columnName);
  return {cardPlace, category, categoryColor, title, description, priority, subtasks, assignees};
}


/**
 * Renders a progress bar for a task based on its subtasks.
 * @param {string} taskID - The ID of the task for which to render the progress bar.
 * @param {Object[]} subtasks - The array of subtasks for the task.
 * @returns {void}
 */
function renderProgressBar(taskID, subtasks) {
  const doneSubtasks = checkDoneSubtasks(subtasks);
  document.getElementById(`progressContainer${taskID}`).innerHTML
    = templateProgressBar(doneSubtasks, subtasks.length);
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
 * Renders the avatars of all assignees on a task card.
 * @param {string} taskID - The ID of the task for which to render the assignees.
 * @param {string[]} assignees - The array of contact IDs of the assignees.
 * @returns {void}
 */
function renderTaskAssignees(taskID, assignees) {
  for (let i = 0; i < assignees.length; i++) {
    const contactID = assignees[i];
    // const contact = allContactsArray.find((c) => c.id === contactID);
    const contact = allContacts[contactID];
    if (!contact) continue;
    const assigneeShortcut = contact.shortcut;
    const assigneeColor = contact.shortcutColor;
    document.getElementById(`assigneesContainer${taskID}`).innerHTML 
      += templateTaskAssignees(assigneeColor, assigneeShortcut);
  }
}


/**
 * Renders a placeholder into every empty column.
 * @param {string} activeSearch - The active search text, used in the placeholder for empty columns.
 * @returns {void}
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


/**
 * Handles a search request based on the search input field.
 * @returns {void}
 */
function handleSearchRequest() {
  const trimmedInput = searchInputfieldRef.value.trim();
  switch (validateSearchInput(trimmedInput)) {
    case "empty":
      checkForRenderedTasks("empty");
      break;
    case "too short":
      checkForRenderedTasks();
      showUserFeedback(`Please enter at least 3 characters.`);
      break;
    case "valid": 
      processSearch(trimmedInput);
  }
}


/**
 * Validates the length of the search input.
 * @param {string} trimmedInput - The trimmed search input.
 * @returns {string} "empty", "too short" or "valid".
 */
function validateSearchInput(trimmedInput) {
  switch (true) {
    case trimmedInput.length === 0:
      return "empty";
    case trimmedInput.length >= 1 && trimmedInput.length <= 2:
      return "too short";
    case trimmedInput.length >= 3:
      return "valid";
  }
}


/**
 * Re-renders all tasks if a filtered list is shown, and clears the search input and feedback if the search was empty.
 * @param {string} [searchStatus=""] - The status of the search input ("empty" or "").
 * @returns {void}
 */
function checkForRenderedTasks(searchStatus="") {
  if (!allFetchedTasksAreRendered) {
    // renderTasks(allFetchedTasksIDs);
    renderTasks(Object.keys(allTasks));
    allFetchedTasksAreRendered = true;
  }
  if (searchStatus === "empty") {
    searchInputfieldRef.value = "";
    clearUserFeedback();
  }
}


/**
 * Searches the tasks and renders the matches, or gives feedback if none are found.
 * @param {string} validInput - The valid search input.
 * @returns {void}
 */
function processSearch(validInput) {
  const matchingTasks = findMatchingTasks(validInput);
  const matching = matchingTasks.length > 0 ? "found" : "not found";
  switch (matching) {
    case "not found":
      checkForRenderedTasks();
      showUserFeedback(`No tasks found.`);
      break;
    case "found":
      renderTasks(matchingTasks, `with "${validInput}" `);
      clearUserFeedback();
      allFetchedTasksAreRendered = false;
  }
}


/**
 * Finds all tasks whose title and description contain every search term.
 * @param {string} validInput - The valid search input.
 * @returns {string[]} The array of taskIDs of the matching tasks.
 */
function findMatchingTasks(validInput) {
  const allTasksIDs = Object.keys(allTasks);
  const matchingTasks = [];
  const searchTerms = validInput.toLowerCase().split(" ");
  for (let i = 0; i < allTasksIDs.length; i++) {
    const taskID = allTasksIDs[i];
    const {title, description} = allTasks[taskID];
    const sourceString = `${title} ${description}`.toLowerCase();
    if (doesTaskMatchSearchTerms(sourceString, searchTerms)) {
      matchingTasks.push(taskID);
    }
  }
  return matchingTasks;
}


/**
 * Checks whether a text contains all search terms.
 * @param {string} sourceString - The lowercase text to search in.
 * @param {string[]} searchTerms - The array of lowercase search terms.
 * @returns {boolean} True if every term is contained.
 */
function doesTaskMatchSearchTerms(sourceString, searchTerms) {
  for (let i = 0; i < searchTerms.length; i++) {
    const term = searchTerms[i];
    if (!sourceString.includes(term)) {
      return false;
    }
  }
  return true;
}


/**
 * Outputs a feedback message to the user.
 * @param {string} message - The message to show.
 * @returns {void}
 */
function showUserFeedback(message) {
  document.getElementsByClassName("find-container")[0].classList.add("input-error");
  document.getElementById("searchErrorMessage").textContent = message;
}


/**
 * Clears any feedback message shown to the user.
 * @returns {void}
 */
function clearUserFeedback() {
  document.getElementsByClassName("find-container")[0].classList.remove("input-error");
  document.getElementById("searchErrorMessage").textContent = "";
}