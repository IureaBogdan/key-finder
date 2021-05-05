import AsyncStorage from "@react-native-community/async-storage";
import StoreDeviceDataModel from "./data-models/store-device-data-model";

class Store {
    async store(key, storeDeviceDataModel) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(storeDeviceDataModel))
        }
        catch (e) {
            console.log(e);
        }
    }

    async retrieve(key) {
        try {
            return await AsyncStorage.getItem(key);
        }
        catch (e) {
            console.error(e);
        }
    }

    async remove(key) {
        try {
            return await AsyncStorage.removeItem(key);
        }
        catch (e) {
            console.error(e);
        }
    }

    async getAllDevices() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            let devices = [];
            for (let i = 0; i < keys.length; i++) {
                const d = await this.retrieve(keys[i]);

                const obj = JSON.parse(d);
                const device = Object.create(StoreDeviceDataModel.prototype, Object.getOwnPropertyDescriptors(obj));

                devices.push(device);
            }
            return devices;
        }
        catch (e) {
            console.error(e);
        }
    }

    async cleanup() {
        try {
            await AsyncStorage.clear();
        }
        catch (e) {
            console.error(e);
        }
    }

}

const store = new Store();
export default store;