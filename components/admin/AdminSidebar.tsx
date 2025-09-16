
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../../types';
import { LayoutDashboard, Users, Clock3, LogOut, X, UserCircle } from 'lucide-react';
import Button from '../ui/Button';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  activeView: string;
  setActiveView: (view: 'dashboard' | 'users' | 'activity') => void;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-3 font-medium">{label}</span>
  </button>
);

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose, user, onLogout, activeView, setActiveView }) => {
  
  const handleNavClick = (view: 'dashboard' | 'users' | 'activity') => {
    setActiveView(view);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full w-full max-w-xs bg-gray-800 shadow-2xl z-[70] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">SmartCrypt Admin</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex-grow p-4 space-y-2">
              <NavLink 
                icon={<LayoutDashboard className="h-5 w-5"/>} 
                label="Dashboard" 
                isActive={activeView === 'dashboard'}
                onClick={() => handleNavClick('dashboard')}
              />
              <NavLink 
                icon={<Users className="h-5 w-5"/>} 
                label="User Management" 
                isActive={activeView === 'users'}
                onClick={() => handleNavClick('users')}
              />
              <NavLink 
                icon={<Clock3 className="h-5 w-5"/>} 
                label="Activity Log" 
                isActive={activeView === 'activity'}
                onClick={() => handleNavClick('activity')}
              />
            </nav>

            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center p-3 rounded-lg bg-gray-900/50 mb-4">
                    <UserCircle className="h-10 w-10 text-indigo-400"/>
                    <div className="ml-3">
                        <p className="font-semibold text-white">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.roleName}</p>
                    </div>
                </div>
                <Button onClick={onLogout} variant="secondary" className="w-full">
                    <LogOut className="h-4 w-4 mr-2"/>
                    Logout
                </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminSidebar;
