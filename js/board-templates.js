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
    <li data-task-id="${escapeHtml(taskID)}" data-task-status="${escapeHtml(allTasks[taskID].status)}" class="task-card d-flex" draggable="true"
      ondragstart="handleDragstart(event)" ondragend="handleDragend()">
      <section class="label-move-container d-flex">
        <h3 class="task-label ${escapeHtml(categoryColor)}">${escapeHtml(allTasks[taskID].category)}</h3>
        <div class="move-menu-container">
          <button class="button-reset" type="button" aria-label="Open move menu"
            onclick="toggleMenu(this, 'move-menu-dropdown${escapeHtml(taskID)}')" aria-expanded="false" aria-controls="move-menu">
            <svg 
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 26"
              class="svg-fill svg-width-height-move"
            > 
              <path fill-rule="evenodd" d="M6 0H18A6 6 0 0 1 24 6V20A6 6 0 0 1 18 26H6A6 6 0 0 1 0 20V6A6 6 0 0 1 6 0ZM6 1.5H18A4.5 4.5 0 0 1 22.5 6V20A4.5 4.5 0 0 1 18 24.5H6A4.5 4.5 0 0 1 1.5 20V6A4.5 4.5 0 0 1 6 1.5Z"/>
              <path d="M15.3333 18.1457L16.8958 16.5832C17.0486 16.4304 17.2396 16.354 17.4688 16.354C17.6979 16.354 17.8958 16.4304 18.0625 16.5832C18.2292 16.7498 18.3125 16.9478 18.3125 17.1769C18.3125 17.4061 18.2292 17.604 18.0625 17.7707L15.0833 20.7498C15 20.8332 14.9097 20.8922 14.8125 20.9269C14.7153 20.9616 14.6111 20.979 14.5 20.979C14.3889 20.979 14.2847 20.9616 14.1875 20.9269C14.0903 20.8922 14 20.8332 13.9167 20.7498L10.9167 17.7498C10.75 17.5832 10.6701 17.3887 10.6771 17.1665C10.684 16.9443 10.7708 16.7498 10.9375 16.5832C11.1042 16.4304 11.2986 16.3505 11.5208 16.3436C11.7431 16.3366 11.9375 16.4165 12.1042 16.5832L13.6667 18.1457V12.9998C13.6667 12.7637 13.7465 12.5658 13.9062 12.4061C14.066 12.2464 14.2639 12.1665 14.5 12.1665C14.7361 12.1665 14.934 12.2464 15.0938 12.4061C15.2535 12.5658 15.3333 12.7637 15.3333 12.9998V18.1457ZM10.3333 7.854V12.9998C10.3333 13.2359 10.2535 13.4339 10.0938 13.5936C9.93403 13.7533 9.73611 13.8332 9.5 13.8332C9.26389 13.8332 9.06597 13.7533 8.90625 13.5936C8.74653 13.4339 8.66667 13.2359 8.66667 12.9998V7.854L7.10417 9.4165C6.95139 9.56928 6.76042 9.64567 6.53125 9.64567C6.30208 9.64567 6.10417 9.56928 5.9375 9.4165C5.77083 9.24984 5.6875 9.05192 5.6875 8.82275C5.6875 8.59359 5.77083 8.39567 5.9375 8.229L8.91667 5.24984C9 5.1665 9.09028 5.10748 9.1875 5.07275C9.28472 5.03803 9.38889 5.02067 9.5 5.02067C9.61111 5.02067 9.71528 5.03803 9.8125 5.07275C9.90972 5.10748 10 5.1665 10.0833 5.24984L13.0833 8.24984C13.25 8.4165 13.3299 8.61095 13.3229 8.83317C13.316 9.05539 13.2292 9.24984 13.0625 9.4165C12.8958 9.56928 12.7014 9.64914 12.4792 9.65609C12.2569 9.66303 12.0625 9.58317 11.8958 9.4165L10.3333 7.854Z"/>
            </svg>
          </button>
          <section id="move-menu-dropdown${escapeHtml(taskID)}" class="move-menu-dropdown d-flex">
            <h5>Move to ...</h5>
            <ol class="move-menu d-flex">
              <li data-destination-status="toDo" onclick="moveTaskViaButton(event)">To do</li>
              <li data-destination-status="inProgress" onclick="moveTaskViaButton(event)">In progress</li>
              <li data-destination-status="awaitFeedback" onclick="moveTaskViaButton(event)">Await feedback</li>
              <li data-destination-status="done" onclick="moveTaskViaButton(event)">Done</li>
            </ol>
          </section>
        </div>
      </section>
      <div class="task-title-description-container d-flex">
        <h4>${escapeHtml(allTasks[taskID].title)}</h4>
        <p id="description${escapeHtml(taskID)}" class="task-description"></p>
      </div>
      <div id="progressContainer${escapeHtml(taskID)}" class="task-progress d-flex">
      </div>
      <div class="task-card-footer d-flex">
        <ul id="assigneesContainer${escapeHtml(taskID)}" class="task-avatars-container d-flex">
        </ul>
        <div class="priority-icon d-flex">
          <img draggable="false"
            src="../assets/icons/prio-${escapeHtml(allTasks[taskID].priority)}-symbol.svg"
            alt="${escapeHtml(allTasks[taskID].priority)} priority task"
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
function templateTaskAssignee(assigneeColor, assigneeShortcut) {
  return /*html*/ `
    <li class="task-avatar d-flex" style="background-color:${escapeHtml(assigneeColor)}">
      ${escapeHtml(assigneeShortcut)}
    </li>`
}


/**
 * Returns the HTML template of the message for an empty column.
 * @param {string} columnName - The display name of the column.
 * @returns {string} The HTML string of the message.
 */
function templateEmptyColumn(columnName) {
  return /*html*/ `
    <li class="empty-column-message d-flex">
      <p>No tasks ${escapeHtml(columnName)}</p>
    </li>`
}
// #endregion


// #region OVERLAY
// function templateOverlayDetailedTask(taskID) {
//   return /*html*/ `
//     <header>
//       <h3>Category</h3>
//       <button>x</button>
//     </header>
//     <main>
//       <h1>titel</h1>
//       <p>description</p>
//       <div>
//         <h2>Due date:</h2>
//         <p></p>
//       </div>
//       <div>
//         <h2>Priority:</h2>
//         <p></p>
//       </div>
//       <div>
//         <h2>Assigned to:</h2>
//         <ul></ul>
//       </div>
//       <div>
//         <h2>Subtasks</h2>
//         <ul></ul>
//       </div>
//     </main>
//     <footer>
//       <button>Delete</button>
//       <button>Edit</button>
//     </footer>`
// }


// function templateOverlayAssignee() {
//   return /*html*/ `
//     <li>
//       <p></p>
//     </li>`
// }


// function templateOverlaySubtask() {
//   return /*html*/ `
//     <li>
//       <p></p>
//     </li>`
// }
// #endregion
