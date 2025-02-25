import React, { useEffect, useState } from 'react';

function AutoUpdater() {
  const [updateStatus, setUpdateStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [updateReady, setUpdateReady] = useState(false);
  const [newVersion, setNewVersion] = useState('');
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.onUpdateMessage((_event, message) => {
      setUpdateStatus(message);
      setError(null);
      console.log('Update message:', message);
    });

    api.onUpdateAvailable((_event, info) => {
      try {
        setUpdateStatus(`New version ${info.version} available. Click to download.`);
        setNewVersion(info.version);
        setError(null);
        console.log('Update available:', {
          version: info.version,
          notes: info.releaseNotes
        });
      } catch (error) {
        setError('Error processing update info');
        console.error('Error handling update info:', error);
      }
    });

    api.onUpdateDownloaded((_event, info) => {
      setUpdateStatus(`Version ${info.version} is ready to install!`);
      setUpdateReady(true);
      setNewVersion(info.version);
      setError(null);
      console.log('Update downloaded:', info);
    });

    api.onUpdateError((_event, error) => {
      setError(error.message || 'Update failed');
      setUpdateStatus('Update failed');
      console.error('Update error:', error);
      
      // Implement retry logic
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          checkForUpdates();
        }, 5000 * (retryCount + 1)); // Exponential backoff
      }
    });

    const checkForUpdates = async () => {
      try {
        setError(null);
        await api.checkForUpdates();
      } catch (error) {
        setError('Check for updates failed');
        console.error('Check for updates failed:', error.message);
        setUpdateStatus('Update check failed');
      }
    };

    checkForUpdates();
    const interval = setInterval(checkForUpdates, 30 * 60 * 1000); // Check every 30 minutes

    return () => {
      clearInterval(interval);
      ['update-message', 'update-available', 'update-downloaded', 'update-error']
        .forEach(channel => api.removeListener(channel));
    };
  }, [retryCount]);

  const handleUpdate = async () => {
    const api = window.electronAPI;
    if (!api) return;

    try {
      if (updateReady) {
        await api.startUpdate();
      } else if (newVersion) {
        setUpdateStatus('Downloading update...');
        await api.downloadUpdate();
      }
    } catch (error) {
      setError('Update failed. Please try again.');
    }
  };

  if (!updateStatus && !error) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
      {error ? (
        <div className="text-red-500 mb-2">{error}</div>
      ) : (
        <p className="text-gray-700">{updateStatus}</p>
      )}
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded h-2 mt-2">
          <div className="bg-blue-500 rounded h-2" style={{ width: `${progress}%` }} />
        </div>
      )}
      {(newVersion || updateReady) && (
        <button
          onClick={handleUpdate}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {updateReady ? 'Install and Restart' : 'Download Update'}
        </button>
      )}
    </div>
  );
}

export default AutoUpdater;
