"use client";

import { useState, useEffect } from "react";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";
import Link from "next/link";
import {
  FolderOpen,
  Plus,
  Search,
  Edit3,
  Archive,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  ArrowLeft,
  Grid3X3,
  List,
  Star,
  Target,
  Activity,
} from "lucide-react";

export default function ProjectListPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); 
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = Array.isArray(projects)
  ? projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
  : [];

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
        setProjects((prev) => prev.filter((p) => p.id !== id));
        setShowSuccess(true);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete project");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  };

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
        return <Activity className="w-3 h-3" />;
      case "COMPLETED":
        return <CheckCircle className="w-3 h-3" />;
      case "ARCHIVED":
        return <Archive className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const calculateProgress = (tasks) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(
      (task) => task.status === "COMPLETED"
    ).length;
    return Math.round((completed / tasks.length) * 100);
  };

  const ProjectCard = ({ project }) => {
    const progress = calculateProgress(project.tasks);

    return (

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-200 group overflow-hidden">
      
        <div className="p-6 pb-4">
        
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: project.color }}
              >
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                <div
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusIcon(project.status)}
                  <span>{project.status.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <button
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                onClick={() => {
                  setSelectedId(project.id);
                  setShowConfirm(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>

          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">
                Progress
              </span>
              <span className="text-sm text-slate-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  backgroundColor: project.color,
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {project.tasks.length} tasks
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View Details →
            </Link>
            <div className="flex items-center space-x-2">
              <Link
                href={`/dashboard/projects/${project.id}/edit`}
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

  const ProjectListItem = ({ project }) => {
    const progress = calculateProgress(project.tasks);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ backgroundColor: project.color }}
            >
              <FolderOpen className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-1">
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                  {project.name}
                </h3>
                <div
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusIcon(project.status)}
                  <span>{project.status.replace("_", " ")}</span>
                </div>
              </div>
              <p className="text-slate-600 text-sm truncate mb-2">
                {project.description}
              </p>

              {/* Progress Bar */}
              <div className="flex items-center space-x-3">
                <div className="flex-1 max-w-xs">
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: project.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6 ml-4">
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900">
                {project.tasks.length}
              </div>
              <div className="text-xs text-slate-600">Tasks</div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                View
              </Link>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              
                onClick={() => {
                  setSelectedId(project.id);
                  setShowConfirm(true);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                <h1 className="text-xl font-bold text-slate-900">Projects</h1>
                <p className="text-sm text-slate-600">
                  Manage and organize your work
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
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
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
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

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {searchTerm || statusFilter !== "ALL"
                ? "No projects found"
                : "No projects yet"}
            </h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== "ALL"
                ? "Try adjusting your search or filter criteria"
                : "Create your first project to start organizing your tasks and workflow"}
            </p>
            {!searchTerm && statusFilter === "ALL" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </button>
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
            {filteredProjects.map((project) =>
              viewMode === "grid" ? (
                <ProjectCard key={project.id} project={project} />
              ) : (
                <ProjectListItem key={project.id} project={project} />
              )
            )}
          </div>
        )}

        {/* Results Summary */}
        {filteredProjects.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>
        )}
      </main>

      {/* Create Project Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Create New Project
            </h3>
            <p className="text-slate-600 mb-6">
              This will take you to a page to create a new project.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <Link href="/dashboard/projects/new">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Create Project
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}


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
