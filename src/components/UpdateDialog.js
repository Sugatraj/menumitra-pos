import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faSpinner, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { AutoUpdater } from '../services/AutoUpdater';

const UpdateDialog = ({ isOpen, currentVersion, serverVersion }) => {
  const [updateState, setUpdateState] = useState({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setSlideIn(true), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (window.updater) {
      window.updater.onUpdateMessage((message) => {
        setUpdateState(prev => ({ ...prev, message }));
      });

      window.updater.onDownloadProgress((info) => {
        setUpdateState(prev => ({
          ...prev,
          status: 'downloading',
          progress: info.percent || 0
        }));
      });

      window.updater.onUpdateDownloaded(() => {
        setUpdateState({
          status: 'ready',
          progress: 100,
          message: 'Update ready to install!'
        });
      });

      window.updater.onUpdateError((message) => {
        setUpdateState({
          status: 'error',
          progress: 0,
          message
        });
      });
    }
  }, []);

  const handleUpdate = async () => {
    try {
      if (updateState.status === 'ready') {
        await window.updater.startUpdate();
        return;
      }

      setUpdateState({
        status: 'checking',
        progress: 0,
        message: 'Checking for updates...'
      });

      await window.updater.checkUpdate();
      await window.updater.downloadUpdate();

    } catch (error) {
      setUpdateState({
        status: 'error',
        progress: 0,
        message: error.message || 'Update failed'
      });
    }
  };

  const handleInstall = () => {
    window.electron.startUpdate();
  };

  // Update progress bar based on status
  const getProgressWidth = () => {
    switch (updateState.status) {
      case 'downloading':
        return `${updateState.progress}%`;
      case 'ready':
        return '100%';
      default:
        return '0%';
    }
  };

  // Get button text based on status
  const getButtonContent = () => {
    switch (updateState.status) {
      case 'downloading':
        return (
          <>
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>Downloading...</span>
          </>
        );
      case 'ready':
        return (
          <>
            <FontAwesomeIcon icon={faCheck} />
            <span>Install Now</span>
          </>
        );
      case 'error':
        return (
          <>
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <span>Retry Update</span>
          </>
        );
      default:
        return (
          <>
            <FontAwesomeIcon icon={faDownload} />
            <span>Update Now</span>
          </>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div
      className={`bg-white w-full max-w-lg h-auto rounded-t-xl p-6 transform transition-transform duration-300 ease-in-out
   ${slideIn ? 'translate-y-0' : 'translate-y-0'}`}    >
      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        <div className="flex items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-800">Update Available</h2>
            <p className="text-sm text-gray-600 mt-1">
              A new version of MenuMitra POS is ready to install
            </p>
          </div>
          <div className="ml-4 px-3 py-1 bg-blue-100 rounded-full">
            <span className="text-xs font-medium text-blue-800">Required</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Current version</span>
            <span className="font-medium text-gray-900">{currentVersion}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">New version</span>
            <span className="font-medium text-gray-900">{serverVersion}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: getProgressWidth() }}
            />
          </div>

          {/* Error message */}
          {updateState.message && (
            <p className={`text-sm text-center ${
              updateState.status === 'error' ? 'text-red-500' : 'text-gray-600'
            }`}>
              {updateState.message}
            </p>
          )}
        </div>

        <button
          onClick={handleUpdate}
          disabled={updateState.status === 'downloading'}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center space-x-2
            ${updateState.status === 'downloading'
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
          {updateState.status === 'downloading' ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              <span>Downloading...</span>
            </>
          ) : updateState.status === 'ready' ? (
            <>
              <FontAwesomeIcon icon={faCheck} className="mr-2" />
              <span>Restart to Update</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              <span>Update Now</span>
            </>
          )}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          The application will restart automatically after the update
        </p>
      </div>
    </div>
  );
};

export default UpdateDialog;
