/**
 * JavaScript file for the templates of the board page.
 */

// #region TASK CARD
/**
 * Returns the HTML template of a task card.
 * Description, progress bar and assignees are filled in afterwards.
 * @param {string} taskID - The ID of the task.
 * @param {string} categoryColor - The CSS class for the color of the category label.
 * @returns {string} The HTML string of the task card.
 */
function templateTaskCard(taskID, categoryColor) {
  return /*html*/ `
    <li data-task-id="${escapeHtml(taskID)}" class="task-card d-flex" draggable="true"
      ondragstart="handleDragstart(event)" ondragend="handleDragend(event)">
      <h3 class="task-label ${escapeHtml(categoryColor)}">${allTasks[escapeHtml(taskID)].category}</h3>
      <div class="task-title-description-container d-flex">
        <h4>${allTasks[escapeHtml(taskID)].title}</h4>
        <p id="description${escapeHtml(taskID)}" class="task-description"></p>
      </div>
      <div id="progressContainer${escapeHtml(taskID)}" class="task-progress d-flex">
      </div>
      <div class="task-card-footer d-flex">
        <ul id="assigneesContainer${escapeHtml(taskID)}" class="task-avatars-container d-flex">
        </ul>
        <div class="priority-icon d-flex">
          <img draggable="false"
            src="../assets/icons/prio-${allTasks[escapeHtml(taskID)].priority}-symbol.svg"
            alt="${allTasks[escapeHtml(taskID)].priority} priority task"
          />
        </div>
      </div>
    </li>`;
}
// #endregion


// #region TASK DETAILS
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
    <li class="task-avatar d-flex" style="background-color:${escapeHtml(assigneeColor)}">
      ${escapeHtml(assigneeShortcut)}
    </li>`
}


/**
 * Returns the HTML template of the placeholder for an empty column.
 * @param {string} activeSearch - The active search text, shown before the column name.
 * @param {string} columnName - The display name of the column.
 * @returns {string} The HTML string of the placeholder.
 */
function templateEmptyColumn(activeSearch, columnName) {
  return /*html*/ `
    <li class="empty-board-column d-flex">
      <p>No tasks ${escapeHtml(activeSearch)}${escapeHtml(columnName)}</p>
    </li>`
}
// #endregion


// #region SEARCH
function templateSearch() {
  return /*html*/ `
    <div class="find-container d-flex">
      <input
        id="searchInputfield"
        class="find-input-field"
        type="text"
        placeholder="Find Task"
        aria-label="Search tasks"
      />
      <button
        onclick="handleSearchRequest()"
        class="find-button button-reset"
        type="button"
        aria-label="Submit search"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          class="svg-fill svg-width-height-32px"
        >
          <path
            d="M13.7118 20.2137C11.8946 20.2137 10.3567 19.5843 9.098 18.3256C7.83931 17.0669 7.20996 15.529 7.20996 13.7118C7.20996 11.8946 7.83931 10.3567 9.098 9.098C10.3567 7.83931 11.8946 7.20996 13.7118 7.20996C15.529 7.20996 17.0669 7.83931 18.3256 9.098C19.5843 10.3567 20.2137 11.8946 20.2137 13.7118C20.2137 14.4454 20.097 15.1372 19.8636 15.7874C19.6302 16.4376 19.3134 17.0127 18.9133 17.5129L24.5149 23.1145C24.6983 23.2979 24.79 23.5313 24.79 23.8147C24.79 24.0981 24.6983 24.3315 24.5149 24.5149C24.3315 24.6983 24.0981 24.79 23.8147 24.79C23.5313 24.79 23.2979 24.6983 23.1145 24.5149L17.5129 18.9133C17.0127 19.3134 16.4376 19.6302 15.7874 19.8636C15.1372 20.097 14.4454 20.2137 13.7118 20.2137ZM13.7118 18.2131C14.9622 18.2131 16.025 17.7755 16.9002 16.9002C17.7755 16.025 18.2131 14.9622 18.2131 13.7118C18.2131 12.4615 17.7755 11.3987 16.9002 10.5234C16.025 9.64815 14.9622 9.21053 13.7118 9.21053C12.4615 9.21053 11.3987 9.64815 10.5234 10.5234C9.64815 11.3987 9.21053 12.4615 9.21053 13.7118C9.21053 14.9622 9.64815 16.025 10.5234 16.9002C11.3987 17.7755 12.4615 18.2131 13.7118 18.2131Z"
          />
        </svg>
      </button>
    </div>
    <div class="search-error-message">
      <p id="searchErrorMessage"></p>
    </div>`
}


// function templateSearch(searchFieldID) {
//   return /*html*/ `
//     <div class="find-container d-flex">
//       <input
//         id="searchInputfield_${searchFieldID}"
//         class="find-input-field"
//         type="text"
//         placeholder="Find Task"
//         aria-label="Search tasks"
//       />
//       <button
//         onclick="handleSearchRequest(${searchFieldID})"
//         class="find-button button-reset"
//         type="button"
//         aria-label="Submit search"
//       >
//         <svg
//           aria-hidden="true"
//           xmlns="http://www.w3.org/2000/svg"
//           viewBox="0 0 32 32"
//           class="svg-fill svg-width-height-32px"
//         >
//           <path
//             d="M13.7118 20.2137C11.8946 20.2137 10.3567 19.5843 9.098 18.3256C7.83931 17.0669 7.20996 15.529 7.20996 13.7118C7.20996 11.8946 7.83931 10.3567 9.098 9.098C10.3567 7.83931 11.8946 7.20996 13.7118 7.20996C15.529 7.20996 17.0669 7.83931 18.3256 9.098C19.5843 10.3567 20.2137 11.8946 20.2137 13.7118C20.2137 14.4454 20.097 15.1372 19.8636 15.7874C19.6302 16.4376 19.3134 17.0127 18.9133 17.5129L24.5149 23.1145C24.6983 23.2979 24.79 23.5313 24.79 23.8147C24.79 24.0981 24.6983 24.3315 24.5149 24.5149C24.3315 24.6983 24.0981 24.79 23.8147 24.79C23.5313 24.79 23.2979 24.6983 23.1145 24.5149L17.5129 18.9133C17.0127 19.3134 16.4376 19.6302 15.7874 19.8636C15.1372 20.097 14.4454 20.2137 13.7118 20.2137ZM13.7118 18.2131C14.9622 18.2131 16.025 17.7755 16.9002 16.9002C17.7755 16.025 18.2131 14.9622 18.2131 13.7118C18.2131 12.4615 17.7755 11.3987 16.9002 10.5234C16.025 9.64815 14.9622 9.21053 13.7118 9.21053C12.4615 9.21053 11.3987 9.64815 10.5234 10.5234C9.64815 11.3987 9.21053 12.4615 9.21053 13.7118C9.21053 14.9622 9.64815 16.025 10.5234 16.9002C11.3987 17.7755 12.4615 18.2131 13.7118 18.2131Z"
//           />
//         </svg>
//       </button>
//     </div>
//     <div class="search-error-message">
//       <p id="searchErrorMessage_${searchFieldID}"></p>
//     </div>`
// }
// #endregion

// #region BUTTONS
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
// #endregion
