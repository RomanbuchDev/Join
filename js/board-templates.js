/**
 * Returns the HTML template of a task card.
 * Description, progress bar and assignees are filled in afterwards.
 * @param {string} taskID - The ID of the task.
 * @param {Object} categoryData - The category data of the task.
 * @param {string} categoryData.category - The category name shown on the card.
 * @param {string} categoryData.categoryColor - The CSS class for the color of the category label.
 * @param {Object} mainData - The main data of the task.
 * @param {string} mainData.title - The title of the task.
 * @param {string} mainData.priority - The priority of the task, used for the priority icon.
 * @returns {string} The HTML string of the task card.
 */
function templateTaskCard(taskID, {category, categoryColor}, {title, priority}) {
  return /*html*/ `
    <div class="task-card d-flex" draggable="true">
      <p class="task-label ${escapeHtml(categoryColor)}">${escapeHtml(category)}</p>
      <div class="task-title-description-container d-flex">
        <h3>${escapeHtml(title)}</h3>
        <p id="description${escapeHtml(taskID)}" class="task-description"></p>
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


/**
 * Returns the HTML template of the progress bar of a task card.
 * @param {number} doneSubtasks - The number of completed subtasks.
 * @param {number} subtasksLength - The total number of subtasks.
 * @returns {string} The HTML string of the progress bar and the subtask counter.
 */
function templateProgressBar(doneSubtasks, subtasksLength) {
  return /*html*/ `
    <progress value="${doneSubtasks}" max="${subtasksLength}"></progress>
    <p>${doneSubtasks}/${subtasksLength} Subtasks</p>`
}


/**
 * Returns the HTML template of one assignee avatar on a task card.
 * @param {string} assigneeColor - The background color of the avatar.
 * @param {string} assigneeShortcut - The shortcut of the assignee shown in the avatar.
 * @returns {string} The HTML string of the avatar.
 */
function templateTaskAssignees(assigneeColor, assigneeShortcut) {
  return /*html*/ `
    <span class="task-avatar d-flex" style="background-color:${escapeHtml(assigneeColor)}">${escapeHtml(assigneeShortcut)}</span>`
}


/**
 * Returns the HTML template of the placeholder for an empty column.
 * @param {string} activeSearch - The active search text, shown before the column name.
 * @param {string} columnName - The display name of the column.
 * @returns {string} The HTML string of the placeholder.
 */
function templateEmptyColumn(activeSearch, columnName) {
  return /*html*/ `
    <div class="empty-board-column d-flex">
      <p>No tasks ${escapeHtml(activeSearch)}${escapeHtml(columnName)}</p>
    </div>`
}


/**
 * Returns the SVG of the Add Task button next to the headline.
 * @returns {string} The SVG markup of the button.
 */
function templateAddTaskH1SVG() {
  return /*html*/ `
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
      class="svg-fill svg-width-height-40px"
    >
      <rect width="40" height="40" rx="10" />
      <path
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        d="M20 10V30"
      />
      <path
        stroke="white"
        stroke-width="2"
        stroke-linecap="round"
        d="M30 20L10.0005 20.138"
      />
    </svg>`;
}


/**
 * Returns the SVG of the Add Task button in a column header.
 * @returns {string} The SVG markup of the button.
 */
function templateAddTaskColumnSVG() {
  return /*html*/ `
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      class="svg-fill svg-width-height-32px"
    >
      <rect width="30" height="30" rx="10" />
      <rect
        x="2"
        y="2"
        width="26"
        height="26"
        rx="8"
        fill="rgba(246 247 248 / 100%)"
      />
      <rect x="14" y="6.5" width="2" height="17" rx="1" />
      <rect x="6.5" y="14.1416" width="17" height="2" rx="1" />
    </svg>`;
}
