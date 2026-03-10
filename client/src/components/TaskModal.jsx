import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = ['Work', 'Growth', 'Health', 'Personal'];

const COLORS = [
    '#6366f1', '#3b82f6', '#8b5cf6', '#a855f7',
    '#f59e0b', '#22c55e', '#06b6d4', '#ec4899',
    '#f97316', '#14b8a6'
];

const DEFAULT_FORM = {
    task_code: '',
    task_name: '',
    category: 'Growth',
    target_hours: '',
    color: '#6366f1',
};

export default function TaskModal({ open, onClose, onSave, editingTask }) {
    const [form, setForm] = useState(DEFAULT_FORM);

    // Populate form when editing
    useEffect(() => {
        if (editingTask) setForm(editingTask);
        else setForm(DEFAULT_FORM);
    }, [editingTask]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!form.task_code || !form.task_name || !form.target_hours) {
            alert('Please fill in all required fields.');
            return;
        }
        onSave(form);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">
                        {editingTask ? 'Edit Task' : 'Add New Task'}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded-lg transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">

                    {/* Task Code */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Task Code <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.task_code}
                            onChange={e => handleChange('task_code', e.target.value.toUpperCase())}
                            disabled={!!editingTask}
                            placeholder="e.g. ML002"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        />
                    </div>

                    {/* Task Name */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Task Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.task_name}
                            onChange={e => handleChange('task_name', e.target.value)}
                            placeholder="e.g. AI/ML Learning"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Category</label>
                        <select
                            value={form.category}
                            onChange={e => handleChange('category', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    {/* Target Hours */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">
                            Daily Target (hours) <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            min="0.25"
                            max="24"
                            step="0.25"
                            value={form.target_hours}
                            onChange={e => handleChange('target_hours', e.target.value)}
                            placeholder="e.g. 2.0"
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Color Picker */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Chart Color</label>
                        <div className="flex gap-2 flex-wrap">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleChange('color', color)}
                                    className={`w-7 h-7 rounded-full border-2 transition
                    ${form.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition"
                    >
                        {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
}