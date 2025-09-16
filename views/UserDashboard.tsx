
import React from 'react';
import { LogOut, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import FileManagement from '../components/admin/FileManagement';
import Button from '../components/ui/Button';
import { User, FileItem, Notification, ActivityType } from '../types';
import NotificationBell from '../components/ui/NotificationBell';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
  allUsers: User[];
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  addNotification: (userId: string, message: string) => void;
  addActivityLog: (username: string, actionType: ActivityType) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout, allUsers, files, setFiles, notifications, setNotifications, addNotification, addActivityLog }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <UserCircle className="h-8 w-8 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold">{user.role} Dashboard</h1>
            <p className="text-sm text-gray-400">Logged in as {user.username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
            <NotificationBell userId={user.id} notifications={notifications} setNotifications={setNotifications} />
            <Button onClick={onLogout} variant="secondary" className="w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
        </div>
      </header>

      <main className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FileManagement user={user} allUsers={allUsers} files={files} setFiles={setFiles} addNotification={addNotification} addActivityLog={addActivityLog} />
        </motion.div>
      </main>
    </div>
  );
};

export default UserDashboard;
