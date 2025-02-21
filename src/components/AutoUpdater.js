import React, { useEffect, useState } from 'react';

function AutoUpdater() {
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!window.electron) return;

    // Check for updates when component mounts
    window.electron.checkForUpdates();

    window.electron.onUpdateMessage((_, message) => {
      setUpdateStatus(message);
    });

    window.electron.onUpdateAvailable((_, info) => {
      setUpdateStatus(`New version ${info.version} available. Downloading...`);
      window.electron.downloadUpdate();
    });

    window.electron.onUpdateDownloaded(() => {
      setUpdateStatus('Update downloaded. Ready to install.');
      setUpdateReady(true);
    });

    window.electron.onUpdateError((_, error) => {
      setUpdateStatus(`Error: ${error}`);
    });
  }, []);

  const installUpdate = () => {
    if (window.electron) {
      window.electron.startUpdate();
    }
  };

  if (!updateStatus) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
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
