/**
 * JavaScript file for the board overlay.
 */

// #region VARIABLES
/** True while the current mouse press started on the backdrop of the task overlay. */
let overlayPressStartedOnBackdrop = false;
// #endregion

function handleTaskCardClick(event, taskID) {
  if (event.target.closest(".move-menu-container")) return;
    openTaskOverlay(taskID);
}


function openTaskOverlay(taskID) {
  const dialogRef = document.getElementById("dialogTask");
  renderTaskOverlay(taskID);
  dialogRef.showModal();
  dialogRef.getBoundingClientRect();
  dialogRef.classList.add("dialog-task-open");
}


function handleOverlayMousedown(event) {
  overlayPressStartedOnBackdrop = event.target === event.currentTarget;
}


function handleOverlayBackdropClick(event) {
  const releasedOnBackdrop = event.target === event.currentTarget;
  if (releasedOnBackdrop && overlayPressStartedOnBackdrop) closeTaskOverlay();
  overlayPressStartedOnBackdrop = false;
}


function handleOverlayCancel(event) {
  event.preventDefault();
  closeTaskOverlay();
}


function closeTaskOverlay() {
  const dialogRef = document.getElementById("dialogTask");
  dialogRef.classList.remove("dialog-task-open");
  dialogRef.addEventListener("transitionend", finishClosingOverlay)
}


function finishClosingOverlay(event) {
  if (event.target === event.currentTarget) closeTaskOverlay();
  event.currentTarget.close();
  event.currentTarget.removeEventListener("transitionend", finishClosingOverlay);
}


function renderTaskOverlay(taskID) {
  const overlayRef = document.getElementById("overlayTaskEdit");
  overlayRef.innerHTML = templateOverlayDetailedTask(taskID, getCategoryColor(taskID));
  renderDescription(taskID, `overlayDescription${taskID}`);
  renderPriority(taskID);
  const assignees = checkForTaskAssignees(taskID);
  if (assignees) {
    const assigneesRef = document.getElementById(`overlayAssigneesContainer${taskID}`);
    assigneesRef.innerHTML = templateOverlayAssignees(taskID);
    renderTaskAssignees(taskID, assignees, "overlay");
  }
}


function getTaskDate(taskID) {
  const date = allTasks[taskID].dueDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) return "No due date";
  return date.split("-").reverse().join(".");
}


function renderPriority(taskID) {
  const priorityRef = document.getElementById(`overlayPriority${taskID}`);
  const priority = allTasks[taskID].priority;
  if (!priority) {
    priorityRef.innerHTML = "Not set";
    return;
  }
  const priorityString = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  priorityRef.innerHTML = templateOverlayPriority(taskID, priorityString);
}