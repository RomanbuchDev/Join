/**
 * JavaScript file for the search functionality on the board page.
 */

// #region VARIABLES
const searchInputFieldRef = document.getElementById("searchInputfield");
// #endregion


// #region SEARCH
/**
 * Handles a click on the search button.
 * Runs the search for the current input and puts the focus back on the search input field.
 * @returns {void} Nothing; the board is updated and the input field is focused.
 */
function handleSearchButtonClick() {
  handleSearchRequest();
  searchInputFieldRef.focus();
}


/**
 * Handles a search request from the search input field.
 * Resets the search if the trimmed input is empty, otherwise renders only the matching tasks.
 * @returns {void} Nothing; the board is updated depending on the input.
 */
function handleSearchRequest() {
  const trimmedInput = searchInputFieldRef.value.trim();
  if (!trimmedInput) {
    resetSearch();
  } else {
    renderTasks(findMatchingTaskIDs(trimmedInput));
    allFetchedTasksAreRendered = false;
  }
}


/**
 * Resets the search:
 * re-renders all tasks if a filtered list is currently shown and clears the search input.
 * @returns {void} Nothing; the board and the search input are updated as needed.
 */
function resetSearch() {
  if (!allFetchedTasksAreRendered) {
    renderTasks(Object.keys(allTasks));
    allFetchedTasksAreRendered = true;
  }
  searchInputFieldRef.value = "";
}
// #endregion


// #region MATCH
/**
 * Finds all tasks whose title and description contain every search term.
 * @param {string} trimmedInput - The trimmed, non-empty search input.
 * @returns {string[]} The array of task IDs of the matching tasks.
 */
function findMatchingTaskIDs(trimmedInput) {
  const allTaskIDs = Object.keys(allTasks);
  const matchingTaskIDs = [];
  const searchTerms = trimmedInput.toLowerCase().split(/\s+/);
  for (let i = 0; i < allTaskIDs.length; i++) {
    const taskID = allTaskIDs[i];
    const description = allTasks[taskID].description ?? "";
    const sourceString = `${allTasks[taskID].title} ${description}`.toLowerCase();
    if (includesAllSearchTerms(sourceString, searchTerms)) {
      matchingTaskIDs.push(taskID);
    }
  }
  return matchingTaskIDs;
}


/**
 * Checks whether a text contains all search terms.
 * @param {string} sourceString - The lowercase text to search in.
 * @param {string[]} searchTerms - The array of lowercase search terms.
 * @returns {boolean} True if every term is contained.
 */
function includesAllSearchTerms(sourceString, searchTerms) {
  for (let i = 0; i < searchTerms.length; i++) {
    const term = searchTerms[i];
    if (!sourceString.includes(term)) {
      return false;
    }
  }
  return true;
}
// #endregion
