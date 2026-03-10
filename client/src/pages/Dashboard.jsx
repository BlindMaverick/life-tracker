import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getDailySummary } from '../api/summary';
import StatCard from '../components/StatCard';
import TaskPerformanceRow from '../components/TaskPerformanceRow';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
    const [summary, setSummary] = useState([]);
    const today = format(new Date(), 'yyyy-MM-dd');
    const displayDate = format(new Date(), 'EEEE, MMMM d yyyy');

    useEffect(() => {
        getDailySummary(today).then(res => setSummary(res.data));
    }, []);

    // ── Derived stats ──────────────────────────────────────────────
    const totalLogged = summary.reduce((s, t) => s + parseFloat(t.hours_logged || 0), 0);
    const totalTarget = summary.reduce((s, t) => s + parseFloat(t.target_hours), 0);
    const tasksMet = summary.filter(t => parseFloat(t.hours_logged) >= parseFloat(t.target_hours)).length;
    const tasksMissed = summary.filter(t => parseFloat(t.hours_logged || 0) < parseFloat(t.target_hours)).length;
    const scorePercent = totalTarget > 0 ? ((totalLogged / totalTarget) * 100).toFixed(0) : 0;

    // ── Score color ────────────────────────────────────────────────
    const scoreColor = scorePercent >= 80 ? 'green' : scorePercent >= 50 ? 'yellow' : 'red';

    // ── Pie chart data (only tasks with hours logged) ──────────────
    const pieData = summary
        .filter(t => parseFloat(t.hours_logged) > 0)
        .map(t => ({ name: t.task_name, value: parseFloat(t.hours_logged), color: t.color }));

    return (
        <div className="space-y-8">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-gray-400 mt-1">📅 {displayDate}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Today's Score"
                    value={`${scorePercent}%`}
                    sub={`${totalLogged.toFixed(1)}h of ${totalTarget.toFixed(1)}h target`}
                    color={scoreColor}
                />
                <StatCard
                    label="Hours Logged"
                    value={`${totalLogged.toFixed(1)}h`}
                    sub="today so far"
                    color="indigo"
                />
                <StatCard
                    label="Tasks Met"
                    value={tasksMet}
                    sub={`of ${summary.length} tasks`}
                    color="green"
                />
                <StatCard
                    label="Tasks Missed"
                    value={tasksMissed}
                    sub="need attention"
                    color={tasksMissed > 0 ? 'red' : 'green'}
                />
            </div>

            {/* Main content — Performance + Pie side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Task Performance */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-200 mb-4">Today's Performance</h3>
                    {summary.length === 0 ? (
                        <p className="text-gray-500 text-sm">No tasks loaded. Go log your hours in the Timesheet!</p>
                    ) : (
                        summary.map(task => (
                            <TaskPerformanceRow key={task.task_name} task={task} />
                        ))
                    )}
                </div>

                {/* Pie Chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-200 mb-4">Time Distribution</h3>
                    {pieData.length === 0 ? (
                        <div className="flex items-center justify-center h-56 text-gray-500 text-sm">
                            No hours logged yet today.
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`${value}h`, '']}
                                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                />
                                <Legend
                                    formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}