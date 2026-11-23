const draftSubtasks = [];
let editingSubtask = null;

/**
 * Shows the subtask input actions when the input contains non-whitespace text.
 * @returns {void}
 */
function updateSubtaskActions() {
  const input = document.getElementById("subtask");
  const actions = document.getElementById("subtask-actions");

  actions.hidden = input.value.trim() === "";
}


/**
 * Clears the subtask input, resets the editing state, and updates the input actions.
 * @returns {void}
 */
function clearSubtaskInput() {
  document.getElementById("subtask").value = "";
  editingSubtask = null;
  updateSubtaskActions();
}


/**
 * Saves a subtask on Enter unless text composition is active,
 * preventing the form from being submitted.
 * @param {KeyboardEvent} event - The keydown event from the subtask input.
 * @returns {void}
 */
function handleSubtaskKeydown(event) {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    saveSubtask();
  }
}


/**
 * Adds a non-blank subtask to the draft, clears the input,
 * refreshes the list, and refocuses the input.
 * @returns {void}
 */
function saveSubtask() {
  const input = document.getElementById("subtask");
  const text = input.value.trim();

  if (text === "") {
    return;
  }

  draftSubtasks.push({ text, done: false });
  clearSubtaskInput();
  renderSubtasks();
  input.focus();
}


/**
 * Rebuilds the subtask list from the current draft subtasks.
 * @returns {void}
 */
function renderSubtasks() {
  const list = document.getElementById("subtask-list");
  list.replaceChildren();

  for (let i = 0; i < draftSubtasks.length; i++) {
    list.append(createSubtaskRow(draftSubtasks[i], i));
  }
}


/**
 * Creates a subtask list item in display or editing mode.
 * @param {{text: string, done: boolean}} subtask - The draft subtask to display.
 * @param {number} index - The subtask's index in the draft array.
 * @returns {HTMLLIElement} The populated subtask list item.
 */
function createSubtaskRow(subtask, index) {
  const isEditing = editingSubtask?.subtask === subtask;
  const row = document.createElement("li");
  row.innerHTML = getSubtaskTemplate(index, isEditing);

  updateSubtaskRowContent(row, subtask, isEditing);
  return row;
}


/**
 * Fills a subtask row with the current edit text or the saved draft text.
 * @param {HTMLLIElement} row - The subtask list item to populate.
 * @param {{text: string, done: boolean}} subtask - The draft subtask.
 * @param {boolean} isEditing - Whether the row is in editing mode.
 * @returns {void}
 */
function updateSubtaskRowContent(row, subtask, isEditing) {
  if (isEditing) {
    row.querySelector(".subtask-edit-input").value = editingSubtask.text;
    return;
  }

  row.querySelector(".subtask-text").textContent = subtask.text;
}


/**
 * Starts editing a draft subtask, refreshes the list, and focuses the edit input.
 * @param {number} index - The subtask's index in the draft array.
 * @returns {void}
 */
function editSubtask(index) {
  const subtask = draftSubtasks[index];
  editingSubtask = { subtask, text: subtask.text };

  renderSubtasks();
  document.querySelector(".subtask-edit-input").focus();
}


/**
 * Applies non-blank edit text to the draft subtask, exits editing mode,
 * and refreshes the list.
 * @returns {void}
 */
function saveSubtaskEdit() {
  const text = editingSubtask.text.trim();
  if (text === "") return;

  editingSubtask.subtask.text = text;
  editingSubtask = null;
  renderSubtasks();
}


/**
 * Saves the subtask edit on Enter unless text composition is active,
 * or cancels the edit on Escape.
 * @param {KeyboardEvent} event - The keydown event from the subtask edit input.
 * @returns {void}
 */
function handleSubtaskEditKeydown(event) {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    saveSubtaskEdit();
  }

  if (event.key === "Escape") {
    editingSubtask = null;
    renderSubtasks();
  }
}


/**
 * Removes a draft subtask and refreshes the list.
 * Clears the input and editing state if the deleted subtask is being edited.
 * @param {number} i - The subtask's index in the draft array.
 * @returns {void}
 */
function deleteSubtask(i) {
  if (editingSubtask?.subtask === draftSubtasks[i]) {
    clearSubtaskInput();
  }

  draftSubtasks.splice(i, 1);
  renderSubtasks();
}


/**
 * Removes all draft subtasks, clears the input and editing state,
 * and refreshes the list.
 * @returns {void}
 */
function resetSubtasks() {
  draftSubtasks.length = 0;
  clearSubtaskInput();
  renderSubtasks();
}


/**
 * Replaces the draft subtasks with copies of the provided subtasks,
 * defaults missing completion states to false, and resets the editing UI.
 * @param {Array<{text: string, done?: boolean}>|null} [subtasks=[]] - The subtasks to load.
 * @returns {void}
 */
function setDraftSubtasks(subtasks = []) {
  const copies = (subtasks ?? []).map((subtask) => ({
    ...subtask,
    done: subtask.done ?? false,
  }));
  draftSubtasks.splice(0, draftSubtasks.length, ...copies);
  clearSubtaskInput();
  renderSubtasks();
}


/**
 * Returns copies of the draft subtasks with missing completion states set to false.
 * @returns {Array<{text: string, done: boolean}>} Copies of the current draft subtasks.
 */
function getDraftSubtasks() {
  return draftSubtasks.map((subtask) => ({
    ...subtask,
    done: subtask.done ?? false,
  }));
}
