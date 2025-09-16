import React, { useState } from 'react';
import { LogOut, UserCircle, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserManagement from '../components/admin/UserManagement';
import FileManagement from '../components/admin/FileManagement';
import ActivityLog from '../components/admin/ActivityLog';
import Button from '../components/ui/Button';
import AddUserPanel from '../components/admin/AddUserPanel';
import AdminSidebar from '../components/admin/AdminSidebar';
import { User, UserStatus, ActivityLog as ActivityLogType, FileItem, Notification, ActivityType } from '../types';
import { useToast } from '../hooks/useToast';
import NotificationBell from '../components/ui/NotificationBell';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (userId: string, message: string) => void;
  activityLogs: ActivityLogType[];
  addActivityLog: (username: string, actionType: ActivityType) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, users, setUsers, files, setFiles, notifications, setNotifications, addNotification, activityLogs, addActivityLog }) => {
  const [isAddUserPanelOpen, setIsAddUserPanelOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'activity'>('dashboard');
  
  const { addToast } = useToast();

  const handleAddUser = (newUser: User) => {
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      addToast('Username is already taken, please try another.', 'error');
      return false;
    }
    const userWithOrg = { ...newUser, organization: user.organization };
    setUsers(prev => [userWithOrg, ...prev]);
    addToast('User added successfully!', 'success');
    addNotification(user.id, `You created a new user: ${newUser.username}.`);
    return true;
  };
  
  const handleUpdateUserStatus = (id: string, newStatus: UserStatus) => {
    setUsers(users.map(u => u.id === id ? {...u, status: newStatus} : u));
    addToast(`User status updated to ${newStatus}`, 'info');
  };
  
  const handleDeleteUser = (id: string) => {
      setUsers(users.filter(u => u.id !== id));
      addToast('User deleted.', 'error');
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        user={user}
        onLogout={onLogout}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      
      <AddUserPanel
        isOpen={isAddUserPanelOpen}
        onClose={() => setIsAddUserPanelOpen(false)}
        onAddUser={handleAddUser}
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/10" aria-label="Open menu">
              <Menu className="h-6 w-6 text-white"/>
            </button>
            <div className="flex items-center space-x-3">
               <UserCircle className="h-8 w-8 text-indigo-400" />
               <div>
                 <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                 <p className="text-sm text-gray-400">Welcome, {user.username}</p>
               </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationBell userId={user.id} notifications={notifications} setNotifications={setNotifications} />
            <Button onClick={onLogout} variant="secondary" className="w-auto hidden sm:flex">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>

        <main className="flex flex-col gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeView === 'dashboard' && <FileManagement user={user} allUsers={users} files={files} setFiles={setFiles} addNotification={addNotification} addActivityLog={addActivityLog} />}
              {activeView === 'users' && (
                <UserManagement 
                  currentUser={user}
                  users={users}
                  onUpdateUserStatus={handleUpdateUserStatus}
                  onDeleteUser={handleDeleteUser}
                  onAddUserClick={() => setIsAddUserPanelOpen(true)}
                />
              )}
              {activeView === 'activity' && <ActivityLog logs={activityLogs}/>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;