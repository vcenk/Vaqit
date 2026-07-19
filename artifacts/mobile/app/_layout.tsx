import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PrayerProvider, usePrayer } from '@/context/PrayerContext';
import { TrackerProvider } from '@/context/TrackerContext';
import { NotificationProvider, useNotifications } from '@/context/NotificationContext';
import { MosqueProvider } from '@/context/MosqueContext';
import { SupporterProvider } from '@/context/SupporterContext';
import { LocaleProvider } from '@/context/LocaleContext';

/** Sits inside both PrayerProvider and NotificationProvider; reschedules whenever location/method changes. */
function NotificationScheduler() {
  const { settings } = usePrayer();
  const { scheduleAll, permissionStatus } = useNotifications();
  useEffect(() => {
    if (permissionStatus === 'granted') {
      scheduleAll(settings);
    }
  }, [settings.latitude, settings.longitude, settings.calculationMethod, settings.madhab, settings.highLatitudeRule, permissionStatus]);
  return null;
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  useEffect(() => {
    AsyncStorage.getItem('vaqit_onboarding_done').then((done) => {
      if (!done) {
        router.replace('/onboarding');
      }
    });
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen
        name="notification-health"
        options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="hijri-calendar"
        options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="mosque-timetable"
        options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="privacy"
        options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="supporter"
        options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <LocaleProvider>
              <SupporterProvider>
                <TrackerProvider>
                  <MosqueProvider>
                  <NotificationProvider>
                    <PrayerProvider>
                      <NotificationScheduler />
                      <RootLayoutNav />
                    </PrayerProvider>
                  </NotificationProvider>
                  </MosqueProvider>
                </TrackerProvider>
              </SupporterProvider>
              </LocaleProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
