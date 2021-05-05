import * as React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import TileList from '../components/associated-devices/tile-list';
import Header from '../components/top-header';
import StoreDeviceDataModel from '../utils/data-models/store-device-data-model';
import store from '../utils/store';
import { useRoute } from '@react-navigation/native';
import ble from "../utils/ble";
import { Alert } from 'react-native';
import { ToastAndroid } from 'react-native';
import assets from '../assets';
import { ThemeConsumer } from 'react-native-elements';

class DevicesScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isInFocus: null,
            devices: [],
            needsRefresh: false
        }
    }

    componentDidMount() {
        this.refreshDevices();
    }

    refreshDevices = () => {
        store.getAllDevices()
            .then(devices => {
                let i = 0;
                console.log(devices);
                devices.forEach(d => {
                    ++i;
                    d['onFindPress'] = this.onFindPress.bind(this, d.uuid, d.accessCode);
                    d['onDeletePress'] = this.onDeletePress.bind(this, d.uuid, d.deviceName);
                    d['color'] = assets.color.inactive;
                    d['active'] = i % 2 == 0 ? false : true;
                })
                this.setState({ devices: [...devices] })
            });
    }

    onDeletePress = (deviceId, deviceName) => {
        Alert.alert(
            "Atenție!!!",
            `Ești pe cale de a șterge asocierea cu dispozitivul '${deviceName}'. Ești sigur că vrei să continui această acțiune?`,
            [
                {
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
                        await this.setState({ devices: [...filteredDevices] });
                        ToastAndroid.show(`${deviceName} a fost șters.`, ToastAndroid.SHORT);
                    }
                }
            ]
        );

    }

    onFindPress = async (deviceId,accessCode) => {
        print = (p) => console.log(`-------------${p}-------------`);
        print('Finding');

        try{
            await ble.findDevice(deviceId,accessCode);
        }
        catch(e){
            console.error(e);
        }
    }

    onRefreshPress = () =>{
        this.refreshDevices();
    }

    render() {
        if(this.props.route.params?.deviceAdded)
            console.log(this.props.route.params?.deviceAdded);
        return (
            <View>
                <Header
                    buttonAction={this.onRefreshPress}
                    isLoading={this.state.isLoading}
                    buttonTitle="Împrospătare"
                ></Header>
                <ScrollView style={{ marginBottom: 95, paddingTop: 6 }}>

                    <View style={styles.associatedDevicesContainer}>
                        {this.state.devices.length != 0 && <TileList devices={this.state.devices} />}
                        {this.state.devices.length == 0 && <Text style={{ fontSize: 40 }}>Niciun dispozitiv adăugat</Text>}
                    </View>


                    <Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text>
                    <View style={styles.cnt}>

                        <Button
                            title="Clean"
                            onPress={async () => { store.cleanup(); this.refreshDevices(); }}
                        />
                        <Button
                            title='Print'
                            onPress={
                                async () => {
                                    const a = await store.getAllDevices();
                                    console.log(a);
                                }} />
                        <Button
                            title='Add'
                            onPress={
                                async () => {
                                    await store.store(
                                        '12:34:56:78:90:11',
                                        new StoreDeviceDataModel('12:34:56:78:90:11', 'Chei garaj', 'ac111'));
                                    await store.store(
                                        '12:34:56:78:90:12',
                                        new StoreDeviceDataModel('12:34:56:78:90:12', 'Cheile de la garsoniera', 'ac222'));
                                    await store.store(
                                        '12:34:56:78:90:13',
                                        new StoreDeviceDataModel('12:34:56:78:90:13', 'Chei masina', 'ac333'));
                                    this.refreshDevices();
                                }} />
                    </View>
                </ScrollView>
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
    cnt: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

});