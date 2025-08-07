// src/components/TaskModal.js
'use client';

export default function TaskModal({ task, onClose }) {
  if (!task) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'bg-yellow-100 text-yellow-700';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'LOW': return 'bg-green-200 text-green-800';
      case 'MEDIUM': return 'bg-yellow-200 text-yellow-800';
      case 'HIGH': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Task Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-sm">✖</button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-gray-600 text-sm">Title</label>
            <p className="font-medium">{task.title}</p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Description</label>
            <p className="text-gray-700">{task.description || 'No description provided'}</p>
          </div>

          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority || 'No Priority'}
            </span>
          </div>

          {task.dueDate && (
            <div className="text-sm text-gray-600">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
