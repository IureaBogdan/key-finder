import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import assets from '../../color';

export default class Tile extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={styles.container}>
                <View>
                    <Text style={styles.title}>
                        {this.props.title}
                    </Text>
                </View>
                <View style={styles.buttonGroup}>
                    <Button
                        title='Găsește'
                        buttonStyle={styles.findButtonStyle} />
                    <Button
                        title='Șterge'
                        buttonStyle={styles.deleteButtonStyle} />

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: 130,
        width: '48%',
        borderRadius: 5,
        backgroundColor: 'white',

        paddingVertical: 6,
        paddingHorizontal: 10,
        marginVertical: 3,

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        elevation: 9,
        shadowColor: '#000'
    },
    title: {
        fontSize: 20,
    },
    id: {
    },

    buttonGroup: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    findButtonStyle: {
        backgroundColor: assets.color.primary,
    },

    deleteButtonStyle: {
        backgroundColor: 'red',
    },

});