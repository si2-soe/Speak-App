import { View, Text, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logo}>
        <Text style={styles.logoIcon}>⚖️</Text>
      </View>
      <Text style={styles.title}>Speak</Text>
      <Text style={styles.sub}>Your personal AI advocate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 72, height: 72,
    backgroundColor: '#c8f064',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoIcon: { fontSize: 32 },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#f0f0f0',
  },
  sub: { fontSize: 14, color: '#555' },
});