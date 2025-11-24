import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, Text, View } from 'react-native';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  time: string;
}

interface GeocodeResult {
  lat: number;
  lon: number;
  display_name: string;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Tọa độ mặc định: Hà Nội
const DEFAULT_LATITUDE = 21.046732510551642;
const DEFAULT_LONGITUDE = 105.79222170282267;

export default function Bai6Screen() {
  const [cityName, setCityName] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Nếu không có quyền, sử dụng tọa độ mặc định
        console.log('Quyền truy cập vị trí bị từ chối, sử dụng tọa độ mặc định');
        const defaultLocation = { lat: DEFAULT_LATITUDE, lon: DEFAULT_LONGITUDE };
        setCurrentLocation(defaultLocation);
        fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCurrentLocation({ lat: latitude, lon: longitude });
      fetchWeather(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      // Nếu có lỗi, sử dụng tọa độ mặc định
      console.log('Không thể lấy vị trí hiện tại, sử dụng tọa độ mặc định');
      const defaultLocation = { lat: DEFAULT_LATITUDE, lon: DEFAULT_LONGITUDE };
      setCurrentLocation(defaultLocation);
      fetchWeather(DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
    }
  };

  const geocodeCity = async (city: string): Promise<GeocodeResult | null> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          display_name: data[0].display_name,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  const fetchWeather = async (latitude: number, longitude: number) => {
    setLoadingState('loading');
    setErrorMessage('');

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.current) {
        setWeatherData({
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m || data.hourly?.relative_humidity_2m?.[0] || 0,
          windSpeed: data.current.wind_speed_10m,
          time: data.current.time,
        });
        setLoadingState('success');
      } else {
        throw new Error('Dữ liệu thời tiết không hợp lệ');
      }
    } catch (error) {
      console.error('Weather API error:', error);
      setErrorMessage('Không thể tải dữ liệu thời tiết');
      setLoadingState('error');
    }
  };

  const handleSearch = async () => {
    if (!cityName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thành phố');
      return;
    }

    setLoadingState('loading');
    setErrorMessage('');

    const geocodeResult = await geocodeCity(cityName.trim());
    if (geocodeResult) {
      await fetchWeather(geocodeResult.lat, geocodeResult.lon);
    } else {
      setErrorMessage('Không tìm thấy thành phố');
      setLoadingState('error');
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      fetchWeather(currentLocation.lat, currentLocation.lon);
    } else {
      getCurrentLocation();
    }
  };

  const getWeatherDescription = (temperature: number): string => {
    if (temperature < 0) return 'Băng giá';
    if (temperature < 10) return 'Lạnh';
    if (temperature < 20) return 'Mát mẻ';
    if (temperature < 30) return 'Ấm áp';
    return 'Nóng';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên thành phố</Text>
          <TextInput
            style={styles.input}
            value={cityName}
            onChangeText={setCityName}
            placeholder="Nhập tên thành phố"
            placeholderTextColor="#999"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.buttonText}>Tìm kiếm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={handleUseCurrentLocation}>
              <Text style={styles.buttonText}>Vị trí hiện tại</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loadingState === 'loading' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        )}

        {loadingState === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        {loadingState === 'success' && weatherData && (
          <View style={styles.weatherContainer}>
            <Text style={[styles.weatherTitle, styles.title]}>
              Thông tin thời tiết
            </Text>
            <View style={styles.weatherCard}>
              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Nhiệt độ</Text>
                <Text style={styles.weatherValue}>
                  {weatherData.temperature.toFixed(1)}°C
                </Text>
                <Text style={styles.weatherDescription}>
                  {getWeatherDescription(weatherData.temperature)}
                </Text>
              </View>

              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Độ ẩm</Text>
                <Text style={styles.weatherValue}>
                  {weatherData.humidity.toFixed(0)}%
                </Text>
              </View>

              <View style={styles.weatherItem}>
                <Text style={styles.weatherLabel}>Tốc độ gió</Text>
                <Text style={styles.weatherValue}>
                  {weatherData.windSpeed.toFixed(1)} km/h
                </Text>
              </View>

              <Text style={styles.timeText}>
                Cập nhật: {new Date(weatherData.time).toLocaleString('vi-VN')}
              </Text>
            </View>
          </View>
        )}
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
  },
  inputGroup: {
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
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  locationButton: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
  weatherContainer: {
    marginTop: 20,
  },
  weatherTitle: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  weatherCard: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  weatherItem: {
    marginBottom: 20,
    padding: 10,
  },
  weatherLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  weatherValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  weatherDescription: {
    fontSize: 16,
    opacity: 0.8,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 12,
    textAlign: 'center',
  },
});

