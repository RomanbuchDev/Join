/**
 * JavaScript file for the overlays of the board page: opening the detail view of a task,
 * closing the detail and the add task overlay, rendering the detail view and toggling subtasks.
 */

// #region OPEN

/**
 * Opens the detail overlay of a task when its card is clicked.
 * Clicks inside the move menu of the card are ignored.
 * @param {MouseEvent} event - The click event on the task card.
 * @param {string} taskID - The ID of the clicked task.
 * @returns {void} Nothing; the overlay is opened unless the click was inside the move menu.
 */
function handleTaskCardClick(event, taskID) {
  if (event.target.closest(".move-menu-container")) return;
  openTaskOverlay(taskID);
}


/**
 * Renders the task into the dialog, opens it as modal and slides it in.
 * The forced reflow before adding the open class makes sure the slide-in transition starts.
 * @param {string} taskID - The ID of the task to show.
 * @returns {void} Nothing; the dialog is opened.
 */
function openTaskOverlay(taskID) {
  renderTaskOverlay(taskID);
  const dialogRef = document.getElementById("dialogDetailedTask");
  dialogRef.dataset.dialogMode = "detailedTask";
  dialogRef.dataset.dialogTaskId = taskID;
  dialogRef.classList.remove("dialog-board-open");
  dialogRef.showModal();
  dialogRef.getBoundingClientRect();
  dialogRef.classList.add("dialog-board-open");
}

// #endregion

// #region CLOSE

/**
 * Handles a click on an overlay dialog. Closes the assignee dropdown of the task form on an outside click.
 * Closes the overlay only if the click hit the dialog itself (the backdrop) in the detail view;
 * in the edit and the add task view, a backdrop click does not close it.
 * @param {MouseEvent} event - The click event on the dialog.
 * @param {string} dialogID - The ID of the clicked dialog.
 * @returns {void} Nothing; the dropdown or the overlay is closed if the conditions are met.
 */
function handleOverlayBackdropClick(event, dialogID) {
  closeAssignedContactsOnOutsideClick(event);
  if (event.target !== event.currentTarget) return;

  const dialogRef = document.getElementById(dialogID);
  if (dialogRef.dataset.dialogMode === "detailedTask") {
    closeOverlay(dialogID);
  }
}


/**
 * Replaces the native closing by the Escape key with a close request for the overlay.
 * @param {Event} event - The cancel event of the dialog.
 * @param {string} dialogID - The ID of the dialog.
 * @returns {void} Nothing; the default behavior is prevented and the close request is handled.
 */
function handleOverlayCancel(event, dialogID) {
  event.preventDefault();
  handleOverlayCloseRequest(dialogID);
}


/**
 * Handles a request to close an overlay, e.g. by the close button, the cancel button or the Escape key.
 * In edit mode, discards the changes and returns to the detail view; otherwise closes the overlay.
 * @param {string} dialogID - The ID of the dialog.
 * @returns {void} Nothing; the view is switched or the closing is started.
 */
function handleOverlayCloseRequest(dialogID) {
  const dialogRef = document.getElementById(dialogID);
  if (dialogRef.dataset.dialogMode === "editTask") {
    resetSubtasks();
    renderOverlayDetailView(dialogRef.dataset.dialogTaskId);
    dialogRef.dataset.dialogMode = "detailedTask";
  } else {
    closeOverlay(dialogID);
  }
}


/**
 * Starts closing the overlay: removes the open class to slide it out and
 * closes the dialog when the transition has ended (see finishClosingOverlay).
 * Relies on a running transition; without one, the dialog would not be closed.
 * @param {string} dialogID - The ID of the dialog to close.
 * @returns {void} Nothing; the slide-out starts.
 */
function closeOverlay(dialogID) {
  const dialogRef = document.getElementById(dialogID);
  dialogRef.classList.remove("dialog-board-open");
  dialogRef.addEventListener("transitionend", finishClosingOverlay);
}


