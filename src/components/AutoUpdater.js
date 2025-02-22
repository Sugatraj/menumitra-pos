import React, { useEffect, useState } from 'react';

function AutoUpdater() {
  const [updateStatus, setUpdateStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [updateReady, setUpdateReady] = useState(false);
  const [newVersion, setNewVersion] = useState('');

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.onUpdateMessage((_event, message) => {
      setUpdateStatus(message);
      console.log('Update message:', message);
    });

    api.onUpdateAvailable((_event, info) => {
      try {
        setUpdateStatus(`New version ${info.version} available. Downloading...`);
        setNewVersion(info.version);
        console.log('Update available:', {
          version: info.version,
          notes: info.releaseNotes
        });
      } catch (error) {
        console.error('Error handling update info:', error);
      }
    });

    api.onUpdateDownloaded((_event, info) => {
      setUpdateStatus(`Version ${info.version} is ready to install!`);
      setUpdateReady(true);
      setNewVersion(info.version);
      console.log('Update downloaded:', info);
    });

    api.onUpdateError((_event, error) => {
      setUpdateStatus(`Update error: ${error}`);
      console.error('Update error:', error);
    });

    // Check for updates with error handling
    const checkForUpdates = async () => {
      try {
        await api.checkForUpdates();
      } catch (error) {
        console.error('Check for updates failed:', error.message);
        setUpdateStatus('Update check failed');
      }
    };

    // Initial check
    checkForUpdates();

    // Periodic check
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      api.removeListener('update-message');
      api.removeListener('update-available');
      api.removeListener('update-downloaded');
      api.removeListener('update-error');
    };
  }, []);

  const installUpdate = () => {
    const api = window.electronAPI;
    if (api && updateReady) {
      api.startUpdate();
    }
  };

  if (!updateStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
      <p className="text-gray-700">{updateStatus}</p>
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded h-2 mt-2">
          <div 
            className="bg-blue-500 rounded h-2" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {updateReady && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">
            Version {newVersion} is ready to install!
          </p>
          <button
            onClick={installUpdate}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Install and Restart
          </button>
        </div>
      )}
    </div>
  );
}

export default AutoUpdater;
