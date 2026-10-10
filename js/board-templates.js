function templateTaskCard(taskID, {category, categoryColor}, {title, description, priority}) {
  return `
    <div class="task-card d-flex">
      <p class="task-label ${categoryColor}">${category}</p>
      <div class="task-title-description-container d-flex">
        <h3>${title}</h3>
        <p class="task-description">
          ${description}
        </p>
      </div>
      <div id="progressContainer${taskID}" class="task-progress d-flex">
      </div>
      <div class="task-card-footer d-flex">
        <div id="assigneesContainer${taskID}" class="task-avatars-container d-flex">
        </div>
        <div class="priority-icon d-flex">
          <img
            src="../assets/icons/prio-${priority}-symbol.svg"
            alt="${priority} priority task"
          />
        </div>
      </div>
    </div>`;
}


function templateProgressBar(doneSubtasks, subtasksLength) {
  return `
    <progress value="${doneSubtasks}" max="${subtasksLength}"></progress>
    <p>${doneSubtasks}/${subtasksLength} Subtasks</p>`
}


function templateTaskAssignees(assigneeColor, assigneeShortcut) {
  return `
    <span class="task-avatar d-flex" style="background-color:${assigneeColor}">${assigneeShortcut}</span>`
}


function templateEmptyColumn(columnName) {
  return `
    <div class="empty-board-column d-flex">
      <p>No tasks ${columnName}</p>
    </div>`
}