/**
 * Closes the dialog after its own slide-out transition ended, removes the listener
 * and empties the overlay. Transition events of child elements are ignored.
 * @param {TransitionEvent} event - The transitionend event of the dialog.
 * @returns {void} Nothing; the dialog is closed and its overlay is emptied.
 */
function finishClosingOverlay(event) {
  const openedDialog = event.currentTarget;
  if (event.target !== openedDialog) return;
  openedDialog.close();
  openedDialog.removeEventListener("transitionend", finishClosingOverlay);
  resetBoardOverlay(openedDialog.firstElementChild.id);
}


/**
 * Removes the content of an overlay.
 * @param {string} overlayID - The ID of the overlay element to empty.
 * @returns {void} Nothing; the content of the element is removed from the DOM.
 */
function resetBoardOverlay(overlayID) {
  document.getElementById(overlayID).innerHTML = "";
}

// #endregion

// #region RENDER DETAIL VIEW

/**
 * Renders the detail view of a task into the overlay.
 * @param {string} taskID - The ID of the task to show.
 * @returns {void} Nothing; header, main part and footer of the overlay are written into the DOM.
 */
function renderTaskOverlay(taskID) {
  renderOverlayFrame(taskID);
  renderOverlayDetailView(taskID);
}


/**
 * Renders the frame of the overlay: the header and the empty containers for main part and footer.
 * @param {string} taskID - The ID of the task to show.
 * @returns {void} Nothing; the content of the overlay is replaced.
 */
function renderOverlayFrame(taskID) {
  const overlayRef = document.getElementById("overlayTaskEdit");
  overlayRef.innerHTML = templateOverlayTaskFrame(taskID, getCategoryColorClass(taskID));
}


/**
 * Renders main part and footer of the detail view. The overlay frame of this task has to be rendered already.
 * @param {string} taskID - The ID of the task to show.
 * @returns {void} Nothing; main part and footer of the overlay are replaced.
 */
function renderOverlayDetailView(taskID) {
  const mainRef = document.getElementById(`overlayMain${taskID}`);
  const footerRef = document.getElementById(`overlayFooter${taskID}`);
  mainRef.innerHTML = templateOverlayMainDetails(taskID);
  footerRef.innerHTML = templateOverlayFooterDetails(taskID);
  renderDescription(taskID, `overlayDescription${taskID}`);
  renderOverlayPriority(taskID);
  renderOverlayAssignees(taskID);
  renderOverlaySubtasks(taskID);
}

// #endregion

// #region DUE DATE, PRIORITY

/**
 * Returns the due date of a task in the format "dd.mm.yyyy".
 * @param {string} taskID - The ID of the task.
 * @returns {string} The formatted date, or "No due date" if the stored date is missing or not in the format "yyyy-mm-dd".
 */
function getFormattedDueDate(taskID) {
  const date = allTasks[taskID].dueDate;
  if (!isDateValid(date)) return "No due date";
  return date.split("-").reverse().join(".");
}


/**
 * Checks whether a date string has the format "yyyy-mm-dd".
 * Only the format is checked, not whether the date exists.
 * @param {string|undefined} date - The date to check; missing if the task has none.
 * @returns {boolean} True if the format matches.
 */
function isDateValid(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date ?? "");
}


/**
 * Renders the priority text and icon of a task into the overlay.
 * Falls back to "medium" if the task has no priority.
 * @param {string} taskID - The ID of the task.
 * @returns {void} Nothing; the priority is written into the overlay.
 */
function renderOverlayPriority(taskID) {
  const priorityRef = document.getElementById(`overlayPriority${taskID}`);
  const priority = allTasks[taskID].priority || "medium";
  const priorityString = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  priorityRef.innerHTML = templateOverlayPriority(priorityString, priority);
}

// #endregion

// #region RENDER ASSIGNEES

/**
 * Renders the assignees of a task into the overlay, or hides the section if there are none.
 * @param {string} taskID - The ID of the task.
 * @returns {void} Nothing; the assignees are written into the overlay or their container is hidden.
 */
