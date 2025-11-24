import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity, Text, View } from 'react-native';

export default function Bai3Screen() {
  const [seconds, setSeconds] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && countdown > 0) {
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Hết giờ!', "Time's up");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, countdown]);

  const handleStart = () => {
    const numSeconds = parseInt(seconds, 10);
    if (isNaN(numSeconds) || numSeconds <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số giây hợp lệ');
      return;
    }
    setCountdown(numSeconds);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCountdown(0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nhập số giây</Text>
          <TextInput
            style={styles.input}
            value={seconds}
            onChangeText={setSeconds}
            placeholder="Nhập số giây cần đếm"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            editable={!isRunning}
          />
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {countdown > 0 ? formatTime(countdown) : '00:00'}
          </Text>
          {countdown === 0 && isRunning && (
            <Text style={styles.timeUpText}>Time's up</Text>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.startButton, isRunning && styles.buttonDisabled]}
            onPress={handleStart}
            disabled={isRunning}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>

          {isRunning && (
            <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={handleStop}>
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 40,
  },
  timerText: {
    fontSize: 25,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timeUpText: {
    fontSize: 24,
    marginTop: 16,
    color: '#ff4444',
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

