const STORAGE_KEY = "todo-list-v1";

let todos = [];
let currentFilter = "all";

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) todos = JSON.parse(raw);
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}`;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return d < today;
}

// --- DOM references
const listEl = document.getElementById("todo-list");
const emptyStateEl = document.getElementById("empty-state");
const itemsLeftEl = document.getElementById("items-left");
const filterButtons = document.querySelectorAll(".filter-btn");

function renderTodos() {
  listEl.innerHTML = "";

  const filtered = todos.filter((t) =>
    currentFilter === "active"
      ? !t.completed
      : currentFilter === "completed"
      ? t.completed
      : true
  );

  emptyStateEl.style.display = filtered.length ? "none" : "block";

  filtered.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    li.innerHTML = `
      <label class="checkbox">
        <input type="checkbox" ${todo.completed ? "checked" : ""}>
      </label>

      <div class="todo-content">
        <span class="todo-text">${todo.text}</span>
        ${
          todo.dueDate
            ? `<div class="todo-meta">
                 <span class="badge ${
                   isOverdue(todo.dueDate) ? "overdue" : "due"
                 }">
                   ${isOverdue(todo.dueDate) ? "Overdue" : "Due"} · ${formatDate(
                todo.dueDate
              )}
                 </span>
               </div>`
            : ""
        }
      </div>

      <button class="delete-btn">×</button>
    `;

    listEl.appendChild(li);
  });

  itemsLeftEl.textContent = `${
    todos.filter((t) => !t.completed).length
  } tasks remaining`;
}

// --- actions
function addTodo(text, dueDate) {
  todos.unshift({
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    dueDate: dueDate || "",
  });
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  saveTodos();
  renderTodos();
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach((b) =>
    b.classList.toggle("active", b.dataset.filter === filter)
  );
  renderTodos();
}

// --- form
document.getElementById("todo-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = document.getElementById("todo-input").value;
  const date = document.getElementById("date-input").value;
  if (text.trim()) addTodo(text, date);
  e.target.reset();
});

// list interactions
listEl.addEventListener("click", (e) => {
  const li = e.target.closest(".todo-item");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.matches("input[type='checkbox']")) return toggleTodo(id);
  if (e.target.matches(".delete-btn")) return deleteTodo(id);
});

// filters
filterButtons.forEach((btn) =>
  btn.addEventListener("click", () => setFilter(btn.dataset.filter))
);

// clear
document
  .getElementById("clear-completed")
  .addEventListener("click", clearCompleted);

// header date
(function () {
  const now = new Date();
  document.getElementById("today-date").textContent =
    now.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  document.getElementById("today-weekday").textContent =
    now.toLocaleDateString(undefined, { weekday: "long" });
})();

// init
loadTodos();
renderTodos();
