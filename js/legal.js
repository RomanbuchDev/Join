// #region BACK NAVIGATION

document.getElementById("historyBack").addEventListener("click", goBack);


/**
 * Goes back to the previous page instead of following the link.
 * @param {Event} event - The click event of the back link.
 */
function goBack(event) {
  event.preventDefault();
  history.back();
}

// #endregion
