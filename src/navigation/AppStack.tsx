import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/AppStack/HomeScreen";
import MusicScreen from "../screens/AppStack/MusicScreen";
import { AppStackParamList } from "./navigation.types";
import SuccessScreen from "../screens/AppStack/SuccessScreen";

const Stack = createStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Music" component={MusicScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
}
