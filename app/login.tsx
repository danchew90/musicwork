import React, { useEffect, useState } from 'react';
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
import Checkbox from 'expo-checkbox';

export default function LoginScreen() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [idRemember, setIdRemember] = useState(false);
  const [autoLoginTriggered, setAutoLoginTriggered] = useState(false);

  const handleLogin = async (emailArg?: string, pwArg?: string) => {
    const email = emailArg ?? id;
    const password = pwArg ?? pw;

    if (email.trim() && password.trim()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert('로그인 실패: ' + error.message);
        console.error('Login error:', error);
      } else {
        await AsyncStorage.setItem('UUID', data.session.user.id);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('pw', password);
        if(idRemember) await AsyncStorage.setItem('rememberedId', email);
        console.log('Login successful, redirecting to main app');
        router.replace('/');
      }
    } else {
      alert('ID와 비밀번호를 입력하세요.');
    }
  };

  const handleKakaoLogin = () => {
    alert('카카오 로그인 준비중');
  };

  // 아이디 기억하기 기능
  useEffect(() => {
    const rememberId = async () => {
      try {
        const remembered = await AsyncStorage.getItem('rememberedId');
        if (remembered) {
          setId(remembered);
          setIdRemember(true);
        }
      } catch (error) {
        console.error('AsyncStorage 오류:', error);
      }
    };
    rememberId();
  }, []);

  // 자동 로그인 (상태 먼저 세팅 후 트리거)
  useEffect(() => {
    const loginAgain = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const storedPw = await AsyncStorage.getItem('pw');
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        if (storedEmail && storedPw&&isLoggedIn === 'true') {
          setId(storedEmail);
          setPw(storedPw);
          setAutoLoginTriggered(true);
        }
      } catch (error) {
        console.error('AsyncStorage 오류:', error);
      }
    };
    loginAgain();
  }, []);

  // 상태 세팅 완료 후 자동 로그인
  useEffect(() => {
    if (autoLoginTriggered) {
      handleLogin(id, pw);
    }
  }, [autoLoginTriggered]);

  // idRemember 상태가 꺼졌으면 기억 해제
  useEffect(() => {
    const rememberId = async () => {
      try {
        if (!idRemember) {
          await AsyncStorage.removeItem('rememberedId');
        }
      } catch (error) {
        console.error('AsyncStorage 오류:', error);
      }
    };
    rememberId();
  }, [idRemember]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')} 
        style={{ width: 200, height: 200 }} 
        resizeMode="contain"
      />

      <TextInput
        placeholder="ID"
        placeholderTextColor="#A68CFF"
        style={styles.input}
        value={id}
        onChangeText={(text) => setId(text.toLowerCase())}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#A68CFF"
        secureTextEntry
        style={styles.input}
        value={pw}
        onChangeText={setPw}
        onSubmitEditing={() => handleLogin()}
      />

      <View style={{flexDirection:'row', alignItems:'center'}}>
        <Checkbox
          style={{ marginRight: 10 }}
          value={idRemember}
          onValueChange={setIdRemember}
          color={idRemember ? '#4630EB' : undefined}
        />      
        <Text style={{color:'#000'}}>아이디 기억하기</Text>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={() => handleLogin()}>
        <Text style={styles.loginButtonText}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/signup')}>
        <Text style={styles.signInBtnText}>회원가입</Text>
      </TouchableOpacity>

      <View style={{flexDirection:'row', justifyContent:'center', width:'80%', marginTop:20}}>
        <TouchableOpacity onPress={() => alert('아이디 찾기 준비중')}>
          <Text>아이디 찾기</Text>
        </TouchableOpacity>
        <Text style={{marginHorizontal:10}}>|</Text>
        <TouchableOpacity onPress={() => alert('비밀번호 찾기 준비중')}>
          <Text>비밀번호 찾기</Text>
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