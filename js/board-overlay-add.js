/**
 * JavaScript file for adding a task from the board page, in an overlay or on the add task page.
 * Uses the task form of the add task page.
 */

// #region OPEN

/**
 * Opens the view for adding a task: the add task page below a viewport width of 48em,
 * otherwise the overlay on the board.
 * @param {"toDo"|"inProgress"|"awaitFeedback"|"done"} status - The status (column ID) for the new task.
 * @returns {void} Nothing; the page is changed or the overlay is opened.
 */
function openAddView(status) {
  if (window.matchMedia("(width < 48em)").matches) {
    openAddTaskPage(status);
  } else {
    openBoardOverlayAddView(status);
  }
}


/**
 * Navigates to the add task page and passes the status as a URL parameter.
 * @param {"toDo"|"inProgress"|"awaitFeedback"|"done"} status - The status (column ID) for the new task.
 * @returns {void} Nothing; the browser loads the add task page.
 */
function openAddTaskPage(status) {
  const addTaskPage = `../html/add-task.html?status=${status}`;
  window.location.href = addTaskPage;
}


/**
 * Renders the task form into the add task dialog, opens it as modal and slides it in.
 * The forced reflow before adding the open class makes sure the slide-in transition starts.
 * @param {"toDo"|"inProgress"|"awaitFeedback"|"done"} status - The status (column ID) for the new task.
 * @returns {void} Nothing; the dialog is opened.
 */
function openBoardOverlayAddView(status) {
  const dialogID = "dialogAddTask";
  renderAddView(dialogID, status);

  const dialogRef = document.getElementById(dialogID);
  dialogRef.classList.remove("dialog-board-open");
  dialogRef.showModal();
  dialogRef.getBoundingClientRect();
  dialogRef.classList.add("dialog-board-open");
}

// #endregion

// #region RENDER

/**
 * Renders the content of the add task overlay and prepares the task form: sets the minimum due date,
 * starts loading the assignees (without waiting for it), resets the draft subtasks and sets the status.
 * @param {string} dialogID - The ID of the add task dialog, used by the close button.
 * @param {"toDo"|"inProgress"|"awaitFeedback"|"done"} status - The status (column ID) for the new task.
 * @returns {void} Nothing; the overlay content is replaced.
 */
function renderAddView(dialogID, status) {
  const overlayRef = document.getElementById("overlayAddTask");
  overlayRef.innerHTML = templateOverlayAddFrame(dialogID);
  setMinimumTaskDate();
  initTaskForm();
  resetSubtasks();
  setAddTaskFormStatus(status);
}

// #endregion

// #region SUCCESS

/**
 * Success callback of createTask for the add task overlay: shows the new task on the board,
 * closes the overlay and shows a toast message.
 * @param {HTMLFormElement} form - The form of the saved task.
 * @returns {void} Nothing; the board and the overlay are updated.
 */
function finishAddSubmit(form) {
  renderAddedTask(form);
  closeOverlay("dialogAddTask");
  showToastMessage("Task added to board", "toast-message-new");
}


/**
 * Inserts the card of the newly saved task at the top of its column and updates the task counter.
 * Expects the new task to be first in the position order of its column in allTasks.
 * @param {HTMLFormElement} form - The form of the saved task; its data-status names the column.
 * @returns {void} Nothing; the card is added to the column.
 */
function renderAddedTask(form) {
  const status = form.dataset.status;
  const addedTaskID = getSortedTaskIds(status)[0];
  const destinationColumn = document.getElementById(status);
  destinationColumn.querySelector(".empty-column-message")?.remove();
  destinationColumn.insertAdjacentHTML("afterbegin", templateTaskCard(addedTaskID, getCategoryColorClass(addedTaskID)));
  renderTaskCardDetails(addedTaskID);
  renderTaskCount(status, destinationColumn.children.length);
}

// #endregion
