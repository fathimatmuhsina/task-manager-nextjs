'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ totalUsers: 0, totalProjects: 0, totalTasks: 0 });

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [session, router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 right-4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="text-center p-10 bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl max-w-4xl w-full border border-white/20 relative z-10 transform transition-all duration-500 hover:shadow-3xl">
        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent leading-tight">
            Task Flow
          </h1>
          <p className="text-gray-600 mb-8 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            Transform your productivity. Stay organized. 
            <span className="block text-indigo-600 font-medium mt-2">Achieve excellence, one task at a time.</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard label="Active Users" count={stats.totalUsers} icon="👥" color="from-blue-500 to-blue-600" />
          <StatCard label="Projects" count={stats.totalProjects} icon="📁" color="from-indigo-500 to-indigo-600" />
          <StatCard label="Tasks Completed" count={stats.totalTasks} icon="✅" color="from-purple-500 to-purple-600" />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.push('/auth/signin')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 min-w-[140px]"
          >
            <span className="relative z-10">Sign In</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl"></div>
          </button>
          
          <button
            onClick={() => router.push('/auth/signup')}
            className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 min-w-[140px]"
          >
            Get Started
            <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm mb-4 font-medium">Trusted by teams worldwide</p>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, count, icon, color }) {
  return (
    <div className="group relative overflow-hidden bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-white/40">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          <div className={`w-3 h-3 bg-gradient-to-r ${color} rounded-full shadow-sm`}></div>
        </div>
        
        <div className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 group-hover:scale-105 transition-transform duration-200">
          {count.toLocaleString()}
        </div>
        
        <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
}