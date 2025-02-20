import axios from 'axios';

export class AutoUpdater {
  static async downloadUpdate() {
    try {
      const response = await axios.get('https://menusmitra.xyz/common_api/get_update', {
        responseType: 'blob'
      });
      
      // Create a URL for the downloaded file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'update.zip');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  static async applyUpdate() {
    // Communicate with Electron main process to apply update
    if (window.electron) {
      return await window.electron.applyUpdate();
    }
    throw new Error('Update mechanism not available');
  }
}
