"use client";

import { useEffect, useState } from "react";
import TaskModal from "@/components/TaskModal";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search, 
  ArrowLeft, 
  Grid3X3, 
  List, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  Target, 
  Activity,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [selectedTask, setSelectedTask] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Expected array but got:", data);
          setTasks([]);
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "ALL" || task.priority === priorityFilter;

    const matchesProject =
      projectFilter === "ALL" || 
      (task.project && task.project.id === projectFilter);

    return matchesSearch && matchesStatus && matchesPriority && matchesProject;
  });

  const deleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        setShowSuccess(true);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete task");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "TODO":
        return {
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: <Clock className="w-3 h-3" />,
          label: "To Do"
        };
      case "IN_PROGRESS":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Activity className="w-3 h-3" />,
          label: "In Progress"
        };
      case "COMPLETED":
        return {
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: "Completed"
        };
      default:
        return {
          color: "bg-slate-100 text-slate-800 border-slate-200",
          icon: <Clock className="w-3 h-3" />,
          label: "Unknown"
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority) {
      case "URGENT":
        return {
          color: "bg-red-100 text-red-950 border-red-200",
          icon: <Target className="w-3 h-3" />,
          label: "Urgent"
        };
      case "HIGH":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <AlertTriangle className="w-3 h-3" />,
          label: "High"
        };
      case "MEDIUM":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Zap className="w-3 h-3" />,
          label: "Medium"
        };
      case "LOW":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <Target className="w-3 h-3" />,
          label: "Low"
        };
       
      default:
        return {
          color: "bg-slate-100 text-slate-800 border-slate-200",
          icon: <Target className="w-3 h-3" />,
          label: "No Priority"
        };
    }
  };

  // Get unique projects for filter dropdown
  const uniqueProjects = tasks.reduce((acc, task) => {
    if (task.project && !acc.find(p => p.id === task.project.id)) {
      acc.push(task.project);
    }
    return acc;
  }, []);

  const TaskCard = ({ task }) => {
    const statusConfig = getStatusConfig(task.status);
    const priorityConfig = getPriorityConfig(task.priority);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 group overflow-hidden">
        {/* Task Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                {statusConfig.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {task.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span>{statusConfig.label}</span>
                  </div>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                    {priorityConfig.icon}
                    <span>{priorityConfig.label}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                onClick={() => {
                  setSelectedId(task.id);
                  setShowConfirm(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>

          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {task.description || "No description provided"}
          </p>

          {/* Project Information */}
          {task.project && (
            <div className="flex items-center space-x-2 mb-4">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: task.project.color || '#6366f1' }}
              />
              <span className="text-sm text-slate-600 font-medium">
                {task.project.name}
              </span>
            </div>
          )}

          {/* Task Details */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {task.dueDate && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  Assigned to: {task.assignee}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedTask(task)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View Details →
            </button>
            <div className="flex items-center space-x-2">
              <Link
                href={`/dashboard/tasks/edit/${task.id}`}
                className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4 text-slate-600" />
              </Link>
              
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TaskListItem = ({ task }) => {
    const statusConfig = getStatusConfig(task.status);
    const priorityConfig = getPriorityConfig(task.priority);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm flex-shrink-0">
              {statusConfig.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                  {task.title}
                </h3>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                  {statusConfig.icon}
                  <span>{statusConfig.label}</span>
                </div>
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${priorityConfig.color}`}>
                  {priorityConfig.icon}
                  <span>{priorityConfig.label}</span>
                </div>
              </div>
              <p className="text-slate-600 text-sm truncate mb-2">
                {task.description || "No description provided"}
              </p>

              {/* Project Information */}
              {task.project && (
                <div className="flex items-center space-x-2 mb-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.project.color || '#6366f1' }}
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    {task.project.name}
                  </span>
                </div>
              )}

              {/* Task Meta */}
              <div className="flex items-center space-x-4 text-xs text-slate-500">
                {task.dueDate && (
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
                {task.assignee && (
                  <span>Assigned to: {task.assignee}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setSelectedTask(task)}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              View
            </button>
            <Link
              href={`/dashboard/tasks/edit/${task.id}`}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
            </Link>
            <button 
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => {
                setSelectedId(task.id);
                setShowConfirm(true);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tasks</h1>
                <p className="text-sm text-slate-600">
                  Manage your tasks and workflow
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/tasks/new"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>

              {/* Project Filter */}
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Projects</option>
                {uniqueProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm || statusFilter !== "ALL" || priorityFilter !== "ALL"
                ? "No tasks found"
                : "No tasks yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== "ALL" || priorityFilter !== "ALL" || projectFilter !== "ALL"
                ? "Try adjusting your search or filter criteria"
                : "Create your first task to start organizing your work"}
            </p>
            {!searchTerm && statusFilter === "ALL" && priorityFilter === "ALL" && projectFilter === "ALL" && (
              <Link
                href="/dashboard/tasks/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Task
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredTasks.map((task) =>
              viewMode === "grid" ? (
                <TaskCard key={task.id} task={task} />
              ) : (
                <TaskListItem key={task.id} task={task} />
              )
            )}
          </div>
        )}

        {/* Results Summary */}
        {filteredTasks.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </p>
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Yes, Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
          cancelButtonClass="bg-gray-200 text-gray-800 hover:bg-gray-300"
          onConfirm={() => {
            deleteTask(selectedId);
            setShowConfirm(false);
          }}
          onCancel={() => {
            setShowConfirm(false);
            setSelectedId(null);
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          message="Task deleted successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}