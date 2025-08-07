'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react'


export default function Layout({ children }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Time Tracking', href: '/time-tracking', icon: Clock },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-semibold text-gray-900">TaskManager</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 rounded text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-gray-600 rounded"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1" />
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}