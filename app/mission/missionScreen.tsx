import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox'; // expo-checkbox import
import { supabase } from '../../lib/supabaseClient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// 각 세션의 상태를 위한 타입 정의
interface SessionState {
  isComplete: boolean;
  // 나중에 녹음 파일 경로 등을 추가할 수 있습니다.
  // recordingPath: string | null;
}

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sessionStates, setSessionStates] = useState<SessionState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [missionTitle, setMissionTitle] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchMission = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mission')
          .select('session, memo')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setMissionTitle(data.memo || '미션 세부사항');
          // 세션 개수만큼 초기 상태를 설정합니다.
          const initialStates = Array.from({ length: data.session || 0 }, () => ({
            isComplete: false,
          }));
          setSessionStates(initialStates);
        }
      } catch (error) {
        console.error('Error fetching mission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  // 체크박스 상태 변경 핸들러
  const handleCheckboxChange = (index: number) => {
    const newStates = [...sessionStates];
    newStates[index].isComplete = !newStates[index].isComplete;
    setSessionStates(newStates);
  };

  const renderSessionCards = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#7B61FF" />;
    }

    if (sessionStates.length === 0) {
      return <Text style={styles.infoText}>이 미션에는 세션이 없습니다.</Text>;
    }

    return sessionStates.map((state, index) => (
      <View key={index} style={styles.missionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.sessionIndexText}>No. {index + 1}</Text>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={state.isComplete}
              onValueChange={() => handleCheckboxChange(index)}
              color={state.isComplete ? '#4630EB' : undefined}
            />
            <Text style={styles.checkboxLabel}>완료</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          {/* 녹음 기능 UI 영역 */}
          <TouchableOpacity style={styles.recordButton}>
            <Text style={styles.recordButtonText}>
                <MaterialCommunityIcons name="record-circle-outline" size={24} color="red" />
            </Text>
          </TouchableOpacity>
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>녹음 컨트롤 및 파형 표시 영역</Text>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{missionTitle}</Text>
      <ScrollView style={styles.missionListContainer}>
        {renderSessionCards()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: '5%',
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  missionListContainer: {
    width: '100%',
    flex: 1,
  },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  sessionIndexText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7B61FF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  cardBody: {
    marginTop: 10,
  },
recordButton: {
  backgroundColor: '#fff',
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 15,
  borderWidth: 1,
  borderColor: '#7B61FF',
  // 드롭쉐도우 추가
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5, // Android용
},
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeholder: {
    backgroundColor: '#f5f5f5',
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#aaa',
  },
});