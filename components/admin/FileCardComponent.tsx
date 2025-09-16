import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileItem, User, UserRole } from '../../types';
import { FileText, MoreVertical, Eye, Share2, Trash2, Edit3, Download, Bot, ShieldCheck } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface FileCardComponentProps {
    file: FileItem;
    user: User;
    isOwner: boolean;
    onDelete: (id: string) => void;
    onShare: (file: FileItem) => void;
    onAnalyze: (file: FileItem) => void;
    onView: (file: FileItem) => void;
    onDownload: (file: FileItem) => void;
}

const FileCardComponent: React.FC<FileCardComponentProps> = ({ file, user, isOwner, onDelete, onShare, onAnalyze, onView, onDownload }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { addToast } = useToast();
  const { role } = user;
  const isLevel4 = role === UserRole.LEVEL4;

  const canView = true;
  const canDownload = true;
  const canShare = !isLevel4 && (isOwner || role === UserRole.LEVEL1 || role === UserRole.LEVEL2);
  const canDelete = !isLevel4 && (isOwner || role === UserRole.ADMIN || role === UserRole.LEVEL1);
  const canEdit = !isLevel4 && (role === UserRole.ADMIN || (isOwner && role === UserRole.LEVEL1));
  const canAnalyze = !isLevel4 && (role === UserRole.ADMIN || role === UserRole.LEVEL1) && !file.isEncrypted;


  const createActionHandler = (action: () => void) => () => {
    action();
    setMenuOpen(false);
  };
  
  const handleView = createActionHandler(() => onView(file));
  const handleDownload = createActionHandler(() => onDownload(file));
  const handleEdit = createActionHandler(() => addToast(`Editing ${file.filename}`, 'info'));
  const handleShare = createActionHandler(() => onShare(file));
  const handleDelete = createActionHandler(() => onDelete(file.id));
  const handleAnalyze = createActionHandler(() => onAnalyze(file));


  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`bg-gray-800/50 p-4 rounded-lg flex items-center justify-between transition-all ${file.isEncrypted ? 'border-l-4 border-indigo-500' : ''}`}
    >
      <div className="flex items-center space-x-4 overflow-hidden">
        {file.isEncrypted ? 
            <ShieldCheck className="h-8 w-8 text-indigo-400 flex-shrink-0" /> : 
            <FileText className="h-8 w-8 text-indigo-400 flex-shrink-0" />
        }
        <div className="overflow-hidden">
          <p className="font-semibold text-white truncate" title={file.filename}>{file.filename}</p>
          <p className="text-sm text-gray-400">
            {isOwner ? `Uploaded on ${file.dateUploaded}` : `From ${file.uploader} on ${file.dateUploaded}`}
            {file.isEncrypted && <span className="text-indigo-400 font-medium ml-2">• Encrypted</span>}
          </p>
        </div>
      </div>
      <div className="relative flex-shrink-0">
        <button onClick={() => setMenuOpen(!menuOpen)} onBlur={() => setTimeout(() => setMenuOpen(false), 150)} className="p-2 rounded-full hover:bg-gray-700">
          <MoreVertical className="h-5 w-5 text-gray-400" />
        </button>
        <AnimatePresence>
        {menuOpen && (
            <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg z-10 glass-card"
            >
            <div className="py-1" role="menu" aria-orientation="vertical">
                {canView && <button onClick={handleView} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700" role="menuitem"><Eye className="mr-3 h-4 w-4"/> View</button>}
                {canShare && <button onClick={handleShare} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700" role="menuitem"><Share2 className="mr-3 h-4 w-4"/> Share</button>}
                {canAnalyze && <button onClick={handleAnalyze} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700" role="menuitem"><Bot className="mr-3 h-4 w-4"/> Analyze</button>}
                {canDownload && <button onClick={handleDownload} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700" role="menuitem"><Download className="mr-3 h-4 w-4"/> Download</button>}
                {canEdit && <button onClick={handleEdit} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-200 hover:bg-gray-700" role="menuitem"><Edit3 className="mr-3 h-4 w-4"/> Edit</button>}
                {canDelete && <button onClick={handleDelete} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-400 hover:bg-gray-700" role="menuitem"><Trash2 className="mr-3 h-4 w-4"/> Delete</button>}
            </div>
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FileCardComponent;