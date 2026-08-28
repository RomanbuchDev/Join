function templateTaskCard({ taskID, category, colorLabel, title, description, priority, doneSubtasks, subtasksLength }) {
  return `
    <div class="task-card d-flex">
      <p class="task-label ${colorLabel}">${category}</p>
      <div class="task-title-description-container d-flex">
        <h3>${title}</h3>
        <p class="task-description">
          ${description}
        </p>
      </div>
      <div class="task-progress d-flex">
        <progress value="${doneSubtasks}" max="${subtasksLength}"></progress>
        <p>${doneSubtasks}/${subtasksLength} Subtasks</p>
      </div>
      <div class="task-card-footer d-flex">
        <div id="avatarsContainer${taskID}" class="task-avatars-container d-flex">
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


function templateTaskAvatar(colorAvatar, avatarShortcut) {
  return `
    <span class="task-avatar d-flex" style="background-color:${colorAvatar}">${avatarShortcut}</span>`
}
