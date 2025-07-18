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
    <div className="max-w-md mx-auto bg-indigo-950 p-6 rounded-lg shadow-lg text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Get Things Done !</h1>

      <div className="flex mb-4">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="What is the task today?"
          className="flex-1 p-2 bg-indigo-900 text-white rounded-l-md focus:outline-none"
        />
        <button
          onClick={handleAddTask}
          className="bg-purple-500 text-white px-4 py-2 rounded-r-md hover:bg-purple-600"
        >
          {editTask !== null ? "Update" : "Add Task"}
        </button>
      </div>

      <div className="space-y-2">
        {tasks.map((taskItem, index) => (
          <div
            key={index}
            className="bg-purple-500 p-3 rounded-md flex justify-between items-center"
          >
            <span>{taskItem}</span>
            <div>
              <button
                onClick={() => handleEditTask(index)}
                className="text-white mx-1 hover:text-indigo-200"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDeleteTask(index)}
                className="text-white mx-1 hover:text-indigo-200"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Todo;
