"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  FolderOpen,
  Plus,
  Target,
  Activity,
  Archive,
  User,
  AlertCircle,
  Trash2,

} from "lucide-react";

export default function ProjectDetails(props) {
  const { id } = use(props.params);

  const [project, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const router = useRouter();


  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Failed to fetch project details");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ARCHIVED":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACTIVE":
        return <Activity className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "ARCHIVED":
        return <Archive className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };
  const deleteProject = async (id) => {
    try {
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
  
      if (res.ok) {
        setShowSuccess(true);
  
        setTimeout(() => {
          router.push("/dashboard/projects");
        }, 1500);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };
  

  const getTaskStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "TODO":
        return "bg-slate-50 text-slate-700 border-slate-200";
      case "OVERDUE":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Activity className="w-4 h-4" />;
      case "OVERDUE":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const calculateProgress = (tasks) => {
    if (!tasks || tasks.length === 0) return 0;
    const completed = tasks.filter((task) => task.status === "COMPLETED").length;
    return Math.round((completed / tasks.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded-lg w-1/3 mb-6"></div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-20 bg-slate-200 rounded-lg"></div>
                <div className="h-20 bg-slate-200 rounded-lg"></div>
                <div className="h-20 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Error Loading Project
            </h3>
            <p className="text-slate-600 mb-8">{error}</p>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(project.tasks);
  const completedTasks = project.tasks?.filter(task => task.status === "COMPLETED").length || 0;
  const totalTasks = project.tasks?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/projects"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: project.color || "#3b82f6" }}
                >
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                  <p className="text-sm text-slate-600">Project Details</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
          
              <Link
                href={`/dashboard/projects/${id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Project
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h2>
                  <p className="text-slate-600 leading-relaxed">{project.description}</p>
                </div>
                <div
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusIcon(project.status)}
                  <span>{project.status.replace("_", " ")}</span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">Progress</h3>
                  <span className="text-sm font-medium text-slate-600">
                    {completedTasks} of {totalTasks} tasks completed
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
                  <div
                    className="h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: project.color || "#3b82f6",
                    }}
                  />
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>0%</span>
                  <span className="font-medium">{progress}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <Target className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-900">{totalTasks}</div>
                  <div className="text-sm text-slate-600">Total Tasks</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-700">{completedTasks}</div>
                  <div className="text-sm text-emerald-600">Completed</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Activity className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">
                    {project.tasks?.filter(task => task.status === "IN_PROGRESS").length || 0}
                  </div>
                  <div className="text-sm text-blue-600">In Progress</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-slate-700">
                    {project.tasks?.filter(task => task.status === "TODO").length || 0}
                  </div>
                  <div className="text-sm text-slate-600">To Do</div>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900">Tasks</h3>
                <Link href='/dashboard/tasks/new'  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Link>
              </div>

              {project.tasks?.length ? (
                <div className="space-y-4">
                  {project.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                              {task.title}
                            </h4>
                            <div
                              className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getTaskStatusColor(
                                task.status
                              )}`}
                            >
                              {getTaskStatusIcon(task.status)}
                              <span>{task.status.replace("_", " ")}</span>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-slate-600 mb-3">{task.description}</p>
                          )}

                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            {task.assignee && (
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{task.assignee}</span>
                              </div>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Edit3 className="w-4 h-4 text-slate-600" />
                          </button>
                          <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-medium text-slate-900 mb-2">No tasks yet</h4>
                  <p className="text-slate-600 mb-6">Get started by creating your first task for this project.</p>
                  <Link href='/dashboard/tasks/new' className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Task
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Created</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-600">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {project.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Last Updated</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {project.dueDate && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Due Date</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <AlertCircle className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/dashboard/projects/${id}/edit`}
                  className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors w-full text-left"
                >
                  <Edit3 className="w-5 h-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Edit Project</span>
                </Link>

                <button className="flex items-center space-x-3 p-3 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                onClick={() => {
                  setSelectedId(project.id);
                  setShowConfirm(true);
                }}
              >
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Delete Project</span>
                </button>
              </div>
            </div>

            {/* Team Members (if available) */}
            {project.members && project.members.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Team Members</h3>
                <div className="space-y-3">
                  {project.members.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{member.name}</div>
                        <div className="text-xs text-slate-600">{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showConfirm && (
        <ConfirmModal
          title="Delete Project"
          message="Are you sure you want to delete this project?"
          confirmText="Yes, Delete"
          cancelText="No"
          confirmButtonClass = "bg-red-600 text-white"
          cancelButtonClass = "bg-gray-200 text-black"
          
          onConfirm={() => {
            deleteProject(selectedId);
            setShowConfirm(false);
          }}
          onCancel={() => {
            setShowConfirm(false);
            setSelectedId(null);
          }}
        />
      )}

      {showSuccess && (
        <SuccessModal
          message="Project deleted successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  );
}