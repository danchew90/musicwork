import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { supabase } from '../../lib/supabaseClient';

// 각 세션의 데이터 구조 정의
interface SessionData {
  isComplete: boolean;
  recordingStatus: 'idle' | 'recording' | 'paused' | 'playing';
}

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
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
          const initialData = Array.from({ length: data.session || 0 }, () => ({
            isComplete: false,
            recordingStatus: 'idle' as const,
          } as SessionData));
          setSessionData(initialData);
        }
      } catch (error) {
        console.error('Error fetching mission:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  // 세션 상태 업데이트 핸들러
  const handleSessionStateChange = (index: number, newState: Partial<SessionData>) => {
    const newData = [...sessionData];
    newData[index] = { ...newData[index], ...newState };
    setSessionData(newData);
  };

  const renderSessionCards = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#7B61FF" />;
    }
    if (sessionData.length === 0) {
      return <Text style={styles.infoText}>이 미션에는 세션이 없습니다.</Text>;
    }

    return sessionData.map((session, index) => (
      <View key={index} style={styles.missionCard}>
        {/* --- 카드 헤더: 세션 번호, 완료 체크박스 --- */}
        <View style={styles.cardHeader}>
          <Text style={styles.sessionIndexText}>세션 {index + 1}</Text>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={session.isComplete}
              onValueChange={() => handleSessionStateChange(index, { isComplete: !session.isComplete })}
              color={session.isComplete ? '#4630EB' : undefined}
            />
            <Text style={styles.checkboxLabel}>완료</Text>
          </View>
        </View>

        {/* --- 카드 본문: 파형, 컨트롤 버튼 --- */}
        <View style={styles.cardBody}>
          {/* 컨트롤 버튼 그룹 */}
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => handleSessionStateChange(index, { recordingStatus: 'recording' })}
            >
              <Text style={styles.controlButtonText}>녹음</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => handleSessionStateChange(index, { recordingStatus: 'playing' })}
            >
              <Text style={styles.controlButtonText}>재생</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => handleSessionStateChange(index, { recordingStatus: 'paused' })}
            >
              <Text style={styles.controlButtonText}>일시정지</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => handleSessionStateChange(index, { recordingStatus: 'idle' })}
            >
              <Text style={styles.controlButtonText}>정지</Text>
            </TouchableOpacity>
          </View>
        </View>
                  {/* 음파 파형 표시 영역 */}
          <View style={styles.waveformContainer}>
            <Text style={styles.waveformText}>음파 파형 표시 영역</Text>
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
    marginBottom: 15,
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
  cardBody: {},
  waveformContainer: {
    backgroundColor: '#f5f5f5',
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  waveformText: {
    color: '#aaa',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#7B61FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5, // 원형에 가깝게
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});