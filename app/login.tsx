import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {supabase} from '../lib/supabaseClient';

export default function LoginScreen() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const handleLogin = async () => {
    // 예제: 간단히 ID/PW 유효성 확인 후 로그인 처리
    if (id.trim() && pw.trim()) {
    //   await AsyncStorage.setItem('isLoggedIn', 'true');
    //   console.log('Login successful, redirecting to main app');
    //   router.replace('/');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: id,
        password: pw,
      });
      if (error) {
        alert('로그인 실패: ' + error.message);
        console.error('Login error:', error);
      }else {
        await AsyncStorage.setItem('isLoggedIn', 'true');
        console.log('Login successful, redirecting to main app');
        router.replace('/');
      }
    } else {
      alert('ID와 비밀번호를 입력하세요.');
    }
  };

  const handleKakaoLogin = () => {
    // Kakao 간편 로그인 로직
    alert('카카오 로그인 준비중');
  };

  return (
    <View style={styles.container}>
        <Image
        source={require('../assets/images/logo.png')} 
        style={{ width: 200, height: 200 }} 
        resizeMode="contain"
        />
      {/* <Text style={styles.title}>Login</Text> */}

      <TextInput
        placeholder="ID"
        placeholderTextColor="#A68CFF"
        style={styles.input}
        value={id}
        onChangeText={setId}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#A68CFF"
        secureTextEntry
        style={styles.input}
        value={pw}
        onChangeText={setPw}
      />

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/signup')}>
        <Text style={styles.signInBtnText}>회원가입</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity style={styles.kakaoButton} onPress={handleKakaoLogin}>
        <Text style={styles.kakaoButtonText}>카카오로 간편 로그인</Text>
      </TouchableOpacity> */}
      <View style={{display:'flex', flexDirection:'row', justifyContent:'center', width:'80%',marginTop: 20}}>
      <TouchableOpacity  onPress={handleLogin} >
        <Text >아이디 찾기</Text>
      </TouchableOpacity>
      <Text style={{marginHorizontal:10}}>|</Text>
      <TouchableOpacity  onPress={handleLogin}>
        <Text >비밀번호 찾기</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE9FE', // 아주 연한 라벤더
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: '#7B61FF', // 주 색상
    marginBottom: 32,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 48,
    borderWidth: 1,
    borderColor: '#A68CFF', // 포인트 색상
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  loginButton: {
    width: '80%',
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  signInBtn: {
    width: '80%',
    backgroundColor: '#FEE500',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,    
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  kakaoButton: {
    width: '80%',
    backgroundColor: '#FEE500',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  kakaoButtonText: {
    color: '#3C1E1E',
    fontSize: 16,
    fontWeight: 'bold',
  },
});