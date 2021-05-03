import * as React from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Header from '../components/top-header';
import ble from '../utils/ble';
import TileList from '../components/found-devices/tile-list';
import Overlay from '../components/overlay-add-device.js';


export default class SearchScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            overlayVisible: false,
            isLoading: false,
            devices: [],
            deviceId: null
        }

    }
    toggleOverlay() { this.setState({ overlayVisible: !this.state.overlayVisible }) }

    buttonAction() {
        this.setState({ isLoading: true });

        ble.searchForDevices()
            .then(d => {
                console.log(d);
                this.setState({ isLoading: false, devices: [...d] });
            });
    }

    deviceButtonAction(deviceId){
        this.setState({deviceId: deviceId,overlayVisible:true});
    }

    render() {
        let devices = [];
        for (let i = 0; i < 6; i++) {
            let idf = '12:34:56:78:90:1'.concat(i);
            devices.push({
                title: 'Key Finder',
                deviceId: idf,
                key: idf,
                onPress: this.deviceButtonAction.bind(this,idf)
            });
        }

        return (
            <View>
                <Header
                    buttonAction={() => this.buttonAction()}
                    isLoading={this.state.isLoading}
                    buttonTitle="Caută"
                ></Header>

                <ScrollView style={{ marginBottom: 95, paddingTop: 6 }}>
                    <View style={styles.foundDevicesContainer}>
                        <TileList devices={devices} />
                    </View>
                </ScrollView>

                <Overlay
                    isVisible={this.state.overlayVisible}
                    deviceId = {this.state.deviceId}
                    onBackdropPress={() => this.toggleOverlay()} />
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