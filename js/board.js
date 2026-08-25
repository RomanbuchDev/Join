// JavaScript file for board page - horizontal drag-scroll for task columns

let isDragging = false;
let dragStartX = 0;
let dragScrollLeft = 0;
let activeTasksSection = null;

const taskSections = document.querySelectorAll(".tasks-section");


function handleDragStart(event) {
  activeTasksSection = event.currentTarget;
  isDragging = true;
  dragStartX = event.pageX - activeTasksSection.offsetLeft;
  dragScrollLeft = activeTasksSection.scrollLeft;
  activeTasksSection.classList.add("dragging");
}


function handleDragEnd() {
  if (activeTasksSection) {
    activeTasksSection.classList.remove("dragging");
  }
  isDragging = false;
  activeTasksSection = null;
}


function handleDragMove(event) {
  if (!isDragging) return;

  event.preventDefault();
  const x = event.pageX - activeTasksSection.offsetLeft;
  const walk = x - dragStartX;
  activeTasksSection.scrollLeft = dragScrollLeft - walk;
}


function initTaskSectionDragScroll() {
  taskSections.forEach((section) => {
    section.addEventListener("mousedown", handleDragStart);
    section.addEventListener("mouseleave", handleDragEnd);
    section.addEventListener("mouseup", handleDragEnd);
    section.addEventListener("mousemove", handleDragMove);
  });
}


initTaskSectionDragScroll();
