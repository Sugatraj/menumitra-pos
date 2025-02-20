import axios from 'axios';

export class UpdateService {
  static async checkForUpdates() {
    try {
      const response = await axios.post('https://menusmitra.xyz/common_api/check_version', {
        app_type: "pos"
      });

      console.log('Version check response:', response.data); // Debug log

      if (response.data.st === 1) {
        const currentVersion = '0.1.0'; // Hardcoded current version
        const serverVersion = response.data.version;

        console.log('Versions:', { current: currentVersion, server: serverVersion }); // Debug log

        const hasUpdate = this.compareVersions(currentVersion, serverVersion);
        console.log('Update available:', hasUpdate); // Debug log

        return {
          hasUpdate,
          currentVersion,
          serverVersion
        };
      }

      return { hasUpdate: false };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { 
        hasUpdate: false, 
        error: error.message,
        currentVersion: '0.1.0',
        serverVersion: 'Unknown'
      };
    }
  }

  static isValidVersion(version) {
    if (!version) return false;
    const versionRegex = /^\d+\.\d+\.\d+$/;
    return versionRegex.test(version);
  }

  static compareVersions(current, server) {
    try {
      if (!current || !server) return false;

      const currentParts = current.split('.').map(Number);
      const serverParts = server.split('.').map(Number);

      while (currentParts.length < 3) currentParts.push(0);
      while (serverParts.length < 3) serverParts.push(0);

      // Compare each part
      for (let i = 0; i < 3; i++) {
        if (isNaN(currentParts[i]) || isNaN(serverParts[i])) return false;
        
        if (serverParts[i] > currentParts[i]) return true;  // Update available
        if (serverParts[i] < currentParts[i]) return false; // No update needed
      }

      return false; // If versions are the same
    } catch (error) {
      console.error('Version comparison error:', error);
      return false;
    }
  }
}
