import { useRoute } from '@react-navigation/native';
import * as React from 'react';
import { Alert, StyleSheet, ToastAndroid, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import TileList from '../components/found-devices/tile-list';
import Overlay from '../components/overlay-add-device.js';
import Header from '../components/top-header';
import ble from '../utils/ble';
import StoreDeviceDataModel from '../utils/data-models/store-device-data-model';
import store from '../utils/store';


class SearchScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            overlayVisible: false,
            isLoading: false,
            isCheckingSecurityCode: false,
            devices: [],
            deviceId: null,

            deviceName: '',
            securityCode: '',
            securityCodeErrorMessage: '',
            deviceNameErrorMessage: '',
        }

    }

    updateDevices = () => {
        let devices = [];
        this.state.devices.forEach(d => {
            devices.push({
                title: d.localName,
                deviceId: d.id,
                key: d.id,
                onPress: this.addDeviceButtonAction.bind(this, d.id)
            });
        });
        return devices
    }
    onDeviceNameChange = async (value) => { this.setState({ deviceName: value }) }
    
    onSecurityCodeChange = async (value) => { this.setState({ securityCode: value }) }
    
    toggleOverlay = async () => {
        this.setState({
            deviceName: '',
            securityCode: '',
            securityCodeErrorMessage: '',
            deviceNameErrorMessage: '',
            overlayVisible: !this.state.overlayVisible
        })
    }

    async searchButtonAction() {
        ToastAndroid.show("Se caută dispozitive...", ToastAndroid.SHORT);
        this.setState({ isLoading: true });

        const d = await ble.searchForDevices();
        this.setState({ isLoading: false, devices: [...d] }, () => {
            if (this.state.devices.length > 0)
                ToastAndroid.show("Au fost găsite dispozitive în apropiere.", ToastAndroid.SHORT);
            else
                ToastAndroid.show("Nu a fost găsit niciun dispozitiv.", ToastAndroid.SHORT);
        });
    }

    async addDeviceButtonAction(deviceId) {
        this.setState({ deviceId: deviceId, overlayVisible: true });
    }

    async submitAddDevice() {
        let hasErr = false;
        if (this.state.deviceName == '')
            this.setState(
                { deviceNameErrorMessage: 'Numele dispozitivului este obligatoriu.' },
                () => { hasErr = true });
        else if (this.state.securityCode == '')
            this.setState(
                { securityCodeErrorMessage: 'Codul de securitate este obligatoriu.' },
                () => { hasErr = true });
        else if (this.state.securityCode.length != 8)
            this.setState(
                { securityCodeErrorMessage: 'Lungimea codului de securitate trebuie să fie de 8 caractere.' },
                () => { hasErr = true });

        if (!hasErr) {
            this.setState({ isCheckingSecurityCode: true });
            try {
                const accessCode = await ble.addDevice(this.state.deviceId, this.state.securityCode);
                if (accessCode != "NO DATA") {
                    await store.store(this.state.deviceId,
                        new StoreDeviceDataModel(this.state.deviceId, this.state.deviceName, accessCode));
                    console.log(accessCode);
                    this.setState({ overlayVisible: false });
                    this.props.navigation.navigate('Asocieri', { needsRefresh: true })
                    ToastAndroid.show('Dispozitivul a fost adăugat.', ToastAndroid.SHORT);
                }
                else ToastAndroid.show('Codul de securitate este incorect.', ToastAndroid.SHORT);
            }
            catch (e) {
                this.setState({ overlayVisible: false }, () => {
                    Alert.alert(
                        e.message,
                        `Cauze posibile:\n   *v-ați depărtat de dispozitiv.\n   *dispozitivul este deja conectat.`,
                        [
                            {
                                text: "Am înțeles",
                                onPress: () => { },
                            }
                        ]);
                });
            }
            finally {
                this.setState({
                    deviceName: '',
                    securityCode: '',
                    deviceNameErrorMessage: '',
                    securityCodeErrorMessage: '',
                    isCheckingSecurityCode: false
                });
            }
        }
    }

    render() {
        return (
            <View>
                <Header
                    buttonAction={() => this.searchButtonAction()}
                    isLoading={this.state.isLoading}
                    buttonTitle="Căutare" />

                <ScrollView style={{ marginBottom: 95, paddingTop: 6 }}>
                    <View style={styles.foundDevicesContainer}>
                        <TileList devices={this.updateDevices()} />
                    </View>
                </ScrollView>

                <Overlay
                    isVisible={this.state.overlayVisible}
                    deviceId={this.state.deviceId}

                    deviceNameValue={this.state.deviceName}
                    onDeviceNameChange={(x) => this.onDeviceNameChange(x)}

                    securityCodeValue={this.state.securityCode}
                    onSecurityCodeChange={this.onSecurityCodeChange}

                    deviceNameErrorMessage={this.state.deviceNameErrorMessage}
                    securityCodeErrorMessage={this.state.securityCodeErrorMessage}

                    isLoading={this.state.isCheckingSecurityCode}

                    onAddPress={this.submitAddDevice.bind(this)}
                    onBackdropPress={this.toggleOverlay} />
            </View>
        );
    }
}

export default function (props) {
    const route = useRoute();
    return <SearchScreen {...props} route={route} />
}

const styles = StyleSheet.create({

    foundDevicesContainer: {
        width: '92%',
        marginHorizontal: '4%',
    },
});