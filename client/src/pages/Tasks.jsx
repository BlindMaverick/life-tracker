import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import TaskModal from '../components/TaskModal';

const CATEGORY_COLORS = {
    Work: 'bg-blue-900 text-blue-300',
    Growth: 'bg-purple-900 text-purple-300',
    Health: 'bg-green-900 text-green-300',
    Personal: 'bg-pink-900 text-pink-300',
};

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const loadTasks = () => {
        getTasks().then(res => setTasks(res.data));
    };

    useEffect(() => { loadTasks(); }, []);

    const handleSave = async (form) => {
        if (editingTask) {
            await updateTask(editingTask.id, form);
        } else {
            await createTask(form);
        }
        loadTasks();
        setEditingTask(null);
    };

    const handleEdit = (task) => {
        setEditingTask(task);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm('Deactivate this task? Your logged history will be preserved.')) {
            await deleteTask(id);
            loadTasks();
        }
    };

    const handleAdd = () => {
        setEditingTask(null);
        setModalOpen(true);
    };

    // Group tasks by category
    const grouped = tasks.reduce((acc, task) => {
        acc[task.category] = acc[task.category] || [];
        acc[task.category].push(task);
        return acc;
    }, {});

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">Task Manager</h2>
                    <p className="text-gray-400 mt-1">Manage your task codes, targets, and categories.</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500
            rounded-lg text-sm font-medium transition"
                >
                    <Plus size={16} /> New Task
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {['Work', 'Growth', 'Health', 'Personal'].map(cat => (
                    <div key={cat} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">{cat}</p>
                        <p className="text-2xl font-bold">{(grouped[cat] || []).length}</p>
                        <p className="text-xs text-gray-500">tasks</p>
                    </div>
                ))}
            </div>

            {/* Task Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-800 text-gray-400">
                            <th className="px-5 py-3 text-left">Code</th>
                            <th className="px-5 py-3 text-left">Task Name</th>
                            <th className="px-5 py-3 text-left">Category</th>
                            <th className="px-5 py-3 text-center">Daily Target</th>
                            <th className="px-5 py-3 text-center">Color</th>
                            <th className="px-5 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((task, i) => (
                            <tr
                                key={task.id}
                                className={`border-t border-gray-800 hover:bg-gray-800/50 transition
                  ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}`}
                            >
                                {/* Code */}
                                <td className="px-5 py-3">
                                    <span className="flex items-center gap-2 font-mono font-semibold text-indigo-300">
                                        <Tag size={13} /> {task.task_code}
                                    </span>
                                </td>

                                {/* Name */}
                                <td className="px-5 py-3 font-medium">{task.task_name}</td>

                                {/* Category Badge */}
                                <td className="px-5 py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                    ${CATEGORY_COLORS[task.category] || 'bg-gray-700 text-gray-300'}`}>
                                        {task.category}
                                    </span>
                                </td>

                                {/* Target */}
                                <td className="px-5 py-3 text-center font-medium text-indigo-300">
                                    {task.target_hours}h / day
                                </td>

                                {/* Color swatch */}
                                <td className="px-5 py-3 text-center">
                                    <span
                                        className="inline-block w-5 h-5 rounded-full border border-gray-600"
                                        style={{ backgroundColor: task.color }}
                                    />
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleEdit(task)}
                                            className="p-1.5 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:text-white"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(task.id)}
                                            className="p-1.5 hover:bg-red-900 rounded-lg transition text-gray-400 hover:text-red-400"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tasks.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                        No tasks yet. Click <span className="text-indigo-400">New Task</span> to add one.
                    </div>
                )}
            </div>

            {/* Modal */}
            <TaskModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                editingTask={editingTask}
            />
        </div>
    );
}