import TimesheetGrid from '../components/TimesheetGrid';

export default function Timesheet() {
    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Timesheet</h2>
                <p className="text-gray-400 mt-1">Log your hours for the week. Hit save when done.</p>
            </div>
            <TimesheetGrid />
        </div>
    );
}