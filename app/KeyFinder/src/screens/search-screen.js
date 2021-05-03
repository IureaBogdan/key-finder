import * as React from 'react';
import { StyleSheet, View, ToastAndroid, Button, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../components/top-header';
import ble from '../utils/ble';
import TileList from '../components/found-devices/tile-list';
import Overlay from '../components/overlay-add-device.js';
import store from '../utils/store';
import StoreDeviceDataModel from '../utils/data-models/store-device-data-model';


export default class SearchScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            overlayVisible: false,
            isLoading: false,
            devices: [],
            deviceId: null,

            deviceName: '',
            securityCode: '',
            securityCodeErrorMessage: '',
            deviceNameErrorMessage: '',
        }

    }

    onDeviceNameChange = async (value) => { await this.setState({ deviceName: value }) }
    onSecurityCodeChange = async (value) => { await this.setState({ securityCode: value }) }
    toggleOverlay = async () => {
        await this.setState({
            deviceName: '',
            securityCode: '',
            securityCodeErrorMessage: '',
            deviceNameErrorMessage: '',
            overlayVisible: !this.state.overlayVisible
        })
    }

    async buttonAction() {
        ToastAndroid.show("Se caută dispozitive...", ToastAndroid.SHORT);
        await this.setState({ isLoading: true });

        const d = await ble.searchForDevices();
        console.log(d);
        await this.setState({ isLoading: false, devices: [...d] });
        ToastAndroid.show("Căutarea a fost realizată cu succes!", ToastAndroid.SHORT);
    }

    async deviceButtonAction(deviceId) {
        await this.setState({ deviceId: deviceId, overlayVisible: true });
    }

    async addDevice(accessCode, deviceId) {
        let hasErr = false;
        if (this.state.deviceName == '')
            await this.setState(
                { deviceNameErrorMessage: 'Numele dispozitivului este obligatoriu.' },
                () => { hasErr = true });
        else if (this.state.securityCode == '')
            await this.setState(
                { securityCodeErrorMessage: 'Codul de securitate este obligatoriu.' },
                () => { hasErr = true });
        else if (this.state.securityCode.length != 8)
            await this.setState(
                { securityCodeErrorMessage: 'Lungimea codului de securitate trebuie să fie de 8 caractere' },
                () => { hasErr = true });

        if (!hasErr) {
            //TO DO: call the device and check if the sec key is corect then get the access key.
            await store.store(
                deviceId,
                new StoreDeviceDataModel(deviceId, this.state.deviceName, accessCode));
            await this.setState({ deviceNameErrorMessage: '', securityCodeErrorMessage: '' });
        }
    }


    render() {
        let devices = [];
        for (let i = 0; i < 6; i++) {
            let idf = '12:34:56:78:90:1'.concat(i);
            devices.push({
                title: 'Key Finder',
                deviceId: idf,
                key: idf,
                onPress: this.deviceButtonAction.bind(this, idf)
            });
        }

        this.state.devices.forEach(d => {
            devices.push({
                title: d.localName,
                deviceId: d.id,
                key: d.id,
                onPress: this.deviceButtonAction.bind(this, d.id)
            });
        })

        return (
            <View>
                <Header
                    buttonAction={() => this.buttonAction()}
                    isLoading={this.state.isLoading}
                    buttonTitle="Caută" />

                <ScrollView style={{ marginBottom: 95, paddingTop: 6 }}>
                    <View style={styles.foundDevicesContainer}>
                        <TileList devices={devices} />
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

                    onAddPress={this.addDevice.bind(this, 'ACCESS_CODE = TEST', this.state.deviceId)}
                    onBackdropPress={this.toggleOverlay} />
            </View>
        );
    }
}

const styles = StyleSheet.create({

    foundDevicesContainer: {
        width: '92%',
        marginHorizontal: '4%',
    },
});