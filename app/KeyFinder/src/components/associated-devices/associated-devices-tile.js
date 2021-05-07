import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import assets from '../../assets';

export default class Tile extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const iconSize = 100;
        return (
            <View
                style={styles.container}
                opacity={this.props.active ? 1 : 0.85}
            >
                <View>
                    <Text style={styles.title}>{this.props.title}</Text>
                    <Text> ID: {this.props.deviceId}</Text>
                </View>
                <View style={styles.iconContainer}>
                    <Ionicons
                        style={{ height: iconSize, width: iconSize }}
                        name={'key-sharp'}
                        size={iconSize}
                        color={this.props.active ? assets.color.primary : assets.color.inactive} />
                </View>
                <View style={styles.buttonGroup}>
                    <Button
                        icon={
                            <Ionicons
                                name={'close-circle-outline'}
                                size={20}
                                color={assets.color.secondary}
                            />
                        }
                        containerStyle={styles.deleteButtonContainer}
                        buttonStyle={styles.deleteButtonStyle}
                        onPress={this.props.onDeletePress} />
                    <Button
                        title='Găsește'
                        disabled={!this.props.active}
                        containerStyle={styles.findButtonContainer}
                        buttonStyle={styles.findButtonStyle}
                        onPress={this.props.onFindPress} />

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        minHeight: 200,
        width: '48%',
        borderRadius: 5,
        backgroundColor: 'white',

        paddingVertical: 6,
        paddingHorizontal: 10,
        marginVertical: 7,

        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        elevation: 9,
        shadowColor: '#000',
    },
    title: {
        margin: 2,
        fontSize: 20,
    },
    iconContainer: {
        display: 'flex',
        // justifyContent: 'center',
        alignItems: 'center'
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'row',
        alignContent: 'space-between',
    },
    findButtonContainer: {
        margin: '1%',
        width: '70%',
    },
    deleteButtonContainer: {
        margin: '1%',
        width: '28%',
    },
    findButtonStyle: {
        backgroundColor: assets.color.primary,
        borderRadius: 15,

    },
    deleteButtonStyle: {
        backgroundColor: 'red',
        borderRadius: 1000,
    },
});