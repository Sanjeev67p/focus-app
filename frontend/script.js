const taskForm = document.getElementById('task-form'); // Select the form
const taskName = document.getElementById('task-name'); // Select the input field
const activeTasksList = document.getElementById('active-tasks-list'); // Select active task list
const completedTasksList = document.getElementById('completed-tasks-list'); // Select completed task list


// Listen for form submission
taskForm.addEventListener('submit', function (event) {
  event.preventDefault(); // Stop page refresh

  // Get task name and remove extra spaces
  const taskNameTrim = taskName.value.trim();

  // Stop if input is empty
  if (taskNameTrim === "") {
    return;
  }

  // Create main task item (li)
  const li = document.createElement("li");
  li.classList.add("task-item");

  // Create task name text
  const span = document.createElement("span");
  span.textContent = taskNameTrim;
  span.classList.add("task-name");

  // Create div to hold task buttons
  const taskControls = document.createElement("div");
  taskControls.classList.add("task-controls");

  // Create Start button
  const startButton = document.createElement("button");
  startButton.textContent = "Start";

  // Create Complete button
  const completeButton = document.createElement("button");
  completeButton.textContent = "Complete";

  // Create Delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";

  // Delete task when Delete button is clicked
  deleteButton.addEventListener("click", function () {
    li.remove();
  });

  // Add all buttons inside controls div
  taskControls.appendChild(startButton);
  taskControls.appendChild(completeButton);
  taskControls.appendChild(deleteButton);

  // Add task name and controls inside li
  li.appendChild(span);
  li.appendChild(taskControls);

  // Add the full task item to active tasks list
  activeTasksList.appendChild(li);

  // Clear input field after adding task
  taskName.value = "";

  // Move task to completed list when Complete button is clicked

  completeButton.addEventListener("click", function () {
    // Remove Start and Complete buttons
    startButton.remove();
    completeButton.remove();

    // Move task to completed list
    completedTasksList.appendChild(li);
  });
});

