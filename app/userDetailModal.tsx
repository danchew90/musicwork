import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabaseClient';
import ModalDropdown from 'react-native-modal-dropdown';
import { FontAwesome } from '@expo/vector-icons';
import RadioGroup from 'react-native-custom-radio-group';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserDetailModal() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [academy, setAcademy] = useState<any[]>([]);
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string>('S'); // 기본값을 'S'로 설정

  const radioGroupList = [{
    label: '학생',
    value: 'S'
  }, {
    label: '선생님',
    value: 'T'
  }];

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

  const formatPhoneNumber = (text: string) => {
    if (!text) return '';
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;

    if (cleaned.startsWith('02')) {
      if (cleaned.length <= 2) {
        formatted = cleaned;
      } else if (cleaned.length <= 6) {
        formatted = `${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
      } else if (cleaned.length <= 10) {
        formatted = `${cleaned.substring(0, 2)}-${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
      } else {
        formatted = `${cleaned.substring(0, 2)}-${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
      }
    } else {
      if (cleaned.length <= 3) {
        formatted = cleaned;
      } else if (cleaned.length <= 7) {
        formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
      } else if (cleaned.length <= 11) {
        formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
      } else {
        formatted = `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7, 11)}`;
      }
    }
    return formatted;
  };

  const validatePhoneNumber = (number: string) => {
    const phoneRegex = /^(01[016789]|02|0[3-9]{1}[0-9]{1})[-]?([0-9]{3,4})[-]?([0-9]{4})$/;
    return phoneRegex.test(number);
  };

  const handleSave = async() => {
    console.log('저장 시 selectedUserType:', selectedUserType); // 디버깅용 로그 추가
    
    if (!name.trim()) {
      Alert.alert('이름을 입력해주세요.');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('핸드폰번호를 입력해주세요.');
      return;
    }
    if (!validatePhoneNumber(formatPhoneNumber(phoneNumber))) {
      Alert.alert('유효한 핸드폰번호를 입력해주세요.');
      return;
    }
    if (!selectedAcademyId) {
      Alert.alert('학원을 선택해주세요.');
      return;
    }
    if (!selectedUserType || selectedUserType === '') {
      Alert.alert('사용자 유형을 선택해주세요.');
      return;
    }
    
    console.log('이름:', name);
    console.log('핸드폰번호:', formatPhoneNumber(phoneNumber));
    console.log('선택된 학원 ID:', selectedAcademyId);
    console.log('선택된 사용자 유형:', selectedUserType);
    
    const UUID = await AsyncStorage.getItem('UUID');
    const param = {
      id: UUID,
      name: name,
      tel: formatPhoneNumber(phoneNumber),
      user_status: selectedUserType,
      ac_code: selectedAcademyId
    }
    
    const { data, error } = await supabase.from('user_detail').upsert(param);
    if (error) {
      console.error('Error saving user details:', error);
      Alert.alert('저장 실패', '사용자 정보를 저장하는 데 실패했습니다.');
      return;
    } else {
      Alert.alert('저장 완료', `이름: ${name}\n핸드폰번호: ${formatPhoneNumber(phoneNumber)}\n선택된 학원 ID: ${selectedAcademyId}\n사용자 유형: ${selectedUserType}`);
      router.back();
    }
  };

  const renderDropdownRow = (rowData: any, _rowID: any, _highlighted: any) => {
    return (
      <View style={styles.dropdownRow}>
        <Text style={styles.dropdownRowText}>{rowData.ac_name}</Text>
      </View>
    );
  };

  const handleRadioPress = (value: string) => {
    console.log('라디오 버튼 선택됨:', value); // 디버깅용 로그 추가
    setSelectedUserType(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>추가정보 등록</Text>

      <View style={styles.radioGroupWrapper}>
        <RadioGroup
          radioGroupList={radioGroupList}
          containerStyle={styles.radioGroupContainer}
          buttonContainerStyle={styles.radioButtonContainer}
          buttonTextStyle={styles.radioButtonText}
          activeButtonContainerStyle={styles.activeRadioButtonContainer}
          activeButtonTextStyle={styles.activeRadioButtonText}
          onPress={handleRadioPress}
          initialValue={selectedUserType}
        />
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>이름</Text>
        <TextInput
          style={styles.input}
          placeholder="이름"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>핸드폰번호</Text>
        <TextInput
          style={styles.input}
          placeholder="숫자만 입력하세요"
          value={formatPhoneNumber(phoneNumber)}
          onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ''))}
          keyboardType="phone-pad"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.label}>학원</Text>
        <View style={styles.pickerContainer}>
          <ModalDropdown
            options={academy}
            onSelect={(_index, value) => setSelectedAcademyId(value.id)}
            renderRow={renderDropdownRow}
            dropdownStyle={styles.dropdownStyle}
          >
            <View style={styles.dropdownButton}>
              <Text style={selectedAcademyId ? styles.dropdownButtonText : styles.dropdownButtonPlaceholder}>
                {selectedAcademyId ? academy.find(a => a.id === selectedAcademyId)?.ac_name : '학원을 선택하세요'}
              </Text>
              <FontAwesome name="caret-down" size={20} color="#7B61FF" />
            </View>
          </ModalDropdown>
        </View>
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
  rowContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    width: 80,
    fontSize: 16,
    color: '#5A43B5',
    marginRight: 10,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#A68CFF',
    borderRadius: 8,
    color: '#333',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  pickerContainer: {
    flex: 1,
  },
  dropdownButton: {
    width: '100%',
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#A68CFF',
    borderRadius: 8,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownButtonPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  dropdownStyle: {
    width: '80%',
    marginTop: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A68CFF',
    backgroundColor: '#fff',
  },
  dropdownRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownRowText: {
    fontSize: 16,
    color: '#333',
  },
  radioGroupWrapper: {
    width: '80%',
    height: 55,
    justifyContent: 'center',
    marginBottom: 20,
  },
  radioGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  radioButtonContainer: {
    backgroundColor: '#fff',
    borderColor: '#A68CFF',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 25,
    width: '45%'
  },
  radioButtonText: {
    color: '#333',
    fontSize: 18,
  },
  activeRadioButtonContainer: {
    backgroundColor: '#7B61FF',
    borderColor: '#7B61FF',
  },
  activeRadioButtonText: {
    color: '#fff',
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