function renderOverlayAssignees(taskID) {
  const assigneesRef = document.getElementById(`overlayAssigneesContainer${taskID}`);
  const assignees = allTasks[taskID].assignedTo;
  if (!hasTaskAssignees(assignees)) {
    assigneesRef.classList.add("d-none");
    return;
  }

  assigneesRef.innerHTML = templateOverlayAssignees(taskID);
  renderTaskAssignees(taskID, assignees, "overlay");
}


/**
 * Appends one assignee to the assignee list of the overlay.
 * Uses the shortcut as the name if the assignee has no name.
 * @param {string} taskID - The ID of the task.
 * @param {{name?: string, shortcut: string, shortcutColor: string}} assignee - The assignee to show.
 * @returns {void} Nothing; the assignee is added to the list.
 */
function renderOneOverlayAssignee(taskID, assignee) {
  const assigneesRef = document.getElementById(`overlayAssignees${taskID}`);
  const name = assignee.name || assignee.shortcut;
  assigneesRef.innerHTML += templateOverlayOneAssignee(assignee.shortcutColor, assignee.shortcut, name);
}

// #endregion

// #region RENDER SUBTASKS

/**
 * Renders the subtask list of a task into the overlay, or hides the section if there are none.
 * @param {string} taskID - The ID of the task.
 * @returns {void} Nothing; the subtasks are written into the overlay or their container is hidden.
 */
function renderOverlaySubtasks(taskID) {
  const subtasksContainerRef = document.getElementById(`overlaySubtasksContainer${taskID}`);
  const subtasks = allTasks[taskID].subtasks;
  if (!hasTaskSubtasks(subtasks)) {
    subtasksContainerRef.classList.add("d-none");
    return;
  }

  subtasksContainerRef.innerHTML = templateOverlaySubtasks(taskID);
  const subtasksListRef = document.getElementById(`overlaySubtasks${taskID}`);
  subtasksListRef.innerHTML = getSubtasksHtml(taskID, subtasks);
}


/**
 * Builds the HTML of all subtasks of a task for the overlay.
 * @param {string} taskID - The ID of the task.
 * @param {{text: string, done: boolean}[]} subtasks - The subtasks of the task.
 * @returns {string} The HTML string of all subtask list entries.
 */
function getSubtasksHtml(taskID, subtasks) {
  let subtasksHTML = "";
  for (let indexSubtask = 0; indexSubtask < subtasks.length; indexSubtask++) {
    subtasksHTML += templateOverlayOneSubtask(taskID, indexSubtask);
  }
  return subtasksHTML;
}

// #endregion

// #region TOGGLE SUBTASKS

/**
 * Saves the new state of a subtask checkbox. Task data and progress bar are updated
 * only after a successful save. The checkbox is disabled while saving.
 * If saving fails, the checkbox keeps its new state.
 * @param {Event} event - The change event of the checkbox.
 * @param {string} taskID - The ID of the task.
 * @param {number} indexSubtask - The index of the subtask in the task.
 * @returns {Promise<void>} Resolves once the saving is finished.
 */
async function toggleSubtask(event, taskID, indexSubtask) {
  const checkboxRef = event.currentTarget;
  const newValue = checkboxRef.checked;
  const subtask = allTasks[taskID].subtasks[indexSubtask];
  checkboxRef.disabled = true;
  try {
    const saved = await patchTasks({[`${taskID}/subtasks/${indexSubtask}/done`]: newValue});
    if (saved) {
      adjustSubtaskState(taskID, subtask, newValue);
    }
  } finally {
    checkboxRef.disabled = false;
  }
}


/**
 * Stores the new done state of a subtask in the task data and updates the progress bar of the task card.
 * @param {string} taskID - The ID of the task.
 * @param {{text: string, done: boolean}} subtask - The subtask to update.
 * @param {boolean} newValue - The new done state.
 * @returns {void} Nothing; the subtask and the progress bar are updated.
 */
function adjustSubtaskState(taskID, subtask, newValue) {
  subtask.done = newValue;
  renderProgressBar(taskID);
}

// #endregion
