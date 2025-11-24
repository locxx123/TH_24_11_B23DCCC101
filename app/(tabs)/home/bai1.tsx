import { StyleSheet, FlatList, TouchableOpacity, Alert, Text, View } from 'react-native';

interface Student {
  id: string;
  name: string;
  age: number;
  class: string;
}

const students: Student[] = Array.from({ length: 20 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Sinh viên ${i + 1}`,
  age: 18 + Math.floor(Math.random() * 5),
  class: `Lớp ${String.fromCharCode(65 + (i % 5))}${Math.floor(i / 5) + 1}`,
}));

export default function Bai1Screen() {
  const handleItemPress = (student: Student) => {
    Alert.alert('Thông tin sinh viên', student.name);
  };

  const renderItem = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.7}>
      <Text style={styles.subtitle}>{item.name}</Text>
      <Text style={styles.info}>Tuổi: {item.age}</Text>
      <Text style={styles.info}>Lớp: {item.class}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  item: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.7,
  },
});

