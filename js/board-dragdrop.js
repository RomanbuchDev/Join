/**
 * JavaScript file for the drag and drop and move via button functionality on the board page.
 * Depends on “columns” from board.js, so it has to be loaded after it.
 */

// #region START, END
/**
 * Marks the dragged task card and sets the drag data used to identify a task drag.
 * @param {DragEvent} event - The dragstart event of the task card.
 * @returns {void} Nothing; the card gets the class "dragged-task".
 */
function handleDragstart(event) {
  const currentDraggedTask = event.currentTarget;
  currentDraggedTask.classList.add("dragged-task");
  event.dataTransfer.effectAllowed = "move";
  // Custom type to identify a task drag
  event.dataTransfer.setData("dragging", "");
}


/**
 * Removes the dragged marker from the task card when the drag ends.
 * @returns {void} Nothing; the class "dragged-task" is removed if it exists.
 */
function handleDragend() {
  const currentDraggedTask = document.querySelector(".dragged-task");
  currentDraggedTask?.classList.remove("dragged-task");
}
// #endregion


// #region LISTENER
columns.forEach((column) => {
  column.addEventListener("dragleave", handleDragleave);
  column.addEventListener("dragover", handleDragover);
  column.addEventListener("drop", handleDrop);
});
// #endregion


// #region LEAVE
/**
 * Cleans up when the pointer leaves a column: removes the highlight and the placeholder, and shows the empty-column message again.
 * @param {DragEvent} event - The dragleave event of the column.
 * @returns {void} Nothing; the column is reset unless the pointer moved to one of its children.
 */
function handleDragleave(event) {
  const column = event.currentTarget;
  if (column.contains(event.relatedTarget)) return;

  column.classList.remove("drag-over-column");
  column.querySelector(".empty-column-message")?.classList.remove("d-none");

  const placeholder = column.querySelector(".placeholder");
  placeholder?.remove();
}
// #endregion


// #region OVER
/**
 * Handles a task being dragged over a column.
 * Ignores drags that are not a task drag, otherwise highlights the column and moves the placeholder.
 * @param {DragEvent} event - The dragover event of the column.
 * @returns {void} Nothing; the column is highlighted and the drop is allowed.
 */
function handleDragover(event) {
  if (!event.dataTransfer.types.includes("dragging")) return;

  const column = event.currentTarget;
  column.classList.add("drag-over-column");
  column.querySelector(".empty-column-message")?.classList.add("d-none");
  event.preventDefault();
  movePlaceholder(event);
}


/**
 * Shows the placeholder at the position where the dragged task would be dropped.
 * Removes the placeholder if the position would not change.
 * @param {DragEvent} event - The dragover event of the column.
 * @returns {void} Nothing; the placeholder is inserted, moved or removed.
 */
function movePlaceholder(event) {
  const draggedTask = document.querySelector(".dragged-task");
  const column = event.currentTarget;
  const existingPlaceholder = column.querySelector(".placeholder");
  const direction = getComputedStyle(column).flexDirection;
  if (isPointerOverPlaceholder(event, direction, existingPlaceholder)) return;
  
  const cardAfter = findCardAfterPointer(event, direction, column);
  if (isPositionUnchanged(draggedTask, column, cardAfter)) {
    existingPlaceholder?.remove();
    return;
  }
  column.insertBefore(existingPlaceholder ?? makePlaceholder(draggedTask), cardAfter)
}


/**
 * Checks whether the pointer is currently over the existing placeholder.
 * @param {DragEvent} event - The dragover event.
 * @param {"row"|"column"} direction - The flex direction of the column.
 * @param {HTMLElement|null} existingPlaceholder - The placeholder in the column, if any.
 * @returns {boolean} True if there is a placeholder and the pointer is over it, otherwise false.
 */
function isPointerOverPlaceholder(event, direction, existingPlaceholder) {
  if (existingPlaceholder) {
    const placeholderRect = existingPlaceholder.getBoundingClientRect();
    return isPointerInRectAlongAxis(event, direction, placeholderRect)
  }
  return false;
}


/**
 * Checks whether the pointer is inside a rectangle along the axis given by the flex direction.
 * @param {DragEvent} event - The dragover event.
 * @param {"row"|"column"} direction - "row" checks the horizontal axis, "column" the vertical one.
 * @param {DOMRect} rect - The rectangle to check.
 * @returns {boolean} True if the pointer is inside the rectangle along that axis.
 */
function isPointerInRectAlongAxis(event, direction, rect) {
  switch (direction) {
    case "row":
      return (
        rect.left <= event.clientX &&
        rect.right >= event.clientX
      );
    case "column":
      return (
        rect.top <= event.clientY &&
        rect.bottom >= event.clientY 
      );
  }
}


/**
 * Finds the card in the column that the dragged task has to be inserted before.
 * Skips the dragged card and the placeholder.
 * @param {DragEvent} event - The dragover event.
 * @param {"row"|"column"} direction - The flex direction of the column.
 * @param {HTMLElement} column - The column the pointer is over.
 * @returns {HTMLElement|null} The card after the pointer, or null if the dragged task goes to the end.
 */
function findCardAfterPointer(event, direction, column) {
  for (const task of column.children) {
    if (task.classList.contains("dragged-task")) continue;
    if (task.classList.contains("placeholder")) continue;
    if (isPointerBeforeCardMiddle(event, direction, task)) {
      return task;
    }
  }
  return null;
}


/**
 * Checks whether the pointer is before the middle of a card along the axis given by the flex direction.
 * @param {DragEvent} event - The dragover event.
 * @param {"row"|"column"} direction - The flex direction of the column.
 * @param {HTMLElement} task - The task card to check.
 * @returns {boolean} True if the pointer is before the middle of the card.
 */
function isPointerBeforeCardMiddle(event, direction, task) {
  const rect = task.getBoundingClientRect();
  switch (direction) {
    case "row":
      return (event.clientX < rect.left + rect.width / 2);
    case "column":
      return (event.clientY < rect.top + rect.height / 2);
  }
}


/**
 * Checks whether dropping the task before the given card would leave it where it already is.
 * @param {HTMLElement} draggedTask - The dragged task card.
 * @param {HTMLElement} column - The column the pointer is over.
 * @param {HTMLElement|null} cardAfter - The card the task would be inserted before.
 * @returns {boolean} True if the position would not change.
 */
function isPositionUnchanged(draggedTask, column, cardAfter) {
  const existingPlaceholder = column.querySelector(".placeholder");
  let nextOfDragged = draggedTask.nextElementSibling;
  if (existingPlaceholder && nextOfDragged === existingPlaceholder) {
    nextOfDragged = existingPlaceholder.nextElementSibling;
  }
  return (
    draggedTask.parentElement === column && 
    cardAfter === nextOfDragged
  );
}


/**
 * Creates a placeholder with the size of the dragged task.
 * @param {HTMLElement} draggedTask - The dragged task card.
 * @returns {HTMLLIElement} The placeholder element, not yet inserted into the DOM.
 */
function makePlaceholder(draggedTask) {
  const placeholder = document.createElement("li");
  placeholder.classList.add("placeholder");
  placeholder.style.minHeight = `${draggedTask.offsetHeight}px`;
  placeholder.style.minWidth = `${draggedTask.offsetWidth}px`;
  return placeholder;
}
// #endregion


// #region DROP
/**
 * Handles the drop of a task on a column.
 * Does nothing if there is no placeholder or no dragged task.
 * @param {DragEvent} event - The drop event of the column.
 * @returns {void} Nothing; the task is moved in the DOM, saved and the empty columns are updated.
 */
function handleDrop(event) {
  event.preventDefault();
  const column = event.currentTarget;
  const placeholder = column.querySelector(".placeholder");
  const draggedTask = document.querySelector(".dragged-task");

  column.classList.remove("drag-over-column");
  if (!placeholder || !draggedTask) return;

  handleSuccessfulDrop(column, draggedTask, placeholder);
  handleMovedTasks(draggedTask);
  checkForEmptyColumn();
}


/**
 * Moves the dragged task card to the position of the placeholder.
 * @param {HTMLElement} column - The column the task is dropped on.
 * @param {HTMLElement} draggedTask - The dragged task card.
 * @param {HTMLElement} placeholder - The placeholder marking the drop position.
 * @returns {void} Nothing; the card replaces the placeholder and the empty-column message is removed.
 */
function handleSuccessfulDrop(column, draggedTask, placeholder) {
  column.querySelector(".empty-column-message")?.remove();
  column.insertBefore(draggedTask, placeholder);
  placeholder.remove();
}
// #endregion


