import React from 'react'
import LogoutButton from "@/components/LogoutButton";

import { 
  Briefcase,
} from "lucide-react";

const Navbar = () => {
  return (
    <div>
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  TaskFlow
                </h1>
                <p className="text-xs text-slate-500 font-medium">Task Management</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
    </div>
  )
}

export default Navbar
