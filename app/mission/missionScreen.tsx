import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import {supabase} from '../../lib/supabaseClient';

export default function missionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
<View>
    <Text>Mission Screen: {id}</Text>
</View>
  );
}

// const styles = StyleSheet.create({
// ,
// });