import { useRoute } from '@react-navigation/native';
import * as React from 'react';
import { Alert, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import assets from '../../assets/assets';
import BtManager from "../logic/bt-manager";
import store from '../logic/storage-manager';
import TileList from '../components/associated-devices/tile-list';
import BlankView from '../components/blank-view';
import Header from '../components/top-header';
import ErrorAlert from './error-alert';
import SearchView from '../components/search-view';

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
            if (devices.length > 0)
                this.refreshDevices()
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
            await BtManager.findDevice(deviceId, accessCode);
        }
        catch (e) {
            if (!ErrorAlert.handleAllErrors(e)) {
                console.log('Eroare la localizarea dispozitivlului.');
                console.error(e);
            }
        }
    }

    refreshDevices = () => {
        store.getAllDevices().then((devices) => {
            if (devices.length == 0) {
                Alert.alert(
                    "Nu s-au găsit asocieri.",
                    `Apasă pe tab-ul 'Caută' pentru a descoperi noi dispozitive, apoi asociază telefonul cu unul sau mai multe din acestea.`,
                    [{ text: "Am înțeles", onPress: () => { } }]);
                return;
            }
            devices.forEach(d => {
                d['onFindPress'] = this.onFindPress.bind(this, d.uuid, d.accessCode);
                d['onDeletePress'] = this.onDeletePress.bind(this, d.uuid, d.deviceName);
                d['color'] = assets.color.additional.inactive;
                d['active'] = false;
            });
            this.setState({ isLoading: true }, async () => {
                let hasFound = false;
                let hasErrors = false;
                try {
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
                    if (!ErrorAlert.handleAllErrors(e)) {
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
                                ToastAndroid.show("Nu a fost găsit niciun dispozitiv asociat.", ToastAndroid.SHORT);
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
                        title='Asocieri'
                        buttonAction={this.refreshDevices}
                        isLoading={this.state.isLoading}
                        buttonTitle="Reîmprospătare"
                    ></Header>
                    {(this.state.devices.length > 0 && !this.state.isLoading) &&
                        <ScrollView style={{ marginBottom: 95, paddingTop: 6 }}>
                            <View style={styles.associatedDevicesContainer}>
                                {this.state.devices.length != 0 && <TileList devices={this.state.devices} />}
                            </View>
                        </ScrollView>
                    }
                    {(this.state.devices.length > 0 && this.state.isLoading) &&
                        <View style={styles.searchContainer}>
                            <SearchView
                                title="Se caută dispozitivele asociate"
                                style={styles.blank} />
                        </View>
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
    searchContainer: {
        marginVertical: "50%",
    }
});