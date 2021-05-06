import { useRoute } from '@react-navigation/native';
import * as React from 'react';
import { Alert, StyleSheet, ToastAndroid, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import TileList from '../components/found-devices/tile-list';
import Overlay from '../components/overlay-add-device.js';
import Header from '../components/top-header';
import StoreDeviceDataModel from '../utils/data-models/store-device-data-model';
import store from '../utils/store';
import BtManager from '../utils/bt-manager';
import ErrorHandler from '../utils/error-handler';


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

    componentDidMount() {
        this.onSearchButtonPress();
    }

    onDeviceNameChange = (value) => { this.setState({ deviceName: value }) }

    onSecurityCodeChange = (value) => { this.setState({ securityCode: value }) }

    onToggleOverlay = () => {
        this.setState({
            deviceName: '',
            securityCode: '',
            securityCodeErrorMessage: '',
            deviceNameErrorMessage: '',
            overlayVisible: !this.state.overlayVisible
        })
    }

    onSearchButtonPress = () => {
        this.setState({ isLoading: true }, () => {
            ToastAndroid.show("Se caută dispozitive...", ToastAndroid.SHORT);
            BtManager.searchForDevices().then((d) => {
                this.setState({ devices: [...d] }, () => {
                    if (this.state.devices.length > 0)
                        ToastAndroid.show("Au fost găsite dispozitive în apropiere.", ToastAndroid.SHORT);
                    else
                        ToastAndroid.show("Nu a fost găsit niciun dispozitiv.", ToastAndroid.SHORT);
                });
            })
                .catch((e) => {
                    if (!ErrorHandler.handleAllErrors(e)) {
                        console.log('Eroare la căutarea dispozitivelor');
                        console.error(e);
                    }
                })
                .finally(() => {
                    this.setState({ isLoading: false });
                })
        });
    }

    onAddDeviceButtonPress = (deviceId) => {
        this.setState({ deviceId: deviceId, overlayVisible: true });
    }

    onSubmitAddDevice = () => {
        let hasErr = false;
        if (this.state.deviceName == '') {
            hasErr = true;
            this.setState({ deviceNameErrorMessage: 'Numele dispozitivului este obligatoriu.' });
        }
        else this.setState({ deviceNameErrorMessage: '' });

        if (this.state.securityCode == '') {
            hasErr = true;
            this.setState({ securityCodeErrorMessage: 'Codul de securitate este obligatoriu.' });
        }
        else if (this.state.securityCode.length != 8) {
            hasErr = true;
            this.setState({ securityCodeErrorMessage: 'Lungimea codului de securitate trebuie să fie de 8 caractere.' });
        }
        else this.setState({ securityCodeErrorMessage: '' });

        if (!hasErr) {
            this.setState({ isCheckingSecurityCode: true }, async () => {
                try {
                    const accessCode = await BtManager.addDevice(this.state.deviceId, this.state.securityCode);
                    if (accessCode != "NO DATA") {
                        const storeModel = new StoreDeviceDataModel(this.state.deviceId, this.state.deviceName, accessCode);
                        await store.store(this.state.deviceId, storeModel);

                        this.setState({
                            overlayVisible: false,
                            deviceName: '',
                            securityCode: '',
                        }, () => {
                            ToastAndroid.show('Adăugat. Apasă pe împrospătare pentru a vedea noul dispozitiv.', ToastAndroid.LONG);
                            this.props.navigation.navigate('Asocieri');
                        });

                    }
                    else ToastAndroid.show('Codul de securitate este incorect.', ToastAndroid.SHORT);
                }
                catch (e) {
                    this.setState({
                        overlayVisible: false,
                        deviceName: '',
                        securityCode: '',
                    }, () => {
                        if (!ErrorHandler.handleAllErrors(e)) {
                            console.log('Eroare la căutarea dispozitivelor');
                            console.error(e);
                        }
                    });
                }
                finally {
                    this.setState({
                        deviceNameErrorMessage: '',
                        securityCodeErrorMessage: '',
                        isCheckingSecurityCode: false
                    });
                }
            });
        }
    }

    updateDevices = () => {
        let devices = [];
        this.state.devices.forEach(d => {
            devices.push({
                title: d.localName,
                deviceId: d.id,
                key: d.id,
                onPress: this.onAddDeviceButtonPress.bind(this, d.id)
            });
        });
        return devices
    }

    render() {
        return (
            <View>
                <Header
                    buttonAction={() => this.onSearchButtonPress()}
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

                    onAddPress={this.onSubmitAddDevice.bind(this)}
                    onBackdropPress={this.onToggleOverlay} />
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