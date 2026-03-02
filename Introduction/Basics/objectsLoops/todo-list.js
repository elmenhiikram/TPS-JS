const todoList = [];

renderTodoList();

function renderTodoList() {
  let todoListHTML = '';

  // Loop over every toDo object and append it to "todoListHTML"
  todoList.forEach((todo, index) => {
    todoListHTML += `
      <span>${todo.name}</span>
      <span>${todo.dueDate}</span>
      <button class="delete-todo-button js-delete-button" data-index="${index}">Delete</button>
    `;
  });

  // Show the objects inside the class "js-todo-list"
  document.querySelector('.js-todo-list').innerHTML = todoListHTML;

  // Loop over every delete button and add an eventListener that deletes the toDo and rerender the Tasks
  document.querySelectorAll('.js-delete-button').forEach((button) => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      todoList.splice(index, 1);
      renderTodoList();
    });
  });
}

document.querySelector('.js-add-todo-button')
  .addEventListener('click', () => {
    addTodo();
  });

function addTodo() {
  const inputElement = document.querySelector('.js-name-input');
  const name = inputElement.value;

  const dateInputElement = document.querySelector('.js-due-date-input');
  const dueDate = dateInputElement.value;

  // Add these values to the variable "todoList"
  todoList.push({ name, dueDate });

  inputElement.value = '';
  dateInputElement.value = '';
  renderTodoList();
}