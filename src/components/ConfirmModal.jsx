"use client";

import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmButtonClass = "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white",
  cancelButtonClass = "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-200 border-0">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 group"
          >
            <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed text-base">{message}</p>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6">
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-200 ${cancelButtonClass}`}
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-200 shadow-lg hover:shadow-xl ${confirmButtonClass}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}