import * as React from 'react';
import { Button, Text, View, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import TileList from '../components/associated-devices/tile-list';
import Header from '../components/top-header';
import ble from "../utils/ble";
import store from '../utils/store'

export default class DevicesScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    render() {
        let devices = [];
        for (let i = 0; i < 3; i++) {
            devices.push({
                title: 'Key Finder'.concat(i),
                key: '12:34:56:78:90:1'.concat(i)
            });
        }
        return (
            <View>
                <Header
                    buttonAction={() => console.log('hdr')}
                    isLoading={this.state.isLoading}
                    buttonTitle="Împrospătare"
                ></Header>
                <ScrollView style={{ marginBottom: 95, paddingTop: 6 }}>

                    <View style={styles.associatedDevicesContainer}>
                        <TileList devices={devices} />
                    </View>


                    <Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text><Text></Text>
                    <View style={styles.cnt}>
                        <Button
                            title="Connect"
                            onPress={() => ble.connect()}
                        />
                        <Button
                            title="TEST"
                            onPress={() => {
                                console.log(btoa('FIND'));
                                console.log(atob(btoa('FIND')));
                            }}
                        />
                        <Button
                            title="Force DC"
                            onPress={() => ble.forceDC()}
                        />
                        <Button
                            title="Force Send"
                            onPress={() => ble.forceSend()}
                        />
                        <Button
                            title='cauta'
                            onPress={
                                async () => {
                                    const a = await store.getAllDevices();
                                    console.log(a);
                                }
                            }
                        />
                    </View>
                </ScrollView>
            </View>
        );
    }
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