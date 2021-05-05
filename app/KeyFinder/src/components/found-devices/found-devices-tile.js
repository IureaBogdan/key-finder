import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import assets from '../../assets';

export default class Tile extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <View style = {styles.container}>
                <View>
                    <Text style={styles.title}>
                        {this.props.title}
                    </Text>
                    <Text style={styles.id}>
                        {this.props.deviceId}
                    </Text>
                </View>
                <Button
                    title='Adaugă'
                    onPress = {this.props.onPress}
                    buttonStyle = {styles.buttonStyle}
                    />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        height: 55,
        borderRadius: 5,
        backgroundColor: 'white',
        
        paddingVertical: 6,
        paddingHorizontal:10,
        marginVertical:3,

        
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        elevation:9,
        shadowColor: '#000'
    },
    title: {
        fontSize: 20,
    },
    id:{
    },
    buttonStyle: {
        backgroundColor: assets.color.primary,
    },
});