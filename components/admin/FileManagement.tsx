
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import { FileItem, User, UserRole, ThreatAnalysisResult, Notification, ActivityType } from '../../types';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import Checkbox from '../ui/Checkbox';
import AnalysisModal from './AnalysisModal';
import DecryptModal from '../ui/DecryptModal';
import KeyDisplayModal from '../ui/KeyDisplayModal';
import { useToast } from '../../hooks/useToast';
import FileCardComponent from './FileCardComponent';
import { UploadCloud, Folder, FolderOpen, Send, Inbox, Download } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateRandomKey = () => {
    const words1 = ['CLOUD', 'STAR', 'SKY', 'MOON', 'SUN', 'WIND', 'FIRE'];
    const words2 = ['FOREST', 'RIVER', 'OCEAN', 'MEADOW', 'PEAK', 'DAWN'];
    const word1 = words1[Math.floor(Math.random() * words1.length)];
    const word2 = words2[Math.floor(Math.random() * words2.length)];
    const number = Math.floor(100 + Math.random() * 900);
    return `${word1}-${word2}-${number}`;
};

const getMimeType = (filename: string): string => {
    const extension = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
    switch (extension) {
        case 'pdf': return 'application/pdf';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        case 'mp3': return 'audio/mpeg';
        case 'wav': return 'audio/wav';
        case 'mp4': return 'video/mp4';
        case 'webm': return 'video/webm';
        case 'mov': return 'video/quicktime';
        case 'txt': return 'text/plain';
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        default: return 'application/octet-stream';
    }
};

