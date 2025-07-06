import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabaseClient';
import RNPickerSelect from 'react-native-picker-select';

export default function UserDetailModal() {
  const [academy, setAcademy] = useState<any[]>([]);
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(null);

  useEffect(() => {
    const loadAcademyData = async () => {
      const { data, error } = await supabase.from('academy').select('*');
      if (data) setAcademy(data);
      if (error) console.error(error);
    };
    loadAcademyData();
  }, []);

  const pickerItems = academy.map((item) => ({
    label: item.ac_name,
    value: item.id,
  }));

  const handleSave = () => {
    if (!selectedAcademyId) {
      Alert.alert('학원을 선택해주세요.');
      return;
    }
    console.log('선택된 학원 ID:', selectedAcademyId);
    Alert.alert('저장 완료', `선택된 학원 ID: ${selectedAcademyId}`);
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>추가정보 등록</Text>

      <RNPickerSelect
        onValueChange={(value) => setSelectedAcademyId(value)}
        items={academy.length > 0 ? pickerItems : [{ label: '학원 정보가 없습니다', value: null }]}
        placeholder={{ label: '학원을 선택하세요', value: null }}
        style={{
          inputIOS: styles.input,
          inputAndroid: styles.input,
          placeholder: { color: '#999' },
        }}
        value={selectedAcademyId}
        useNativeAndroidPickerStyle={false}
      />

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