import { Alert } from "react-native";
import { BluetoothError, DeviceNotInRangeError, KfAppError, LocationError, LocationServicesError } from "../logic/err/kf-app-error";
import BtManager from '../logic/bt-manager';
import { PermissionsAndroid } from "react-native";

export default class ErrorAlert {

    static handleBluetoothError = () => {
        Alert.alert(
            "Bluetooth-ul nu este pornit",
            "Pentru a scana dispozitivele din jur acesta trebuie pornit. Se permite pornirea bluetooth-ului?",
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
            "Serviciile de localizare nu sunt pornite",
            "Pentru a putea scana dispozitivele din jur acestea trebuie pornite.",
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
                title: "Accesul la serviciile de localizare nu este permis",
                message:
                    "Penru ca aplicația să funcționeze corespunzător, permisiunea " +
                    "de a accesa locația dispozitivului este necesară.",
                buttonPositive: "Am înțeles"
            }
        );
    }

    static handleDeviceNotInRangeError = () => {
        Alert.alert(
            'Dispozitivul nu poate fi contactat',
            "Cauze posibile:\n\n" +
            "Poziția dumneavoastră față de dispozitiv s-a schimbat de la momentul ultimei căutări.\n\n" +
            "Dispozitivul este ocupat.\n\n" +
            "Bluetooth-ul sau locația sunt oprite.\n\n"+
            "Spam al acțiunilor permise",
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