import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import * as React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import assets from './assets/assets';

import  DevicesScreen from './src/screens/devices-screen';
import SearchScreen from './src/screens/search-screen';
import TestScreen from './src/screens/test-screen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Asocieri') {
              iconName = focused
                ? 'bulb'
                : 'bulb-outline';
            } else if (route.name === 'Caută') {
              iconName = focused ? 'search' : 'search-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: assets.color.primary.basic,
          inactiveTintColor: assets.color.additional.inactive,
        }}
      >
        <Tab.Screen name="Asocieri" component={DevicesScreen} />
        <Tab.Screen name="Caută" component={SearchScreen} />
        <Tab.Screen name="Teste" component={TestScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}