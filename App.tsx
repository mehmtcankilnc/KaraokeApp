import "./global.css";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AppStack from "./src/navigation/AppStack";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
import { ModalProvider } from "./src/providers/ModalProvider";

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={"default"} />
        <SafeAreaView
          style={{ flex: 1, backgroundColor: "#fee9e6" }}
          edges={[]}
        >
          <ModalProvider>
            <AppStack />
          </ModalProvider>
        </SafeAreaView>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
