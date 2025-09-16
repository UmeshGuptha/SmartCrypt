
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, UserStatus } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { PlusCircle, X } from 'lucide-react';

interface AddUserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: User) => boolean;
}

const AddUserPanel: React.FC<AddUserPanelProps> = ({ isOpen, onClose, onAddUser }) => {
  const [newUser, setNewUser] = useState({ username: '', password: '', role: UserRole.LEVEL1, roleName: '' });

  useEffect(() => {
    // Reset form when panel opens
    if (isOpen) {
        setNewUser({ username: '', password: '', role: UserRole.LEVEL1, roleName: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userToAdd: User = {
      id: Date.now().toString(),
      username: newUser.username,
      password: newUser.password,
      role: newUser.role,
      roleName: newUser.roleName || newUser.role,
      status: UserStatus.ACTIVE,
    };
    const success = onAddUser(userToAdd);
    if (success) {
      onClose();
    }
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
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-800 shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-6 overflow-y-auto">
              <Input
                id="username"
                label="Username"
                placeholder="john.doe"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
                autoFocus
              />
              <Input
                id="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                  User Role
                </label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full rounded-md border-gray-600 bg-gray-700/50 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 transition duration-150"
                >
                  {Object.values(UserRole)
                    .filter((r) => r !== UserRole.ADMIN)
                    .map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                </select>
              </div>
              <Input
                id="roleName"
                label="Custom Role Name (Optional)"
                placeholder="e.g., Doctor, Researcher"
                value={newUser.roleName}
                onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })}
              />
              <div className="pt-4">
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add User
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddUserPanel;