/**
 * JavaScript file for the search functionality on the board page.
 */

// #region VARIABLES
let trimmedInput = "";
// #endregion


// #region SEARCH
/**
 * Handles a search request based on the search input field.
 * Validates the input, then either shows all tasks, gives feedback or renders the matching tasks.
 * @returns {void} Nothing; the board and the feedback message are updated depending on the input.
 */
function handleSearchRequest() {
  // const trimmedInput = document.getElementById("searchInputfield").value.trim();
  trimmedInput = "te";
  switch (validateSearchInput()) {
    case "empty":
      checkForRenderedTasks("empty");
      break;
    case "too short":
      checkForRenderedTasks();
      showUserFeedback(`Please enter at least 3 characters.`);
      break;
    case "valid": 
      processSearch();
  }
}


/**
 * Validates the length of the search input.
 * @param {string} trimmedInput - The trimmed search input.
 * @returns {("empty"|"too short"|"valid")} The validation result of the input.
 */
function validateSearchInput() {
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
 * Searches the tasks and renders the matches, or gives feedback if none are found.
 * @param {string} validInput - The valid search input.
 * @returns {void} Nothing; the matching tasks are rendered or a feedback message is shown.
 */
function processSearch() {
  const matchingTasks = findMatchingTasks();
  const matching = matchingTasks.length > 0 ? "found" : "not found";
  switch (matching) {
    case "not found":
      checkForRenderedTasks();
      showUserFeedback(`No tasks found.`);
      break;
    case "found":
      renderTasks(matchingTasks, `with "${trimmedInput}" `);
      clearUserFeedback();
      allFetchedTasksAreRendered = false;
  }
}


/**
 * Re-renders all tasks if a filtered list is shown, and clears the search input and feedback if the search was empty.
 * @param {string} [searchStatus=""] - The status of the search input ("empty" or "").
 * @returns {void} Nothing; the board, the search input and the feedback message are updated as needed.
 */
function checkForRenderedTasks(searchStatus="") {
  if (!allFetchedTasksAreRendered) {
    renderTasks(Object.keys(allTasks));
    allFetchedTasksAreRendered = true;
  }
  if (searchStatus === "empty") {
    searchInputfieldRef.value = "";
    clearUserFeedback();
  }
}
// #endregion


// #region MATCH
/**
 * Finds all tasks whose title and description contain every search term.
 * @param {string} validInput - The valid search input.
 * @returns {string[]} The array of task IDs of the matching tasks.
 */
function findMatchingTasks() {
  const allTasksIDs = Object.keys(allTasks);
  const matchingTasks = [];
  const searchTerms = trimmedInput.toLowerCase().split(" ");
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
// #endregion


// #region FEEDBACK
/**
 * Outputs a feedback message to the user.
 * @param {string} message - The message to show.
 * @returns {void} Nothing; the message is written into the error element and the search field is marked as invalid.
 */
function showUserFeedback(message) {
  document.getElementsByClassName("find-container")[0].classList.add("input-error");
  document.getElementById("searchErrorMessage").textContent = message;
}


/**
 * Clears any feedback message shown to the user.
 * @returns {void} Nothing; the error message is emptied and the error state of the search field is removed.
 */
function clearUserFeedback() {
  document.getElementsByClassName("find-container")[0].classList.remove("input-error");
  document.getElementById("searchErrorMessage").textContent = "";
}
// #endregion
