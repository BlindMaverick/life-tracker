import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getReflection, upsertReflection } from '../api/reflections';
import { getDailySummary } from '../api/summary';
import { Save, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react';

export default function Reflection() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const displayDate = format(new Date(), 'EEEE, MMMM d yyyy');

    const [summary, setSummary] = useState([]);
    const [reflection, setReflection] = useState(null);
    const [whatWentWell, setWhatWentWell] = useState('');
    const [whatWasMissed, setWhatWasMissed] = useState('');
    const [planTomorrow, setPlanTomorrow] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // ── Load today's summary + existing reflection ─────────────────
    useEffect(() => {
        getDailySummary(today).then(res => setSummary(res.data));
        getReflection(today).then(res => {
            if (res.data) {
                setReflection(res.data);
                setWhatWentWell(res.data.what_went_well || '');
                setWhatWasMissed(res.data.what_was_missed || '');
                setPlanTomorrow(res.data.plan_for_tomorrow || '');
            }
        });
    }, []);

    // ── Compute suggestions from summary ──────────────────────────
    const suggestions = summary
        .filter(t => {
            const missed = parseFloat(t.target_hours) - parseFloat(t.hours_logged || 0);
            return missed > 0.25;
        })
        .map(t => ({
            task_name: t.task_name,
            missed: (parseFloat(t.target_hours) - parseFloat(t.hours_logged || 0)).toFixed(1),
            color: t.color,
        }))
        .sort((a, b) => b.missed - a.missed);

    // ── Tasks that hit target ──────────────────────────────────────
    const wins = summary.filter(
        t => parseFloat(t.hours_logged || 0) >= parseFloat(t.target_hours)
    );

    // ── Save reflection ────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        await upsertReflection({
            reflection_date: today,
            what_went_well: whatWentWell,
            what_was_missed: whatWasMissed,
            plan_for_tomorrow: planTomorrow,
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="space-y-8 max-w-4xl">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold">Daily Reflection</h2>
                <p className="text-gray-400 mt-1">📅 {displayDate}</p>
            </div>

            {/* Auto Suggestions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={18} className="text-yellow-400" />
                    <h3 className="font-semibold text-gray-200">Auto Suggestions for Tomorrow</h3>
                </div>

                {suggestions.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                        <CheckCircle size={16} />
                        You hit all your targets today. Amazing work! 🎉
                    </div>
                ) : (
                    <div className="space-y-3">
                        {suggestions.map((s, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                            >
                                <AlertCircle size={16} className="text-red-400 shrink-0" />
                                <span
                                    className="w-3 h-3 rounded-full shrink-0"
                                    style={{ backgroundColor: s.color }}
                                />
                                <p className="text-sm text-gray-200">
                                    You missed{' '}
                                    <span className="text-red-400 font-semibold">{s.missed}h</span>
                                    {' '}of{' '}
                                    <span className="font-semibold">{s.task_name}</span>
                                    {' '}— prioritize this tomorrow.
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Wins today */}
            {wins.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle size={18} className="text-green-400" />
                        <h3 className="font-semibold text-gray-200">Today's Wins 🏆</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {wins.map((t, i) => (
                            <span
                                key={i}
                                className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: t.color + '33', border: `1px solid ${t.color}` }}
                            >
                                ✅ {t.task_name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Reflection Form */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
                <h3 className="font-semibold text-gray-200">📓 Your Reflection</h3>

                {/* What went well */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        ✅ What went well today?
                    </label>
                    <textarea
                        rows={3}
                        value={whatWentWell}
                        onChange={e => setWhatWentWell(e.target.value)}
                        placeholder="e.g. Completed PwC tasks on time, hit gym target..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-200
              placeholder-gray-600"
                    />
                </div>

                {/* What was missed */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        ❌ What did you miss or struggle with?
                    </label>
                    <textarea
                        rows={3}
                        value={whatWasMissed}
                        onChange={e => setWhatWasMissed(e.target.value)}
                        placeholder="e.g. Skipped LeetCode, only 30 mins of ML learning..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-200
              placeholder-gray-600"
                    />
                </div>

                {/* Plan for tomorrow */}
                <div>
                    <label className="block text-sm text-gray-400 mb-2">
                        🎯 Plan for tomorrow
                    </label>
                    <textarea
                        rows={3}
                        value={planTomorrow}
                        onChange={e => setPlanTomorrow(e.target.value)}
                        placeholder="e.g. Start with LeetCode at 9am, 2hr AI/ML after lunch..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-200
              placeholder-gray-600"
                    />
                </div>

                {/* Save */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500
              disabled:opacity-50 rounded-lg font-medium text-sm transition"
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Reflection'}
                    </button>
                </div>
            </div>
        </div>
    );
}