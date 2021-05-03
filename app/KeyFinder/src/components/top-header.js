
import * as React from 'react';
import { Text } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Header } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import assets from '../color';

export default class TopBar extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let button = <Button
            title={this.props.buttonTitle}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={{ width: 92 }}
            icon={
                <Icon
                    name={this.props.buttonTitle == 'Caută' ? "search" : "refresh"}
                    size={15}
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
                            Key Finder
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
        fontSize: 12
    },
});