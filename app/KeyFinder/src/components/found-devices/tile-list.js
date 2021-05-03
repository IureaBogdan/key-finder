import * as React from 'react';
import { View } from 'react-native';
import Tile from './found-devices-tile';

export default class TileList extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        let devices = []
        this.props.devices.forEach(dev => {
            devices.push(
                <Tile
                    title={dev.title}
                    deviceId={dev.deviceId}
                    onPress = {dev.onPress}
                    key={dev.key} />
            );
        });
        return (<View>{devices}</View>);
    }
}