const draftSubtasks = [];
let editingSubtask = null;

function updateSubtaskActions() {
  const input = document.getElementById("subtask");
  const actions = document.getElementById("subtask-actions");

  actions.hidden = input.value.trim() === "";
}

function clearSubtaskInput() {
  document.getElementById("subtask").value = "";
  editingSubtask = null;
  updateSubtaskActions();
}

function handleSubtaskKeydown(event) {
  if (event.key === "Enter" && !event.isComposing) {
    event.preventDefault();
    saveSubtask();
  }
}

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

function renderSubtasks() {
  const list = document.getElementById("subtask-list");
  list.replaceChildren();

  for (let i = 0; i < draftSubtasks.length; i++) {
    list.append(createSubtaskRow(draftSubtasks[i], i));
  }
}

function createSubtaskRow(subtask, index) {
  const isEditing = editingSubtask?.subtask === subtask;
  const row = document.createElement("li");
  row.innerHTML = getSubtaskTemplate(index, isEditing);

  updateSubtaskRowContent(row, subtask, isEditing);
  return row;
}

function updateSubtaskRowContent(row, subtask, isEditing) {
  if (isEditing) {
    row.querySelector(".subtask-edit-input").value = editingSubtask.text;
    return;
  }

  row.querySelector(".subtask-text").textContent = subtask.text;
}

function editSubtask(index) {
  const subtask = draftSubtasks[index];
  editingSubtask = { subtask, text: subtask.text };

  renderSubtasks();
  document.querySelector(".subtask-edit-input").focus();
}

function saveSubtaskEdit() {
  const text = editingSubtask.text.trim();
  if (text === "") return;

  editingSubtask.subtask.text = text;
  editingSubtask = null;
  renderSubtasks();
}

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

function deleteSubtask(i) {
  if (editingSubtask?.subtask === draftSubtasks[i]) {
    clearSubtaskInput();
  }

  draftSubtasks.splice(i, 1);
  renderSubtasks();
}

function resetSubtasks() {
  draftSubtasks.length = 0;
  clearSubtaskInput();
  renderSubtasks();
}

function setDraftSubtasks(subtasks = []) {
  const copies = (subtasks ?? []).map((subtask) => ({
    ...subtask,
    done: subtask.done ?? false,
  }));
  draftSubtasks.splice(0, draftSubtasks.length, ...copies);
  clearSubtaskInput();
  renderSubtasks();
}

function getDraftSubtasks() {
  return draftSubtasks.map((subtask) => ({
    ...subtask,
    done: subtask.done ?? false,
  }));
}
