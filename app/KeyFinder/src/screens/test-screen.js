import { useRoute } from '@react-navigation/native';
import * as React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-elements';
import SDDM from '../logic/data-models/store-device-data-model'
import assets from '../../assets/assets';
import store from '../logic/storage-manager';

var ids = [
    '12:23:34:45:56:67',
    '12:23:34:45:56:68',
    '12:23:34:45:56:69',
    '12:23:34:45:56:60'
]
class TestScreen extends React.Component {
    constructor(props) {
        super(props)
    }

    addThreeDevices = async () => {
        var device1 = new SDDM(
            ids[0],
            'Chei apartament',
            'EEEEEEEE'
        );
        var device2 = new SDDM(
            ids[1],
            'Chei mașină',
            'EEEEEEEE'
        );
        var device3 = new SDDM(
            ids[2],
            'Mașa',
            'EEEEEEEE'
        );
        await store.store(device1.uuid, device1);
        await store.store(device2.uuid, device2);
        await store.store(device3.uuid, device3);
    }

    addOneDevice = async () => {
        var device = new SDDM(
            ids[3],
            'Chei garsonieră',
            'EEEEEEEE'
        );
        await store.store(device.uuid, device);
    }

    clearStorage = () => {
        ids.forEach(id => {
            store.remove(id);
        });
    }

    render() {
        return (
            <View>
                <View style={styles.header}>
                    <Text style={styles.text}>Functii de test</Text>
                </View>
                <View style={styles.center}>
                    <Button title={'Adaugă 3 dispozitive'}
                        buttonStyle={styles.button}
                        onPress={this.addThreeDevices} />
                    <Button title={'Adaugă un dispozitiv'}
                        buttonStyle={styles.button}
                        onPress={this.addOneDevice} />
                    <Button title={'Sterge dispozitivele de test'}
                        buttonStyle={styles.buttonD}
                        onPress={this.clearStorage} />
                </View>
            </View>
        );
    }
}

export default function (props) {
    const route = useRoute();
    return <TestScreen {...props} route={route} />
}

const styles = StyleSheet.create({
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'green',
        height: 90,
        paddingTop: 20,
        backgroundColor: assets.color.primary.basic,
    },
    center: {
        padding: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        height: 500,
    },
    text: {
        color: assets.color.secondary.basic,
        fontSize: 30,
    },
    button: {
        backgroundColor: assets.color.primary.basic,
    },
    buttonD: {
        backgroundColor: 'red',
    }
});