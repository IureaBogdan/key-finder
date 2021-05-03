import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Input, Overlay } from 'react-native-elements';
import assets from '../color';

export default class AppOverlay extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Overlay
                backdropStyle={{ backgroundColor: 'rgba(125,125,125,0.6)' }}

                animationType='fade'
                transparent={true}
                statusBarTranslucent={true}

                isVisible={this.props.isVisible}
                onBackdropPress={this.props.onBackdropPress}>
                <View style={styles.container}>
                    <Input
                        value={this.props.deviceNameValue}
                        onChangeText={this.props.onDeviceNameChange}
                        errorMessage={this.props.deviceNameErrorMessage}

                        inputStyle={styles.inputStyle}
                        inputContainerStyle={styles.inputContainerStyle}
                        placeholder='Nume discpozitiv'
                    />
                    <Input
                        value={this.props.securityCodeValue}
                        onChangeText={this.props.onSecurityCodeChange}
                        errorMessage={this.props.securityCodeErrorMessage}

                        inputStyle={styles.inputStyle}
                        inputContainerStyle={styles.inputContainerStyle}
                        placeholder='Cod de securitate'
                    />
                    <View style={styles.formSubmit}>
                        <Text>{this.props.deviceId}</Text>
                        <Text style={{ color: assets.color.inactive }}> *Pentru a continua, completează câmpurile.</Text>
                        <Button
                            onPress={this.props.onAddPress}
                            title='Adaugă'
                            buttonStyle={styles.buttonStyle} />
                    </View>
                </View>
            </Overlay>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 50,
        paddingTop: 10,
        minWidth: 250,
        maxWidth: 300,
        minHeight: 250,
        height: '40%'
    },
    inputStyle: {
        color: assets.color.inactive
    },
    inputContainerStyle: {
        borderBottomColor: assets.color.primary
    },
    buttonStyle: {
        backgroundColor: assets.color.primary,
        width: 100,
        marginTop: 25
    },
    formSubmit: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
});