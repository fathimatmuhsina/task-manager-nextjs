'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Settings,
  AlertCircle,
  CheckSquare,
  Calendar,
  FolderOpen,
  Flag,
  Clock,
  User,
} from "lucide-react";

const PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
    color: "#10B981",
    bg: "bg-emerald-500",
    textColor: "text-emerald-800",
    bgColor: "bg-emerald-100",
    description: "Can be done when time allows"
  },
  {
    value: "MEDIUM",
    label: "Medium", 
    color: "#F59E0B",
    bg: "bg-amber-500",
    textColor: "text-amber-800",
    bgColor: "bg-amber-100",
    description: "Important but not urgent"
  },
  {
    value: "HIGH",
    label: "High",
    color: "#EF4444", 
    bg: "bg-red-500",
    textColor: "text-red-800",
    bgColor: "bg-red-100",
    description: "Needs attention soon"
  },
  {
    value: "URGENT",
    label: "Urgent",
    color: "#DC2626",
    bg: "bg-red-600",
    textColor: "text-red-900", 
    bgColor: "bg-red-200",
    description: "Immediate action required"
  },
];

const STATUS_OPTIONS = [
  {
    value: "TODO",
    label: "To Do",
    description: "Task is ready to be started",
    color: "text-slate-800",
    bgColor: "bg-slate-100"
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    description: "Currently working on this task",
    color: "text-blue-800",
    bgColor: "bg-blue-100"
  },
  {
    value: "COMPLETED",
    label: "Completed", 
    description: "Task has been finished",
    color: "text-emerald-800",
    bgColor: "bg-emerald-100"
  },
];

export default function AddTaskPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [projects, setProjects] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'TODO',
    dueDate: '',
    projectId: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const projectsRes = await fetch('/api/projects');
        const projectsData = await projectsRes.json();
        
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (err) {
        console.error('Error loading data:', err);
        setErrors(prev => ({ ...prev, fetch: 'Failed to load project data' }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const checkDuplicateTitle = async () => {
    try {
      const res = await fetch('/api/tasks/validate-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          projectId: formData.projectId,
          excludeId: formData.id || null, // For edit, pass current task ID
        }),
      });
  
      const data = await res.json();
      return data.exists;
    } catch (err) {
      console.error("Validation error:", err);
      return false;
    }
  };
  
  const validateForm = async() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    } else if (formData.title.trim().length < 2) {
      newErrors.title = "Task title must be at least 2 characters";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    if (!formData.projectId) {
      newErrors.projectId = "Please select a project";
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.dueDate = "Due date cannot be in the past";
    }


      const isDuplicate = await checkDuplicateTitle();
      if (isDuplicate) {
        newErrors.title = "Task name already exists in this project";
      }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const isValid = await validateForm(); 
  
    if (!isValid) return; 
    setShowConfirm(true); 
  };

  const handleConfirmedSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log("FormData before submit:", formData); // Add this too
  
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const result = await res.json();
  
      console.log("Status:", res.status);
      console.log("Server response:", result);
  
      if (!res.ok) {
        throw new Error(result?.error || 'Failed to create task');
      }
  
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Submit Error:', error);
      setErrors(prev => ({ ...prev, submit: error.message }));
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const selectedProject = projects.find(p => p.id === formData.projectId);
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === formData.priority);
  const selectedStatus = STATUS_OPTIONS.find(s => s.value === formData.status);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/tasks"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Create New Task
                </h1>
                <p className="text-sm text-slate-600">
                  Add a new task to organize your work
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/dashboard/tasks"
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                form="task-form"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="task-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Task Preview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Task Preview
            </h3>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckSquare className="w-5 h-5 text-slate-600" />
                    <h4 className="text-xl font-bold text-slate-900">
                      {formData.title || "Task Title"}
                    </h4>
                  </div>
                  
                  <p className="text-slate-600 mb-4">
                    {formData.description || "Task description will appear here..."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Priority Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${selectedPriority?.bgColor} ${selectedPriority?.textColor}`}
                    >
                      <Flag className="w-3 h-3" />
                      <span>{selectedPriority?.label} Priority</span>
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${selectedStatus?.bgColor} ${selectedStatus?.color}`}
                    >
                      {selectedStatus?.label}
                    </span>

                    {/* Project Badge */}
                    {selectedProject && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
                        <FolderOpen className="w-3 h-3" />
                        <span>{selectedProject.name}</span>
                      </span>
                    )}

                    {/* Due Date */}
                    {formData.dueDate && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Due {new Date(formData.dueDate).toLocaleDateString()}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Basic Information
                </h3>
                <p className="text-sm text-slate-600">
                  Essential details about your task
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Task Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Task Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter task title..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.title
                      ? "border-red-300 bg-red-50"
                      : "border-slate-300"
                  }`}
                />
                {errors.title && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{errors.title}</span>
                  </div>
                )}
              </div>

              {/* Task Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what needs to be done, requirements, and key details..."
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${
                    errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-slate-300"
                  }`}
                />
                <div className="flex items-center justify-between mt-2">
                  {errors.description ? (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.description}</span>
                    </div>
                  ) : (
                    <div />
                  )}
                  <span className="text-sm text-slate-500">
                    {formData.description.length}/1000
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Task Settings
                </h3>
                <p className="text-sm text-slate-600">
                  Configure priority, status, and project assignment
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Priority & Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Priority Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Priority Level
                  </label>
                  <div className="space-y-3">
                    {PRIORITY_OPTIONS.map((priority) => (
                      <label
                        key={priority.value}
                        className="flex items-start space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={priority.value}
                          checked={formData.priority === priority.value}
                          onChange={(e) => handleInputChange("priority", e.target.value)}
                          className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-3 h-3 rounded-full ${priority.bg}`}
                            />
                            <span className="text-sm font-medium text-slate-900">
                              {priority.label}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {priority.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Initial Status
                  </label>
                  <div className="space-y-3">
                    {STATUS_OPTIONS.map((status) => (
                      <label
                        key={status.value}
                        className="flex items-start space-x-3 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status.value}
                          checked={formData.status === status.value}
                          onChange={(e) => handleInputChange("status", e.target.value)}
                          className="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {status.label}
                          </div>
                          <div className="text-sm text-slate-600">
                            {status.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project & Due Date */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Selection */}
                <div>
                  <label
                    htmlFor="projectId"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Project *
                  </label>
                  <select
                    id="projectId"
                    value={formData.projectId}
                    onChange={(e) => handleInputChange("projectId", e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.projectId
                        ? "border-red-300 bg-red-50"
                        : "border-slate-300"
                    }`}
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.projectId}</span>
                    </div>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.dueDate
                        ? "border-red-300 bg-red-50"
                        : "border-slate-300"
                    }`}
                  />
                  {errors.dueDate && (
                    <div className="flex items-center space-x-2 mt-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.dueDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Errors */}
          {(errors.submit || errors.fetch) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-800">
                  {errors.submit || errors.fetch}
                </span>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <ConfirmModal
          isOpen={true}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmedSubmit}
          title="Confirm Task Creation"
          description="Are you sure you want to create this task?"
          confirmText="Create Task"
          cancelText="Cancel"
          confirmButtonClass="bg-blue-600 text-white"
          cancelButtonClass="bg-gray-200 text-black"
        />
      )}

      {/* Success Modal */}
      {showSuccess && (
        <SuccessModal
          isOpen={true}
          onClose={() => {
            setShowSuccess(false);
            setShowConfirm(false);
            router.push("/dashboard/tasks");
          }}
          message="Task created successfully!"
        />
      )}
    </div>
  );
}