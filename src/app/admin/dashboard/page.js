'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/dashboard/Navbar';
import {
  Users,
  FolderOpen,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  UserCheck,
  Shield,
  Activity,
  Calendar,
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchData();
    }
  }, [session, status]);

  async function fetchData() {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch admin data');
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Admin Dashboard Error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter and sort users
  const getFilteredAndSortedUsers = () => {
    if (!data?.users) return [];

    let filtered = data.users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'ALL' || user.role === filterRole;
      return matchesSearch && matchesRole;
    });

    // Add computed fields for sorting
    filtered = filtered.map(user => ({
      ...user,
      projectCount: user.projects?.length || 0,
      taskCount: user.projects?.reduce((acc, project) => acc + (project.tasks?.length || 0), 0) || 0,
    }));

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Calculate statistics
  const getStatistics = () => {
    if (!data?.users) return { totalUsers: 0, adminUsers: 0, totalProjects: 0, totalTasks: 0 };

    const totalUsers = data.users.length;
    const adminUsers = data.users.filter(user => user.role === 'ADMIN').length;
    const totalProjects = data.users.reduce((acc, user) => acc + (user.projects?.length || 0), 0);
    const totalTasks = data.users.reduce((acc, user) => 
      acc + user.projects?.reduce((taskAcc, project) => taskAcc + (project.tasks?.length || 0), 0) || 0, 0
    );

    return { totalUsers, adminUsers, totalProjects, totalTasks };
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div className="text-xl text-slate-600">Loading admin dashboard...</div>
        </div>
      </main>
    );
  }

  const filteredUsers = getFilteredAndSortedUsers();
  const stats = getStatistics();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Monitor users, projects, and system activity from this comprehensive admin interface
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Admin Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.adminUsers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Projects</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProjects}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FolderOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalTasks}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <ClipboardList className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border-0">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-2 text-slate-800 mb-2">
              <Filter className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Filters & Search</h3>
            </div>
            <p className="text-sm text-slate-600">
              Find and organize users with advanced filtering options
            </p>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                />
              </div>

              {/* Role Filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 w-full sm:w-48"
              >
                <option value="ALL">All Roles</option>
                <option value="USER">Users</option>
                <option value="ADMIN">Admins</option>
              </select>

              {/* Sort Options */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSort('name')}
                  className={`px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 ${
                    sortField === 'name' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  Name
                  {sortField === 'name' && (
                    sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => toggleSort('role')}
                  className={`px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 ${
                    sortField === 'role' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  Role
                  {sortField === 'role' && (
                    sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => toggleSort('projectCount')}
                  className={`px-4 py-2 border border-slate-200 rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 ${
                    sortField === 'projectCount' ? 'bg-blue-100 border-blue-300 text-blue-700' : 'text-slate-700'
                  }`}
                >
                  Projects
                  {sortField === 'projectCount' && (
                    sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border-0">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-3 text-slate-800 mb-2">
              <Users className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-semibold">Users ({filteredUsers.length})</h3>
            </div>
            <p className="text-sm text-slate-600">
              Detailed view of all system users and their associated projects
            </p>
          </div>
          
          <div className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Users className="mx-auto h-12 w-12 text-slate-300" />
                <h3 className="mt-4 text-lg font-medium text-slate-600">No users found</h3>
                <p className="mt-2 text-slate-500">
                  {searchTerm || filterRole !== 'ALL' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No users available in the system'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="p-6 hover:bg-slate-50/50 transition-all duration-200"
                  >
                    <button
                      onClick={() =>
                        setExpandedUser(expandedUser === index ? null : index)
                      }
                      className="flex justify-between w-full text-left items-center group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {user.name || 'No Name'}
                            </p>
                            <span 
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.role === 'ADMIN' 
                                  ? 'bg-purple-100 text-purple-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{user.email}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <FolderOpen className="h-3 w-3" />
                              {user.projectCount || 0} projects
                            </span>
                            <span className="flex items-center gap-1">
                              <ClipboardList className="h-3 w-3" />
                              {user.taskCount || 0} tasks
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                        {expandedUser === index ? 
                          <ChevronUp className="h-5 w-5" /> : 
                          <ChevronDown className="h-5 w-5" />
                        }
                      </div>
                    </button>

                    {expandedUser === index && (
                      <div className="mt-6 ml-16 space-y-6 animate-in slide-in-from-top-2 duration-300">
                        <div className="h-px bg-slate-200"></div>
                        
                        {/* Projects */}
                        <div>
                          <div className="flex items-center gap-2 text-slate-700 font-medium mb-4">
                            <FolderOpen className="h-5 w-5 text-blue-500" />
                            Projects ({user.projects?.length || 0})
                          </div>
                          
                          {(!user.projects || user.projects.length === 0) ? (
                            <div className="text-center py-8 px-4 bg-slate-50 rounded-lg">
                              <FolderOpen className="mx-auto h-8 w-8 text-slate-300" />
                              <p className="mt-2 text-sm text-slate-500">No projects created yet</p>
                            </div>
                          ) : (
                            <div className="grid gap-4">
                              {user.projects.map((project, pIndex) => (
                                <div key={project.id} className="border border-slate-200 rounded-lg p-4 bg-white/50">
                                  <button
                                    className="flex items-center justify-between w-full text-left group"
                                    onClick={() =>
                                      setExpandedProject(
                                        expandedProject === `${index}-${pIndex}`
                                          ? null
                                          : `${index}-${pIndex}`
                                      )
                                    }
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <FolderOpen className="h-4 w-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <h4 className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">
                                          {project.name}
                                        </h4>
                                        <p className="text-xs text-slate-500">
                                          {project.tasks?.length || 0} tasks
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                                      {expandedProject === `${index}-${pIndex}` ? 
                                        <ChevronUp className="h-4 w-4" /> : 
                                        <ChevronDown className="h-4 w-4" />
                                      }
                                    </div>
                                  </button>

                                  {expandedProject === `${index}-${pIndex}` && (
                                    <div className="mt-4 pl-11 space-y-3">
                                      {(!project.tasks || project.tasks.length === 0) ? (
                                        <div className="text-center py-6 px-4 bg-slate-50 rounded-lg">
                                          <ClipboardList className="mx-auto h-6 w-6 text-slate-300" />
                                          <p className="mt-2 text-sm text-slate-500">No tasks in this project</p>
                                        </div>
                                      ) : (
                                        project.tasks.map((task) => (
                                          <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100">
                                            <ClipboardList className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <div className="flex-1">
                                              <p className="font-medium text-slate-800">{task.title}</p>
                                            </div>
                                            <span 
                                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                              }`}
                                            >
                                              {task.status.replace('_', ' ')}
                                            </span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}