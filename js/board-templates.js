function templateTaskCard(taskID, {category, categoryColor}, {title, description, priority}) {
  return `
    <div class="task-card d-flex">
      <p class="task-label ${escapeHtml(categoryColor)}">${escapeHtml(category)}</p>
      <div class="task-title-description-container d-flex">
        <h3>${escapeHtml(title)}</h3>
        <p class="task-description">
          ${escapeHtml(description)}
        </p>
      </div>
      <div id="progressContainer${escapeHtml(taskID)}" class="task-progress d-flex">
      </div>
      <div class="task-card-footer d-flex">
        <div id="assigneesContainer${escapeHtml(taskID)}" class="task-avatars-container d-flex">
        </div>
        <div class="priority-icon d-flex">
          <img
            src="../assets/icons/prio-${escapeHtml(priority)}-symbol.svg"
            alt="${escapeHtml(priority)} priority task"
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
    <span class="task-avatar d-flex" style="background-color:${escapeHtml(assigneeColor)}">${escapeHtml(assigneeShortcut)}</span>`
}


function templateEmptyColumn(activeSearch, columnName) {
  return `
    <div class="empty-board-column d-flex">
      <p>No tasks ${escapeHtml(activeSearch)}${escapeHtml(columnName)}</p>
    </div>`
}
