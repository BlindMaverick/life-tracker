export default function StatCard({ label, value, sub, color = 'indigo' }) {
    const colorMap = {
        indigo: 'border-indigo-500 text-indigo-400',
        green: 'border-green-500 text-green-400',
        red: 'border-red-500 text-red-400',
        yellow: 'border-yellow-500 text-yellow-400',
    };

    return (
        <div className={`bg-gray-900 border border-gray-800 border-l-4 ${colorMap[color]} rounded-xl p-5`}>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${colorMap[color].split(' ')[1]}`}>{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
    );
}