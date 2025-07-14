import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import getEnvVars from '../../environment';
import { createClient } from '@supabase/supabase-js';
const { supabaseUrl, supabaseKey } = getEnvVars();

export default function MissionScreen() {
    const supabase = createClient(supabaseUrl, supabaseKey);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sessionCount, setSessionCount] = useState<number>(0); // 소문자 number 타입 사용
  const [isLoading, setIsLoading] = useState(true);
  const [missionTitle, setMissionTitle] = useState('');

  useEffect(() => {
    // id가 유효하지 않으면 API를 호출하지 않습니다.
    if (!id) return;

    const fetchMission = async () => {
      setIsLoading(true);
      console.log('Fetching mission with ID:', id);
      try {
        // 필요한 필드(session, memo)만 명시적으로 선택합니다.
        const { data, error } = await supabase
          .from('mission')
          .select('session, memo')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          console.log('Mission data:', data);
          setSessionCount(data.session || 0);
          setMissionTitle(data.memo || '미션 세부사항');
        }
      } catch (error) {
        console.error('Error fetching mission:', error);
        // 사용자에게 오류를 알리는 UI를 추가할 수 있습니다.
      } finally {
        setIsLoading(false);
      }
    };

    fetchMission();
  }, [id]); // id가 변경될 때마다 effect를 다시 실행합니다.

  // 세션 카드를 렌더링하는 헬퍼 함수
  const renderSessionCards = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#7B61FF" />;
    }

    if (sessionCount === 0) {
      return <Text>이 미션에는 세션이 없습니다.</Text>;
    }

    // 1부터 sessionCount까지의 배열을 만들어 각 항목을 View로 렌더링합니다.
    return Array.from({ length: sessionCount }, (_, index) => (
      <View key={index} style={styles.missionCard}>
        <Text style={styles.missionText}>세션 {index + 1}</Text>
        {/* 여기에 체크박스나 버튼 등 다른 UI 요소를 추가할 수 있습니다. */}
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
  missionListContainer: {
    width: '100%',
    flex: 1,
  },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionText: {
    fontSize: 18,
    fontWeight: '500',
  },
});
