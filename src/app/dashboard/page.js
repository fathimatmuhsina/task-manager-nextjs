import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import Navbar from "@/components/dashboard/Navbar";
import { 
  CheckCircle, 
  FolderOpen, 
  Plus, 
  Target,
  BarChart3,
  Settings,
  Activity,
  Users,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user?.email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
            Welcome Back
          </h2>
          <p className="text-slate-600 mb-8 text-lg">Please log in to access your dashboard</p>
          <Link 
            href="/auth/signin" 
            className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Sign In
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

 // Fetch user with all tasks and projects for stats
 const user = await prisma.user.findUnique({
  where: { email: session.user.email },
  include: {
    tasks: {
      include: { project: true },
    },
    projects: {
      include: { tasks: true },
    },
  },
});

// Fetch recent 5 tasks
const recentTasks = await prisma.task.findMany({
  where: { userId: user?.id },
  include: { project: true },
  orderBy: { createdAt: "desc" },
  take: 5,
});

// Fetch recent 5 projects
const recentProjects = await prisma.project.findMany({
  where: { userId: user?.id },
  include: { tasks: true },
  orderBy: { createdAt: "desc" },
  take: 5,
});

if (!user) {
  return <div>User not found</div>;
}

const completedTasks = user.tasks.filter(task => task.status === 'COMPLETED').length;
const totalTasks = user.tasks.length;
const totalProjects = user.projects.length; // Add this for stats
const activeProjects = user.projects.filter(project => project.status === 'ACTIVE').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm';
      case 'IN_PROGRESS': return 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm';
      case 'TODO': return 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 shadow-sm';
    }
  };

  const navigationItems = [
    { href: '/dashboard/tasks', label: 'Tasks', icon: CheckCircle, color: 'from-blue-500 to-indigo-600', description: 'Manage your tasks', accent: 'bg-blue-50' },
    { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen, color: 'from-emerald-500 to-teal-600', description: 'View all projects', accent: 'bg-emerald-50' },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart3, color: 'from-orange-500 to-red-600', description: 'View analytics', accent: 'bg-orange-50' },
    { href: '/dashboard/profile', label: 'Profile', icon: Settings, color: 'from-slate-500 to-slate-700', description: 'Account settings', accent: 'bg-slate-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50">
      {/* Header */}
      <Navbar/>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-500" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
              Welcome back, {user?.name || "User"}!
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
            Here's what's happening with your projects today. Let's make it productive! 🚀
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Tasks</p>
                <p className="text-4xl font-bold text-slate-900 mb-1">{totalTasks}</p>
                <p className="text-sm text-slate-600">All time</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Completed</p>
                <p className="text-4xl font-bold text-slate-900 mb-1">{completedTasks}</p>
                <p className="text-sm text-emerald-600 font-medium">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% complete
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Active Projects</p>
                <p className="text-4xl font-bold text-slate-900 mb-1">{activeProjects}</p>
                <p className="text-sm text-slate-600">In progress</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* First-Time Tips */}
        {user.tasks.length === 0 && user.projects.length === 0 && (
          <div className="mb-12 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-8 shadow-lg">
            <div className="flex items-start space-x-6">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-amber-900 mb-3 flex items-center">
                  🚀 Let's get you started!
                </h3>
                <p className="text-amber-800 mb-6 text-lg leading-relaxed">
                  Welcome to TaskFlow! Here are a few quick steps to set up your workspace and begin your productivity journey:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Link href="/dashboard/projects" className="group flex items-center p-4 bg-white/60 rounded-xl border border-amber-200 text-amber-700 hover:text-amber-900 hover:bg-white/80 transition-all duration-200">
                    <FolderOpen className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Start your first project</span>
                  </Link>
                  <Link href="/dashboard/tasks/new" className="group flex items-center p-4 bg-white/60 rounded-xl border border-amber-200 text-amber-700 hover:text-amber-900 hover:bg-white/80 transition-all duration-200">
                    <Plus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add your first task</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Quick Actions</h2>
              <p className="text-slate-600">Jump into your most common tasks</p>
            </div>
            <Link 
              href="/dashboard/tasks/new" 
              className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Add New Task
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group">
                  <div className={`${item.accent} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-white/50`}>
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          {/* Recent Tasks */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Recent Tasks</h2>
                <p className="text-slate-600">Your latest work items</p>
              </div>
              <Link href="/dashboard/tasks" className="group text-indigo-600 hover:text-indigo-700 font-semibold flex items-center">
                View all
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              {recentTasks.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">No tasks yet</h3>
                  <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">
                    Ready to be productive? Create your first task to get started on your journey.
                  </p>
                  <Link 
                    href="/dashboard/tasks/new"
                    className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Add Task
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentTasks.map((task, index) => (
                    <div key={task.id} className="group p-6 hover:bg-slate-50/50 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-lg">
                          {task.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600">
                        {task.project && (
                          <div className="flex items-center bg-slate-100 px-3 py-1 rounded-full">
                            <FolderOpen className="w-4 h-4 mr-2" />
                            <span className="font-medium">{task.project.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Projects Overview */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Projects</h2>
                <p className="text-slate-600">Your active workspaces</p>
              </div>
              <Link href="/dashboard/projects" className="group text-indigo-600 hover:text-indigo-700 font-semibold flex items-center">
                View all
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="space-y-6">
              {recentProjects.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-12 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FolderOpen className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">No projects yet</h3>
                  <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">
                    Start organizing your work with projects to keep everything structured and focused.
                  </p>
                  <Link 
                    href="/dashboard/projects"
                    className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Create Project
                  </Link>
                </div>
              ) : (
                recentProjects.slice(0, 3).map((project, index) => (
                  <div key={project.id} className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {project.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{project.tasks.length} tasks</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}