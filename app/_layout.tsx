import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { use, useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/Colors';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const RootLayoutNav = () => {
  const colorScheme = useColorScheme();
  
  const MyLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: Colors.light.background, // 화면 배경
      card: Colors.light.background,       // 헤더와 탭 배경
      primary: Colors.light.tint,          // 강조 색
      text: Colors.light.text,             // 텍스트 색
      border: Colors.light.background,     // 경계선
    },
  };
  
  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.dark.background,
      card: Colors.dark.background,
      primary: Colors.dark.tint,
      text: Colors.dark.text,
      border: Colors.dark.background,
    },
  };

  const currentTheme = colorScheme === 'dark' ? MyDarkTheme : MyLightTheme;

  return (
    <ThemeProvider value={currentTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: currentTheme.colors.background },
          headerStyle: { backgroundColor: currentTheme.colors.card },
          headerTintColor: currentTheme.colors.text,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen 
          name="userDetailModal" 
          options={{ 
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: 'transparent' } // 모달은 투명 배경
          }} 
        />
        
        {/* Mission 관련 스크린들 추가 */}
        <Stack.Screen 
          name="mission/missionScreen" 
          options={{ 
            headerShown: true,
            title: '숙제 하기~🎵',
            headerBackTitle: '뒤로'
          }} 
        />
        <Stack.Screen 
          name="mission/missionDetail" 
          options={{ 
            headerShown: true,
            title: '숙제 다시보기~🎶',
            headerBackTitle: '뒤로'
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
};