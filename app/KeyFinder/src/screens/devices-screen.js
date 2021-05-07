import { useRoute } from '@react-navigation/native';
import * as React from 'react';
import { Alert, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import assets from '../assets';
import TileList from '../components/associated-devices/tile-list';
import BlankView from '../components/blank-view';
import Header from '../components/top-header';
import BtManager from "../utils/bt-manager";
import ErrorHandler from '../utils/error-handler';
import store from '../utils/storage-manager';

class DevicesScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            devices: [],
        }
    }

    componentDidMount() {
        store.getAllDevices().then((devices) => {
            if (devices.length > 0) {
                devices.forEach(d => {
                    d['onFindPress'] = this.onFindPress.bind(this, d.uuid, d.accessCode);
                    d['onDeletePress'] = this.onDeletePress.bind(this, d.uuid, d.deviceName);
                    d['color'] = assets.color.inactive;
                    d['active'] = false;
                });
                this.setState({ devices: [...devices] });
            }
        });
    }

    onDeletePress = (deviceId, deviceName) => {
        Alert.alert(
            "Atenție!!!",
            `Ești pe cale de a șterge asocierea cu dispozitivul '${deviceName}'. Ești sigur că vrei să continui această acțiune?`,
            [{
                text: "Anulează",
                onPress: () => { },
                style: "cancel"
            },
            {
                text: "Da",
                onPress: async () => {
                    await store.remove(deviceId);
                    const filteredDevices = this.state.devices.filter((d) => {
                        return d.uuid != deviceId;
                    });
                    this.setState({ devices: [...filteredDevices] }, () => { ToastAndroid.show(`${deviceName} a fost șters.`, ToastAndroid.SHORT); });
                }
            }]);
    }

    onFindPress = async (deviceId, accessCode) => {
        try {
            if ((await BtManager.findDevice(deviceId, accessCode)).success)
                ToastAndroid.show('Dispozitivul a fost contactat.', ToastAndroid.SHORT);
        }
        catch (e) {
            if (!ErrorHandler.handleAllErrors(e)) {
                console.log('Eroare la căutarea dispozitivelor');
                console.error(e);
            }
        }
    }

    onRefreshPress = () => {
        this.refreshDevices(true);
    }

    refreshDevices = (withAlert) => {
        store.getAllDevices().then((devices) => {
            if (devices.length == 0 && withAlert) {
                Alert.alert(
                    "Nu s-au găsit asocieri.",
                    `Apasă pe tab-ul 'Caută' pentru a descoperi noi dispozitive, apoi asociază telefonul cu unul sau mai multe din acestea.`,
                    [{ text: "Am înțeles", onPress: () => { } }]);
                return;
            }
            devices.forEach(d => {
                d['onFindPress'] = this.onFindPress.bind(this, d.uuid, d.accessCode);
                d['onDeletePress'] = this.onDeletePress.bind(this, d.uuid, d.deviceName);
                d['color'] = assets.color.inactive;
                d['active'] = false;
            });
            this.setState({ isLoading: true }, async () => {
                let hasFound = false;
                let hasErrors = false;
                try {
                    ToastAndroid.show("Se caută dispozitivele asociate...", ToastAndroid.SHORT);
                    const scannedDevices = await BtManager.searchForDevices();
                    devices.forEach(d => {
                        const found = scannedDevices.filter(sd => sd.id == d.uuid)
                        if (found.length > 0) {
                            d['active'] = true;
                            hasFound = true;
                        }
                        else d['active'] = false;
                    });
                }
                catch (e) {
                    hasErrors = true;
                    if (!ErrorHandler.handleAllErrors(e)) {
                        console.log('Eroare la căutarea dispozitivelor');
                        console.error(e);
                    }
                }
                finally {
                    this.setState({ isLoading: false, devices: [...devices] }, () => {
                        if (!hasErrors) {
                            if (hasFound)
                                ToastAndroid.show("Au fost găsite dispozitive în apropiere.", ToastAndroid.SHORT);
                            else
                                ToastAndroid.show("Nu a fost găsit niciun dispozitiv.", ToastAndroid.SHORT);
                        }
                    });
                }
            });
        });
    }

    render() {
        return (
            <View>
                <View>
                    <Header
                        title = 'Asocieri'
                        buttonAction={this.onRefreshPress}
                        isLoading={this.state.isLoading}
                        buttonTitle="Împrospătare"
                    ></Header>
                    {this.state.devices.length > 0 &&
                        <ScrollView style={{ marginBottom: 95, paddingTop: 6 }}>
                            <View style={styles.associatedDevicesContainer}>
                                {this.state.devices.length != 0 && <TileList devices={this.state.devices} />}
                            </View>
                        </ScrollView>
                    }
                    {this.state.devices.length == 0 &&
                        < BlankView
                            title="Nu există asocieri cu dispozitivele KeyFinder. Apasă pe tab-ul caută pentru a adăuga unul."
                            style={styles.blank} />
                    }
                </View>

                <View>
                </View>
            </View>
        );
    }
}

export default function (props) {
    const route = useRoute();
    return <DevicesScreen {...props} route={route} />
}

const styles = StyleSheet.create({
    associatedDevicesContainer: {
        width: '96%',
        marginHorizontal: '2%',
    },
    blank: {
        marginVertical: 80,
    },
});