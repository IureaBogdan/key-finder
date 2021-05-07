import React from "react";
import { StyleSheet } from "react-native";
import { View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from 'react-native-elements';
import assets from "../assets";

export default class BlankView extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                <Ionicons
                    name={"search-circle-outline"}
                    size={220}
                    color={assets.color.inactive}
                />
                <View style = {styles.textContainer}>
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
        color: assets.color.inactive,
        textAlign: "center"
    },
});