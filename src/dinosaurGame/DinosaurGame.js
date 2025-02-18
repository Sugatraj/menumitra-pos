import React, { useState, useEffect } from 'react';

const DinosaurGame = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {!isOnline && (
        <div
          style={{
            fontSize: '20px',
            color: '#ff0000',
            backgroundColor: '#fff3f3',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '500px',
            border: '2px solid #ffcccc',
          }}
        >
          <h2 style={{ fontSize: '28px', marginBottom: '15px' }}>Lost Network Connection</h2>
          <p>Please check your internet connection and try again.</p>
        </div>
      )}
    </div>
  );
};
export default DinosaurGame;
