"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import SuccessModal from "@/components/SuccessModal";
import {
  ArrowLeft,
  FolderOpen,
  Save,
  Loader2,
  FileText,
  Palette,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const PROJECT_COLORS = [
  { name: "Blue", value: "#3B82F6", bg: "bg-blue-500" },
  { name: "Emerald", value: "#10B981", bg: "bg-emerald-500" },
  { name: "Purple", value: "#8B5CF6", bg: "bg-purple-500" },
  { name: "Orange", value: "#F59E0B", bg: "bg-amber-500" },
  { name: "Red", value: "#EF4444", bg: "bg-red-500" },
  { name: "Pink", value: "#EC4899", bg: "bg-pink-500" },
  { name: "Indigo", value: "#6366F1", bg: "bg-indigo-500" },
  { name: "Teal", value: "#14B8A6", bg: "bg-teal-500" },
  { name: "Cyan", value: "#06B6D4", bg: "bg-cyan-500" },
  { name: "Slate", value: "#64748B", bg: "bg-slate-500" },
];

const PROJECT_STATUSES = [
  {
    value: "ACTIVE",
    label: "Active",
    description: "Currently working on this project",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "Project has been finished",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
    description: "Project is archived for reference",
  },
];

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    status: "ACTIVE",
  });

  // Fetch project
  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const data = await res.json();
        setForm({
          name: data.name || "",
          description: data.description || "",
          color: data.color || "#3B82F6",
          status: data.status || "ACTIVE",
        });
      } catch (error) {
        console.error(error);
        alert("Failed to load project");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProject();
  }, [id]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = async (isEdit = false, projectId = null) => {
    const newErrors = {};
  
    if (!form.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Project name must be at least 2 characters";
    } else {
      try {
        const res = await fetch("/api/projects/validate-name", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            excludeId: isEdit ? projectId : null,
          }),
        });
  
        if (!res.ok) {
          const errorText = await res.text(); // fallback for debugging
          console.error("Validation API error:", errorText);
          newErrors.name = "Failed to validate project name";
        } else {
          const data = await res.json();
          if (data.exists) {
            newErrors.name = "Project name already exists";
          }
        }
      } catch (error) {
        console.error("Validation error:", error);
        newErrors.name = "Something went wrong while checking name";
      }
    }
  
    if (form.description && form.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const isValid = await validateForm(true, id); 
    if (!isValid) {
      setShowConfirm(false); 
      return;
    }
  
    setShowConfirm(true); 
  };
  const handleConfirmedSubmit = async () => {
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...form }),
      });
  
      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        console.warn("Failed to parse JSON response");
      }
  
      if (!res.ok) {
        const errorMessage = data?.error || "An error occurred";
        setErrors({ name: errorMessage });
        setShowConfirm(false); // ✅ close the modal so error is visible
        return;
      }
  
      setShowSuccess(true);
    } catch (error) {
      console.error("Error updating project:", error);
      alert(error.message || "Something went wrong.");
      setShowConfirm(false); // ✅ also close on unexpected error
    }
  };
  
  
  

  const selectedColor = PROJECT_COLORS.find((c) => c.value === form.color);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/projects"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Edit Project</h1>
                <p className="text-sm text-slate-600">Update your project details</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                form="edit-form"
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form id="edit-form" onSubmit={handleSubmit} className="space-y-8">
          {/* Preview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Preview</h3>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: form.color }}
                >
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-slate-900">
                    {form.name || "Project Name"}
                  </h4>
                  <p className="text-slate-600 mt-1">
                    {form.description || "Project description..."}
                  </p>
                  <div className="flex items-center space-x-4 mt-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        form.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : form.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {
                        PROJECT_STATUSES.find((s) => s.value === form.status)
                          ?.label
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Basic Info</h3>
                <p className="text-sm text-slate-600">Project name and description</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.name ? "border-red-300 bg-red-50" : "border-slate-300"
                  }`}
                />
                {errors.name && (
                  <div className="flex items-center text-red-600 mt-2 text-sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {errors.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-lg resize-none ${
                    errors.description
                      ? "border-red-300 bg-red-50"
                      : "border-slate-300"
                  }`}
                />
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-500">
                    {form.description.length}/500
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Project Settings
                </h3>
                <p className="text-sm text-slate-600">Customize your project</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Project Color
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => handleInputChange("color", color.value)}
                      className={`w-12 h-12 rounded-lg ${color.bg} relative ${
                        form.color === color.value
                          ? "ring-2 ring-offset-2 ring-slate-400"
                          : ""
                      }`}
                      title={color.name}
                    >
                      {form.color === color.value && (
                        <CheckCircle className="w-5 h-5 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Project Status
                </label>
                <div className="space-y-3">
                  {PROJECT_STATUSES.map((status) => (
                    <label
                      key={status.value}
                      className="flex items-start space-x-3"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={form.status === status.value}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className="mt-1 w-4 h-4 text-blue-600"
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
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-800">{errors.submit}</span>
              </div>
            </div>
          )}
        </form>
      </main>
      {showConfirm && (
        <ConfirmModal
          isOpen={true}
          onCancel={() => setShowConfirm(false)}
          onConfirm={handleConfirmedSubmit}
          title="Confirm Project Updation"
          description="Are you sure you want to save changes?"
          confirmText="Update"
          cancelText="Cancel"
          confirmButtonClass = "bg-green-600 text-white"
          cancelButtonClass = "bg-gray-200 text-black"
        />
      )}

      {showSuccess && (
        <SuccessModal
          isOpen={true}
          onClose={() => {
            setShowSuccess(false);
            setShowConfirm(false)
            router.push("/dashboard/projects");
          }}
          message="Project updated successfully!"
        />
      )}
    </div>
  );
}