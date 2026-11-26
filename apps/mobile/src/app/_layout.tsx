import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColors, useScheme } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Android bundles Inter; iOS uses SF Pro, so nothing to wait for there.
  const [loaded] = useFonts(Platform.OS === 'ios' ? {} : { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Navigator />
    </GestureHandlerRootView>
  );
}

function Navigator() {
  const scheme = useScheme();
  const c = useColors();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, background: c.bg, primary: c.brand, card: c.surface, text: c.label } };

  return (
    <ThemeProvider value={theme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="login" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="(resident)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(responder)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="sos"
          options={{
            presentation: 'formSheet',
            sheetAllowedDetents: [0.82],
            sheetGrabberVisible: true,
            sheetCornerRadius: 32,
            gestureEnabled: true,
            contentStyle: { backgroundColor: Platform.OS === 'ios' ? 'transparent' : c.surface },
          }}
        />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="incident" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="offer" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
        <Stack.Screen
          name="medical-id"
          options={{ presentation: 'formSheet', sheetAllowedDetents: [0.6, 1], sheetGrabberVisible: true, contentStyle: { backgroundColor: Platform.OS === 'ios' ? 'transparent' : c.surface } }}
        />
      </Stack>
    </ThemeProvider>
  );
}
