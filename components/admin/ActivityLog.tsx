
import React from 'react';
import { motion } from 'framer-motion';
import { ActivityLog, ActivityType } from '../../types';
import { Upload, Share2, LogIn } from 'lucide-react';
import Card from '../ui/Card';

const ActivityIcon: React.FC<{type: ActivityType}> = ({type}) => {
    const iconMap = {
        [ActivityType.UPLOAD]: <Upload className="h-4 w-4 text-blue-400"/>,
        [ActivityType.SHARE]: <Share2 className="h-4 w-4 text-purple-400"/>,
        [ActivityType.LOGIN]: <LogIn className="h-4 w-4 text-green-400"/>,
    };
    return <div className="p-2 bg-gray-700/50 rounded-full">{iconMap[type]}</div>;
}

interface ActivityLogProps {
  logs: ActivityLog[];
}

const ActivityLogComponent: React.FC<ActivityLogProps> = ({ logs }) => {
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold text-white mb-6">Activity Log</h2>
      <Card>
        <div className="space-y-2">
          {logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ActivityIcon type={log.actionType} />
              <div className="flex-grow">
                <p className="text-sm text-white">
                  <span className="font-semibold">{log.username}</span> performed a <span className="font-semibold">{log.actionType}</span> action.
                </p>
                <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            </motion.div>
          ))}
          {logs.length === 0 && (
              <p className="text-center text-gray-500 py-8">No activity to display.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ActivityLogComponent;
