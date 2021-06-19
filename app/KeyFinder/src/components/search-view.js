import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from 'react-native-elements';
import assets from "../../assets/assets";

export default class SearchView extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                <View>
                    <ActivityIndicator size="large" color={assets.color.primary.basic} />
                </View>
                <View style={styles.textContainer}>
                    <Text h4 h4Style={styles.h4style}>{this.props.title}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        width: '90%'
    },
    h4style: {
        color: assets.color.primary.basic,
        textAlign: "center"
    },
});