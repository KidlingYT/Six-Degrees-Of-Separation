import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SettingsProvider } from "./Context/Settings";
import SwipeTabView from "./components/SwipeTabView";


export default function Layout() {
  return (
    <GestureHandlerRootView>
      <SettingsProvider>
        <SwipeTabView>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SwipeTabView>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}