const UploadForm: React.FC<{ onUpload: (file: File, analyze: boolean) => void }> = ({ onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [analyzeAfterUpload, setAnalyzeAfterUpload] = useState(true);
    const { addToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            addToast('Please select a file to upload.', 'error');
            return;
        }
        setIsUploading(true);
        setTimeout(() => {
            onUpload(file, analyzeAfterUpload);
            setIsUploading(false);
            setFile(null);
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
            <UploadCloud className="h-16 w-16 text-gray-500 mb-4"/>
            <h3 className="text-xl font-semibold mb-2">Upload a File</h3>
            <p className="text-gray-400 mb-4">Drag and drop files here or click to browse.</p>
            <form onSubmit={handleUpload} className="w-full max-w-lg space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Input type="file" onChange={handleFileChange} className="w-full sm:w-auto flex-grow" />
                    <Button type="submit" isLoading={isUploading} className="w-full sm:w-auto">
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </div>
                <div className="flex justify-center">
                    <Checkbox id="analyze" label="Analyze file after upload" checked={analyzeAfterUpload} onChange={e => setAnalyzeAfterUpload(e.target.checked)} />
                </div>
            </form>
        </motion.div>
    );
};

interface FileManagementProps {
  user: User;
  allUsers: User[];
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  addNotification: (userId: string, message: string) => void;
  addActivityLog: (username: string, actionType: ActivityType) => void;
}

const FileManagement: React.FC<FileManagementProps> = ({ user, allUsers, files, setFiles, addNotification, addActivityLog }) => {
  const [activeTab, setActiveTab] = useState(user.role === UserRole.LEVEL4 ? 'received-files' : 'my-files');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [fileToShare, setFileToShare] = useState<FileItem | null>(null);
  const [usersToShareWith, setUsersToShareWith] = useState<string[]>([]);
  
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [fileToAnalyze, setFileToAnalyze] = useState<FileItem | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ThreatAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const [fileToDecrypt, setFileToDecrypt] = useState<FileItem | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  const [isKeyDisplayModalOpen, setIsKeyDisplayModalOpen] = useState(false);
  const [keyToDisplay, setKeyToDisplay] = useState<string | null>(null);
  const [fileWithNewKey, setFileWithNewKey] = useState<FileItem | null>(null);


  const { addToast } = useToast();

    const allTabs = [
        { id: 'upload', label: 'Upload File' },
        { id: 'my-files', label: 'My Files' },
        { id: 'shared-by-me', label: 'Shared By Me' },
        { id: 'received-files', label: 'Received Files' },
        { id: 'downloaded-files', label: 'Downloaded Files' },
    ];
    
    const visibleTabs = user.role === UserRole.LEVEL4
        ? allTabs.filter(tab => ['received-files', 'downloaded-files'].includes(tab.id))
        : allTabs;
  
  const shareableUsers = allUsers.filter(u => u.id !== user.id);
  
  const openFileInNewTab = (file: FileItem) => {
    if (!file.content || !file.mimeType) {
        addToast('File content not available for preview.', 'error');
        return;
    }

    let embedContent;
    const { content, mimeType, filename } = file;

    if (mimeType.startsWith('image/')) {
        embedContent = `<img src="${content}" alt="${filename}" style="max-width: 100%; max-height: 100vh; object-fit: contain;">`;
    } else if (mimeType.startsWith('video/')) {
        embedContent = `<video src="${content}" controls autoplay style="max-width: 100%; max-height: 100vh;"></video>`;
    } else if (mimeType.startsWith('audio/')) {
        embedContent = `<div style="display: flex; flex-direction: column; align-items: center;"><h2 style="color: white; font-family: sans-serif;">${filename}</h2><audio src="${content}" controls autoplay></audio></div>`;
    } else if (mimeType === 'application/pdf') {
        embedContent = `<iframe src="${content}" style="width: 100%; height: 100vh; border: none;"></iframe>`;
    } else {
        // Fallback for other types like .txt, .docx etc. - try iframe
        embedContent = `<iframe src="${content}" style="width: 100%; height: 100vh; border: none; background: white;"></iframe>`;
    }
    
    const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8"><title>${filename}</title>
            <style>body { margin: 0; background-color: #1f2937; display: flex; justify-content: center; align-items: center; height: 100vh; }</style>
        </head>
        <body>${embedContent}</body>
        </html>
    `;
    
    const newWindow = window.open("", '_blank');
    if (newWindow) {
        newWindow.document.write(fullHtml);
        newWindow.document.close();
    }
  };

  const handleOpenShareModal = (file: FileItem) => {
    setFileToShare(file);
    setUsersToShareWith([]); // Reset selection
    setIsShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setIsShareModalOpen(false);
    setTimeout(() => {
        setFileToShare(null);
        setUsersToShareWith([]);
    }, 200);
  };
  
  const handleAnalyzeFile = async (file: FileItem) => {
    setFileToAnalyze(file);
    setIsAnalysisModalOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    addToast(`Analyzing ${file.filename}...`, 'info');

    const schema = {
      type: Type.OBJECT,
      properties: {
        threatLevel: {
          type: Type.STRING,
          description: 'The assessed threat level. Must be one of: "Low", "Medium", "High", or "Critical".'
        },
        summary: {
          type: Type.STRING,
          description: 'A brief, one-sentence summary of the analysis findings.'
        },
        potentialThreats: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of potential threats or sensitive data types identified.'
        },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'A list of recommended actions to mitigate threats.'
        }
      },
      required: ['threatLevel', 'summary', 'potentialThreats', 'recommendations']
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following filename for potential security threats: "${file.filename}". Based on the name, infer the likely content and perform a threat analysis. The file could contain sensitive information like patient records, research data, or corporate documents. Provide a threat level, a summary, a list of potential threats, and recommended actions.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const resultJson = JSON.parse(response.text);
      setAnalysisResult(resultJson);
    } catch (error) {
      console.error("Analysis failed:", error);
      addToast('Analysis failed. Please try again.', 'error');
      setAnalysisResult({
        threatLevel: 'Critical',
        summary: 'The analysis could not be completed due to an API error.',
        potentialThreats: ['API communication failure.', 'Model may be unavailable.'],
        recommendations: ['Check the browser console for errors.', 'Try again later.']
      });
    } finally {
      setIsAnalyzing(false);
      addNotification(user.id, `Analysis for "${file.filename}" is complete.`);
    }
  };

  const handleCloseAnalysisModal = () => {
    setIsAnalysisModalOpen(false);
    setTimeout(() => {
        setFileToAnalyze(null);
        setAnalysisResult(null);
    }, 200);
  };

  const handleEncryptFile = (fileId: string) => {
    const key = generateRandomKey();
    let encryptedFile: FileItem | null = null;
    setFiles(currentFiles =>
      currentFiles.map(f => {
        if (f.id === fileId) {
          encryptedFile = { ...f, isEncrypted: true, decryptionKey: key };
          return encryptedFile;
        }
        return f;
      })
    );
    addToast(`File encrypted. Please share the key securely.`, 'success');
    setKeyToDisplay(key);
    setFileWithNewKey(encryptedFile);
    setIsKeyDisplayModalOpen(true);
  };
  
  const handleOpenFileView = (file: FileItem) => {
    if (file.isEncrypted) {
        setFileToDecrypt(file);
        setIsDecryptModalOpen(true);
    } else {
        openFileInNewTab(file);
    }
  };

  const handleCloseDecryptModal = () => {
    setIsDecryptModalOpen(false);
    setIsDecrypting(false);
    setTimeout(() => {
        setFileToDecrypt(null);
    }, 200);
  };

  const handleConfirmDecrypt = (key: string) => {
    if (!fileToDecrypt) return;
    setIsDecrypting(true);
    setTimeout(() => {
        if (key === fileToDecrypt.decryptionKey) {
            addToast('Decryption successful!', 'success');
            handleCloseDecryptModal();
            openFileInNewTab(fileToDecrypt);
        } else {
            addToast('Invalid decryption key.', 'error');
            setIsDecrypting(false);
        }
    }, 1000);
  };

  const handleConfirmShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileToShare && usersToShareWith.length > 0) {
        const key = generateRandomKey();
        const updatedFile = {
            ...fileToShare,
            isEncrypted: true,
            decryptionKey: key,
            sharedWith: [...new Set([...(fileToShare.sharedWith || []), ...usersToShareWith])],
        };

        setFiles(currentFiles =>
          currentFiles.map(f => f.id === fileToShare.id ? updatedFile : f)
        );

        addToast(`Shared '${fileToShare.filename}' with ${usersToShareWith.length} user(s).`, 'success');
        addActivityLog(user.username, ActivityType.SHARE);
        
        usersToShareWith.forEach(recipientId => {
            addNotification(recipientId, `${user.username} shared "${fileToShare.filename}" with you.`);
        });
        
        setKeyToDisplay(key);
        setFileWithNewKey(updatedFile);
        setIsKeyDisplayModalOpen(true);
        handleCloseShareModal();
    } else {
        addToast('Could not share file. Please select at least one user.', 'error');
    }
  };

  const handleDelete = (id: string) => {
      setFiles(files.filter(f => f.id !== id));
      addToast("File deleted", 'info');
  }

  const handleUpload = (file: File, analyze: boolean) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile: FileItem = {
            id: `file-${Date.now()}`,
            filename: file.name,
            dateUploaded: new Date().toISOString().split('T')[0],
            uploader: user.username,
            uploaderId: user.id,
            isEncrypted: false,
            sharedWith: [],
            downloadedBy: [],
            content: content,
            mimeType: file.type || getMimeType(file.name),
        };
        setFiles(prev => [newFile, ...prev]);
        addToast('File uploaded successfully!', 'success');
        addActivityLog(user.username, ActivityType.UPLOAD);
        setActiveTab('my-files');
        if (analyze) {
          handleAnalyzeFile(newFile);
        }
      };
      reader.onerror = () => {
        addToast('Failed to read file.', 'error');
      };
      reader.readAsDataURL(file);
  }
  
  const handleDownloadFile = (file: FileItem) => {
    if (!file.content) {
        addToast("Cannot download file, content is missing.", 'error');
        return;
    }
    const link = document.createElement('a');
    link.href = file.content;
    link.setAttribute('download', file.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setFiles(currentFiles =>
      currentFiles.map(f =>
        f.id === file.id
          ? { ...f, downloadedBy: [...new Set([...(f.downloadedBy || []), user.id])] }
          : f
      )
    );
    
    addToast(`Downloading ${file.filename}...`, 'success');

    if (user.id !== file.uploaderId) {
        addNotification(file.uploaderId, `${user.username} downloaded your file: "${file.filename}".`);
    }
  };

  const myFiles = files.filter(f => f.uploaderId === user.id);
  const sharedByMeFiles = files.filter(f => f.uploaderId === user.id && f.sharedWith && f.sharedWith.length > 0);
  const receivedFiles = files.filter(f => f.sharedWith?.includes(user.id));
  const downloadedFiles = files.filter(f => f.downloadedBy?.includes(user.id));

  const FileList: React.FC<{list: FileItem[], isOwnerList: boolean, emptyText: string}> = ({ list, isOwnerList, emptyText }) => (
    <div className="space-y-4">
        <AnimatePresence>
            {list.length > 0 ? (
                list.map(file => <FileCardComponent key={file.id} file={file} user={user} isOwner={isOwnerList} onDelete={handleDelete} onShare={handleOpenShareModal} onAnalyze={handleAnalyzeFile} onView={handleOpenFileView} onDownload={handleDownloadFile} />)
            ) : (
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-500 py-8">{emptyText}</motion.p>
            )}
        </AnimatePresence>
    </div>
  );

  const getTabIcon = () => {
    switch(activeTab) {
      case 'upload': return <UploadCloud className="h-6 w-6 mr-2 text-indigo-400"/>;
      case 'my-files': return <FolderOpen className="h-6 w-6 mr-2 text-indigo-400"/>;
      case 'shared-by-me': return <Send className="h-6 w-6 mr-2 text-indigo-400"/>;
      case 'received-files': return <Inbox className="h-6 w-6 mr-2 text-indigo-400"/>;
      case 'downloaded-files': return <Download className="h-6 w-6 mr-2 text-indigo-400"/>;
      default: return <Folder className="h-6 w-6 mr-2 text-indigo-400"/>;
    }
  }

  const handleCheckboxChange = (checked: boolean, userId: string) => {
    if (checked) {
        setUsersToShareWith(prev => [...prev, userId]);
    } else {
        setUsersToShareWith(prev => prev.filter(id => id !== userId));
    }
  };
  
  useEffect(() => {
    if (user.role === UserRole.LEVEL4 && !visibleTabs.find(t => t.id === activeTab)) {
        setActiveTab('received-files');
    }
  }, [user.role, activeTab, visibleTabs]);

  return (
    <Card>
      <div className="flex items-center mb-4">
        {getTabIcon()}
        <h3 className="text-xl font-bold">File Management</h3>
      </div>
      <Tabs tabs={visibleTabs} activeTab={activeTab} onTabClick={setActiveTab} />
      <div className="mt-6">
        {activeTab === 'upload' && <UploadForm onUpload={handleUpload} />}
        {activeTab === 'my-files' && <FileList list={myFiles} isOwnerList={true} emptyText="Upload a file to get started."/>}
        {activeTab === 'shared-by-me' && <FileList list={sharedByMeFiles} isOwnerList={true} emptyText="You haven't shared any files."/>}
        {activeTab === 'received-files' && <FileList list={receivedFiles} isOwnerList={false} emptyText="No files have been shared with you." />}
        {activeTab === 'downloaded-files' && <FileList list={downloadedFiles} isOwnerList={false} emptyText="You haven't downloaded any files yet." />}
      </div>

      <Modal 
        isOpen={isShareModalOpen} 
        onClose={handleCloseShareModal} 
        title={`Share "${fileToShare?.filename ?? 'file'}"`}
      >
        {fileToShare && (
          <form onSubmit={handleConfirmShare} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Share with (select multiple):
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2 p-2 rounded-md border border-gray-600 bg-gray-900/50">
                {shareableUsers.length > 0 ? (
                  shareableUsers.map(u => (
                    <Checkbox
                        key={u.id}
                        id={`share-user-${u.id}`}
                        label={`${u.username} (${u.roleName})`}
                        checked={usersToShareWith.includes(u.id)}
                        onChange={(e) => handleCheckboxChange(e.target.checked, u.id)}
                    />
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center p-4">No other users to share with.</p>
                )}
              </div>
            </div>
             <p className="text-sm text-yellow-300/80 bg-yellow-500/10 p-3 rounded-lg">
                Note: Sharing a file will automatically encrypt it with SmartCrypt™ and generate a unique key. You must share this key with the recipient(s).
            </p>
            <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="secondary" onClick={handleCloseShareModal} className="w-auto">Cancel</Button>
                <Button type="submit" className="w-auto" disabled={shareableUsers.length === 0 || usersToShareWith.length === 0}>Share & Encrypt</Button>
            </div>
          </form>
        )}
      </Modal>

       <AnalysisModal 
            isOpen={isAnalysisModalOpen}
            onClose={handleCloseAnalysisModal}
            isLoading={isAnalyzing}
            result={analysisResult}
            filename={fileToAnalyze?.filename ?? ''}
            fileId={fileToAnalyze?.id ?? null}
            onEncrypt={handleEncryptFile}
        />

       <DecryptModal
            isOpen={isDecryptModalOpen}
            onClose={handleCloseDecryptModal}
            onDecrypt={handleConfirmDecrypt}
            filename={fileToDecrypt?.filename ?? ''}
            isDecrypting={isDecrypting}
       />

       <KeyDisplayModal
            isOpen={isKeyDisplayModalOpen}
            onClose={() => setIsKeyDisplayModalOpen(false)}
            filename={fileWithNewKey?.filename ?? ''}
            decryptionKey={keyToDisplay}
       />
    </Card>
  );
};

export default FileManagement;
