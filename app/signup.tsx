import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import {supabase} from '../lib/supabaseClient';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

const passwordRegex = /^[a-zA-Z0-9]{6,15}$/;

  const isPasswordValid = passwordRegex.test(password);
  const isPasswordConfirmValid = password === passwordConfirm && passwordConfirm.length > 0;
  const isEmailValid = email.length > 0; // Basic check, can be improved

  const onRegister = () => {
    if (!isEmailValid) {
      Alert.alert('유효한 이메일을 입력해주세요.');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('비밀번호는 6~15자의 영문자 또는 숫자만 가능합니다.');
      return;
    }
    if (!isPasswordConfirmValid) {
      Alert.alert('비밀번호 확인이 일치하지 않습니다.');
      return;
    }
    signup();
    // 회원가입 로직 추가 가능
  };
  const signup = async() =>{
    const {data, error} = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      Alert.alert('회원가입 실패', error.message);
    }else{
        Alert.alert('회원가입 성공', '로그인 페이지로 이동합니다.');
        router.push('/login'); // 회원가입 성공 후 로그인 페이지로 이동
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={[styles.input, !isEmailValid && email.length > 0 ? styles.inputError : null]}
        placeholder="이메일"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, !isPasswordValid && password.length > 0 ? styles.inputError : null]}
        placeholder="비밀번호 (6~8자 영문자 또는 숫자)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, !isPasswordConfirmValid && passwordConfirm.length > 0 ? styles.inputError : null]}
        placeholder="비밀번호 확인"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={onRegister}>
        <Text style={styles.buttonText}>회원가입</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backBtn} onPress={() =>router.back()}>
        <Text style={styles.backBtnTxt}>뒤로가기</Text>
      </TouchableOpacity>
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
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#7B61FF',
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
  inputError: {
    borderColor: 'red',
  },
  
  button: {
    width: '80%',
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  backBtn:{
    width: '80%',
    borderWidth: 1,
    borderColor: '#7B61FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backBtnTxt: {
    color: '#7B61FF',
    fontSize: 18,
    fontWeight: '600',
  },
  link: {
    marginTop: 20,
  },
  linkText: {
    color: '#4a90e2',
    fontSize: 16,
  },
});