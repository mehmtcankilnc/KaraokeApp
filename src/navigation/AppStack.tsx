import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/AppStack/HomeScreen";
import MusicScreen from "../screens/AppStack/MusicScreen";

const Stack = createStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Music" component={MusicScreen} />
    </Stack.Navigator>
  );
}
