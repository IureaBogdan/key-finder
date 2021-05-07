import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Header } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import assets from '../assets';

export default class TopBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let button = <Button
            title={this.props.buttonTitle}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonContainerStyle}
            icon={
                <Ionicons
                    name={this.props.buttonTitle == 'Căutare' ? "search" : "reload-outline"}
                    size={18}
                    color={assets.color.secondary}
                />
            }
            iconRight
            loading={this.props.isLoading}
            loadingProps={{ color: assets.color.secondary }}
            onPress={() => this.props.buttonAction()}
            type="clear" />

        return (
            <View>
                <Header
                    leftComponent={
                        <Text style={styles.title}>
                            {this.props.title}
                        </Text>}
                    leftContainerStyle={{ width: 120 }}
                    rightComponent={button}
                    containerStyle={styles.container}
                    statusBarProps={{
                        backgroundColor: assets.color.primary
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        top: 1,
        height: 95,
        backgroundColor: assets.color.primary,
    },
    title: {
        width: 118,
        fontSize: 28,
        color: assets.color.secondary
    },
    buttonTitleStyle: {
        color: assets.color.secondary,
        padding: 5,
        fontSize: 14
    },
    buttonContainerStyle:{
        width: 120,
    },
});