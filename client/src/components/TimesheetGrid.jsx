import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { format, addWeeks, subWeeks } from 'date-fns';
import { getWeekStart, getWeekDays } from '../utils/dateUtils';
import { getTasks } from '../api/tasks';
import { getWeeklyEntries, upsertEntry } from '../api/entries';

export default function TimesheetGrid() {
    const [weekStart, setWeekStart] = useState(getWeekStart());
    const [tasks, setTasks] = useState([]);
    const [entries, setEntries] = useState({}); // { "date_taskId": hours }
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const weekDays = getWeekDays(weekStart);

    // ─── Load tasks ───────────────────────────────────────────────
    useEffect(() => {
        getTasks().then(res => setTasks(res.data));
    }, []);

    // ─── Load entries when week changes ───────────────────────────
    useEffect(() => {
        const weekStartStr = format(weekStart, 'yyyy-MM-dd');
        getWeeklyEntries(weekStartStr).then(res => {
            const map = {};
            res.data.forEach(entry => {
                map[`${entry.entry_date.split('T')[0]}_${entry.task_id}`] = entry.hours_logged;
            });
            setEntries(map);
        });
    }, [weekStart]);

    // ─── Cell value helpers ────────────────────────────────────────
    const getCellValue = (date, taskId) => entries[`${date}_${taskId}`] ?? '';

    const handleCellChange = (date, taskId, value) => {
        setEntries(prev => ({ ...prev, [`${date}_${taskId}`]: value }));
    };

    // ─── Cell color based on target ───────────────────────────────
    const getCellColor = (date, task) => {
        const val = parseFloat(getCellValue(date, task.id));
        if (isNaN(val) || val === 0) return 'bg-gray-800 border-gray-700';
        if (val >= parseFloat(task.target_hours)) return 'bg-green-900 border-green-600';
        if (val >= parseFloat(task.target_hours) * 0.5) return 'bg-yellow-900 border-yellow-600';
        return 'bg-red-900 border-red-600';
    };

    // ─── Save all entries ──────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        const promises = [];

        weekDays.forEach(({ date }) => {
            tasks.forEach(task => {
                const val = getCellValue(date, task.id);
                if (val !== '' && val !== undefined) {
                    promises.push(
                        upsertEntry({
                            task_id: task.id,
                            entry_date: date,
                            hours_logged: parseFloat(val) || 0,
                        })
                    );
                }
            });
        });

        await Promise.all(promises);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    // ─── Week navigation ──────────────────────────────────────────
    const prevWeek = () => setWeekStart(subWeeks(weekStart, 1));
    const nextWeek = () => setWeekStart(addWeeks(weekStart, 1));

    // ─── Daily total ──────────────────────────────────────────────
    const getDayTotal = (date) => {
        return tasks.reduce((sum, task) => {
            const val = parseFloat(getCellValue(date, task.id)) || 0;
            return sum + val;
        }, 0).toFixed(1);
    };

    return (
        <div className="space-y-4">

            {/* Week Navigator */}
            <div className="flex items-center justify-between">
                <button onClick={prevWeek} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                    <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-medium text-gray-300">
                    Week of {format(weekStart, 'MMM d, yyyy')}
                </span>
                <button onClick={nextWeek} className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Legend */}
            <div className="flex gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-700 inline-block" /> Met target</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-700 inline-block" /> 50–99%</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-700 inline-block" /> Below 50%</span>
            </div>

            {/* Grid */}
            <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-800">
                            <th className="px-4 py-3 text-left text-gray-400 font-medium w-32">Day</th>
                            {tasks.map(task => (
                                <th key={task.id} className="px-3 py-3 text-center min-w-28">
                                    <div className="font-semibold text-white">{task.task_code}</div>
                                    <div className="text-xs text-gray-400 truncate max-w-24 mx-auto">{task.task_name}</div>
                                    <div className="text-xs text-indigo-400">Target: {task.target_hours}h</div>
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-gray-400 font-medium">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {weekDays.map(({ date, label }, i) => (
                            <tr key={date} className={i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'}>
                                <td className="px-4 py-2 text-gray-300 font-medium whitespace-nowrap">{label}</td>
                                {tasks.map(task => (
                                    <td key={task.id} className="px-2 py-2 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="24"
                                            step="0.5"
                                            value={getCellValue(date, task.id)}
                                            onChange={e => handleCellChange(date, task.id, e.target.value)}
                                            className={`w-20 px-2 py-1.5 text-center rounded-lg border text-sm font-medium
                        focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
                        ${getCellColor(date, task)}`}
                                            placeholder="0"
                                        />
                                    </td>
                                ))}
                                <td className="px-4 py-2 text-center font-bold text-indigo-300">
                                    {getDayTotal(date)}h
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500
            disabled:opacity-50 rounded-lg font-medium transition-colors"
                >
                    <Save size={16} />
                    {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Timesheet'}
                </button>
            </div>
        </div>
    );
}