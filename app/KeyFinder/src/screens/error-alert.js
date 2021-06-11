import { Alert } from "react-native";
import { BluetoothError, DeviceNotInRangeError, KfAppError, LocationError, LocationServicesError } from "../logic/err/kf-app-error";
import BtManager from '../logic/bt-manager';
import { PermissionsAndroid } from "react-native";

export default class ErrorAlert {

    static handleBluetoothError = () => {
        Alert.alert(
            "Bluetooth-ul nu este pornit",
            "Pentru a continua acțiunea, acesta trebuie să fie pornit. Se permite pornirea bluetooth-ului?",
            [
                {
                    text: "Nu",
                    onPress: () => { },
                    style: "cancel"
                },
                {
                    text: "Da",
                    onPress: () => BtManager.manager.enable(),
                }
            ]
        );
    }

    static handleLocationServicesError = () => {
        Alert.alert(
            "Locația nu este pornită",
            "Pentru a continua acțiunea, aceasta trebuie să fie pornită.",
            [
                {
                    text: "Ok",
                    onPress: () => { },
                }
            ]
        );
    }

    static handleLocationError = () => {
        PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Accesul la locație nu este permis",
                message:
                    "Penru ca aplicația să funcționeze corespunzător, permisiunea " +
                    "de a accesa locația dispozitivului este necesară.",
                buttonPositive: "Am înțeles"
            }
        );
    }

    static handleDeviceNotInRangeError = () => {
        Alert.alert(
            'Dispozitivul nu a putut fi contactat',
            "Cauze posibile:\n\n" +
            "Poziția dumneavoastră față de dispozitiv s-a schimbat de la momentul ultimei căutări.\n\n" +
            "Dispozitivul este conectat cu o altă aplicație mobilă.\n\n" +
            "Bluetooth-ul sau locația sunt oprite.",
            [{ text: "Am înțeles", onPress: () => { }, }]);
    }

    static handleAllErrors = (e) => {
        if (e instanceof KfAppError) {
            if (e instanceof LocationError) {
                this.handleLocationError();
            }
            else if (e instanceof BluetoothError) {
                this.handleBluetoothError();
            }
            else if (e instanceof LocationServicesError) {
                this.handleLocationServicesError();
            }
            else if (e instanceof DeviceNotInRangeError) {
                this.handleDeviceNotInRangeError();
            }
            return true;
        }
        return false;
    }
}