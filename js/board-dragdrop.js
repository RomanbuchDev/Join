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
  column.addEventListener("drop", handleDrop);
  column.addEventListener("dragover", handleDragover);
});


// #region LEAVE DROP
function handleDragleave(event) {
  const column = event.currentTarget;
  if (column.contains(event.relatedTarget)) return;

  column.classList.remove("drag-over-column");
  column.querySelector(".empty-column-message")?.classList.remove("d-none");
  const placeholder = column.querySelector(".placeholder");
  placeholder?.remove();
}


function handleDrop(event) {
  event.preventDefault();
  const column = event.currentTarget;
  const placeholder = column.querySelector(".placeholder");
  column.classList.remove("drag-over-column");
  if (!placeholder) return;
  
  const draggedTask = document.querySelector(".dragged-task");
  column.insertBefore(draggedTask, placeholder);
  placeholder.remove();
  column.querySelector(".empty-column-message")?.remove();
  checkForEmptyColumn();
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