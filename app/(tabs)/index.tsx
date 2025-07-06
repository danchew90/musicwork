// app/index.tsx
import { use, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button } from 'react-native';
import {supabase} from '../../lib/supabaseClient';

export default function Index() {
  useEffect(() => {
    const checkLoginAndRedirect = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');        
        
        if (isLoggedIn === 'true') {          
          router.replace('/(tabs)');
        } else {          
          router.replace('/login');
        }
      } catch (error) {        
        router.replace('/login');
      }
    };

    checkLoginAndRedirect();
  }, []);
  //user 추가 정보 확인
  useEffect(() => {
    const checkUserDetails = async () => {
      const userId = await AsyncStorage.getItem('UUID'); 
      try {
        const { data, error } = await supabase.from('user_detail').select('*').eq('id', userId);
        if(data?.length == 0) {
          router.push('/userDetailModal');
        }else{
        console.log(data)
        }
      } catch (error) {
        console.error('Index: Error checking user details:', error);
      }
    }
    checkUserDetails();
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
        <Button
  title="Open Modal Route"
  onPress={() => router.push('/userDetailModal')}
/>
    </View>
  );
}