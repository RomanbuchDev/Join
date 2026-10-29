/**
 * JavaScript file for the drag and drop functionality on the board page.
 */

// #region START END
function handleDragstart(event) {
  const currentDraggedTask = event.currentTarget;
  currentDraggedTask.classList.add("dragged-task");
  event.dataTransfer.effectAllowed = "move";
  // Custom type to identify a task drag
  event.dataTransfer.setData("task", "");
}


function handleDragend(event) {
  const currentDraggedTask = event.currentTarget;
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
  // If we are moving into a child element,
  // we aren't actually leaving the column
  const column = event.currentTarget;
  if (column.contains(event.relatedTarget)) return;
  const placeholder = column.querySelector(".placeholder");
  placeholder?.remove();
}


function handleDrop(event) {
  event.preventDefault();
  const draggedTask = document.querySelector(".dragged-task");
  const column = event.currentTarget;
  const placeholder = column.querySelector(".placeholder");
  if (!placeholder) return;
  draggedTask.remove();
  column.insertBefore(draggedTask, placeholder);
  placeholder.remove();
}
// #endregion


// #region OVER
function handleDragover(event) {
  if (!event.dataTransfer.types.includes("task")) return;
  event.preventDefault();
  movePlaceholder(event);
}


function movePlaceholder(event) {
  const draggedTask = document.querySelector(".dragged-task");
  const column = event.currentTarget;
  const existingPlaceholder = column.querySelector(".placeholder");
  if (isPointerOverPlaceholder(event, existingPlaceholder)) return;
  
  const cardBelow = findCardBelowPointer(event, column);
  if (isPositionUnchanged(draggedTask, column, cardBelow)) {
    existingPlaceholder?.remove();
    return;
  }
  column.insertBefore(existingPlaceholder ?? makePlaceholder(draggedTask), cardBelow)
}


function isPointerOverPlaceholder(event, existingPlaceholder) {
  if (existingPlaceholder) {
    const placeholderRect = existingPlaceholder.getBoundingClientRect();
    return (
      placeholderRect.top <= event.clientY &&
      placeholderRect.bottom >= event.clientY
    );
  }
}


function findCardBelowPointer(event, column) {
  for (const task of column.children) {
    if (task.classList.contains("dragged-task")) continue;
    if (task.classList.contains("placeholder")) continue;
    const rect = task.getBoundingClientRect();
    if (event.clientY < rect.top + rect.height / 2) return task;
  }
  return null;
}


function isPositionUnchanged(draggedTask, column, cardBelow) {
  const existingPlaceholder = column.querySelector(".placeholder");
  let nextOfDragged = draggedTask.nextElementSibling;
  if (existingPlaceholder && nextOfDragged === existingPlaceholder) {
    nextOfDragged = existingPlaceholder.nextElementSibling;
  }
  return (
    draggedTask.parentElement === column && 
    cardBelow === nextOfDragged
  );
}


function makePlaceholder(draggedTask) {
  const placeholder = document.createElement("li");
  placeholder.classList.add("placeholder");
  placeholder.style.height = `${draggedTask.offsetHeight}px`;
  return placeholder;
}
// #endregion