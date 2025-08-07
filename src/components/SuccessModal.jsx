"use client";

import { CheckCircle, X, Sparkles } from 'lucide-react';

export default function SuccessModal({ 
  title = "Success!",
  message = "Operation completed successfully", 
  buttonText = "Continue",
  onClose 
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-200 border-0 overflow-hidden">
        {/* Decorative top border */}
        <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
        
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </button>
          
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <p className="text-gray-600 leading-relaxed text-base">{message}</p>
        </div>

        {/* Decorative elements */}
        <div className="px-6 pb-2">
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <button
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-200 shadow-lg hover:shadow-xl"
            onClick={onClose}
          >
            {buttonText}
          </button>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-50 to-transparent rounded-full translate-y-12 -translate-x-12 opacity-50"></div>
      </div>
    </div>
  );
}