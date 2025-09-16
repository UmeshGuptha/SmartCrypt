import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, UserRole, UserStatus } from '../../types';
import { Trash2, Ban, CheckCircle2, PauseCircle, PlayCircle, UserPlus, Building } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export const initialUsers: User[] = [];

const StatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full inline-block";
    const statusClasses = {
        [UserStatus.ACTIVE]: "bg-green-500/20 text-green-300",
        [UserStatus.BLOCKED]: "bg-red-500/20 text-red-300",
        [UserStatus.SUSPENDED]: "bg-yellow-500/20 text-yellow-300",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
}

interface UserManagementProps {
  currentUser: User;
  users: User[];
  onUpdateUserStatus: (id: string, newStatus: UserStatus) => void;
  onDeleteUser: (id: string) => void;
  onAddUserClick: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, users, onUpdateUserStatus, onDeleteUser, onAddUserClick }) => {
  const canDeleteUsers = currentUser.role === UserRole.ADMIN;
  const canBlockUsers = currentUser.role === UserRole.ADMIN;
  const canSuspendUsers = [UserRole.ADMIN, UserRole.LEVEL1, UserRole.LEVEL2].includes(currentUser.role);
  
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-white">User Management</h2>
        <Button onClick={onAddUserClick} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2"/>
          Add New User
        </Button>
      </div>
       <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-700 bg-gray-800/50">
                        <th className="p-4 font-semibold">Username</th>
                        <th className="p-4 font-semibold">Organization</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <AnimatePresence>
                    <tbody>
                    {users.filter(u => u.role !== UserRole.ADMIN).map((user, index) => (
                        <motion.tr 
                            key={user.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-800 last:border-b-0"
                        >
                            <td className="p-4 font-medium">{user.username}</td>
                            <td className="p-4 text-gray-400">{user.organization || 'N/A'}</td>
                            <td className="p-4 text-gray-300">{user.roleName}</td>
                            <td className="p-4"><StatusBadge status={user.status} /></td>
                            <td className="p-4">
                                <div className="flex justify-end items-center space-x-2">
                                    {canBlockUsers && (user.status === UserStatus.BLOCKED ? (
                                        <button onClick={() => onUpdateUserStatus(user.id, UserStatus.ACTIVE)} className="p-1 text-gray-400 hover:text-green-400 transition-colors" title="Unblock"><CheckCircle2 size={18}/></button>
                                    ) : (
                                        <button onClick={() => onUpdateUserStatus(user.id, UserStatus.BLOCKED)} className="p-1 text-gray-400 hover:text-red-400 transition-colors" title="Block"><Ban size={18}/></button>
                                    ))}
                                    {canSuspendUsers && (user.status === UserStatus.SUSPENDED ? (
                                        <button onClick={() => onUpdateUserStatus(user.id, UserStatus.ACTIVE)} className="p-1 text-gray-400 hover:text-green-400 transition-colors" title="Unsuspend"><PlayCircle size={18}/></button>
                                    ) : (
                                        <button onClick={() => onUpdateUserStatus(user.id, UserStatus.SUSPENDED)} className="p-1 text-gray-400 hover:text-yellow-400 transition-colors" title="Suspend"><PauseCircle size={18}/></button>
                                    ))}
                                    {canDeleteUsers && (
                                        <button onClick={() => onDeleteUser(user.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={18}/></button>
                                    )}
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                    </tbody>
                </AnimatePresence>
            </table>
            {users.filter(u => u.role !== UserRole.ADMIN).length === 0 && (
                <p className="text-center text-gray-500 p-8">No users found.</p>
            )}
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;