// #region BUTTON
/**
 * Moves a task to the top of another column via the move menu.
 * Does nothing if the target column does not exist or equals the current one.
 * @param {MouseEvent} event - The click event of the menu entry; its data-destination-status names the target column.
 * @returns {void} Nothing; the card is moved, the menu is closed and the change is saved.
 */
function moveTaskViaButton(event) {
  const moveButton = event.currentTarget.closest(".move-menu-container").querySelector("button");
  const movedTask = event.currentTarget.closest(".task-card");
  const destinationStatus = event.currentTarget.dataset.destinationStatus;
  const destinationColumn = document.getElementById(destinationStatus);
  if (!destinationColumn || destinationStatus === movedTask.dataset.taskStatus) return;

  destinationColumn.querySelector(".empty-column-message")?.remove();
  destinationColumn.prepend(movedTask);
  toggleMenu(moveButton, `move-menu-dropdown${movedTask.dataset.taskId}`);
  handleMovedTasks(movedTask);
  checkForEmptyColumn();
}
// #endregion


// #region MOVED
/**
 * Saves the new order after a task was moved: renumbers the destination column and, if the task
 * changed its column, also handles the origin column, counters and status. Queues the changes for saving.
 * Used for drag and drop and for moving via button.
 * @param {HTMLElement} draggedTask - The task card, already placed in its destination column.
 * @returns {void} Nothing; allTasks and the DOM are updated and the changes are queued for saving.
 */
function handleMovedTasks(draggedTask) {
  const updates = {};
  const destinationStatus = draggedTask.parentElement.id;
  const originStatus = draggedTask.dataset.taskStatus;
  const draggedTaskID = draggedTask.dataset.taskId;
  const previousTaskID = draggedTask.previousElementSibling?.dataset.taskId ?? null;
  
  insertTaskIntoColumn(updates, destinationStatus, { insertedTaskID:draggedTaskID, previousTaskID });
  if (destinationStatus !== originStatus) {
    handleStatusChange(updates, { destinationStatus, originStatus }, draggedTask);
  }
  patchTasks(updates);
}


/**
 * Handles the parts of a move that only apply if the task changed its column:
 * updates the counters, renumbers the origin column and stores the new status.
 * The status is changed last, so the task is still found in the origin column.
 * @param {Object<string, string|number>} updates - The collected changes; extended by this function.
 * @param {Object} statuses - The status before and after the move.
 * @param {string} statuses.destinationStatus - The status of the column the task is in now.
 * @param {string} statuses.originStatus - The status the task had before.
 * @param {HTMLElement} draggedTask - The moved task card, already in its destination column.
 * @returns {void} Nothing; the counters, allTasks, the card and the updates object are changed.
 */
function handleStatusChange(updates, { destinationStatus, originStatus }, draggedTask) {
  adjustTaskAmount(destinationStatus, originStatus);
  removeTaskFromColumn(updates, originStatus, draggedTask.dataset.taskId);
  adjustNewStatusToDraggedTask(updates, destinationStatus, draggedTask);
}


/**
 * Updates the task counters of the destination and the origin column from the DOM.
 * @param {string} destinationStatus - The status of the destination column.
 * @param {string} originStatus - The status of the origin column.
 * @returns {void} Nothing; both counters are rewritten.
 */
function adjustTaskAmount(destinationStatus, originStatus) {
  renderAmountOfTasks(destinationStatus, document.querySelector(`#${destinationStatus}`).children.length);
  renderAmountOfTasks(originStatus, document.querySelector(`#${originStatus}`).children.length);
}


/**
 * Stores the new status of the moved task in allTasks, on the card and in the updates.
 * @param {Object<string, string|number>} updates - The collected changes; extended by this function.
 * @param {string} destinationStatus - The new status.
 * @param {HTMLElement} draggedTask - The moved task card.
 * @returns {void} Nothing; allTasks, the card's data attribute and the updates object are changed.
 */
function adjustNewStatusToDraggedTask(updates, destinationStatus, draggedTask) {
  const draggedTaskID = draggedTask.dataset.taskId;
  allTasks[draggedTaskID].status = destinationStatus;
  draggedTask.dataset.taskStatus = destinationStatus;
  Object.assign(updates, { [`${draggedTaskID}/status`]: destinationStatus });
}
// #endregion
