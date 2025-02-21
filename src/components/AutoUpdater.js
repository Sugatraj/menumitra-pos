import React, { useEffect, useState } from 'react';

function AutoUpdater() {
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;

    api.onUpdateMessage((_event, message) => {
      setUpdateStatus(message);
      console.log('Update message:', message);
    });

    api.onUpdateAvailable((_event, info) => {
      setUpdateStatus(`New version ${info.version} available and downloading...`);
      console.log('Update available:', info);
    });

    api.onUpdateDownloaded(() => {
      setUpdateStatus('Update ready to install!');
      setUpdateReady(true);
      console.log('Update downloaded and ready');
    });

    // Initial check
    api.checkForUpdates().catch(console.error);

    return () => {
      api.removeListener('update-message');
      api.removeListener('update-available');
      api.removeListener('update-downloaded');
    };
  }, []);

  const installUpdate = () => {
    const api = window.electronAPI;
    if (api) {
      api.startUpdate();
    }
  };

  const checkForUpdates = () => {
    const api = window.electronAPI;
    if (api) {
      api.checkForUpdates().catch(console.error);
    }
  };

  if (!updateStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
      <button 
        onClick={checkForUpdates}
        className="mb-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Check for Updates
      </button>
      <p className="text-gray-700">{updateStatus}</p>
      {updateReady && (
        <button
          onClick={installUpdate}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Install and Restart
        </button>
      )}
    </div>
  );
}

export default AutoUpdater;
