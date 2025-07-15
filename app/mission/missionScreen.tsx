import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import Checkbox from 'expo-checkbox';
import { supabase } from '../../lib/supabaseClient';
import { FontAwesome, FontAwesome5, FontAwesome6, Foundation } from '@expo/vector-icons';
import AudioRecord from 'react-native-audio-record';
import { Audio } from 'expo-av';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { Buffer } from 'buffer';
import RNFS from 'react-native-fs';

interface SessionData {
  isComplete: boolean;
  recordingStatus: 'idle' | 'recording' | 'paused' | 'playing';
  audioUri: string | null;
  waveform: number[];
  playbackInstance: Audio.Sound | null;
}

const WaveformDisplay = ({ waveform, width, height }: { waveform: number[], width: number, height: number }) => {
  const path = Skia.Path.Make();
  path.moveTo(0, height / 2);

  if (waveform.length > 1) {
    waveform.forEach((amplitude, index) => {
      const x = (index / (waveform.length - 1)) * width;
      const y = (height / 2) - ((amplitude - 127.5) / 127.5) * (height / 2);
      path.lineTo(x, y);
    });
  } else {
    path.lineTo(width, height / 2);
  }

  return (
    <Canvas style={{ width, height }}>
      <Path path={path} style="stroke" color="#7B61FF" strokeWidth={2} />
    </Canvas>
  );
};

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [missionTitle, setMissionTitle] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    return () => {
      if (isRecordingRef.current) {
        AudioRecord.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchMission = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('mission')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setMissionTitle(data.memo || '미션 세부사항');
          const initialData = Array.from({ length: data.session || 0 }, () => ({
            isComplete: false,
            recordingStatus: 'idle' as const,
            audioUri: null,
            waveform: [],
            playbackInstance: null,
          }));
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

  const handleSessionStateChange = (index: number, newState: Partial<SessionData>) => {
    setSessionData(prevData => {
      const newData = [...prevData];
      if (newData[index]) {
        newData[index] = { ...newData[index], ...newState };
      }
      return newData;
    });
  };

  const startRecording = async (index: number) => {
    if (!hasPermission) {
      console.log('Permission to record audio not granted');
      return;
    }

    handleSessionStateChange(index, { recordingStatus: 'recording', waveform: [] });

    const options = {
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      wavFile: `session_${id}_${index}.wav`,
    };

    AudioRecord.init(options);
    isRecordingRef.current = true;

    AudioRecord.on('data', (data:any) => {
      const chunk = Buffer.from(data, 'base64');
      const waveformData = Array.from(chunk);
      setSessionData(prev => {
        if (prev[index]?.recordingStatus !== 'recording') return prev;
        const newWaveform = [...prev[index].waveform, ...waveformData].slice(-500);
        const newData = [...prev];
        newData[index] = { ...newData[index], waveform: newWaveform };
        return newData;
      });
    });

    AudioRecord.start();
  };

  const stopRecording = async (index: number) => {
    if (!isRecordingRef.current) return;

    isRecordingRef.current = false;

    try {
      const audioFile = await AudioRecord.stop();
      handleSessionStateChange(index, { recordingStatus: 'idle', audioUri: audioFile });
      uploadRecording(index, audioFile);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const playRecording = async (index: number) => {
    const session = sessionData[index];
    if (!session.audioUri) return;

    try {
      await stopPlayback(index);
      const { sound } = await Audio.Sound.createAsync({ uri: 'file://' + session.audioUri });
      handleSessionStateChange(index, { playbackInstance: sound, recordingStatus: 'playing' });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          handleSessionStateChange(index, { recordingStatus: 'idle' });
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };

  const pausePlayback = async (index: number) => {
    const session = sessionData[index];
    if (session.playbackInstance && session.recordingStatus === 'playing') {
      await session.playbackInstance.pauseAsync();
      handleSessionStateChange(index, { recordingStatus: 'paused' });
    }
  };

  const stopPlayback = async (index: number) => {
    const session = sessionData[index];
    if (session.playbackInstance) {
      await session.playbackInstance.stopAsync();
      await session.playbackInstance.unloadAsync();
      handleSessionStateChange(index, { playbackInstance: null, recordingStatus: 'idle' });
    }
  };

  const uploadRecording = async (index: number, fileUri: string) => {
    try {
      const fileContent = await RNFS.readFile(fileUri, 'base64');
      const fileName = `mission_${id}_session_${index + 1}.wav`;
      const { error } = await supabase.storage
        .from('recordings')
        .upload(fileName, fileContent, {
          contentType: 'audio/wav',
          upsert: true,
        });

      if (error) throw error;
      console.log(`Session ${index + 1} uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading recording:', error);
    }
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

        <View style={styles.cardBody}>
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => startRecording(index)} 
              disabled={session.recordingStatus === 'recording'}
            >
              <Foundation name="record" size={18} color={session.recordingStatus === 'recording' ? 'grey' : 'red'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => playRecording(index)} 
              disabled={!session.audioUri || session.recordingStatus === 'playing'}
            >
              <FontAwesome name="play" size={18} color={!session.audioUri || session.recordingStatus === 'playing' ? 'grey' : '#7B61FF'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => pausePlayback(index)} 
              disabled={session.recordingStatus !== 'playing'}
            >
              <FontAwesome6 name="pause" size={18} color={session.recordingStatus !== 'playing' ? 'grey' : '#7B61FF'} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={() => stopRecording(index)} 
              disabled={session.recordingStatus !== 'recording'}
            >
              <FontAwesome5 name="stop" size={18} color={session.recordingStatus !== 'recording' ? 'grey' : '#7B61FF'} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.waveformContainer}>
          {session.recordingStatus === 'recording' || session.audioUri ? (
            <WaveformDisplay waveform={session.waveform} width={300} height={80} />
          ) : (
            <Text style={styles.waveformText}>음파 파형 표시 영역</Text>
          )}
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
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  controlButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#7B61FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,   
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});