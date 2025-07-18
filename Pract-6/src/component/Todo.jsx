import React from "react";
import { useState } from "react";

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");
  const [editTask, setEditTask] = useState(null);

  const handleAddTask = () => {
    if (task.trim() !== "") {
      if (editTask !== null) {
        const updatedTasks = [...tasks];
        updatedTasks[editTask] = task;
        setTasks(updatedTasks);
        setEditTask(null);
      } else {
        setTasks([...tasks, task]);
      }
      setTask("");
    }
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  const handleEditTask = (index) => {
    setTask(tasks[index]);
    setEditTask(index);
  };

  return (
    <div className="Todo">
      <h1>Get Things Done !</h1>

      <div className="input-container">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What is the task today?"
        />
        <button onClick={handleAddTask} className="add-button">
          {editTask !== null ? "Update" : "Add Task"}
        </button>
      </div>

      <div className="task-list">
        {tasks.map((taskItem, index) => (
          <div key={index} className="task-item">
            <span>{taskItem}</span>
            <div className="task-actions">
              <button onClick={() => handleEditTask(index)}>✏️</button>
              <button onClick={() => handleDeleteTask(index)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Todo;
