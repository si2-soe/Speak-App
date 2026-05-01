import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const categories = [
  { id: 'renter', icon: '🏠', label: 'Renter rights & disputes' },
  { id: 'workplace', icon: '💼', label: 'Workplace discrimination' },
  { id: 'fraud', icon: '🚨', label: 'Consumer fraud & scams' },
  { id: 'data', icon: '🔒', label: 'Data & privacy violations' },
  { id: 'whistle', icon: '📢', label: 'Whistleblowing' },
];

export default function HomeScreen({ navigation, isAnon }) {
  const startChat = (category) => {
    navigation.navigate('Chat', { category, anon: isAnon });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoIcon}>⚖️</Text>
          </View>
        </View>

        <Text style={styles.title}>Speak</Text>
        <Text style={styles.subtitle}>Your personal AI advocate.{'\n'}Know your rights. Take action.</Text>

        {isAnon && (
          <View style={styles.anonBanner}>
            <Text style={styles.anonBannerText}>🔒 Anonymous mode — nothing will be saved</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>What are you dealing with?</Text>

        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.catCard}
            onPress={() => startChat(cat.id)}
            activeOpacity={0.7}
          >
            <View style={styles.catIcon}>
              <Text style={styles.catIconText}>{cat.icon}</Text>
            </View>
            <Text style={styles.catLabel}>{cat.label}</Text>
            <Text style={styles.catArrow}>›</Text>
          </TouchableOpacity>
        ))}

        {!isAnon && (
          <TouchableOpacity
            style={styles.journalBtn}
            onPress={() => navigation.navigate('Journal')}
            activeOpacity={0.8}
          >
            <Text style={styles.journalBtnText}>📁 My cases</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.disclaimer}>
          Speak provides guidance only, not legal advice.{'\n'}Consult a qualified solicitor for serious matters.
        </Text>

        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={() => Alert.alert(
            isAnon ? 'End anonymous session' : 'Sign out',
            isAnon ? 'This will end your anonymous session.' : 'Are you sure?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: isAnon ? 'End session' : 'Sign out', style: 'destructive', onPress: () => supabase.auth.signOut() }
            ]
          )}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutBtnText}>{isAnon ? 'End anonymous session' : 'Sign out'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { padding: 24, paddingTop: 60 },
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  logo: {
    width: 72, height: 72,
    backgroundColor: '#c8f064',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: 32 },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#f0f0f0',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  catIcon: {
    width: 36, height: 36,
    backgroundColor: '#242424',
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catIconText: { fontSize: 18 },
  catLabel: { flex: 1, color: '#ccc', fontSize: 14 },
  catArrow: { color: '#555', fontSize: 20 },
  disclaimer: {
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
    marginTop: 16,
  },
  journalBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2e2e2e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  journalBtnText: { color: '#ccc', fontSize: 14 },
  signOutBtn: {
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  signOutBtnText: { color: '#555', fontSize: 13 },
  anonBanner: {
    backgroundColor: 'rgba(200,240,100,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(200,240,100,0.15)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  anonBannerText: { color: '#c8f064', fontSize: 13 },
});