/**
 * Returns the overlay action buttons for adding or editing a task.
 * @param {"add"|"edit"} [mode="add"] - Determines the buttons and submit label.
 * @param {string} [cancelHandler=""] - JavaScript executed when Cancel is clicked.
 * @returns {string} The overlay action buttons HTML.
 */
function getTaskOverlayActionsTemplate(mode = "add", cancelHandler = "") {
  return /*html*/ `
    <div class="form-actions">
      ${
        mode === "edit"
          ? ""
          : `
        <button type="button" class="form-action form-action--clear"
          onclick="${cancelHandler}">Cancel ✕</button>
      `
      }
      <button type="submit" class="form-action form-action--create">
        ${mode === "edit" ? "Ok ✓" : "Create Task ✓"}
      </button>
    </div>
  `;
}


/**
 * Returns the HTML for an assignee option with a badge, name, and checkbox.
 * @returns {string} The assignee option HTML with empty badge and name placeholders.
 */
function getAssignedContactTemplate() {
  return /*html*/ `
    <label class="assigned-contact-option">
      <span class="selected-contact-badge" aria-hidden="true"></span>
      <span class="assigned-contact-name"></span>
      <input
        type="checkbox" name="assignedTo" onclick="renderSelectedContactBadges()"
      />
    </label>
  `;
}


/**
 * Returns a subtask row's inner HTML in display or editing mode.
 * @param {number} index - The subtask's draft array index, used by the action buttons.
 * @param {boolean} isEditing - Whether to show the edit input and save button.
 * @returns {string} The subtask row content and action buttons HTML.
 */
function getSubtaskTemplate(index, isEditing) {
  return /*html*/ `
    <div class="subtask-row ${isEditing ? "subtask-row--editing" : ""}">
      ${
        isEditing
          ? `<input class="subtask-edit-input" type="text"
              aria-label="Edit subtask"
              oninput="editingSubtask.text = this.value"
              onkeydown="handleSubtaskEditKeydown(event)" />`
          : `<span class="subtask-text"></span>`
      }

      <div class="subtask-row-actions">
        ${
          isEditing
            ? ""
            : `<button type="button" aria-label="Edit subtask"
                onclick="editSubtask(${index})">
                <img src="../assets/icons/subtasks.svg" alt="" width="20" height="20" />
              </button>`
        }

        <button type="button" aria-label="Delete subtask"
          onclick="deleteSubtask(${index})">
          <img src="../assets/icons/delete.svg" alt="" width="20" height="20" />
        </button>

        ${
          isEditing
            ? `<button type="button" aria-label="Save subtask"
                onclick="saveSubtaskEdit()">✓</button>`
            : ""
        }
      </div>
    </div>
  `;
}
