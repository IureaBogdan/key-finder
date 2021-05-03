export default class StorageDataModel{
    constructor(deviceName,UUID,serviceUUID, characteristic){
        this.deviceName = deviceName;
        this.UUID = UUID;
        this.serviceUUID = serviceUUID;
        this.characteristic = characteristic;
    }
}