// app/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button } from 'react-native';

export default function Index() {
  useEffect(() => {
    const checkLoginAndRedirect = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        console.log('Index: checking login status:', isLoggedIn);
        
        if (isLoggedIn === 'true') {
          console.log('Index: redirecting to main app');
          router.replace('/(tabs)');
        } else {
          console.log('Index: redirecting to login');
          router.replace('/login');
        }
      } catch (error) {
        console.error('Index: AsyncStorage error:', error);
        router.replace('/login');
      }
    };

    checkLoginAndRedirect();
  }, []);

  // 로딩 화면 또는 스플래시 화면
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Loading...</Text>
      <Button
          title="LogOut"
          onPress={() => {
            // 로그인 처리 로직
            // ex) context나 store에 로그인 상태 저장
            AsyncStorage.setItem('isLoggedIn', 'false')
            .then(() => {
                console.log('Logout successful, redirecting to login');
                router.replace('/login');
            })
          }}
        />
    </View>
  );
}