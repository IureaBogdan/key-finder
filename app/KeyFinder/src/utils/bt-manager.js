import { BleManager } from 'react-native-ble-plx';
import { BluetoothError, DeviceNotInRangeError, LocationError, LocationServicesError } from './err/kf-app-error';
class BtManager {

    constructor() {
        this.data = require("./devices-data.json");
        this.manager = new BleManager();
        this.connected_device_id = null;
        this.manager.onStateChange(state => {
            this.blEnabled = state == 'PoweredOn' ? true : false;
        })
    }

    searchForDevices() {
        return new Promise((resolve, reject) => {
            let devices = [];
            this.manager.startDeviceScan(this.data.adv_service_uuids, null, (error, device) => {
                if (error) {
                    if (error.message == 'BluetoothLE is powered off')
                        reject(new BluetoothError('Bluetooth-ul nu este pornit'));
                    else if (error.message == 'Device is not authorized to use BluetoothLE')
                        reject(new LocationError('Nu s-a permis accesul la locatie'));
                    else if (error.message == 'Location services are disabled')
                        reject(new LocationServicesError('Serviciile de localizare nu sunt pornite'));
                    reject(error);
                }
                if (!devices.find(d => d.id == device.id))
                    devices.push(device);
            });
            setTimeout(() => {
                this.manager.stopDeviceScan();
                resolve(devices);
            }, 3000)
        });
    }

    addDevice(deviceID, securityCode) {
        if (this.blEnabled) {
            return this.manager.connectToDevice(deviceID)
                .then(() => {
                    return this.manager.discoverAllServicesAndCharacteristicsForDevice(deviceID);
                })
                .then(() => {
                    return this.manager.writeCharacteristicWithoutResponseForDevice(
                        deviceID,
                        this.data.gatt_service[0].uuid,
                        this.data.gatt_service[0].characteristic_uuid,
                        btoa(securityCode));
                })
                .then(() => {
                    return this.manager.readCharacteristicForDevice(
                        deviceID,
                        this.data.gatt_service[0].uuid,
                        this.data.gatt_service[0].characteristic_uuid
                    );
                })
                .then(char => {
                    this.manager.cancelDeviceConnection(deviceID);
                    return atob(char.value);
                })
                .catch((e) => {
                    this.manager.isDeviceConnected(deviceID)
                        .then(isConnected => {
                            if (isConnected)
                                this.manager.cancelDeviceConnection(deviceID);
                        });
                    this.throwErrorByType(e);
                    throw new DeviceNotInRangeError('Dispozitivul nu poate fi contactat.');
                });
        }
        else throw new BluetoothError('Bluetooth-ul nu este pornit');
    }

    findDevice(deviceID, accessCode) {
        if (this.blEnabled) {
            return this.manager.connectToDevice(deviceID)
                .then(() => {
                    return this.manager.discoverAllServicesAndCharacteristicsForDevice(deviceID);
                })
                .then(() => {
                    return this.manager.writeCharacteristicWithoutResponseForDevice(
                        deviceID,
                        this.data.gatt_service[0].uuid,
                        this.data.gatt_service[0].characteristic_uuid,
                        btoa(accessCode.concat(this.data.write_message.FIND)))
                        .catch(err => {
                            console.log(err);
                        });
                })
                .then(() => {
                    this.manager.cancelDeviceConnection(deviceID)
                        .catch(e => {
                            print('Eroare la deconectare');
                            console.error(e);
                        });
                    return { success: true };
                })
                .catch((e) => {
                    this.manager.isDeviceConnected(deviceID)
                        .then(isConnected => {
                            if (isConnected)
                                this.manager.cancelDeviceConnection(deviceID);
                        });
                    this.throwErrorByType(e);
                    throw new DeviceNotInRangeError('Dispozitivul nu poate fi contactat.');
                });
        }
        else throw new BluetoothError('Bluetooth-ul nu este pornit');
    }

    throwErrorByType(error) {
        if (error.message == 'BluetoothLE is powered off')
            throw new BluetoothError('Bluetooth-ul nu este pornit');
        else if (error.message == 'Device is not authorized to use BluetoothLE')
            throw new LocationError('Nu s-a permis accesul la locatie');
        else if (error.message == 'Location services are disabled')
            throw new LocationServicesError('Serviciile de localizare nu sunt pornite');
    }
}

const instance = new BtManager();
export default instance;