import React, { useState, useEffect } from 'react';

function UpdateStatus() {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.electron) {
      window.electron.onUpdateMessage((event, message) => {
        setStatus(message);
      });

      window.electron.onUpdateDownloadProgress((event, progressObj) => {
        setProgress(progressObj.percent);
      });
    }
  }, []);

  return status ? (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <p>{status}</p>
      {progress > 0 && <progress value={progress} max="100" />}
    </div>
  ) : null;
}

export default UpdateStatus;
