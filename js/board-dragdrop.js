/**
 * JavaScript file for the drag and drop functionality on the board page.
 */

// #region START END
function handleDragstart(event) {
  const currentDraggedTask = event.currentTarget;
  currentDraggedTask.classList.add("dragged-task");
  event.dataTransfer.effectAllowed = "move";
  // Custom type to identify a task drag
  event.dataTransfer.setData("dragging", "");
}


function handleDragend() {
  const currentDraggedTask = document.querySelector(".dragged-task");
  currentDraggedTask.classList.remove("dragged-task");
}
// #endregion


columns.forEach((column) => {
  column.addEventListener("dragleave", handleDragleave);
  column.addEventListener("dragover", handleDragover);
  column.addEventListener("drop", handleDrop);
});


// #region LEAVE
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
function handleDragover(event) {
  if (!event.dataTransfer.types.includes("dragging")) return;

  const column = event.currentTarget;
  column.classList.add("drag-over-column");
  column.querySelector(".empty-column-message")?.classList.add("d-none");
  event.preventDefault();
  movePlaceholder(event);
}


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


function isPointerOverPlaceholder(event, direction, existingPlaceholder) {
  if (existingPlaceholder) {
    const placeholderRect = existingPlaceholder.getBoundingClientRect();
    return isPointerInRectAlongAxis(event, direction, placeholderRect)
  }
}


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


function isPointerBeforeCardMiddle(event, direction, task) {
  const rect = task.getBoundingClientRect();
  switch (direction) {
    case "row":
      return (event.clientX < rect.left + rect.width / 2);
    case "column":
      return (event.clientY < rect.top + rect.height / 2);
  }
}


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


function makePlaceholder(draggedTask) {
  const placeholder = document.createElement("li");
  placeholder.classList.add("placeholder");
  placeholder.style.minHeight = `${draggedTask.offsetHeight}px`;
  placeholder.style.minWidth = `${draggedTask.offsetWidth}px`;
  return placeholder;
}
// #endregion


// #region DROP
function handleDrop(event) {
  event.preventDefault();
  const column = event.currentTarget;
  column.classList.remove("drag-over-column");

  const placeholder = column.querySelector(".placeholder");
  if (!placeholder) return;

  const draggedTask = document.querySelector(".dragged-task");
  handleSuccessfulDrop(column, draggedTask, placeholder);
  checkForEmptyColumn();
  handleMovedTasks(draggedTask);
}


function handleSuccessfulDrop(column, draggedTask, placeholder) {
  column.querySelector(".empty-column-message")?.remove();
  column.insertBefore(draggedTask, placeholder);
  placeholder.remove();
}


function handleMovedTasks(draggedTask) {
  const updates = {};
  const destinationStatus = draggedTask.parentElement.id;
  const originStatus = draggedTask.dataset.taskStatus;
  
  adjustDestinationStatus(updates, draggedTask, { destinationStatus, originStatus });
  if (destinationStatus !== originStatus) {
    adjustOriginStatus(updates, draggedTask, originStatus);
    adjustNewStatusToDraggedTask(updates, draggedTask, destinationStatus);
  }
  patchTasks(updates);
}


function adjustDestinationStatus(updates, draggedTask, { destinationStatus, originStatus }) {
  const draggedTaskId = draggedTask.dataset.taskId;
  const sortedTasks = getSortedTaskIds(destinationStatus);

  if (destinationStatus === originStatus) removeDraggedTaskId(sortedTasks, draggedTaskId);
  const newPreviousTaskId = draggedTask.previousElementSibling?.dataset.taskId ?? null;
  const newPosition = newPreviousTaskId ? sortedTasks.indexOf(newPreviousTaskId) + 1 : 0;
  sortedTasks.splice(newPosition, 0, draggedTaskId);
  adjustPositions(updates, sortedTasks);
}


function adjustOriginStatus(updates, draggedTask, originStatus) {
  const draggedTaskId = draggedTask.dataset.taskId;
  const sortedTasks = getSortedTaskIds(originStatus);

  removeDraggedTaskId(sortedTasks, draggedTaskId);
  adjustPositions(updates, sortedTasks);
}


function getSortedTaskIds(status) {
  const tasksPerStatus = Object.keys(allTasks).filter((taskId) => allTasks[taskId].status === status);
  return tasksPerStatus.sort((a, b) => allTasks[a].position - allTasks[b].position);
}


function removeDraggedTaskId(sortedTasks, draggedTaskId) {
  const draggedTaskIndex = sortedTasks.indexOf(draggedTaskId);
  sortedTasks.splice(draggedTaskIndex, 1);
}


function adjustPositions(updates, sortedIds) {
  sortedIds.forEach((taskId, index) => {
    allTasks[taskId].position = index;
    Object.assign(updates, { [`${taskId}/position`]: index });
  });
}


function adjustNewStatusToDraggedTask(updates, draggedTask, destinationStatus) {
  const draggedTaskId = draggedTask.dataset.taskId;
  allTasks[draggedTaskId].status = destinationStatus;
  draggedTask.dataset.taskStatus = destinationStatus;
  Object.assign(updates, { [`${draggedTaskId}/status`]: destinationStatus });
}


async function patchTasks(updates) {
  try {
    const idToken = await window.auth.currentUser.getIdToken();
    const tasksUrl = `${window.firebaseUrl}/tasks.json?auth=${idToken}`;
    const response = await fetch(tasksUrl, { method: "PATCH", body: JSON.stringify(updates) });
    if (!response.ok) {
      throw new Error(`Failed to save tasks: ${response.status}`);
    }
  } catch (error) {
    openDialogConnectionErrorDatabase();
  }
}
// #endregion