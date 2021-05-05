import { BleManager } from 'react-native-ble-plx';

class KfBleUtil {

    constructor() {
        this.data = require("./devices-data.json");
        this.manager = new BleManager();
        this.connected_device_id = null;
    }

    searchForDevices() {
        return new Promise((resolve, reject) => {
            let devices = [];
            this.manager.startDeviceScan(this.data.adv_service_uuids, null, (error, device) => {
                if (error) reject(Error(error));
                if (!devices.find(d => d.id == device.id))
                    devices.push(device);
            });
            setTimeout(() => {
                this.manager.stopDeviceScan()
                resolve(devices);
            }, 3000)
        });
    }

    addDevice(deviceID, securityCode) {
        return this.manager.connectToDevice(deviceID)
            .then(() => {
                return this.manager.discoverAllServicesAndCharacteristicsForDevice(deviceID);
            })
            .then(() => {
                this.manager.writeCharacteristicWithoutResponseForDevice(
                    deviceID,
                    this.data.gatt_service[0].uuid,
                    this.data.gatt_service[0].characteristic_uuid,
                    btoa(securityCode))
                    .catch(err => {
                        console.log(err);
                    });
            })
            .then(() => {
                return this.manager.readCharacteristicForDevice(
                    deviceID,
                    this.data.gatt_service[0].uuid,
                    this.data.gatt_service[0].characteristic_uuid
                );
            })
            .then(char => {
                this.manager.cancelDeviceConnection(deviceID)
                    .catch(e => {
                        print('Eroare la deconectare');
                        console.error(e);
                    });
                return atob(char.value);
            })
            .catch((e) => {
                console.error(e);
                this.manager.isDeviceConnected(deviceID)
                    .then(isConnected => {
                        if (isConnected)
                            this.manager.cancelDeviceConnection(deviceID)
                                .catch(e => {
                                    print('Eroare la deconectare');
                                    console.error(e);
                                });
                    });
                throw new Error('Dispozitivul nu poate fi contactat.');
            });
    }

    findDevice(deviceID, accessCode) {
        return this.manager.connectToDevice(deviceID)
            .then(() => {
                return this.manager.discoverAllServicesAndCharacteristicsForDevice(deviceID);
            })
            .then(() => {
                this.manager.writeCharacteristicWithoutResponseForDevice(
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
                return true;
            })
            .catch((e) => {
                console.error(e);
                this.manager.isDeviceConnected(deviceID)
                    .then(isConnected => {
                        if (isConnected)
                            this.manager.cancelDeviceConnection(deviceID)
                                .catch(e => {
                                    print('Eroare la deconectare');
                                    console.error(e);
                                });
                    });
                throw new Error('Dispozitivul nu poate fi contactat.');
            });
    }
}

// this.manager.onStateChange(state => {
//     console.log(state);
// });

const instance = new KfBleUtil();
export default instance;