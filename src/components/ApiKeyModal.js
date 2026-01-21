import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const ApiKeyModal = ({ isOpen, onClose, project }) => {
  const [copied, setCopied] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen || !project) return null;

  const apiKey = project.apiKey || 'No API Key available';
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  
  const curlExample = `curl --location '${baseUrl}/public/configs?environment=development' \\
--header 'X-API-Key: ${apiKey}'`;

  const copyToClipboard = (text, type = 'key') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'key') {
        setCopied(true);
        toast.success('API Key copied to clipboard!', {
          duration: 2000,
          position: 'top-right',
        });
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopiedCurl(true);
        toast.success('cURL command copied to clipboard!', {
          duration: 2000,
          position: 'top-right',
        });
        setTimeout(() => setCopiedCurl(false), 2000);
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#324d67]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary">key</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">API Key</h2>
              <p className="text-xs text-gray-500">Project: {project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <span className="text-white material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* API Key Section */}
          <div>
            <label className="block text-sm font-medium mb-2 text-white">Your API Key</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-white px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-lg font-mono text-sm break-all border border-gray-200 dark:border-[#324d67]">
                {apiKey}
              </div>
              <button
                onClick={() => copyToClipboard(apiKey, 'key')}
                className="p-3  bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-lg">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <span className="material-symbols-outlined text-sm align-middle mr-1">info</span>
              Keep this key secure. Anyone with this key can access your configurations.
            </p>
          </div>

          {/* Usage Instructions */}
          <div>
            <h3 className="text-sm text-white font-bold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">code</span>
              Usage Example
            </h3>
            <div className="space-y-3">
              {/* cURL Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">cURL Request</span>
                  <button
                    onClick={() => copyToClipboard(curlExample, 'curl')}
                    className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedCurl ? 'check' : 'content_copy'}
                    </span>
                    {copiedCurl ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto custom-scrollbar">
                  <code>{curlExample}</code>
                </pre>
              </div>

              {/* Available Endpoints */}
              <div className="glass-card p-4 rounded-lg">
                <h4 className="text-xs font-bold mb-3 text-gray-500 uppercase tracking-wider">
                  Available Endpoints
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded font-mono font-bold">GET</span>
                    <div className="flex-1">
                      <code className="text-gray-900 dark:text-gray-100">/api/public/configs</code>
                      <p className="text-gray-500 mt-1">Get all configurations for a specific environment</p>
                      <p className="text-gray-500 mt-1">
                        <span className="font-medium">Query params:</span> 
                        <code className="ml-1 px-1 py-0.5 bg-white/5 rounded">environment</code> (required)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Environments */}
              <div className="glass-card p-4 rounded-lg">
                <h4 className="text-xs font-bold mb-2 text-gray-500 uppercase tracking-wider">
                  Available Environments
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['development', 'staging', 'production'].map((env) => (
                    <span 
                      key={env}
                      className="px-3 py-1 text-white bg-white/5 rounded-full text-xs font-mono border border-gray-200 dark:border-[#324d67]"
                    >
                      {env}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="glass-card p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-yellow-500">warning</span>
              <div className="text-xs space-y-1">
                <p className="font-bold text-yellow-600 dark:text-yellow-500">Security Best Practices</p>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
                  <li>Never commit API keys to version control</li>
                  <li>Use environment variables to store the key</li>
                  <li>Rotate keys regularly for production environments</li>
                  <li>Use HTTPS in production to encrypt the key in transit</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-[#324d67]">
          <button
            onClick={onClose}
            className="text-white px-4 py-2 rounded-lg border border-gray-200 dark:border-[#324d67] hover:bg-white/5 transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
