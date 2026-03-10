import { useState, useEffect } from 'react';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { getDailySummary } from '../api/summary';
import { getWeeklySummary, getBiweeklyTrend } from '../api/summary';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';

const TOOLTIP_STYLE = {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#f9fafb',
};

export default function Analytics() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const biweekStart = format(startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [biweeklyData, setBiweeklyData] = useState([]);
    const [taskNames, setTaskNames] = useState([]);

    useEffect(() => {
        // Pie chart — today
        getDailySummary(today).then(res => {
            setDailyData(
                res.data
                    .filter(t => parseFloat(t.hours_logged) > 0)
                    .map(t => ({ name: t.task_name, value: parseFloat(t.hours_logged), color: t.color }))
            );
        });

        // Bar chart — this week
        getWeeklySummary(weekStart).then(res => {
            const tasks = [...new Set(res.data.map(r => r.task_name))];
            setTaskNames(tasks);

            // Group by date
            const byDate = {};
            res.data.forEach(row => {
                const d = row.entry_date.split('T')[0];
                if (!byDate[d]) byDate[d] = { date: format(new Date(d + 'T00:00:00'), 'EEE') };
                byDate[d][row.task_name] = parseFloat(row.total_hours);
            });
            setWeeklyData(Object.values(byDate));
        });

        // Trend line — last 2 weeks
        getBiweeklyTrend(biweekStart).then(res => {
            const tasks = [...new Set(res.data.map(r => r.task_name))];
            setTaskNames(prev => [...new Set([...prev, ...tasks])]);

            const byDate = {};
            res.data.forEach(row => {
                const d = row.entry_date.split('T')[0];
                if (!byDate[d]) byDate[d] = { date: format(new Date(d + 'T00:00:00'), 'MMM d') };
                byDate[d][row.task_name] = parseFloat(row.total_hours);
            });
            setBiweeklyData(Object.values(byDate));
        });
    }, []);

    // Build a color map from daily data for chart lines/bars
    const colorMap = {};
    dailyData.forEach(d => { colorMap[d.name] = d.color; });

    return (
        <div className="space-y-10 max-w-5xl">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Analytics</h2>
                <p className="text-gray-400 mt-1">Visualize your time patterns and trends.</p>
            </div>

            {/* ── Chart 1: Daily Pie ───────────────────────────────── */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-200 mb-1">📊 Today's Time Distribution</h3>
                <p className="text-xs text-gray-500 mb-6">Where did your time go today?</p>

                {dailyData.length === 0 ? (
                    <div className="flex items-center justify-center h-56 text-gray-500 text-sm">
                        No hours logged today. Fill in your timesheet first!
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={dailyData}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={110}
                                paddingAngle={3}
                                dataKey="value"
                                label={({ name, value }) => `${name} (${value}h)`}
                                labelLine={false}
                            >
                                {dailyData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`${value}h`, '']}
                                contentStyle={TOOLTIP_STYLE}
                            />
                            <Legend
                                formatter={(value) => (
                                    <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── Chart 2: Weekly Bar ──────────────────────────────── */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-200 mb-1">📊 This Week's Breakdown</h3>
                <p className="text-xs text-gray-500 mb-6">Hours per task across each day this week.</p>

                {weeklyData.length === 0 ? (
                    <div className="flex items-center justify-center h-56 text-gray-500 text-sm">
                        No entries this week yet.
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} unit="h" />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                formatter={(value) => [`${value}h`, '']}
                            />
                            <Legend
                                formatter={(value) => (
                                    <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>
                                )}
                            />
                            {taskNames.map(name => (
                                <Bar
                                    key={name}
                                    dataKey={name}
                                    stackId="a"
                                    fill={colorMap[name] || '#6366f1'}
                                    radius={[2, 2, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* ── Chart 3: Bi-weekly Trend ─────────────────────────── */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-gray-200 mb-1">📈 2-Week Trend</h3>
                <p className="text-xs text-gray-500 mb-6">
                    Are you improving? Track consistency over the last 14 days.
                </p>

                {biweeklyData.length === 0 ? (
                    <div className="flex items-center justify-center h-56 text-gray-500 text-sm">
                        Not enough data yet. Keep logging daily for 2 weeks!
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={biweeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} unit="h" />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                formatter={(value) => [`${value}h`, '']}
                            />
                            <Legend
                                formatter={(value) => (
                                    <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>
                                )}
                            />
                            {taskNames.map(name => (
                                <Line
                                    key={name}
                                    type="monotone"
                                    dataKey={name}
                                    stroke={colorMap[name] || '#6366f1'}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

        </div>
    );
}