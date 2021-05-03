
import { BleManager } from 'react-native-ble-plx';

function print(v) {
    console.log(`-------------${v}------------`);
}

BL_MESSAGE = 'RklORA==';
class KfBleUtil {

    constructor() {
        this.data = require("../../assets/devices/devices-data.json");
        this.manager = new BleManager();
        this.connected_device_id = null;
    }

    searchForDevices() {
        var p = new Promise((resolve, reject) => {
            print('Scanning')

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
        return p;
    }

    st() {
        this.searchForDevices()
            .then(d => {
                console.log(d);
            })
            .catch(err => console.log(err));
    }

    connect() {
        this.searchForDevices()
            .then(d => {
                console.log(d);
                d[0].connect()
                    .then(connected_device => {
                        console.log(connected_device);
                        return this.manager.discoverAllServicesAndCharacteristicsForDevice(connected_device.id)
                    })
                    .then(dev => {
                        let ids = 0;
                        dev.services()
                            .then(services => {
                                service = services.find(x => x.uuid == this.data.gatt_service_uuid)
                                service.characteristics()
                                    .then(chs => console.log(chs))
                            });
                    })
                    .catch(err => {
                        console.log(err)
                    });
            })
            .catch(err => console.log(err));


    }

    dc() {
        print("Deconectare");
        this.manager.cancelDeviceConnection(this.device.id)
            .catch(err => {
                print('Eroare la deconectare');
                console.log(err);
            })
    }

    forceDC() {
        print("Deconectare fortata")
        this.manager.cancelDeviceConnection("10:52:1C:68:A5:92")
            .catch(err => {
                print('Eroare la deconectare');
                console.log(err);
            })
    }

    forceSend() {
        print('Trimitere mesaj');
        this.manager.writeCharacteristicWithoutResponseForDevice(
            "10:52:1C:68:A5:92",
            "000000ff-0000-1000-8000-00805f9b34fb", "0000ff01-0000-1000-8000-00805f9b34fb", "RklORA==")
            .catch(err => {
                print('Eroare la trimiterea mesajului');
                console.log(err);
            });
    }
}

// this.manager.onStateChange(state => {
//     console.log(state);
// });

const instance = new KfBleUtil();
export default instance;