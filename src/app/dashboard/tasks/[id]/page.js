'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function TaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  useEffect(() => {
    const fetchTask = async () => {
      const res = await fetch(`/api/tasks?id=${id}`);
      const data = await res.json();
      setTask(data);
    };
    if (id) fetchTask();
  }, [id]);

  if (!task) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{task.title}</h2>

      <p className="mb-2">{task.description || 'No description.'}</p>

      <div className="text-sm text-gray-700 space-y-1">
        <div>Status: <strong>{task.status}</strong></div>
        <div>Priority: <strong>{task.priority}</strong></div>
        <div>Due Date: <strong>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</strong></div>
        <div>Completed At: <strong>{task.completedAt ? new Date(task.completedAt).toLocaleString() : 'Not completed'}</strong></div>
        <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
        <div>Last Updated: {new Date(task.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
}
