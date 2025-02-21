import React, { useEffect, useState } from 'react';

function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    const isElectron = window?.electron;

    if (isElectron) {
      window.electron.onUpdateAvailable(() => {
        setUpdateAvailable(true);
      });

      window.electron.onUpdateDownloaded(() => {
        setUpdateAvailable(false);
        setUpdateDownloaded(true);
      });
    }

    return () => {
      if (isElectron) {
        // Clean up listeners if in Electron
        window.electron.removeAllListeners?.('update-available');
        window.electron.removeAllListeners?.('update-downloaded');
      }
    };
  }, []);

  const installUpdate = () => {
    if (window?.electron) {
      window.electron.startUpdate();
    }
  };

  // Don't show anything if not in Electron or no updates
  if (!window?.electron || (!updateAvailable && !updateDownloaded)) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
      {updateAvailable && (
        <p className="text-gray-700">Downloading new update...</p>
      )}
      {updateDownloaded && (
        <div>
          <p className="text-gray-700">Update downloaded!</p>
          <button
            onClick={installUpdate}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Restart and Install
          </button>
        </div>
      )}
    </div>
  );
}

export default UpdateNotification;
