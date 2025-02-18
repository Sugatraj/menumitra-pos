
export class BluetoothPrinterService {
  constructor() {
    this.device = null;
    this.characteristic = null;
  }

  async scanAndConnect() {
    if (!navigator.bluetooth) {
      throw new Error('Bluetooth is not available on this device');
    }

    try {
      const available = await navigator.bluetooth.getAvailability();
      if (!available) {
        throw new Error('Please enable Bluetooth on your device');
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] },
          { namePrefix: 'Printer' },
          { namePrefix: 'POS' },
          { namePrefix: 'ESC' },
          { namePrefix: 'BT' }
        ],
        optionalServices: ['battery_service', '000018f0-0000-1000-8000-00805f9b34fb']
      });

      if (!device) {
        throw new Error('No printer selected');
      }

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      this.characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
      this.device = device;

      return {
        device,
        isConnected: true,
        isReady: true
      };
    } catch (error) {
      if (error.name === 'NotFoundError') {
        throw new Error('No compatible Bluetooth printers found');
      } else if (error.name === 'SecurityError') {
        throw new Error('Bluetooth permission denied');
      }
      throw error;
    }
  }

  async print(content) {
    if (!this.characteristic) {
      throw new Error('Printer not connected');
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      await this.characteristic.writeValue(data);
    } catch (error) {
      throw new Error('Failed to send print data: ' + error.message);
    }
  }

  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }
}
