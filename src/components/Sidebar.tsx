import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, BarChart2, Settings, LogOut, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const navItems = [
    { to: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { to: '/habits', icon: <ListChecks className="w-5 h-5" />, label: 'Habits' },
    { to: '/analytics', icon: <BarChart2 className="w-5 h-5" />, label: 'Analytics' },
    { to: '/subscription', icon: <CreditCard className="w-5 h-5" />, label: 'Subscription' },
    { to: '/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col relative z-50">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600 flex items-center">
          <span className="text-3xl mr-2">🚀</span> 1percentrise
        </h1>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                onClick={handleNavClick}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        {user && user.email && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-medium">
                {user.email?.slice(0, 1).toUpperCase() ?? ''}
              </div>
              <div className="ml-3">
                <p className="font-medium text-sm truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;