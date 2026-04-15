import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/TaskLogView.css";

const TaskLogView = () => {
  const [tasks, setTasks] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]); // ID of expanded tasks

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      const localTasks = JSON.parse(localStorage.getItem("mock_tasks") || "[]");
      setTasks([...localTasks, ...res.data]);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      const localTasks = JSON.parse(localStorage.getItem("mock_tasks") || "[]");
      setTasks(localTasks);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchTasks();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <div className="task-log-container animate-fade-in font-body">
      {/* Breadcrumbs */}
      <nav className="task-log-breadcrumb">
        <Link to="#">Dashboard</Link>
        <span className="separator">/</span>
        <span>Tasks</span>
      </nav>

      {/* Header */}
      <header className="task-log-header">
        <h1>Task log</h1>
      </header>

      {/* Task List */}
      <div className="task-list-wrapper">
        {tasks.map((task) => (
          <div key={task.id} className="task-item-card">
            <div 
              className="task-item-header"
              onClick={() => toggleTask(task.id)}
            >
              <div className="task-item-title-row">
                <i className={`fa-solid fa-chevron-down task-chevron ${expandedTasks.includes(task.id) ? "expanded" : ""}`}></i>
                <span className="task-name">{task.name}</span>
              </div>
              <div className="task-status-badge">
                <span>{task.status}</span>
                <i className="fa-solid fa-circle-check"></i>
              </div>
            </div>

            {/* Details Section */}
            {expandedTasks.includes(task.id) && (
              <div className="task-item-details">
                <div className="task-metadata-grid">
                  <span className="task-meta-label">Created on</span>
                  <span className="task-meta-value">{task.createdOn}</span>

                  <span className="task-meta-label">Started on</span>
                  <span className="task-meta-value">{task.startedOn}</span>

                  <span className="task-meta-label">Finished on</span>
                  <span className="task-meta-value">{task.finishedOn}</span>

                  <span className="task-meta-label">Duration</span>
                  <span className="task-meta-value">{task.duration}</span>

                  <span className="task-meta-label">Created by</span>
                  <span className="task-meta-value">{task.createdBy}</span>
                </div>
                <Link to="#" className="show-details-link">Show details</Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskLogView;
