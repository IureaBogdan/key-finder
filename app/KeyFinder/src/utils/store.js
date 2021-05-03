import AsyncStorage from "@react-native-community/async-storage";

class Store {
    async store(key, storeDeviceDataModel) {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(storeDeviceDataModel))
            return await 0;
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

    async getAllDevices() {
        try {
            const keys = await AsyncStorage.getAllKeys();
            let devices = [];
            for(let i =0; i< keys.length;i++){
                const d = await this.retrieve(keys[i]);
                devices.push(d);
            }
            return devices;
        }
        catch (e) {
            console.error(e);
        }
    }

}

const store = new Store();
export default store;