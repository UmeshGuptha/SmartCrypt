import React from 'react';
import { motion } from 'framer-motion';
import { ThreatAnalysisResult } from '../../types';
import Modal from '../ui/Modal';
import { AlertTriangle, CheckCircle, Shield, List, Lock } from 'lucide-react';
import Button from '../ui/Button';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: ThreatAnalysisResult | null;
  filename: string;
  fileId: string | null;
  onEncrypt: (fileId: string) => void;
}

const ThreatLevelBadge: React.FC<{ level: ThreatAnalysisResult['threatLevel'] }> = ({ level }) => {
  const levelStyles = {
    Low: 'bg-green-500/20 text-green-300',
    Medium: 'bg-yellow-500/20 text-yellow-300',
    High: 'bg-orange-500/20 text-orange-300',
    Critical: 'bg-red-500/20 text-red-300',
  };
  return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${levelStyles[level]}`}>{level} Risk</span>;
};

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, isLoading, result, filename, fileId, onEncrypt }) => {
  const isHighRisk = result && (result.threatLevel === 'High' || result.threatLevel === 'Critical');

  const handleEncrypt = () => {
    if (fileId) {
      onEncrypt(fileId);
    }
    onClose();
  };
  
  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={`Threat Analysis: ${filename}`} 
        className="max-w-2xl" 
        backgroundClassName="bg-gray-800 border border-gray-700"
    >
      {isLoading && (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-12 w-12 text-indigo-400"
            >
                <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </motion.div>
          <h3 className="text-xl font-semibold">Analyzing File...</h3>
          <p className="text-gray-400">Our AI is securely scanning the file for potential threats. Please wait a moment.</p>
        </div>
      )}
      {!isLoading && result && (
        <>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-200">Analysis Summary</h4>
                <ThreatLevelBadge level={result.threatLevel} />
              </div>
              <p className="mt-2 text-gray-300">{result.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <h5 className="font-semibold text-gray-200 flex items-center mb-3">
                      <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
                      Potential Threats
                  </h5>
                  <ul className="space-y-2">
                      {result.potentialThreats.map((threat, i) => (
                          <li key={i} className="flex items-start">
                              <List className="h-4 w-4 mr-3 mt-1 text-gray-500 flex-shrink-0" />
                              <span className="text-gray-400">{threat}</span>
                          </li>
                      ))}
                  </ul>
              </div>
              <div>
                  <h5 className="font-semibold text-gray-200 flex items-center mb-3">
                      <Shield className="h-5 w-5 mr-2 text-green-400" />
                      Recommendations
                  </h5>
                  <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start">
                              <CheckCircle className="h-4 w-4 mr-3 mt-1 text-gray-500 flex-shrink-0" />
                              <span className="text-gray-400">{rec}</span>
                          </li>
                      ))}
                  </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10 flex justify-end items-center gap-4">
            <p className={`text-sm mr-auto transition-colors ${isHighRisk ? 'text-red-400' : 'text-gray-400'}`}>
                {isHighRisk ? 'High risk detected. Encryption is strongly recommended.' : 'Low risk detected. You can encrypt for extra security.'}
            </p>
            <Button variant="secondary" onClick={onClose} className="w-auto">
                Close
            </Button>
            <Button
                onClick={handleEncrypt}
                variant={isHighRisk ? 'danger' : 'primary'}
                className="w-auto"
            >
                <Lock className="h-4 w-4 mr-2" />
                Encrypt File
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AnalysisModal;
