import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, FileText, Calculator, ShoppingBag, LogOut, Shield, Bell, Settings, Sun, Moon, X } from 'lucide-react';

const themeOptions = [
  { value: 'light' as const, Icon: Sun },
  { value: 'dark' as const, Icon: Moon }
];

export const Layout: React.FC = () => {
  const { user, logout, switchRole, theme, setTheme } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    'Inventory sync completed successfully.',
    '2 quotations are awaiting review.'
  ]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Inventory Stock', path: '/inventory', icon: Package, roles: ['ADMIN', 'SALES_USER'] },
    { label: 'Customer Enquiries', path: '/enquiries', icon: FileText, roles: ['ADMIN', 'SALES_USER'] },
    { label: 'Quotations', path: '/quotations', icon: Calculator, roles: ['ADMIN', 'SALES_USER'] },
    { label: 'Orders & Dispatch', path: '/orders', icon: ShoppingBag, roles: ['ADMIN', 'SALES_USER'] },
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 px-2 py-4 border-b border-slate-800 mb-6">
            <Shield className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="font-bold text-lg leading-tight">PERN ERP</h1>
              <p className="text-xs text-slate-400">Industrial Operations</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              if (user && !item.roles.includes(user.role)) return null;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="border-t border-slate-800 pt-4">
          <div className="px-3 mb-3">
            <p className="text-xs text-slate-400">Logged in as:</p>
            <p className="text-sm font-semibold truncate text-slate-200">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              {user?.role}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-end gap-2 mb-5">
          <button aria-label="Notifications" title="Notifications" onClick={() => setShowNotifications(!showNotifications)} className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><Bell className="h-5 w-5" />{notifications.length > 0 && <span className="absolute -right-1 -top-1 h-4 min-w-4 rounded-full bg-indigo-600 px-1 text-[10px] text-white">{notifications.length}</span>}</button>
          <button aria-label="Settings" title="Settings" onClick={() => setShowSettings(!showSettings)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><Settings className="h-5 w-5" /></button>
        </div>
        {showNotifications && <div className="fixed right-8 top-20 z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><h2 className="font-semibold">Notifications</h2><button aria-label="Close notifications" title="Close" onClick={() => setShowNotifications(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>{notifications.length === 0 ? <p className="mt-3 text-sm text-slate-500">No new notifications.</p> : <><div className="mt-3 space-y-2">{notifications.map((notification) => <p key={notification} className="text-sm text-slate-600">{notification}</p>)}</div><button onClick={() => setNotifications([])} className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Clear all</button></>}</div>}
        {showSettings && <div className="fixed right-8 top-20 z-20 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"><h2 className="font-semibold">Settings</h2><label className="mt-4 block text-sm font-medium">Active role</label><select value={user?.role || 'SALES_USER'} onChange={(e) => switchRole(e.target.value as 'ADMIN' | 'SALES_USER')} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm"><option value="ADMIN">Administrator</option><option value="SALES_USER">Sales user</option></select><label className="mt-4 block text-sm font-medium">Theme</label><div className="mt-2 grid grid-cols-3 gap-2">{themeOptions.map(({ value, Icon }) => <button key={value} onClick={() => setTheme(value)} className={`flex items-center justify-center gap-1 rounded-lg border p-2 text-xs ${theme === value ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'}`}><Icon className="h-4 w-4" />{value}</button>)}</div></div>}
        <Outlet />
      </main>
    </div>
  );
};