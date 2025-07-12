import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabaseClient';
import RNPickerSelect from 'react-native-picker-select';

export default function UserDetailModal() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [academy, setAcademy] = useState<any[]>([]);
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(null);

  useEffect(() => {
    const loadAcademyData = async () => {
      const { data, error } = await supabase.from('academy').select('*');
      if (data) {
        console.log('Loaded academy data:', data);
        setAcademy(data);
      }
      if (error) console.error('Error loading academy data:', error);
    };
    loadAcademyData();
  }, []);

  const pickerItems = academy.map((item) => ({
    label: item.ac_name,
    value: item.id,
  }));

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('이름을 입력해주세요.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('핸드폰번호를 입력해주세요.');
      return;
    }
    if (!selectedAcademyId) {
      Alert.alert('학원을 선택해주세요.');
      return;
    }
    console.log('이름:', name);
    console.log('핸드폰번호:', phoneNumber);
    console.log('선택된 학원 ID:', selectedAcademyId);
    Alert.alert('저장 완료', `이름: ${name}\n핸드폰번호: ${phoneNumber}\n선택된 학원 ID: ${selectedAcademyId}`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>추가정보 등록</Text>

      <TextInput
        style={styles.input}
        placeholder="이름"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="핸드폰번호"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholderTextColor="#999"
      />

      <View style={styles.pickerContainer}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedAcademyId(value)}
          items={pickerItems}
          placeholder={{ label: '학원을 선택하세요', value: null }}
          style={pickerSelectStyles}
          value={selectedAcademyId}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>저장하기</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnTxt}>뒤로가기</Text>
      </TouchableOpacity>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#A68CFF',
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#A68CFF',
    borderRadius: 8,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  placeholder: {
    color: '#999',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE9FE',
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
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#A68CFF',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 20,
    fontSize: 16,
  },
  pickerContainer: {
    width: '80%',
    marginBottom: 20,
  },
  saveButton: {
    width: '80%',
    backgroundColor: '#7B61FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backBtn: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#7B61FF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  backBtnTxt: {
    color: '#7B61FF',
    fontSize: 18,
    fontWeight: '600',
  },
});