import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TableProperties, ListTodo, BarChart3, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/timesheet', icon: TableProperties, label: 'Timesheet' },
    { to: '/tasks', icon: ListTodo, label: 'Tasks' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/reflection', icon: BookOpen, label: 'Reflection' },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
            <div className="px-6 py-5 border-b border-gray-700">
                <h1 className="text-xl font-bold text-indigo-400">⏱ LifeTracker</h1>
                <p className="text-xs text-gray-400 mt-1">Your time. Your growth.</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="px-4 py-4 border-t border-gray-700 space-y-2">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400
            hover:bg-gray-800 hover:text-red-400 rounded-lg transition"
                >
                    <LogOut size={15} /> Sign Out
                </button>
            </div>
        </aside>
    );
}