// app/index.tsx
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import getEnvVars from '../../environment';
const { supabaseUrl, supabaseKey } = getEnvVars();

export default function Index() {
  const [missionList, setMissionList] = useState<any[] | null>([]);
  const [isLoading, setIsLoading] = useState(true);
 const supabase = createClient(supabaseUrl, supabaseKey);
  /**
   * Supabase 연결 상태를 확인하고 대기하는 함수입니다.
   * 네트워크 문제 등으로 연결이 불안정할 경우 재시도를 수행합니다.
   * @returns {Promise<boolean>} 연결 성공 시 true, 실패 시 false를 반환합니다.
   */
  const waitForSupabaseConnection = async () => {
    let retries = 0;
    const maxRetries = 5;

    while (retries < maxRetries) {
      try {
        // 간단한 테스트 쿼리로 연결 상태 확인
        // 실제 데이터가 필요 없으므로 'id'만 선택하고 1개만 가져옵니다.
        const { error } = await supabase.from('mission').select('id').limit(1);

        if (!error) {
          console.log('Index: Supabase 연결 성공');
          return true; // 연결 성공
        }

        console.log(`Index: Supabase 연결 시도 ${retries + 1}회 실패:`, error.message);
        retries++;

        // 지수적 백오프: 0.5초, 1초, 2초... 간격으로 재시도합니다.
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries - 1)));
      } catch (error) {
        console.error(`Index: Supabase 연결 오류 (시도 ${retries + 1}회):`, error);
        retries++;
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retries - 1)));
      }
    }

    console.warn('Index: Supabase에 연결할 수 없습니다. 최대 재시도 횟수 초과.');
    return false; // 연결 실패
  };

  /**
   * 사용자 추가 정보를 확인하는 함수입니다.
   * user_detail 테이블에 해당 UUID를 가진 사용자가 있는지 확인합니다.
   * @param {string} currentUserId 현재 로그인한 사용자의 UUID입니다.
   */
  const checkUserDetails = async (currentUserId: string) => {
    try {
      const { data, error } = await supabase.from('user_detail').select('*').eq('id', currentUserId);
      console.log('Index: 사용자 세부 정보 데이터 길이:', data?.length);

      if (error) {
        console.error('Index: 사용자 세부 정보 확인 중 오류 발생:', error);
        return;
      }

      if (data?.length === 0) {
        // 사용자 세부 정보가 없으면 모달을 띄우거나 등록 페이지로 이동시킬 수 있습니다.
        // 현재는 메인 로직에서 /tabs로 리디렉션하므로, 여기서 바로 이동시키기보다
        // 필요한 경우 사용자에게 추가 정보를 입력하도록 유도하는 모달을 띄우는 것이 좋습니다.
        console.log('Index: 사용자 세부 정보 없음. userDetailModal로 이동 필요.');
        // router.push('/userDetailModal'); // 필요시 주석 해제하여 모달 라우트로 이동
      } else {
        console.log('Index: 사용자 세부 정보 발견:', data);
      }
    } catch (error) {
      console.error('Index: 사용자 세부 정보 확인 중 예외 발생:', error);
    }
  };

  /**
   * 현재 사용자에게 할당된 미션을 확인하는 함수입니다.
   * done_flag와 상관없이 모든 미션을 가져옵니다.
   * @param {string} currentUserId 현재 로그인한 사용자의 UUID입니다.
   */
  const checkMission = async (currentUserId: string) => {
    console.log('Index: 미션 확인 중. UUID:', currentUserId);
    try {
      const { data, error } = await supabase.from('mission').select('*').eq('to_id', currentUserId).order('id', { ascending: false });

      if (error) {
        console.error('Index: 미션 확인 중 오류 발생:', error);
        console.error('Index: 오류 상세:', error.message, error.details);
        setMissionList([]); // 오류 발생 시 미션 리스트를 비웁니다.
        return;
      }

      console.log('Index: 원본 미션 데이터:', data);
      console.log('Index: 로드된 미션 수:', data?.length || 0, '개');

      setMissionList(data || []); // data가 null이면 빈 배열로 설정합니다.
    } catch (error) {
      console.error('Index: 미션 확인 중 예외 발생:', error);
    }
  };

  /**
   * 앱 초기화 로직을 수행하는 useEffect 훅입니다.
   * 컴포넌트 마운트 시 단 한 번만 실행됩니다.
   */
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true); // 로딩 상태 시작

        // 1. 로그인 상태 확인
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

        if (isLoggedIn !== 'true') {
          console.log('Index: 사용자 로그인 안 됨. 로그인 페이지로 리디렉션.');
          router.replace('/login'); // 로그인 페이지로 대체 (replace)하여 뒤로가기 방지
          return; // 더 이상 코드 실행하지 않고 종료
        }

        console.log('Index: 사용자 로그인 상태 확인됨.');

        // 2. UUID(사용자 ID) 확인
        const storedUUID = await AsyncStorage.getItem('UUID');
        if (!storedUUID) {
          console.log('Index: UUID를 찾을 수 없음. 로그인 페이지로 리디렉션.');
          router.replace('/login'); // UUID가 없으면 로그인 페이지로
          return; // 더 이상 코드 실행하지 않고 종료
        }

        // 3. Supabase 연결 대기
        // 연결이 필수적이며 불안정할 수 있다면 이 단계를 활성화하세요.
        // const isConnected = await waitForSupabaseConnection();
        // if (!isConnected) {
        //   console.error('Index: Supabase 연결 실패, 데이터를 불러올 수 없습니다.');
        //   // 사용자에게 오류 메시지를 표시하거나 다른 처리 로직을 추가할 수 있습니다.
        //   return; // 더 이상 코드 실행하지 않고 종료
        // }

        // 4. 모든 준비가 완료되면 데이터 페칭
        // UUID를 인자로 전달하여 해당 사용자 데이터를 가져옵니다.
        await checkUserDetails(storedUUID);
        await checkMission(storedUUID);

        console.log('Index: 데이터 로드 완료, 탭 화면으로 리디렉션.');
        // 5. 모든 초기화가 완료되면 메인 탭 화면으로 이동
        // 이 router.replace는 `useEffect`의 의존성 배열이 비어있어
        // 컴포넌트 마운트 시 한 번만 실행되므로 무한 루프를 유발하지 않습니다.
        // router.replace('/(tabs)');

      } catch (error) {
        console.error('Index: 앱 초기화 중 오류 발생:', error);
        // 어떤 오류든 발생하면 로그인 페이지로 폴백
        router.replace('/login');
      } finally {
        setIsLoading(false); // 로딩 상태 종료
      }
    };

    initializeApp(); // 초기화 함수 실행
  }, []); // <--- 빈 의존성 배열: 컴포넌트 마운트 시 단 한 번만 실행

  /**
   * 마감일을 계산하고 포맷팅하는 함수입니다.
   * @param {string | Date} deadlineInput 마감일 정보입니다.
   * @param {boolean} doneFlag 미션 완료 여부입니다. (현재 코드에서는 doneFlag가 반환 값에 영향을 주지 않습니다)
   * @returns {string} 남은 일수 또는 상태 문자열입니다.
   */
  const formatDaysRemaining = (deadlineInput: string | Date, doneFlag: boolean) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 날짜의 시간 부분을 0으로 초기화

    let deadlineDate: Date;
    // deadlineInput이 문자열이면 Date 객체로 변환하고, 이미 Date 객체면 그대로 사용합니다.
    if (typeof deadlineInput === 'string') {
      deadlineDate = new Date(deadlineInput);
    } else if (deadlineInput instanceof Date) {
      deadlineDate = deadlineInput;
    } else {
      console.error('유효하지 않은 deadlineInput 타입:', typeof deadlineInput, deadlineInput);
      return '날짜 오류';
    }

    // 파싱된 날짜가 유효한지 확인
    if (isNaN(deadlineDate.getTime())) {
      console.error('파싱 후 유효하지 않은 마감 날짜:', deadlineInput);
      return '날짜 오류';
    }

    deadlineDate.setHours(0, 0, 0, 0); // 마감일의 시간 부분도 0으로 초기화

    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 밀리초를 일수로 변환

    if (diffDays === 0) {
      return '오늘 마감';
    } else if (diffDays > 0) {
      return `D-${diffDays}일 남음`;
    } else {
      return `D+${Math.abs(diffDays)}일 지남`;
    }
  };

  /**
   * `created_at` 날짜를 "YYYY-MM-DD 숙제!" 형식으로 포맷팅하는 함수입니다.
   * @param {string} createdAt 미션 생성 날짜 문자열입니다.
   * @returns {string} 포맷팅된 날짜 문자열입니다.
   */
  const formatMissionDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day} 숙제!`;
  };

  /**
   * 미션 상세 화면으로 이동하는 함수입니다.
   * 미션 완료 여부에 따라 다른 화면으로 라우팅합니다.
   * @param {number} missionId 이동할 미션의 ID입니다.
   * @param {boolean} done_flag 미션 완료 여부입니다.
   */
  const moveToMissionDetail = (missionId: number, done_flag: boolean) => {
    if (done_flag) {
      router.push(`/mission/missionDetail?id=${missionId}`); // 완료된 미션 상세
    } else {
      router.push(`/mission/missionScreen?id=${missionId}`); // 완료되지 않은 미션 진행 화면
    }
  };

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#7B61FF" />
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  // 메인 화면 UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 오늘의 미션 🎶</Text>
      <ScrollView style={styles.missionListContainer}>
        {missionList && missionList.length > 0 ?
          // 미션 리스트가 있으면 각 미션 카드를 렌더링합니다.
          missionList.map((mission: any, idx: number) => (
            <TouchableOpacity
              key={idx}
              // 미션 완료 여부에 따라 다른 스타일을 적용합니다.
              style={mission.done_flag ? styles.missionCard : styles.yetMissionCard}
              onPress={() => { moveToMissionDetail(mission.id, mission.done_flag) }}
            >
              <View style={styles.missionContent}>
                <Text style={styles.missionTitle}>{formatMissionDate(mission.created_at)}</Text>
                <Text style={styles.missionDeadline}>
                  마감: {formatDaysRemaining(mission.dead_line, mission.done_flag)}
                </Text>
                <Text style={styles.missionSession}>
                  세션: {mission.session}번 해야 함
                </Text>
                {/* memo가 있으면 미션 설명을 표시합니다. */}
                {mission.memo && <Text style={styles.missionDescription}>{mission.memo}</Text>}
              </View>
              {/* 미션이 완료되었으면 완료 스탬프 이미지를 표시합니다. */}
              {mission.done_flag && (
                <Image
                  source={require('../../assets/images/good_stamp.png')}
                  style={styles.stampImage}
                />
              )}
            </TouchableOpacity>
          )) : (
            // 미션 리스트가 비어있을 때 표시할 UI
            <View style={styles.noMissionContainer}>
              <Text style={styles.noMissionText}>숙제가 없습니다.</Text>
            </View>
          )}
      </ScrollView>

      {/* 로그아웃 버튼 */}
      <Button
        title="로그아웃"
        onPress={() => {
          AsyncStorage.setItem('isLoggedIn', 'false')
            .then(() => {
              console.log('로그아웃 성공, 로그인 페이지로 리디렉션');
              router.replace('/login');
            });
        }}
      />
      {/* 사용자 세부 정보 모달 열기 버튼 (테스트용) */}
      <Button
        title="세부 정보 모달 열기"
        onPress={() => router.push('/userDetailModal')}
      />
    </View>
  );
}

// 스타일 정의
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, // 상단 패딩
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    color: '#333',
  },
  missionListContainer: {
    width: '90%',
    flex: 1,
  },
  missionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yetMissionCard: {
    backgroundColor: '#7B61FF', // 완료되지 않은 미션 카드 색상
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  missionContent: {
    flex: 1, // 텍스트 내용이 공간을 최대한 차지하도록
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  missionDeadline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  missionSession: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  missionDescription: {
    fontSize: 12,
    color: '#7B61FF',
    marginTop: 5,
  },
  stampImage: {
    width: 60,
    height: 60,
    marginLeft: 10, // 텍스트와 스탬프 이미지 사이 간격
  },
  noMissionContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  noMissionText: {
    fontSize: 18,
    color: '#666',
  },
});