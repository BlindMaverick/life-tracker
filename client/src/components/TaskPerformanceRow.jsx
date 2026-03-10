export default function TaskPerformanceRow({ task }) {
    const logged = parseFloat(task.hours_logged) || 0;
    const target = parseFloat(task.target_hours);
    const pct = Math.min((logged / target) * 100, 100).toFixed(0);
    const missed = Math.max(target - logged, 0).toFixed(1);

    const getStatus = () => {
        if (logged >= target) return { label: 'Met', color: 'text-green-400', bar: 'bg-green-500' };
        if (logged >= target * 0.5) return { label: 'Partial', color: 'text-yellow-400', bar: 'bg-yellow-500' };
        return { label: 'Missed', color: 'text-red-400', bar: 'bg-red-500' };
    };

    const status = getStatus();

    return (
        <div className="flex items-center gap-4 py-3 border-b border-gray-800 last:border-0">
            {/* Color dot + name */}
            <div className="flex items-center gap-2 w-44 shrink-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: task.color }} />
                <span className="text-sm font-medium truncate">{task.task_name}</span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div
                    className={`h-2 rounded-full transition-all ${status.bar}`}
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Hours */}
            <div className="text-sm text-gray-400 w-24 text-right shrink-0">
                {logged}h / {target}h
            </div>

            {/* Status badge */}
            <div className={`text-xs font-semibold w-14 text-right shrink-0 ${status.color}`}>
                {status.label}
            </div>

            {/* Missed */}
            {missed > 0 && (
                <div className="text-xs text-gray-500 w-20 text-right shrink-0">
                    -{missed}h
                </div>
            )}
        </div>
    );
}