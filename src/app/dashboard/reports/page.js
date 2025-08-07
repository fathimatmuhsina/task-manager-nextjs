"use client";
import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Users,
  FolderOpen,
  Search,
  X,
  ChevronDown,
  ArrowLeft,
  FileText,
  Target,
  Timer,
  Award,
  Activity,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

const STATUS_OPTIONS = [
  {
    value: "TODO",
    label: "To Do",
    color: "bg-slate-100 text-slate-800",
    icon: "⏳",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    color: "bg-blue-100 text-blue-800",
    icon: "🔄",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: "✅",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "LOW",
    label: "Low",
    color: "bg-green-100 text-green-800",
    icon: "🟢",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800",
    icon: "🟡",
  },
  {
    value: "HIGH",
    label: "High",
    color: "bg-orange-100 text-orange-800",
    icon: "🟠",
  },
  {
    value: "URGENT",
    label: "Urgent",
    color: "bg-red-100 text-red-800",
    icon: "🔴",
  },
];

const COMPLETION_OPTIONS = [
  { value: "all", label: "All Tasks" },
  { value: "onTime", label: "Completed On Time" },
  { value: "late", label: "Completed Late" },
];

export default function TaskReportPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("table");

  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    project: [],
    dateRange: { start: "", end: "" },
    search: "",
    overdue: false,
    completedOnTime: "all",
  });

  const [sortConfig, setSortConfig] = useState({
    field: "createdAt",
    direction: "desc",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, projectsRes] = await Promise.all([
          fetch("/api/tasks"),
          fetch("/api/projects"),
        ]);

        const tasksData = await tasksRes.json();
        const projectsData = await projectsRes.json();

        if (!tasksRes.ok) {
          setError(tasksData.error || "Failed to fetch tasks");
          return;
        }

        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch task report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Enhanced task processing with analytics
  const processedTasks = useMemo(() => {
    return tasks.map((task) => {
      const created = new Date(task.createdAt);
      const due = task.dueDate ? new Date(task.dueDate) : null;
      const completed = task.completedAt ? new Date(task.completedAt) : null;
      const now = new Date();

      // Time to complete calculation
      let timeToComplete = null;
      let timeToCompleteText = "-";
      if (completed) {
        const diffMs = completed.getTime() - created.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        timeToComplete = diffMs;
        timeToCompleteText = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
      }

      // Days until due / overdue calculation
      let daysUntilDue = null;
      let daysUntilDueText = "-";
      let isOverdue = false;

      if (due && !completed) {
        const diffMs = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        daysUntilDue = diffDays;

        if (diffDays < 0) {
          isOverdue = true;
          daysUntilDueText = `${Math.abs(diffDays)} days overdue`;
        } else if (diffDays === 0) {
          daysUntilDueText = "Due today";
        } else {
          daysUntilDueText = `${diffDays} days left`;
        }
      }

      // On-time completion
      let completedOnTime = null;
      if (completed && due) {
        completedOnTime = completed <= due;
      }

      // Total logged time
      const totalLoggedTime =
        task.timeEntries?.reduce((sum, entry) => sum + entry.duration, 0) || 0;
      const loggedTimeText =
        totalLoggedTime > 0
          ? `${Math.floor(totalLoggedTime / 60)}h ${totalLoggedTime % 60}m`
          : "-";

      return {
        ...task,
        created,
        due,
        completed,
        timeToComplete,
        timeToCompleteText,
        daysUntilDue,
        daysUntilDueText,
        isOverdue,
        completedOnTime,
        totalLoggedTime,
        loggedTimeText,
      };
    });
  }, [tasks]);

  // Advanced filtering logic
  const filteredTasks = useMemo(() => {
    return processedTasks.filter((task) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.project.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(task.status)) {
        return false;
      }

      // Priority filter
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      // Project filter
      if (
        filters.project.length > 0 &&
        !filters.project.includes(task.project.id)
      ) {
        return false;
      }

      // Date range filter
      if (
        filters.dateRange.start &&
        task.created < new Date(filters.dateRange.start)
      ) {
        return false;
      }
      if (
        filters.dateRange.end &&
        task.created > new Date(filters.dateRange.end + "T23:59:59")
      ) {
        return false;
      }

      // Overdue filter
      if (filters.overdue && !task.isOverdue) {
        return false;
      }

      // Completion timing filter
      if (filters.completedOnTime !== "all") {
        if (
          filters.completedOnTime === "onTime" &&
          task.completedOnTime !== true
        ) {
          return false;
        }
        if (
          filters.completedOnTime === "late" &&
          task.completedOnTime !== false
        ) {
          return false;
        }
      }

      return true;
    });
  }, [processedTasks, filters]);

  // Sorting logic
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.field) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "project":
          aValue = a.project.name.toLowerCase();
          bValue = b.project.name.toLowerCase();
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          const priorityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "createdAt":
          aValue = a.created.getTime();
          bValue = b.created.getTime();
          break;
        case "dueDate":
          aValue = a.due?.getTime() || 0;
          bValue = b.due?.getTime() || 0;
          break;
        case "completedAt":
          aValue = a.completed?.getTime() || 0;
          bValue = b.completed?.getTime() || 0;
          break;
        case "timeToComplete":
          aValue = a.timeToComplete || 0;
          bValue = b.timeToComplete || 0;
          break;
        case "daysUntilDue":
          aValue = a.daysUntilDue || 999;
          bValue = b.daysUntilDue || 999;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTasks, sortConfig]);

  // Analytics calculations
  const analytics = useMemo(() => {
    const total = processedTasks.length;
    const completed = processedTasks.filter(
      (t) => t.status === "COMPLETED"
    ).length;
    const inProgress = processedTasks.filter(
      (t) => t.status === "IN_PROGRESS"
    ).length;
    const overdue = processedTasks.filter((t) => t.isOverdue).length;
    const completedOnTime = processedTasks.filter(
      (t) => t.completedOnTime === true
    ).length;
    const completedLate = processedTasks.filter(
      (t) => t.completedOnTime === false
    ).length;

    const avgCompletionTime =
      processedTasks
        .filter((t) => t.timeToComplete)
        .reduce((sum, t) => sum + t.timeToComplete, 0) /
      (processedTasks.filter((t) => t.timeToComplete).length || 1);

    const avgCompletionDays = Math.round(
      avgCompletionTime / (1000 * 60 * 60 * 24)
    );

    return {
      total,
      completed,
      inProgress,
      overdue,
      completedOnTime,
      completedLate,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      onTimeRate:
        completed > 0 ? Math.round((completedOnTime / completed) * 100) : 0,
      avgCompletionDays,
    };
  }, [processedTasks]);

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      project: [],
      dateRange: { start: "", end: "" },
      search: "",
      overdue: false,
      completedOnTime: "all",
    });
  };

  const SortButton = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
    >
      <span>{children}</span>
      {sortConfig.field === field &&
        (sortConfig.direction === "asc" ? (
          <SortAsc className="w-4 h-4" />
        ) : (
          <SortDesc className="w-4 h-4" />
        ))}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading task report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center">
                <Link
                  href="/dashboard"
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Task Analytics
                </h1>
                <p className="text-sm text-slate-600">
                  Comprehensive task reporting and insights
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() =>
                  setViewMode(viewMode === "table" ? "cards" : "table")
                }
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title={`Switch to ${
                  viewMode === "table" ? "card" : "table"
                } view`}
              >
                {viewMode === "table" ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {(filters.status.length > 0 ||
                  filters.priority.length > 0 ||
                  filters.project.length > 0 ||
                  filters.search) && (
                  <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>
              
            </div>
          </div>
        </div>
      </header>

      {/* Analytics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Total Tasks
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.completionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  On-Time Rate
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  {analytics.onTimeRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Avg. Completion
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.avgCompletionDays}d
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Timer className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search Tasks
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Search by title, description, or project..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status.value)}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status.value]
                            : filters.status.filter((s) => s !== status.value);
                          handleFilterChange("status", newStatus);
                        }}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">
                        {status.icon} {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Priority
                </label>
                <div className="space-y-2">
                  {PRIORITY_OPTIONS.map((priority) => (
                    <label key={priority.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority.value)}
                        onChange={(e) => {
                          const newPriority = e.target.checked
                            ? [...filters.priority, priority.value]
                            : filters.priority.filter(
                                (p) => p !== priority.value
                              );
                          handleFilterChange("priority", newPriority);
                        }}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">
                        {priority.icon} {priority.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {projects.map((project) => (
                    <label key={project.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.project.includes(project.id)}
                        onChange={(e) => {
                          const newProject = e.target.checked
                            ? [...filters.project, project.id]
                            : filters.project.filter((p) => p !== project.id);
                          handleFilterChange("project", newProject);
                        }}
                        className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-slate-700">
                        {project.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Created Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) =>
                      handleFilterChange("dateRange", {
                        ...filters.dateRange,
                        start: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) =>
                      handleFilterChange("dateRange", {
                        ...filters.dateRange,
                        end: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Special Filters */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special Filters
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.overdue}
                      onChange={(e) =>
                        handleFilterChange("overdue", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Show only overdue tasks
                    </span>
                  </label>

                  <select
                    value={filters.completedOnTime}
                    onChange={(e) =>
                      handleFilterChange("completedOnTime", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {COMPLETION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium">{sortedTasks.length}</span>{" "}
              of <span className="font-medium">{processedTasks.length}</span>{" "}
              tasks
            </p>
            {(filters.status.length > 0 ||
              filters.priority.length > 0 ||
              filters.project.length > 0 ||
              filters.search) && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Clear filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="title">Task</SortButton>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="project">Project</SortButton>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="status">Status</SortButton>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="priority">Priority</SortButton>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="createdAt">Created</SortButton>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="dueDate">Due Date</SortButton>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="completedAt">Completed</SortButton>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="timeToComplete">
                        Time to Complete
                      </SortButton>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <SortButton field="daysUntilDue">Status</SortButton>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {sortedTasks.map((task) => {
                    const statusOption = STATUS_OPTIONS.find(
                      (s) => s.value === task.status
                    );
                    const priorityOption = PRIORITY_OPTIONS.find(
                      (p) => p.value === task.priority
                    );

                    return (
                      <tr
                        key={task.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="text-sm text-slate-500 truncate max-w-xs">
                                {task.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FolderOpen className="w-4 h-4 text-slate-400 mr-2" />
                            <span className="text-sm text-slate-900">
                              {task.project.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusOption?.color}`}
                          >
                            {statusOption?.icon} {statusOption?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityOption?.color}`}
                          >
                            {priorityOption?.icon} {priorityOption?.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {task.created.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {task.due ? (
                            <div
                              className={`${
                                task.isOverdue ? "text-red-600" : ""
                              }`}
                            >
                              {task.due.toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {task.completed ? (
                            <div
                              className={`${
                                task.completedOnTime === false
                                  ? "text-red-600"
                                  : task.completedOnTime === true
                                  ? "text-green-600"
                                  : ""
                              }`}
                            >
                              {task.completed.toLocaleDateString()}
                              {task.completedOnTime === true && " ✅"}
                              {task.completedOnTime === false && " ⚠️"}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {task.timeToCompleteText}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {task.isOverdue ? (
                            <span className="text-red-600 font-medium">
                              {task.daysUntilDueText}
                            </span>
                          ) : task.daysUntilDue !== null ? (
                            <span
                              className={`${
                                task.daysUntilDue <= 1
                                  ? "text-amber-600"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.daysUntilDueText}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {sortedTasks.length === 0 && (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-slate-600">
                  {filters.search ||
                  filters.status.length > 0 ||
                  filters.priority.length > 0 ||
                  filters.project.length > 0
                    ? "Try adjusting your filters to see more results."
                    : "Create your first task to get started with reporting."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Card View */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => {
              const statusOption = STATUS_OPTIONS.find(
                (s) => s.value === task.status
              );
              const priorityOption = PRIORITY_OPTIONS.find(
                (p) => p.value === task.priority
              );

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityOption?.color}`}
                      >
                        {priorityOption?.icon}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusOption?.color}`}
                      >
                        {statusOption?.icon}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-slate-600">
                      <FolderOpen className="w-4 h-4 mr-2" />
                      {task.project.name}
                    </div>

                    <div className="flex items-center text-sm text-slate-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Created: {task.created.toLocaleDateString()}
                    </div>

                    {task.due && (
                      <div
                        className={`flex items-center text-sm ${
                          task.isOverdue ? "text-red-600" : "text-slate-600"
                        }`}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Due: {task.due.toLocaleDateString()}
                        {task.isOverdue && " (Overdue)"}
                      </div>
                    )}

                    {task.completed && (
                      <div
                        className={`flex items-center text-sm ${
                          task.completedOnTime === false
                            ? "text-red-600"
                            : task.completedOnTime === true
                            ? "text-green-600"
                            : "text-slate-600"
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed: {task.completed.toLocaleDateString()}
                        {task.completedOnTime === true && " ✅"}
                        {task.completedOnTime === false && " ⚠️"}
                      </div>
                    )}

                    {task.timeToCompleteText !== "-" && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Timer className="w-4 h-4 mr-2" />
                        Time to complete: {task.timeToCompleteText}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sortedTasks.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-slate-600">
                  {filters.search ||
                  filters.status.length > 0 ||
                  filters.priority.length > 0 ||
                  filters.project.length > 0
                    ? "Try adjusting your filters to see more results."
                    : "Create your first task to get started with reporting."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
