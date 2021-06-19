import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import Tile from './associated-devices-tile';

export default class TileList extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        let devices = []
        this.props.devices.forEach(dev => {
            devices.push(
                <Tile
                    title={dev.deviceName}
                    key={dev.uuid}
                    onFindPress={dev.onFindPress}
                    onDeletePress={dev.onDeletePress}
                    color={dev.color}
                    active={dev.active}
                    loading={dev.loading}
                    deviceId={dev.uuid}
                />
            );
        });
        return (<View style={styles.container}>{devices}</View>);
    }
}
const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
    },
});